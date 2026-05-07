"use client";

import { useState } from "react";
import { X, ShieldAlert, CheckCircle2, XCircle, MessageSquareQuote } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface OverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  criterionId: string;
  onSubmit: (verdict: "PASS" | "FAIL", annotation: string) => void;
}

export default function OverrideModal({ 
  isOpen, 
  onClose, 
  criterionId, 
  onSubmit 
}: OverrideModalProps) {
  const [verdict, setVerdict] = useState<"PASS" | "FAIL">("PASS");
  const [annotation, setAnnotation] = useState("");

  if (!isOpen) return null;

  const isInvalid = annotation.trim().length < 10;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-newsreader font-bold text-slate-900 dark:text-white">Manual Override</h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Audit Intervention Required</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors group">
              <X className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white" />
            </button>
          </div>

          <div className="p-8 space-y-8">
            {/* Criterion Identifier */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">Active Criterion</label>
              <div className="px-4 py-3 bg-slate-100 dark:bg-slate-950 rounded-xl text-sm font-mono text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                {criterionId}
                <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full font-bold">LOCKED</span>
              </div>
            </div>

            {/* Verdict Selection */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">Determination</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setVerdict("PASS")}
                  className={cn(
                    "relative flex items-center justify-center gap-3 py-4 rounded-2xl border-2 font-bold transition-all",
                    verdict === "PASS" 
                      ? "bg-green-50/50 border-green-500 text-green-700 dark:bg-green-900/10 dark:border-green-600 dark:text-green-400 shadow-lg shadow-green-500/10" 
                      : "border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  )}
                >
                  <CheckCircle2 className={cn("w-5 h-5", verdict === "PASS" ? "opacity-100" : "opacity-30")} />
                  PASS
                </button>
                <button
                  onClick={() => setVerdict("FAIL")}
                  className={cn(
                    "relative flex items-center justify-center gap-3 py-4 rounded-2xl border-2 font-bold transition-all",
                    verdict === "FAIL" 
                      ? "bg-red-50/50 border-red-500 text-red-700 dark:bg-red-900/10 dark:border-red-600 dark:text-red-400 shadow-lg shadow-red-500/10" 
                      : "border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  )}
                >
                  <XCircle className={cn("w-5 h-5", verdict === "FAIL" ? "opacity-100" : "opacity-30")} />
                  FAIL
                </button>
              </div>
            </div>

            {/* Justification Area */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">Audit Justification</label>
                <span className={cn("text-[10px] font-bold", annotation.length < 10 ? "text-amber-500" : "text-green-500")}>
                  {annotation.length} / 10 CHARS MIN
                </span>
              </div>
              <div className="relative">
                <MessageSquareQuote className="absolute top-4 left-4 w-5 h-5 text-slate-300 dark:text-slate-700 pointer-events-none" />
                <textarea
                  value={annotation}
                  onChange={(e) => setAnnotation(e.target.value)}
                  placeholder="Explain the technical rationale for this override..."
                  className="w-full h-36 pl-12 pr-4 py-4 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Discard Changes
            </button>
            <button
              disabled={isInvalid}
              onClick={() => onSubmit(verdict, annotation)}
              className={cn(
                "px-8 py-2.5 rounded-full text-sm font-bold transition-all shadow-xl",
                isInvalid 
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800" 
                  : "bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:scale-105 active:scale-95"
              )}
            >
              Confirm Override
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
