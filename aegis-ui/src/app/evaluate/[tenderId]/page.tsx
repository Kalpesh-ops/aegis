'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SplitScreenLayout from '@/components/layout/SplitScreenLayout';
import PDFViewer from '@/components/pdf/PDFViewer';
import { HighlightOverlay } from '@/components/pdf/HighlightOverlay';
import { CriterionList } from '@/components/evaluation/CriterionList';
import OverrideModal from '@/components/evaluation/OverrideModal';
import { EvaluationResult } from '@/types';
import { ArrowRight } from 'lucide-react';

// Mock data to establish UI before wiring the FastAPI fetch
const MOCK_RESULTS: EvaluationResult[] = [
  {
    vendor_id: "v-123",
    criterion_id: "c-456",
    status: "MANUAL_REVIEW_REQUIRED",
    flag: "PROXIMITY_REVIEW_REQUIRED",
    python_parsed_value: 50000000,
    timestamp: new Date().toISOString(),
    evidence_payload: {
      raw_string: "Rs 5 Cr",
      context_sentence: "The bidder must have a standalone turnover of Rs 5 Cr, while group turnover is Rs 12 Cr.",
      page_num: 1,
      source_chunk_bbox: [100, 250, 400, 280] // PyMuPDF coordinates
    },
    requires_human_override: true
  }
];

export default function EvaluatePage() {
  const router = useRouter();
  const params = useParams();
  const [results, setResults] = useState<EvaluationResult[]>(MOCK_RESULTS);
  const [activePage, setActivePage] = useState<number>(1);
  const [activeBBox, setActiveBBox] = useState<[number, number, number, number] | null>(null);
  const [activeCriterionId, setActiveCriterionId] = useState<string | null>(null);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  
  // This state will be updated by PDFViewer's onScaleCalculated event
  const [pdfScale, setPdfScale] = useState<number>(1.0); 

  const handleSelectCriterion = (id: string, pageNum: number, bbox?: [number, number, number, number]) => {
    setActiveCriterionId(id);
    setActivePage(pageNum);
    setActiveBBox(bbox || null);
    
    // Auto-open override if it's a review item (optional UX choice)
    const res = results.find(r => r.criterion_id === id);
    if (res?.status === 'MANUAL_REVIEW_REQUIRED') {
        setIsOverrideModalOpen(true);
    }
  };

  const handleSubmitOverride = (verdict: "PASS" | "FAIL", annotation: string) => {
    if (!activeCriterionId) return;

    // Local state update (Mocking the POST response)
    setResults(prev => prev.map(res => {
      if (res.criterion_id === activeCriterionId) {
        return {
          ...res,
          status: verdict as any,
          flag: "HUMAN_OVERRIDDEN" as any,
          requires_human_override: false
        };
      }
      return res;
    }));

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
