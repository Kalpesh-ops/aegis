from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.api.dependencies import get_db
from app.domains.vendor.service import process_vendor_document
from app.domains.evaluation.service import process_vendor_evaluation

router = APIRouter()

@router.post("/process")
async def upload_vendor_document(
    tender_id: str = Form(...),
    vendor_name: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Endpoint to upload a vendor document, extract evidence, and trigger evaluation.
    """
    file_bytes = await file.read()
    vendor_id, evidences = await process_vendor_document(
        tender_id=tender_id,
        vendor_name=vendor_name,
        file_bytes=file_bytes,
        db=db
    )
    
    # Trigger deterministic evaluation immediately after extraction
    evaluation_results = process_vendor_evaluation(vendor_id=vendor_id, db=db)
    
    return {"vendor_id": vendor_id, "evidences": evidences, "evaluations": evaluation_results}
