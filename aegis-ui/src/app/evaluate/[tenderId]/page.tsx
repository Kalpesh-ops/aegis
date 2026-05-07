'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import SplitScreenLayout from '@/components/layout/SplitScreenLayout';
import PDFViewer from '@/components/pdf/PDFViewer';
import { HighlightOverlay } from '@/components/pdf/HighlightOverlay';
import { CriterionList } from '@/components/evaluation/CriterionList';
import OverrideModal from '@/components/evaluation/OverrideModal';
import { EvaluationResult } from '@/types';
import { 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  ChevronLeft, 
  FileText,
  Clock,
  ExternalLink,
  Loader2,
  UploadCloud,
  CheckCircle2,
  Users
} from 'lucide-react';
import Link from 'next/link';
import Dropzone from '@/components/layout/Dropzone';

export default function EvaluatePage() {
  const router = useRouter();
  const params = useParams();
  
  const [results, setResults] = useState<EvaluationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingVendor, setUploadingVendor] = useState(false);
  const [activePage, setActivePage] = useState<number>(1);
  const [activeBBox, setActiveBBox] = useState<[number, number, number, number] | null>(null);
  const [activeCriterionId, setActiveCriterionId] = useState<string | null>(null);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [activeVendorId, setActiveVendorId] = useState<string | null>(null);
  const [pdfScale, setPdfScale] = useState<number>(1.0); 

  const loadResults = async () => {
    if (!params.tenderId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/evaluation/report/${params.tenderId}?format=json`);
      if (!res.ok) throw new Error("Failed to fetch evaluation report");
      const data = await res.json();
      
      const mappedResults = data.map((r: any) => ({
        vendor_id: r.vendor_id,
        criterion_id: r.criterion_id,
        status: r.status,
        flag: r.reason?.includes("PROXIMITY") ? "PROXIMITY_REVIEW_REQUIRED" : (r.reason || null),
        timestamp: r.timestamp || new Date().toISOString(),
        evidence_payload: {
          raw_string: r.evidence?.raw_string || "No raw evidence available",
          context_sentence: r.evidence?.context_sentence || "",
          page_num: r.evidence?.page_number || 1,
          source_chunk_bbox: [100, 250, 400, 280] // Hardcoded fallback
        },
        requires_human_override: r.status === 'MANUAL_REVIEW_REQUIRED'
      }));
      
      setResults(mappedResults);
      if (mappedResults.length > 0) {
        setActiveVendorId(mappedResults[0].vendor_id);
      }
    } catch (err) {
      console.error("Evaluation Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, [params.tenderId]);

  const handleVendorUpload = async (file: File) => {
    if (!params.tenderId) return;
    setUploadingVendor(true);
    
    const formData = new FormData();
    formData.append('tender_id', params.tenderId as string);
    formData.append('vendor_name', file.name.split('.')[0]); // Simple name extraction
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/v1/vendors/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error("Vendor processing failed");
      
      // Refresh results after successful upload
      await loadResults();
    } catch (err) {
      console.error(err);
      alert("Failed to process vendor submission.");
    } finally {
      setUploadingVendor(false);
    }
  };

  const handleSelectCriterion = (id: string, pageNum: number, bbox?: [number, number, number, number]) => {
    setActiveCriterionId(id);
    setActivePage(pageNum);
    setActiveBBox(bbox || null);
    
    const res = results.find(r => r.criterion_id === id);
    if (res) {
        setActiveVendorId(res.vendor_id);
        setIsOverrideModalOpen(true);
    }
  };

  const handleSubmitOverride = async (verdict: "PASS" | "FAIL", annotation: string) => {
    if (!activeCriterionId || !activeVendorId) return;

    try {
      const response = await fetch(`http://localhost:8000/api/v1/evaluation/${activeVendorId}/${activeCriterionId}/override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officer_id: "OFFICER-77X",
          verdict: verdict,
          annotation: annotation
        })
      });

      if (!response.ok) throw new Error("Override failed");
      
      setResults(prev => prev.map(res => {
        if (res.criterion_id === activeCriterionId && res.vendor_id === activeVendorId) {
          return {
            ...res,
            status: verdict as any,
            flag: "HUMAN_OVERRIDDEN" as any,
            requires_human_override: false
          };
        }
        return res;
      }));
    } catch (err) {
      console.error(err);
    }

    setIsOverrideModalOpen(false);
  };

  if (loading && !uploadingVendor) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="font-newsreader text-xl text-slate-400 animate-pulse">Initializing Verification Workspace...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      {/* Premium Header */}
      <header className="h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center px-8 z-50">
        <Link href="/" className="flex items-center gap-3 group">
          <ShieldCheck className="w-6 h-6 text-blue-600 group-hover:rotate-12 transition-transform" />
          <span className="font-newsreader font-bold text-xl tracking-tight">Aegis Audit.</span>
        </Link>
        
        <div className="ml-auto flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status:</span>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-full">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">{results.filter(r => r.status === 'MANUAL_REVIEW_REQUIRED').length} Pending Review</span>
            </div>
          </div>
          
          <button
            onClick={() => router.push(`/report/${params.tenderId}`)}
            disabled={results.length === 0}
            className="flex items-center gap-2 px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-xs font-bold hover:scale-105 transition-all shadow-lg active:scale-95"
          >
            Finalize Report
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <div className="flex-grow relative">
        <SplitScreenLayout
          className="h-full border-none p-0 gap-0"
          leftPanel={
            <div className="h-full w-full bg-slate-100 dark:bg-slate-950 overflow-hidden flex flex-col relative">
              <AnimatePresence mode="wait">
                {results.length > 0 ? (
                  <motion.div 
                    key="pdf-view"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="h-full w-full flex flex-col"
                  >
                    <div className="absolute top-6 left-6 z-10 flex items-center gap-2 p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl">
                      <div className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-tighter">Proposal Evidence</div>
                      <span className="text-[10px] font-bold text-slate-500 truncate max-w-[120px]">VENDOR_SPEC.PDF</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 ml-1" />
                    </div>

                    <div className="flex-grow overflow-auto p-12 flex justify-center custom-scrollbar">
                      <PDFViewer 
                        fileUrl="/sample-vendor.pdf" 
                        pageNumber={activePage}
                        onScaleCalculated={setPdfScale}
                      >
                        <HighlightOverlay bbox={activeBBox} pdfScale={pdfScale} />
                      </PDFViewer>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="empty-upload"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="h-full w-full flex flex-col items-center justify-center p-12"
                  >
                    <div className="max-w-md w-full space-y-8 text-center">
                      <div className="mx-auto w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center mb-6 border border-blue-100 dark:border-blue-800">
                        <UploadCloud className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="space-y-3">
                        <h2 className="font-newsreader text-3xl font-bold text-slate-900 dark:text-white">Awaiting Vendor Proposal</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">To initialize the verification engine, please upload the vendor's technical submission PDF for this tender.</p>
                      </div>
                      
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl shadow-blue-500/5">
                        <Dropzone 
                          onFileSelect={handleVendorUpload} 
                          isUploading={uploadingVendor}
                          label="Upload Vendor Proposal"
                          className="h-40"
                        />
                      </div>
                      
                      <div className="flex items-center justify-center gap-8 pt-4">
                        <div className="flex flex-col items-center">
                           <span className="text-xs font-bold text-slate-400 mb-1">AUDITABLE</span>
                           <ShieldCheck className="w-5 h-5 text-slate-300" />
                        </div>
                        <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
                        <div className="flex flex-col items-center">
                           <span className="text-xs font-bold text-slate-400 mb-1">DETERMINISTIC</span>
                           <CheckCircle2 className="w-5 h-5 text-slate-300" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          }
          rightPanel={
            <div className="h-full w-full flex flex-col bg-white dark:bg-slate-900">
               <div className="p-4 bg-slate-50/50 dark:bg-slate-950/30 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Vendor: <span className="text-slate-900 dark:text-white">{activeVendorId?.slice(0, 12) || "Processing"}</span></span>
                    </div>
                    <div className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase">Audit Workspace</div>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-slate-400 font-mono">
                    <FileText className="w-3 h-3" />
                    TENDER_REF: {params.tenderId}
                  </div>
               </div>
               <CriterionList 
                results={results}
                activeCriterionId={activeCriterionId}
                onSelect={handleSelectCriterion}
              />
              
              {results.length === 0 && !uploadingVendor && (
                <div className="flex-grow flex flex-col items-center justify-center p-8 text-center border-t border-slate-100 dark:border-slate-800">
                  <AlertCircle className="w-10 h-10 text-slate-200 dark:text-slate-800 mb-4" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Awaiting Extraction Data</p>
                </div>
              )}
              
              {uploadingVendor && (
                <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 dark:text-white">Processing Submission</p>
                    <p className="text-xs text-slate-500">Extracting evidence blocks and verifying thresholds...</p>
                  </div>
                </div>
              )}
            </div>
          }
        />
      </div>

      <AnimatePresence>
        {activeCriterionId && (
          <OverrideModal
            isOpen={isOverrideModalOpen}
            onClose={() => setIsOverrideModalOpen(false)}
            criterionId={activeCriterionId}
            onSubmit={handleSubmitOverride}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
