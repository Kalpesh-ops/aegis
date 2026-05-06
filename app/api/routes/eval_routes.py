import csv
import io
from fastapi.responses import StreamingResponse
from app.domains.evaluation.service import process_vendor_evaluation, submit_human_override, generate_tender_report

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api.dependencies import get_db
from app.domains.evaluation.schemas import EvaluationResult, HumanOverride

router = APIRouter()

@router.get("/report/{tender_id}")
async def get_tender_report(
    tender_id: str,
    format: str = "json",
    db: Session = Depends(get_db)
):
    """
    Returns a consolidated audit report for all vendors in a tender.
    Supports JSON and CSV formats.
    """
    report_data = generate_tender_report(tender_id=tender_id, db=db)
    
    if format.lower() == "csv":
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=["vendor_id", "vendor_name", "criterion_id", "status", "reason", "evaluated_by", "timestamp"])
        writer.writeheader()
        
        # Flatten the data for CSV
        for row in report_data:
            csv_row = {k: v for k, v in row.items() if k != "evidence"}
            writer.writerow(csv_row)
            
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=aegis_audit_{tender_id}.csv"}
        )
        
    return report_data

@router.post("/{vendor_id}/evaluate", response_model=List[EvaluationResult])
async def evaluate_vendor(
    vendor_id: str,
    db: Session = Depends(get_db)
):
    """
    Triggers the evaluation rule engine for a specific vendor.
    """
    results = process_vendor_evaluation(vendor_id=vendor_id, db=db)
    return results

@router.post("/{vendor_id}/{criterion_id}/override", response_model=EvaluationResult)
async def override_evaluation(
    vendor_id: str,
    criterion_id: str,
    override: HumanOverride,
    db: Session = Depends(get_db)
):
    """
    Submits a manual override by an officer for a specific criterion evaluation.
    """
    result = submit_human_override(
        vendor_id=vendor_id,
        criterion_id=criterion_id,
        override=override,
        db=db
    )
    return result
