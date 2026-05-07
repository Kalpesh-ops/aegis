import { TenderCriterion, VendorEvidence } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export async function uploadTender(file: File): Promise<{ tender_id: string; criteria: TenderCriterion[] }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/tenders/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to upload tender document.");
  }

  return response.json();
}

export async function uploadVendorEvidence(
  tenderId: string, 
  vendorName: string, 
  file: File
): Promise<{ vendor_id: string; evidences: VendorEvidence[]; evaluations: any[] }> {
  const formData = new FormData();
  formData.append("tender_id", tenderId);
  formData.append("vendor_name", vendorName);
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/vendors/process`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to process vendor evidence.");
  }

  return response.json();
}

export async function getTenderReport(tenderId: string): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/evaluation/report/${tenderId}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch tender report.");
  }

  return response.json();
}
