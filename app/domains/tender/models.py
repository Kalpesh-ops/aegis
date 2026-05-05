from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from app.core.database import Base

class Tender(Base):
    __tablename__ = "tenders"
    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Criterion(Base):
    __tablename__ = "criteria"
    id = Column(String, primary_key=True, index=True)
    tender_id = Column(String, ForeignKey("tenders.id"))
    category = Column(String, nullable=False)
    is_mandatory = Column(Boolean, default=True)
    description = Column(String, nullable=False)
    search_vector = Column(JSON) # Stores trigger phrases and domain keywords
    extraction_meta = Column(JSON) # JSONB in production