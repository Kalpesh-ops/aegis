import enum
from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime
from app.domains.vendor.schemas import VendorEvidence

class EvaluationStatus(str, enum.Enum):
    PASS = "PASS"
    FAIL = "FAIL"
    MANUAL_REVIEW_REQUIRED = "MANUAL_REVIEW_REQUIRED"

class EvaluationResult(BaseModel):
    vendor_id: str
    criterion_id: str
    status: Literal["PASS", "FAIL", "MANUAL_REVIEW_REQUIRED"]
    flag: Optional[Literal["PROXIMITY_REVIEW_REQUIRED", "FORMAT_MISMATCH", "OCR_FAILURE"]] = None
    python_parsed_value: Optional[float] = None
    timestamp: datetime = datetime.now()

class HumanOverride(BaseModel):
    # Enforced Append-Only in DB
    override_id: str
    evaluation_id: str
    officer_id: str
    original_verdict: str
    new_verdict: str
    annotation_text: str
    timestamp: datetime
