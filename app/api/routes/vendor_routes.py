from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from app.api.dependencies import get_db
from app.domains.vendor.service import process_vendor_document
from app.domains.vendor.schemas import VendorEvidence

router = APIRouter()

@router.post("/process", response_model=List[VendorEvidence])
async def upload_vendor_document(
    tender_id: str = Form(...),
    vendor_name: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Endpoint to upload a vendor document and extract evidence based on tender criteria.
    """
    file_bytes = await file.read()
    evidences = await process_vendor_document(
        tender_id=tender_id,
        vendor_name=vendor_name,
        file_bytes=file_bytes,
        db=db
    )
    return evidences
