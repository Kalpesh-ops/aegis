import logging
from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.domains.evaluation.models import EvaluationAuditRecord, DBStatusEnum
from app.domains.evaluation.schemas import EvaluationResult, HumanOverride
from app.domains.tender.models import Criterion
from app.domains.vendor.models import Vendor, VendorEvidenceRecord

logger = logging.getLogger(__name__)

def evaluate_threshold(
    threshold_type: str, 
    threshold_value: Optional[float], 
    extracted_value: Optional[float], 
    extracted_string: str
) -> bool:
    """Pure deterministic function to evaluate thresholds."""
    if threshold_type == "BOOLEAN":
        return extracted_string.strip().lower() in ["yes", "true", "1", "compliant", "valid"]
    
    if extracted_value is None or threshold_value is None:
        return False

    if threshold_type == "MIN":
        return extracted_value >= threshold_value
    elif threshold_type == "MAX":
        return extracted_value <= threshold_value
    elif threshold_type == "EXACT_MATCH":
        return extracted_value == threshold_value
    
    return False

def process_vendor_evaluation(vendor_id: str, db: Session) -> List[EvaluationResult]:
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found.")

    criteria = db.query(Criterion).filter(Criterion.tender_id == vendor.tender_id).all()
    evidences = db.query(VendorEvidenceRecord).filter(VendorEvidenceRecord.vendor_id == vendor_id).all()

    evidence_map = {e.criterion_id: e for e in evidences}
    results: List[EvaluationResult] = []

    for criterion in criteria:
        evidence = evidence_map.get(criterion.id)
        
        # Default to fail if no evidence found
        if not evidence:
            results.append(
                EvaluationResult(
                    vendor_id=vendor_id,
                    criterion_id=criterion.id,
                    status="FAIL",
                    flag="MISSING_EVIDENCE",
                    python_parsed_value=None,
                    timestamp=datetime.now(timezone.utc)
                )
            )
            continue

        # Extract deterministic threshold meta (assuming JSON struct in extraction_meta)
        meta = criterion.extraction_meta or {}
        threshold_type = meta.get("threshold_type", "BOOLEAN")
        threshold_value = meta.get("threshold_value")
        
        passed = evaluate_threshold(
            threshold_type=threshold_type,
            threshold_value=threshold_value,
            extracted_value=evidence.python_parsed_value,
            extracted_string=evidence.raw_string
        )

        status = "PASS" if passed else "FAIL"
        flag = None
        requires_human_override = False

        # Apply Proximity & Ambiguity Constraints
        if evidence.is_ambiguous:
            status = "MANUAL_REVIEW_REQUIRED"
            flag = "LLM_PYTHON_MISMATCH"
            requires_human_override = True
        elif passed and evidence.contains_multiple_financial_entities and criterion.category == "financial":
            status = "MANUAL_REVIEW_REQUIRED"
            flag = "PROXIMITY_REVIEW_REQUIRED"
            requires_human_override = True

        result = EvaluationResult(
            vendor_id=vendor_id,
            criterion_id=criterion.id,
            status=status,
            flag=flag,
            python_parsed_value=evidence.python_parsed_value,
            timestamp=datetime.now(timezone.utc)
        )
        results.append(result)

        # Audit Commit - Append Only
        audit_record = EvaluationAuditRecord(
            vendor_id=vendor_id,
            criterion_id=criterion.id,
            status=DBStatusEnum[status],
            reason=flag or "Automated Evaluation Complete",
            evidence_payload={
                "raw_string": evidence.raw_string,
                "context_sentence": evidence.context_sentence,
                "page_number": evidence.page_number,
                "source_chunk": evidence.source_chunk
            },
            requires_human_override=requires_human_override
        )
        db.add(audit_record)

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to commit evaluation audit logs: {str(e)}")
        raise HTTPException(status_code=500, detail="Audit ledger commit failed.")

    return results

def submit_human_override(
    vendor_id: str,
    criterion_id: str,
    override: HumanOverride,
    db: Session
) -> EvaluationResult:
    """
    Enforces the append-only audit trail. 
    Does not update existing rows; creates a new audit record for the officer's decision.
    """
    # 1. Fetch latest record for context
    last_record = db.query(EvaluationAuditRecord).filter(
        EvaluationAuditRecord.vendor_id == vendor_id,
        EvaluationAuditRecord.criterion_id == criterion_id
    ).order_by(EvaluationAuditRecord.created_at.desc()).first()

    if not last_record:
        raise HTTPException(status_code=404, detail="Original evaluation record not found.")

    # 2. Append-Only: Create a new audit row
    new_audit_record = EvaluationAuditRecord(
        vendor_id=vendor_id,
        criterion_id=criterion_id,
        status=DBStatusEnum[override.verdict],
        reason=f"OFFICER OVERRIDE: {override.annotation}",
        evidence_payload=last_record.evidence_payload, # Inherit original evidence
        requires_human_override=False, # Override resolves the manual review flag
        evaluated_by=override.officer_id,
        python_parsed_value=last_record.python_parsed_value
    )
    
    db.add(new_audit_record)
    
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Audit override commit failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Audit ledger commit failed.")

    return EvaluationResult(
        vendor_id=vendor_id,
        criterion_id=criterion_id,
        status=override.verdict,
        flag="HUMAN_OVERRIDDEN",
        python_parsed_value=last_record.python_parsed_value,
        timestamp=datetime.now(timezone.utc)
    )

def generate_tender_report(tender_id: str, db: Session):
    """
    Aggregates the most recent evaluation status for every vendor under a tender.
    Groups results to facilitate the Matrix View.
    """
    vendors = db.query(Vendor).filter(Vendor.tender_id == tender_id).all()
    vendor_ids = [v.id for v in vendors]
    
    # Query all audit records for these vendors
    audit_records = db.query(EvaluationAuditRecord).filter(
        EvaluationAuditRecord.vendor_id.in_(vendor_ids)
    ).order_by(EvaluationAuditRecord.created_at.desc()).all()
    
    # We only want the LATEST audit record for each (vendor, criterion) pair
    report_data = {}
    for record in audit_records:
        key = (record.vendor_id, record.criterion_id)
        if key not in report_data:
            report_data[key] = {
                "vendor_id": record.vendor_id,
                "vendor_name": next((v.name for v in vendors if v.id == record.vendor_id), "Unknown"),
                "criterion_id": record.criterion_id,
                "status": record.status.value,
                "reason": record.reason,
                "evaluated_by": record.evaluated_by,
                "evidence": record.evidence_payload,
                "timestamp": record.created_at.isoformat()
            }
            
    return list(report_data.values())
