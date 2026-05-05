from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.dependencies import get_db
from app.domains.tender import service as tender_service
from app.domains.tender.schemas import TenderCriterion
from typing import List

router = APIRouter(prefix="/api/v1/tenders", tags=["Tenders"])

@router.post("/upload", response_model=List[TenderCriterion])
async def upload_tender_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Ingests a government tender PDF, extracts structured blocks, 
    and triggers the LLM criteria extraction pipeline.
    """
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported for tenders.")

    file_bytes = await file.read()
    
    # Pass to the domain service layer (business logic)
    # The service will handle the LLM call and DB persistence
    extracted_criteria = await tender_service.process_tender_document(file.filename, file_bytes, db)
    
    return extracted_criteria