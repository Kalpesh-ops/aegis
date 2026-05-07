'use client';

import { EvaluationResult } from '@/types';
import { CheckCircle2, XCircle, AlertTriangle, FileText, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface CriterionListProps {
  results: EvaluationResult[];
  activeCriterionId: string | null;
  onSelect: (criterionId: string, pageNum: number, bbox?: [number, number, number, number]) => void;
}

export function CriterionList({ results, activeCriterionId, onSelect }: CriterionListProps) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
        <h2 className="font-newsreader text-xl font-bold text-slate-900 dark:text-white">Compliance Checklist</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest font-bold">Extraction Intelligence</p>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {results.map((res, i) => {
          const isActive = res.criterion_id === activeCriterionId;
          
          return (
            <motion.div
              key={res.criterion_id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelect(res.criterion_id, res.evidence_payload.page_num, res.evidence_payload.source_chunk_bbox)}
              className={clsx(
                "group relative p-5 border rounded-2xl cursor-pointer transition-all duration-300",
                isActive 
                  ? "border-blue-500 bg-blue-50/30 dark:bg-blue-900/10 shadow-lg ring-1 ring-blue-500/20" 
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-md"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={clsx(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    isActive ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600"
                  )}>
                    <span className="text-xs font-bold">{i + 1}</span>
                  </div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[150px]">
                    {res.criterion_id.slice(0, 12)}
                  </span>
                </div>
                
                {res.status === 'PASS' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                {res.status === 'FAIL' && <XCircle className="w-5 h-5 text-red-500" />}
                {res.status === 'MANUAL_REVIEW_REQUIRED' && (
                  <div className="flex items-center space-x-1 animate-pulse">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  </div>
                )}
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-3 mb-4 border border-slate-100 dark:border-slate-800/50">
                <p className="text-xs text-slate-600 dark:text-slate-400 italic line-clamp-2 leading-relaxed">
                  "{res.evidence_payload.raw_string || "No evidence extracted."}"
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={clsx(
                    "px-2 py-0.5 text-[10px] font-bold rounded-full border tracking-tighter uppercase",
                    res.status === 'MANUAL_REVIEW_REQUIRED' 
                      ? "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-800"
                      : "text-slate-500 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700"
                  )}>
                    {res.status.replace(/_/g, ' ')}
                  </span>
                  <span className="flex items-center text-[10px] font-bold text-blue-600 dark:text-blue-400">
                    <FileText className="w-3 h-3 mr-1" />
                    Page {res.evidence_payload.page_num}
                  </span>
                </div>
                
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-blue-500 animate-bounce-horizontal" />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
