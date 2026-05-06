"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">Manual Override</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Criterion ID</label>
            <div className="px-3 py-2 bg-gray-100 rounded text-xs font-mono text-gray-600 border border-gray-200">
              {criterionId}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">New Verdict</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setVerdict("PASS")}
                className={cn(
                  "py-2 px-4 rounded-lg border font-medium transition-all",
                  verdict === "PASS" 
                    ? "bg-green-50 border-green-500 text-green-700 ring-2 ring-green-500/20" 
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                )}
              >
                PASS
              </button>
              <button
                onClick={() => setVerdict("FAIL")}
                className={cn(
                  "py-2 px-4 rounded-lg border font-medium transition-all",
                  verdict === "FAIL" 
                    ? "bg-red-50 border-red-500 text-red-700 ring-2 ring-red-500/20" 
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                )}
              >
                FAIL
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex justify-between">
              Justification
              <span className={cn("text-[10px]", annotation.length < 10 ? "text-red-500" : "text-green-500")}>
                {annotation.length}/10 min chars
              </span>
            </label>
            <textarea
              value={annotation}
              onChange={(e) => setAnnotation(e.target.value)}
              placeholder="Provide a detailed justification for this override. Government audit trail requires substantial reasoning."
              className="w-full h-32 p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all"
            />
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={isInvalid}
            onClick={() => onSubmit(verdict, annotation)}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-md",
              isInvalid 
                ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none" 
                : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
            )}
          >
            Submit Override
          </button>
        </div>
      </div>
    </div>
  );
}
