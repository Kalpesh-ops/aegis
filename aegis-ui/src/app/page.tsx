"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Dropzone from "@/components/layout/Dropzone";
import { uploadTender, uploadVendorEvidence } from "@/lib/api";
import { TenderCriterion } from "@/types";
import { CheckCircle, FileUp, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function IngestionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [tenderFile, setTenderFile] = useState<File | null>(null);
  const [criteria, setCriteria] = useState<TenderCriterion[]>([]);
  const [tenderId, setTenderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTenderUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);
    try {
      const payload = await uploadTender(file);
      setCriteria(payload.criteria);
      setTenderId(payload.tender_id); 
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to extract criteria from tender document.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmCriteria = () => {
    setStep(3);
  };

  const handleVendorUpload = async (file: File) => {
    if (!tenderId) return;
    setIsUploading(true);
    setError(null);
    try {
      await uploadVendorEvidence(tenderId, "Global Defense Systems Ltd", file);
      // In a real app, we'd add to a list of vendors. For demo, we proceed to evaluation.
      setStep(4);
    } catch (err: any) {
      setError(err.message || "Failed to process vendor evidence.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      {/* Error Modal Overlay */}
      {error && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-in fade-in p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95">
             <div className="bg-red-600 p-4 flex items-center space-x-3">
                <ShieldCheck className="w-6 h-6 text-white" />
                <h3 className="font-bold text-white">System Exception</h3>
             </div>
             <div className="p-6">
                <p className="text-gray-700 font-medium mb-6">{error}</p>
                <div className="flex justify-end">
                   <button 
                     onClick={() => setError(null)}
                     className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold transition-colors"
                   >
                     Acknowledge
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-blue-600 p-8 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <ShieldCheck className="w-8 h-8" />
            <h1 className="text-2xl font-bold tracking-tight">Aegis Ingestion Gateway</h1>
          </div>
          <p className="text-blue-100 text-sm">High-Assurance Procurement Evaluation Engine</p>
          
          <div className="mt-8 flex items-center space-x-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center space-x-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  step >= s ? "bg-white text-blue-600" : "bg-blue-500 text-blue-200 border border-blue-400"
                )}>
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                <div className={cn(
                  "h-1 w-8 rounded-full",
                  step > s ? "bg-white" : "bg-blue-500"
                )} />
              </div>
            ))}
          </div>
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-gray-800">Step 1: Tender Specification</h2>
                <p className="text-sm text-gray-500">Upload the master CRPF tender document to extract eligibility criteria.</p>
              </div>
              <Dropzone onFileSelect={handleTenderUpload} isUploading={isUploading} label="Upload Tender PDF (CRPF-SPEC-01)" />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-gray-800">Step 2: Confirm Extraction</h2>
                <p className="text-sm text-gray-500">Review and validate the AI-extracted eligibility criteria.</p>
              </div>
              
              <div className="bg-gray-50 border rounded-xl overflow-hidden">
                <div className="max-h-64 overflow-y-auto divide-y divide-gray-200">
                  {criteria.map((c, idx) => (
                    <div key={idx} className="p-4 flex items-start space-x-3">
                      <div className="mt-1 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 shrink-0">
                        {idx + 1}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-800">{c.description}</p>
                        <div className="flex space-x-2">
                          <span className="text-[10px] font-bold uppercase text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-200">
                            {c.threshold_type} {c.threshold_value} {c.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleConfirmCriteria}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-[0.98] flex items-center justify-center space-x-2"
              >
                <span>Confirm and Evaluate Vendors</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-gray-800">Step 3: Vendor Submission</h2>
                <p className="text-sm text-gray-500">Upload vendor technical/financial bids for automated evaluation.</p>
              </div>
              <Dropzone onFileSelect={handleVendorUpload} isUploading={isUploading} label="Upload Vendor PDF (Technical/Financial Bid)" />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 text-center py-8 animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-800">Processing Complete</h2>
                <p className="text-gray-500">Vendor evidence has been successfully extracted and normalized.</p>
              </div>
              <button
                onClick={() => router.push(`/evaluate/${tenderId}`)}
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl active:scale-95 space-x-2"
              >
                <span>Launch Evaluation Workspace</span>
                <FileUp className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 flex items-center space-x-8 grayscale opacity-50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded-md" />
            <span className="text-xs font-bold text-gray-500 tracking-widest uppercase">Government of India</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full" />
            <span className="text-xs font-bold text-gray-500 tracking-widest uppercase">CRPF Procurement</span>
          </div>
      </div>
    </div>
  );
}
