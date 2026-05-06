'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SplitScreenLayout from '@/components/layout/SplitScreenLayout';
import PDFViewer from '@/components/pdf/PDFViewer';
import { HighlightOverlay } from '@/components/pdf/HighlightOverlay';
import { CriterionList } from '@/components/evaluation/CriterionList';
import OverrideModal from '@/components/evaluation/OverrideModal';
import { EvaluationResult } from '@/types';
import { ArrowRight } from 'lucide-react';

export default function EvaluatePage() {
  const router = useRouter();
  const params = useParams();
  const [results, setResults] = useState<EvaluationResult[]>([]);
  const [activePage, setActivePage] = useState<number>(1);
  const [activeBBox, setActiveBBox] = useState<[number, number, number, number] | null>(null);
  const [activeCriterionId, setActiveCriterionId] = useState<string | null>(null);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [activeVendorId, setActiveVendorId] = useState<string | null>(null);
  
  // This state will be updated by PDFViewer's onScaleCalculated event
  const [pdfScale, setPdfScale] = useState<number>(1.0); 

  useEffect(() => {
    async function loadResults() {
      try {
        const res = await fetch(`http://localhost:8080/api/v1/evaluation/report/${params.tenderId}?format=json`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        
        // Transform report format back to EvaluationResult format for the UI
        const mappedResults = data.map((r: any) => ({
          vendor_id: r.vendor_id,
          criterion_id: r.criterion_id,
          status: r.status,
          flag: r.reason.includes("PROXIMITY") ? "PROXIMITY_REVIEW_REQUIRED" : null,
          timestamp: r.timestamp,
          evidence_payload: {
            raw_string: r.evidence.raw_string,
            context_sentence: r.evidence.context_sentence,
            page_num: r.evidence.page_number,
            source_chunk_bbox: [100, 250, 400, 280] // Hardcoded fallback for now
          },
          requires_human_override: r.status === 'MANUAL_REVIEW_REQUIRED'
        }));
        
        setResults(mappedResults);
      } catch (err) {
        console.error(err);
      }
    }
    loadResults();
  }, [params.tenderId]);

  const handleSelectCriterion = (id: string, pageNum: number, bbox?: [number, number, number, number]) => {
    setActiveCriterionId(id);
    setActivePage(pageNum);
    setActiveBBox(bbox || null);
    
    // Auto-open override if it's a review item (optional UX choice)
    const res = results.find(r => r.criterion_id === id);
    if (res?.status === 'MANUAL_REVIEW_REQUIRED') {
        setActiveVendorId(res.vendor_id);
        setIsOverrideModalOpen(true);
    }
  };

  const handleSubmitOverride = async (verdict: "PASS" | "FAIL", annotation: string) => {
    if (!activeCriterionId || !activeVendorId) return;

    try {
      // Call the backend to persist the append-only override
      const response = await fetch(`http://localhost:8080/api/v1/evaluation/${activeVendorId}/${activeCriterionId}/override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officer_id: "OFFICER-77X",
          verdict: verdict,
          annotation: annotation
        })
      });

      if (!response.ok) {
         alert("Failed to submit override to the immutable ledger.");
         return;
      }
      
      const newAudit = await response.json();

      // Local state update
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

    console.log(`Submitting override for ${activeCriterionId}: ${verdict} - ${annotation}`);
    setIsOverrideModalOpen(false);
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-gray-50">
      <header className="h-14 bg-white border-b flex items-center px-6 shadow-sm z-10">
        <h1 className="text-lg font-bold text-gray-800 tracking-tight">
          Aegis <span className="text-blue-600">Verification Engine</span>
        </h1>
        <div className="ml-auto flex items-center space-x-4">
          <span className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Pending Overrides: {results.filter(r => r.status === 'MANUAL_REVIEW_REQUIRED').length}
          </span>
          <button
            onClick={() => router.push(`/report/${params.tenderId}`)}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black transition-all active:scale-95 flex items-center space-x-2"
          >
            <span>Complete & Generate Report</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      <SplitScreenLayout
        leftPanel={
          <div className="relative h-full w-full bg-gray-200 overflow-auto p-8 flex justify-center">
            <PDFViewer 
              fileUrl="/sample-vendor.pdf" 
              pageNumber={activePage}
              onScaleCalculated={setPdfScale}
            >
              <HighlightOverlay bbox={activeBBox} pdfScale={pdfScale} />
            </PDFViewer>
          </div>
        }
        rightPanel={
          <CriterionList 
            results={results}
            activeCriterionId={activeCriterionId}
            onSelect={handleSelectCriterion}
          />
        }
      />

      {activeCriterionId && (
        <OverrideModal
          isOpen={isOverrideModalOpen}
          onClose={() => setIsOverrideModalOpen(false)}
          criterionId={activeCriterionId}
          onSubmit={handleSubmitOverride}
        />
      )}
    </div>
  );
}
