from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.sql import func
import enum
from app.core.database import Base

class DBStatusEnum(enum.Enum):
    PASS = "PASS"
    FAIL = "FAIL"
    MANUAL_REVIEW_REQUIRED = "MANUAL_REVIEW_REQUIRED"

class EvaluationAuditRecord(Base):
    """Append-only table for evaluations. Never update, only insert."""
    __tablename__ = "evaluation_audit_log"
    id = Column(Integer, primary_key=True, autoincrement=True)
    vendor_id = Column(String, index=True, nullable=False)
    criterion_id = Column(String, ForeignKey("criteria.id"), nullable=False)
    status = Column(Enum(DBStatusEnum), nullable=False)
    flag = Column(String, nullable=True) # e.g., PROXIMITY_REVIEW_REQUIRED
    python_parsed_value = Column(JSON, nullable=True)
    reason = Column(String, nullable=False)
    evidence_payload = Column(JSON, nullable=False) # Stores chunk, page_num, extracted_value
    requires_human_override = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    evaluated_by = Column(String, default="aegis_system")