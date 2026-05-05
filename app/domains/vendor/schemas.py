from pydantic import BaseModel
from typing import Optional, Literal

class VendorEvidence(BaseModel):
    criterion_id: str
    raw_string: str
    context_sentence: str
    llm_inferred_integer: Optional[int] = None
    contains_multiple_financial_entities: bool
    source_chunk: str
    page_number: int
    document_status: Literal["EXTRACTED", "PARTIAL", "FAILED"]
    is_ambiguous: bool = False
