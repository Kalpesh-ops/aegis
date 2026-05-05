from pydantic import BaseModel
from typing import List, Optional, Literal
from enum import Enum

class CriterionCategory(str, Enum):
    TECHNICAL = "technical"
    FINANCIAL = "financial"
    COMPLIANCE = "compliance"

class CriterionExtractionMeta(BaseModel):
    tender_id: str
    outline_sections_mapped: list[str]
    source_pages: list[int]
    unmatched_eligibility_keywords: list[dict] # { "keyword": str, "page_number": int, "context": str }

class TenderCriterion(BaseModel):
    id: str
    description: str
    threshold_value: Optional[float] = None
    threshold_type: Literal["MIN", "MAX", "BOOLEAN", "EXACT_MATCH"]
    unit: Optional[str] = None # e.g., "INR", "YEARS"
    source_chunk: str
    page_number: int
