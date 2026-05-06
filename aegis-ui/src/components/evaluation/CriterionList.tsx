'use client';

import { EvaluationResult } from '@/types';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

interface CriterionListProps {
  results: EvaluationResult[];
  activeCriterionId: string | null;
  onSelect: (criterionId: string, pageNum: number, bbox?: [number, number, number, number]) => void;
}

export function CriterionList({ results, activeCriterionId, onSelect }: CriterionListProps) {
  return (
    <div className="flex flex-col space-y-3 h-full overflow-y-auto p-4">
      {results.map((res) => {
        const isActive = res.criterion_id === activeCriterionId;
        
        return (
          <div
            key={res.criterion_id}
            onClick={() => onSelect(res.criterion_id, res.evidence_payload.page_num, res.evidence_payload.source_chunk_bbox)}
            className={clsx(
              "p-4 border rounded-lg cursor-pointer transition-all duration-200",
              isActive ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-500/20" : "border-gray-200 hover:bg-gray-50 hover:border-blue-300"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm text-gray-700">Criterion: {res.criterion_id.slice(0,8)}</span>
              {res.status === 'PASS' && <CheckCircle className="w-5 h-5 text-green-500" />}
              {res.status === 'FAIL' && <XCircle className="w-5 h-5 text-red-500" />}
              {res.status === 'MANUAL_REVIEW_REQUIRED' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
            </div>
            
            <p className="text-xs text-gray-600 mb-2 font-mono bg-gray-100 p-2 rounded">
              {res.evidence_payload.raw_string || "No evidence extracted."}
            </p>

            {res.flag && (
              <div className="flex items-center justify-between mt-2">
                <span className="inline-block px-2 py-1 text-[10px] font-bold text-red-700 bg-red-100 rounded-full">
                  FLAG: {res.flag.replace(/_/g, ' ')}
                </span>
                {res.status === 'MANUAL_REVIEW_REQUIRED' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(res.criterion_id, res.evidence_payload.page_num, res.evidence_payload.source_chunk_bbox);
                      // Triggering parent callback would be better, but assuming parent handles state
                    }}
                    className="text-[10px] font-bold text-blue-600 hover:underline"
                  >
                    Request Override
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
