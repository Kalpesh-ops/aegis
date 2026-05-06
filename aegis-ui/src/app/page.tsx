"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Dropzone from "@/components/layout/Dropzone";
import { uploadTender, uploadVendorEvidence } from "@/lib/api";
import { TenderCriterion } from "@/types";
import {
  CheckCircle, FileUp, ShieldCheck, ArrowRight, Scale,
  FileSearch, History, UploadCloud, Loader2, AlertTriangle,
  Lock, Eye, Cpu, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── step labels for the progress bar ── */
const STEPS = ["Upload Tender", "Confirm Criteria", "Upload Vendor", "Evaluate"];

export default function LandingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);          // 0 = hero / landing
  const [isUploading, setIsUploading] = useState(false);
  const [criteria, setCriteria] = useState<TenderCriterion[]>([]);
  const [tenderId, setTenderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ── handlers ── */
  const handleTenderUpload = async (file: File) => {
    setIsUploading(true); setError(null);
    try {
      const payload = await uploadTender(file);
      setCriteria(payload.criteria);
      setTenderId(payload.tender_id);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to extract criteria from tender document.");
    } finally { setIsUploading(false); }
  };

  const handleVendorUpload = async (file: File) => {
    if (!tenderId) return;
    setIsUploading(true); setError(null);
    try {
      await uploadVendorEvidence(tenderId, "Global Defense Systems Ltd", file);
      setStep(4);
    } catch (err: any) {
      setError(err.message || "Failed to process vendor evidence.");
    } finally { setIsUploading(false); }
  };

  const isRateLimit = error
    ? ["rate", "quota", "429"].some(k => error.toLowerCase().includes(k))
    : false;

  /* ════════════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">

      {/* ── ERROR MODAL ── */}
      {error && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className={`p-4 flex items-center space-x-3 ${isRateLimit ? "bg-amber-500" : "bg-red-600"}`}>
              <AlertTriangle className="w-5 h-5 text-white" />
              <h3 className="font-bold text-white">{isRateLimit ? "API Rate Limit" : "System Exception"}</h3>
            </div>
            <div className="p-6">
              <p className="text-slate-700 font-medium mb-2">{error}</p>
              {isRateLimit && (
                <p className="text-sm text-amber-600 mb-4">
                  Free-tier quota exceeded. The system retries automatically with alternate models. Wait 30-60 s and try again.
                </p>
              )}
              <div className="flex justify-end mt-4">
                <button onClick={() => setError(null)}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold transition">
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ NAVIGATION ══════════ */}
      <nav className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center shadow-md z-10">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="w-7 h-7 text-blue-400" />
          <span className="text-xl font-bold tracking-tight">Aegis Gateway</span>
          <span className="text-[10px] ml-2 px-2 py-0.5 bg-blue-600/30 text-blue-300 rounded-full font-bold uppercase tracking-wider">
            v1.0 Prototype
          </span>
        </div>
        {step > 0 && (
          <button onClick={() => { setStep(0); setCriteria([]); setTenderId(null); }}
            className="text-sm text-slate-400 hover:text-white transition font-medium">
            ← Back to Home
          </button>
        )}
      </nav>

      {/* ══════════ HERO (step 0) ══════════ */}
      {step === 0 && (
        <>
          <header className="max-w-6xl mx-auto pt-20 pb-16 px-6 flex flex-col md:flex-row items-center gap-12 w-full">
            {/* Left — Value Prop */}
            <div className="md:w-1/2 space-y-6">
              <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full border border-blue-200 uppercase tracking-wider">
                AI for Bharat · Theme 3 · CRPF Tender Evaluation
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
                High-Assurance AI for{" "}
                <span className="text-blue-600">Government Tenders.</span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                Aegis eliminates manual evaluation bottlenecks without sacrificing auditability.
                Using <strong>Dual-Pass Normalization</strong>, we extract, evaluate, and visually
                ground vendor evidence against strict government criteria — then lock every decision
                into a tamper-proof ledger.
              </p>
              <div className="flex space-x-4 pt-2">
                <button onClick={() => setStep(1)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow-sm flex items-center active:scale-[0.97]">
                  Start Evaluation <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right — System Guardrails Card */}
            <div className="md:w-1/2 w-full bg-white p-1 rounded-xl shadow-xl border border-slate-200">
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-8 space-y-5">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-3">
                  System Guardrails
                </h3>
                <ul className="space-y-4 text-sm text-slate-600">
                  <li className="flex items-start">
                    <ShieldCheck className="w-5 h-5 text-green-600 mr-3 shrink-0 mt-0.5" />
                    <div><strong className="text-slate-800">Zero Silent Disqualifications.</strong>{" "}All edge cases default to mandatory human review — never automated rejection.</div>
                  </li>
                  <li className="flex items-start">
                    <Eye className="w-5 h-5 text-blue-600 mr-3 shrink-0 mt-0.5" />
                    <div><strong className="text-slate-800">Visual Grounding.</strong>{" "}Extracted data is mapped to exact PDF page coordinates with bounding-box highlighting.</div>
                  </li>
                  <li className="flex items-start">
                    <Lock className="w-5 h-5 text-amber-600 mr-3 shrink-0 mt-0.5" />
                    <div><strong className="text-slate-800">Immutable Audit Ledger.</strong>{" "}Officer overrides are tracked via an append-only PostgreSQL architecture. No deletions, no edits.</div>
                  </li>
                  <li className="flex items-start">
                    <Cpu className="w-5 h-5 text-purple-600 mr-3 shrink-0 mt-0.5" />
                    <div><strong className="text-slate-800">AI for Extraction Only.</strong>{" "}Final compliance decisions are made by a deterministic Python rule engine — never by the LLM.</div>
                  </li>
                </ul>
              </div>
            </div>
          </header>

          {/* ── Value Pillars ── */}
          <section className="bg-slate-900 text-white py-16">
            <div className="max-w-6xl mx-auto px-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400 mb-2">Technical Architecture</p>
              <h2 className="text-2xl font-bold mb-10">How Aegis Evaluates a Tender</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: <Scale className="w-7 h-7 text-blue-400" />, title: "Dual-Pass Normalization",
                    text: "The LLM extracts semantic evidence. A deterministic Python parser independently computes the numerical value. Mismatches trigger an automatic LLM_PYTHON_MISMATCH flag for manual review." },
                  { icon: <FileSearch className="w-7 h-7 text-blue-400" />, title: "Proximity Gap Detection",
                    text: "If multiple financial figures (e.g. Standalone vs. Group Turnover) are detected in the same sentence, the system halts with PROXIMITY_REVIEW_REQUIRED — preventing silent misattribution." },
                  { icon: <History className="w-7 h-7 text-blue-400" />, title: "Append-Only Audit Trail",
                    text: "The PostgreSQL table enforces immutability at the constraint level. Every officer override is a new row — never an UPDATE or DELETE — producing a tamper-proof compliance record." },
                ].map((pillar, i) => (
                  <div key={i} className="p-6 bg-slate-800 rounded-xl border border-slate-700 space-y-4 hover:border-blue-500/40 transition">
                    {pillar.icon}
                    <h3 className="text-lg font-bold">{pillar.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{pillar.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Process Flow ── */}
          <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 mb-2">Operational Flow</p>
              <h2 className="text-2xl font-bold text-slate-900 mb-10">End-to-End Pipeline</h2>
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { num: "01", label: "Tender Ingestion", desc: "Officer uploads the CRPF tender PDF. The LLM extracts rigid eligibility criteria and persists them." },
                  { num: "02", label: "Vendor Extraction", desc: "Heterogeneous vendor bids are parsed. Dual-Pass produces a raw string + deterministic float per criterion." },
                  { num: "03", label: "Rule Engine", desc: "Python compares the float against thresholds. Mismatches and proximity conflicts are flagged for review." },
                  { num: "04", label: "Visual Grounding", desc: "The officer reviews flagged items side-by-side with the original PDF, with source text highlighted in-situ." },
                ].map((s, i) => (
                  <div key={i} className="relative p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 group hover:border-blue-300 transition">
                    <span className="text-3xl font-black text-blue-100 group-hover:text-blue-200 transition">{s.num}</span>
                    <h4 className="text-sm font-bold text-slate-800">{s.label}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                    {i < 3 && <ChevronRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA Footer ── */}
          <section className="bg-blue-600 py-12 text-center text-white">
            <h2 className="text-2xl font-bold mb-3">Ready to Begin?</h2>
            <p className="text-blue-100 mb-6 text-sm max-w-lg mx-auto">
              Upload your CRPF tender specification to initialize the secure evaluation environment.
            </p>
            <button onClick={() => setStep(1)}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition shadow active:scale-[0.97]">
              Launch Ingestion Protocol <ArrowRight className="inline ml-2 w-4 h-4" />
            </button>
          </section>

          {/* ── Footer ── */}
          <footer className="bg-slate-900 text-slate-500 text-xs py-6 text-center">
            <p>Aegis High-Assurance Procurement Gateway · AI for Bharat Hackathon 2025 · Theme 3: CRPF Tender Evaluation</p>
            <p className="mt-1 text-slate-600">Built with FastAPI · Next.js · PostgreSQL · Gemini LLM · PyMuPDF</p>
          </footer>
        </>
      )}

      {/* ══════════ INGESTION WIZARD (steps 1–4) ══════════ */}
      {step > 0 && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Wizard header with step bar */}
            <div className="bg-slate-900 p-6 text-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400 mb-1">Secure Ingestion Protocol</p>
              <h2 className="text-lg font-bold">Aegis Evaluation Pipeline</h2>
              <div className="mt-6 flex items-center">
                {STEPS.map((label, i) => {
                  const sIdx = i + 1;
                  return (
                    <div key={i} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                          step > sIdx ? "bg-green-500 text-white" :
                          step === sIdx ? "bg-blue-500 text-white ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900" :
                          "bg-slate-700 text-slate-400"
                        )}>
                          {step > sIdx ? <CheckCircle className="w-4 h-4" /> : sIdx}
                        </div>
                        <span className={cn("text-[9px] mt-1.5 font-medium",
                          step >= sIdx ? "text-slate-300" : "text-slate-600"
                        )}>{label}</span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={cn("w-12 h-0.5 mx-1 mb-4 rounded-full",
                          step > sIdx ? "bg-green-500" : "bg-slate-700"
                        )} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step content */}
            <div className="p-8">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-800">Upload Tender Specification</h3>
                    <p className="text-sm text-slate-500">Upload the master CRPF tender document. The system will extract structured eligibility criteria via LLM.</p>
                  </div>
                  <Dropzone onFileSelect={handleTenderUpload} isUploading={isUploading} label="Upload Tender PDF (CRPF-SPEC-01)" />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-800">Confirm Extracted Criteria</h3>
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                        {criteria.length} criteria found
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">Review and validate the AI-extracted eligibility criteria before vendor evaluation begins. This is a blocking checkpoint.</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                    <div className="max-h-56 overflow-y-auto divide-y divide-slate-200">
                      {criteria.map((c, idx) => (
                        <div key={idx} className="p-4 flex items-start space-x-3 hover:bg-white transition">
                          <div className="mt-0.5 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700 shrink-0">
                            {idx + 1}
                          </div>
                          <div className="space-y-1 flex-1">
                            <p className="text-sm font-medium text-slate-800">{c.description}</p>
                            <div className="flex space-x-2">
                              <span className="text-[10px] font-bold uppercase text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {c.threshold_type} {c.threshold_value != null ? c.threshold_value : ""} {c.unit || ""}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button onClick={() => setStep(3)}
                    className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg active:scale-[0.98] flex items-center justify-center space-x-2">
                    <Lock className="w-4 h-4" />
                    <span>Confirm & Proceed to Vendor Upload</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-800">Upload Vendor Submission</h3>
                    <p className="text-sm text-slate-500">Upload vendor technical/financial bids. The system will run Dual-Pass extraction and trigger the deterministic rule engine.</p>
                  </div>
                  <Dropzone onFileSelect={handleVendorUpload} isUploading={isUploading} label="Upload Vendor PDF (Technical / Financial Bid)" />
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6 text-center py-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-800">Pipeline Complete</h3>
                    <p className="text-slate-500 text-sm">Vendor evidence extracted, normalized, and evaluated against tender criteria.</p>
                  </div>
                  <button onClick={() => router.push(`/evaluate/${tenderId}`)}
                    className="inline-flex items-center px-8 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-xl active:scale-[0.97] space-x-2">
                    <span>Launch Verification Workspace</span>
                    <FileUp className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
