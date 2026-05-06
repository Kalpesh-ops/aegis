import uuid
import json
import logging
import re
from typing import List
from fastapi import HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.domains.vendor.models import Vendor, VendorEvidenceRecord
from app.domains.vendor.schemas import VendorEvidence
from app.domains.tender.models import Criterion
from app.core.llm_client import llm_client
from app.utils.pdf_parser import extract_structured_blocks

logger = logging.getLogger(__name__)

class VendorExtractionResponse(BaseModel):
    evidences: List[VendorEvidence]

def deterministic_python_parser(raw_string: str) -> float | None:
    """Pass 1: Deterministic evaluation of extracted strings."""
    # Strip everything except numbers and decimals
    numeric_str = re.sub(r'[^\d.]', '', raw_string)
    try:
        # Check if multiple decimals exist (e.g., "1.2.3")
        if numeric_str.count('.') > 1:
             # Handle cases like "INR 1,23,456.78" which after regex might be "123456.78"
             # But if it's "1.2.3", we might just take the first part
             return None
        return float(numeric_str) if numeric_str else None
    except ValueError:
        return None

async def process_vendor_document(
    tender_id: str, 
    vendor_name: str, 
    file_bytes: bytes, 
    db: Session
) -> List[VendorEvidence]:
    
    # 1. Fetch Tender Criteria
    criteria = db.query(Criterion).filter(Criterion.tender_id == tender_id).all()
    if not criteria:
        raise HTTPException(status_code=404, detail="No criteria found for this tender.")
        
    criteria_context = "\n".join([f"- ID: {c.id} | Desc: {c.description}" for c in criteria])

    # 2. Parse Vendor PDF
    blocks = extract_structured_blocks(file_bytes)
    if not blocks:
        raise HTTPException(status_code=400, detail="No extractable text found in vendor PDF.")

    document_text = ""
    for block in blocks:
        document_text += f"[PAGE {block['page_num']}] {block['text']}\n"

    vendor_id = str(uuid.uuid4())

    # 3. LLM Extraction Prompt
    prompt = f"""
    You are a high-assurance extraction engine. Map the vendor document text to the following tender criteria.
    
    Criteria to map against:
    {criteria_context}
    
    Rules:
    1. Extract the 'raw_string' containing the evidence.
    2. Extract the exact 'context_sentence'.
    3. Provide 'llm_inferred_integer' representing the numerical value found.
    4. Set 'contains_multiple_financial_entities' to true ONLY if the context sentence contains multiple distinct monetary values.
    5. 'document_status' must be EXTRACTED, PARTIAL, or FAILED.
    
    Document Text:
    {document_text}
    """

    # 4. Execute LLM Extraction
    try:
        schema = VendorExtractionResponse.model_json_schema()
        raw_json_response = llm_client.generate_extraction(prompt=prompt, schema=schema)
        response_data = json.loads(raw_json_response)
        extracted_evidences = [VendorEvidence(**e) for e in response_data.get("evidences", [])]
    except Exception as e:
        logger.error(f"Vendor LLM extraction failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to map vendor evidence.")

    # 5. Dual-Pass Cross-Check & DB Persistence
    db_vendor = Vendor(id=vendor_id, name=vendor_name, tender_id=tender_id)
    db.add(db_vendor)
    db.flush() # Force insert of vendor to satisfy evidence foreign key
    
    for evidence in extracted_evidences:
        # Dual-Pass: Python deterministic check vs LLM inferred check
        python_val = deterministic_python_parser(evidence.raw_string)
        
        # If the LLM integer drastically differs from the Python deterministic float, flag as ambiguous
        if evidence.llm_inferred_integer is not None and python_val is not None:
            if abs(evidence.llm_inferred_integer - python_val) > 1: # Basic tolerance
                evidence.is_ambiguous = True
                
        # Persist to database
        db_evidence = VendorEvidenceRecord(
            vendor_id=vendor_id,
            criterion_id=evidence.criterion_id,
            raw_string=evidence.raw_string,
            context_sentence=evidence.context_sentence,
            llm_inferred_integer=evidence.llm_inferred_integer,
            contains_multiple_financial_entities=evidence.contains_multiple_financial_entities,
            source_chunk=evidence.source_chunk,
            page_number=evidence.page_number,
            document_status=evidence.document_status,
            python_parsed_value=python_val,
            is_ambiguous=evidence.is_ambiguous
        )
        db.add(db_evidence)
        
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Vendor DB commit failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to persist vendor evidence.")

    return vendor_id, extracted_evidences
