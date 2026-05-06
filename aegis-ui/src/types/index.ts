export type DBStatus = "PASS" | "FAIL" | "MANUAL_REVIEW_REQUIRED";
export type EvaluationFlag = "PROXIMITY_REVIEW_REQUIRED" | "FORMAT_MISMATCH" | "OCR_FAILURE" | "LLM_PYTHON_MISMATCH" | "MISSING_EVIDENCE";

export interface VendorEvidence {
  criterion_id: string;
  raw_string: string;
  context_sentence: string;
  llm_inferred_integer: number | null;
  contains_multiple_financial_entities: boolean;
  source_chunk: string;
  page_number: number;
  document_status: "EXTRACTED" | "PARTIAL" | "FAILED";
  is_ambiguous: boolean;
  python_parsed_value: number | null;
}

export interface EvaluationResult {
  vendor_id: string;
  criterion_id: string;
  status: DBStatus;
  flag: EvaluationFlag | null;
  python_parsed_value: number | null;
  timestamp: string;
  evidence_payload: {
    raw_string: string;
    context_sentence: string;
    page_num: number;
    source_chunk_bbox: [number, number, number, number];
  };
  requires_human_override: boolean;
}

export interface TenderCriterion {
  id: string;
  description: string;
  threshold_value: number | null;
  threshold_type: "MIN" | "MAX" | "BOOLEAN" | "EXACT_MATCH";
  unit: string | null;
  source_chunk: string;
  page_number: number;
}
