import uuid
import json
import logging
from typing import List
from fastapi import HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.domains.tender.models import Tender, Criterion
from app.domains.tender.schemas import TenderCriterion
from app.core.llm_client import llm_client
from app.utils.pdf_parser import extract_structured_blocks

logger = logging.getLogger(__name__)

# Wrapper model to enforce an array output from the LLM
class TenderExtractionResponse(BaseModel):
    criteria: List[TenderCriterion]

async def process_tender_document(filename: str, file_bytes: bytes, db: Session) -> List[TenderCriterion]:
    # 1. Parse PDF Blocks
    blocks = extract_structured_blocks(file_bytes)
    if not blocks:
        raise HTTPException(status_code=400, detail="No extractable text found in PDF.")

    # 2. Construct Traced Context
    # Injecting page numbers so the LLM can explicitly map them to the extraction meta
    context_text = ""
    for block in blocks:
        context_text += f"[PAGE {block['page_num']}] {block['text']}\n"

    tender_id = str(uuid.uuid4())

    # 3. LLM Prompt Construction
    prompt = f"""
    You are a deterministic extraction engine for government procurement.
    Extract all mandatory and optional eligibility criteria from the provided tender document.
    Focus on: Financial Thresholds (turnover, net worth), Technical Experience (past projects), and Compliance (ISO, GST, PAN).
    
    Rules:
    1. Assign the exact 'page_num' based on the [PAGE X] markers in the text.
    2. Extract the exact 'source_chunk' verbatim.
    3. Determine 'is_mandatory' based on legal language ("shall", "must").
    4. Set 'contains_multiple_financial_entities' to true ONLY if the source chunk contains more than one distinct monetary value.
    5. Set 'tender_id' to: {tender_id}
    
    Document Text:
    {context_text}
    """

    # 4. Execute LLM Extraction
    try:
        # Using the Pydantic model's JSON schema to strictly type the LLM output
        schema = TenderExtractionResponse.model_json_schema()
        raw_json_response = llm_client.generate_extraction(prompt=prompt, schema=schema)
        
        # Parse response
        response_data = json.loads(raw_json_response)
        extracted_criteria = [TenderCriterion(**c) for c in response_data.get("criteria", [])]
    except Exception as e:
        logger.error(f"Extraction pipeline failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to extract criteria from tender document.")

    # 5. Persist to Database (Immutable Ledger)
    try:
        db_tender = Tender(id=tender_id, title=filename)
        db.add(db_tender)
        
        for pydantic_crit in extracted_criteria:
            # Generate deterministic UUID for criterion
            crit_id = str(uuid.uuid4())
            pydantic_crit.criterion_id = crit_id 
            
            db_crit = Criterion(
                id=crit_id,
                tender_id=tender_id,
                category=pydantic_crit.category.value,
                is_mandatory=pydantic_crit.is_mandatory,
                description=pydantic_crit.description,
                search_vector={"trigger_phrases": pydantic_crit.trigger_phrases, "domain_keywords": pydantic_crit.domain_keywords},
                extraction_meta=pydantic_crit.meta.model_dump()
            )
            db.add(db_crit)
            
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Database commit failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to persist tender criteria.")

    return extracted_criteria