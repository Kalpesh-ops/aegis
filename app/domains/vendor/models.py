from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Integer, Float, JSON
from sqlalchemy.sql import func
from app.core.database import Base

class Vendor(Base):
    __tablename__ = "vendors"
    id = Column(String, primary_key=True, index=True)
    tender_id = Column(String, ForeignKey("tenders.id"), nullable=False)
    name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class VendorEvidenceRecord(Base):
    """
    Stores extracted evidence from vendor documents.
    """
    __tablename__ = "vendor_evidences"
    id = Column(Integer, primary_key=True, autoincrement=True)
    vendor_id = Column(String, ForeignKey("vendors.id"), nullable=False)
    criterion_id = Column(String, ForeignKey("criteria.id"), nullable=False)
    raw_string = Column(String, nullable=False)
    context_sentence = Column(String, nullable=False)
    llm_inferred_integer = Column(Integer, nullable=True)
    contains_multiple_financial_entities = Column(Boolean, default=False)
    source_chunk = Column(String, nullable=False)
    page_number = Column(Integer, nullable=False)
    document_status = Column(String, nullable=False) # EXTRACTED, PARTIAL, FAILED
    is_ambiguous = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
