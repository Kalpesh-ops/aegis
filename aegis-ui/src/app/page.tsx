"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import Dropzone from "@/components/layout/Dropzone";
import { uploadTender, uploadVendorEvidence } from "@/lib/api";
import { TenderCriterion } from "@/types";
import {
  ShieldCheck, FileSearch, Scale, History, ArrowRight, UploadCloud,
  Sun, Moon, CheckCircle, FileUp, Lock, Eye, Cpu, ChevronRight,
  AlertTriangle, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Animation Variants ── */
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 80, damping: 16 } },
};

const STEPS = ["Upload Tender", "Confirm Criteria", "Upload Vendor", "Evaluate"];

export default function LandingPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  /* ── Ingestion State Machine ── */
  const [step, setStep] = useState(0); // 0 = landing
  const [isUploading, setIsUploading] = useState(false);
  const [criteria, setCriteria] = useState<TenderCriterion[]>([]);
  const [tenderId, setTenderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTenderUpload = async (file: File) => {
    setIsUploading(true); setError(null);
    try {
      const payload = await uploadTender(file);
      setCriteria(payload.criteria);
      setTenderId(payload.tender_id);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to extract criteria.");
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

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">

      {/* ── Ambient gradient blurs ── */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 dark:bg-blue-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-400/10 dark:bg-amber-900/20 blur-[120px] pointer-events-none" />

      {/* ── Error Modal ── */}
      {error && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className={`p-4 flex items-center space-x-3 ${isRateLimit ? "bg-amber-500" : "bg-red-600"}`}>
              <AlertTriangle className="w-5 h-5 text-white" />
              <h3 className="font-bold text-white">{isRateLimit ? "API Rate Limit" : "System Exception"}</h3>
            </div>
            <div className="p-6">
              <p className="text-slate-700 dark:text-slate-300 font-medium mb-2">{error}</p>
              {isRateLimit && <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">Free-tier quota exceeded. Wait 30–60 s and retry.</p>}
              <div className="flex justify-end mt-4">
                <button onClick={() => setError(null)} className="px-5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg font-semibold transition">Dismiss</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ══════════ NAVIGATION ══════════ */}
      <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
        className="relative z-10 border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          <span className="font-newsreader text-2xl font-bold tracking-tight">Aegis.</span>
          <span className="text-[9px] ml-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-800/50">
            v1.0
          </span>
        </div>
        <div className="flex items-center space-x-4">
          {step > 0 && (
            <button onClick={() => { setStep(0); setCriteria([]); setTenderId(null); }}
              className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition font-medium">
              ← Home
            </button>
          )}
          {mounted && (
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
            </button>
          )}
        </div>
      </motion.nav>

      {/* ══════════ LANDING (step 0) ══════════ */}
      {step === 0 && (
        <>
          {/* Hero */}
          <motion.header variants={stagger} initial="hidden" animate="show"
            className="relative z-10 max-w-7xl mx-auto pt-20 pb-16 px-6 flex flex-col lg:flex-row items-center gap-16 w-full">

            <div className="lg:w-1/2 space-y-7">
              <motion.div variants={fadeUp}
                className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-widest rounded-full border border-blue-200 dark:border-blue-800/50 uppercase">
                AI for Bharat · Theme 3 · CRPF Tender Evaluation
              </motion.div>

              <motion.h1 variants={fadeUp} className="font-newsreader text-5xl lg:text-6xl font-semibold leading-[1.1] tracking-tight">
                High-Assurance AI for{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 italic">
                  Formal Audits.
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-light max-w-lg">
                Aegis eliminates manual evaluation bottlenecks. Using deterministic Dual-Pass Normalization, we extract,
                evaluate, and visually ground vendor evidence against rigid statutory criteria.
              </motion.p>

              <motion.div variants={fadeUp} className="pt-2">
                <button onClick={() => setStep(1)}
                  className="group relative inline-flex items-center px-8 py-3.5 text-base font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-full hover:bg-blue-600 dark:hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-[0.97]">
                  Initialize Engine
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </div>

            {/* Guardrails Card */}
            <motion.div variants={fadeUp} className="lg:w-1/2 w-full">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-15 group-hover:opacity-30 transition duration-700" />
                <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-2xl space-y-6">
                  <h3 className="font-newsreader text-xl font-semibold border-b border-slate-100 dark:border-slate-800 pb-4">Architectural Guardrails</h3>
                  <ul className="space-y-5">
                    {[
                      { icon: ShieldCheck, color: "green", title: "Zero Silent Disqualifications", desc: "All edge cases default to mandatory human-in-the-loop review." },
                      { icon: Eye, color: "blue", title: "Visual Grounding", desc: "Extracted data mapped to exact PDF bounding boxes for officer verification." },
                      { icon: Lock, color: "amber", title: "Immutable Audit Ledger", desc: "Append-only PostgreSQL architecture. No deletions, no edits — ever." },
                      { icon: Cpu, color: "purple", title: "AI for Extraction Only", desc: "Final decisions are deterministic Python. The LLM never passes or fails a vendor." },
                    ].map((g, i) => (
                      <li key={i} className="flex items-start">
                        <div className={`p-2 bg-${g.color}-50 dark:bg-${g.color}-900/20 rounded-md mr-4 shrink-0`}>
                          <g.icon className={`w-5 h-5 text-${g.color}-600 dark:text-${g.color}-400`} />
                        </div>
                        <div>
                          <strong className="block text-slate-900 dark:text-white text-sm">{g.title}</strong>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{g.desc}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.header>

          {/* Value Pillars */}
          <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }}
            className="relative z-10 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 py-20">
            <div className="max-w-7xl mx-auto px-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-2">Technical Architecture</p>
              <h2 className="font-newsreader text-3xl font-semibold mb-12">How Aegis Evaluates a Tender</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: Scale, title: "Dual-Pass Normalization", desc: "The LLM extracts semantic evidence. A deterministic Python parser independently computes the numerical value. Mismatches trigger an automatic LLM_PYTHON_MISMATCH flag for manual review." },
                  { icon: FileSearch, title: "Proximity Gap Detection", desc: "If multiple financial figures (e.g. Standalone vs. Group Turnover) exist in close proximity, the system halts with PROXIMITY_REVIEW_REQUIRED — preventing silent misattribution." },
                  { icon: History, title: "Append-Only Audit Trail", desc: "PostgreSQL constraints forbid UPDATEs or DELETEs. Every officer override is a new row — producing a tamper-proof compliance record exportable as CSV." },
                ].map((p, i) => (
                  <div key={i} className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800/50 transition-all">
                    <p.icon className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-6" />
                    <h3 className="font-newsreader text-xl font-semibold mb-3">{p.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Process Flow */}
          <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }}
            className="relative z-10 py-20 bg-white dark:bg-slate-950">
            <div className="max-w-7xl mx-auto px-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-2">Operational Flow</p>
              <h2 className="font-newsreader text-3xl font-semibold mb-12">End-to-End Pipeline</h2>
              <div className="grid md:grid-cols-4 gap-5">
                {[
                  { n: "01", label: "Tender Ingestion", desc: "Officer uploads the CRPF tender PDF. The LLM extracts rigid eligibility criteria and persists them to PostgreSQL." },
                  { n: "02", label: "Vendor Extraction", desc: "Heterogeneous vendor bids are parsed. Dual-Pass produces a raw string + deterministic float per criterion." },
                  { n: "03", label: "Rule Engine", desc: "Python compares the float against thresholds. Mismatches and proximity conflicts trigger mandatory review flags." },
                  { n: "04", label: "Visual Grounding", desc: "The officer reviews flagged items side-by-side with the original PDF, with source text highlighted via bounding boxes." },
                ].map((s, i) => (
                  <div key={i} className="relative p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 group hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                    <span className="text-4xl font-black text-blue-100 dark:text-blue-900/50 group-hover:text-blue-200 dark:group-hover:text-blue-800/50 transition">{s.n}</span>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{s.label}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                    {i < 3 && <ChevronRight className="hidden md:block absolute -right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-600" />}
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* CTA */}
          <section className="relative z-10 bg-slate-900 dark:bg-slate-800 py-14 text-center text-white">
            <h2 className="font-newsreader text-3xl font-semibold mb-3">Ready to Begin?</h2>
            <p className="text-slate-400 mb-8 text-sm max-w-lg mx-auto">
              Upload your CRPF tender specification to initialize the secure evaluation environment.
            </p>
            <button onClick={() => setStep(1)}
              className="bg-white text-slate-900 px-8 py-3.5 rounded-full font-bold hover:bg-blue-50 hover:shadow-lg transition-all active:scale-[0.97]">
              Launch Ingestion Protocol <ArrowRight className="inline ml-2 w-4 h-4" />
            </button>
          </section>

          {/* Footer */}
          <footer className="relative z-10 bg-slate-950 text-slate-500 text-xs py-6 text-center border-t border-slate-800">
            <p>Aegis High-Assurance Procurement Gateway · AI for Bharat Hackathon 2026 · Theme 3: CRPF Tender Evaluation</p>
            <p className="mt-1 text-slate-600">FastAPI · Next.js · PostgreSQL · Gemini LLM · PyMuPDF</p>
          </footer>
        </>
      )}

      {/* ══════════ INGESTION WIZARD (steps 1–4) ══════════ */}
      {step > 0 && (
        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 80, damping: 16 }}
            className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Wizard header */}
            <div className="bg-slate-900 dark:bg-slate-800 p-6 text-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400 mb-1">Secure Ingestion Protocol</p>
              <h2 className="font-newsreader text-lg font-semibold">Aegis Evaluation Pipeline</h2>
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
                        <span className={cn("text-[9px] mt-1.5 font-medium", step >= sIdx ? "text-slate-300" : "text-slate-600")}>{label}</span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={cn("w-10 h-0.5 mx-1 mb-4 rounded-full", step > sIdx ? "bg-green-500" : "bg-slate-700")} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step content */}
            <div className="p-8">
              {step === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-newsreader text-xl font-semibold text-slate-800 dark:text-white">Upload Tender Specification</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Upload the master CRPF tender document. The system will extract structured eligibility criteria via LLM.</p>
                  </div>
                  <Dropzone onFileSelect={handleTenderUpload} isUploading={isUploading} label="Upload Tender PDF (CRPF-SPEC-01)" />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-newsreader text-xl font-semibold text-slate-800 dark:text-white">Confirm Extracted Criteria</h3>
                      <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full border border-green-200 dark:border-green-800">
                        {criteria.length} found
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Review and validate before vendor evaluation begins. This is a blocking checkpoint.</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    <div className="max-h-56 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-700">
                      {criteria.map((c, idx) => (
                        <div key={idx} className="p-4 flex items-start space-x-3 hover:bg-white dark:hover:bg-slate-700/50 transition">
                          <div className="mt-0.5 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[10px] font-bold text-blue-700 dark:text-blue-300 shrink-0">
                            {idx + 1}
                          </div>
                          <div className="space-y-1 flex-1">
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{c.description}</p>
                            <span className="text-[10px] font-bold uppercase text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">
                              {c.threshold_type} {c.threshold_value != null ? c.threshold_value : ""} {c.unit || ""}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button onClick={() => setStep(3)}
                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3.5 rounded-xl font-bold hover:bg-blue-600 dark:hover:bg-blue-50 transition-all shadow-lg active:scale-[0.98] flex items-center justify-center space-x-2">
                    <Lock className="w-4 h-4" />
                    <span>Confirm & Proceed to Vendor Upload</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-newsreader text-xl font-semibold text-slate-800 dark:text-white">Upload Vendor Submission</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Upload vendor technical/financial bids. The system will run Dual-Pass extraction and trigger the deterministic rule engine.</p>
                  </div>
                  <Dropzone onFileSelect={handleVendorUpload} isUploading={isUploading} label="Upload Vendor PDF (Technical / Financial Bid)" />
                </motion.div>
              )}

              {step === 4 && (
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6 text-center py-6">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-newsreader text-2xl font-semibold text-slate-800 dark:text-white">Pipeline Complete</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Vendor evidence extracted, normalized, and evaluated against tender criteria.</p>
                  </div>
                  <button onClick={() => router.push(`/evaluate/${tenderId}`)}
                    className="inline-flex items-center px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold hover:bg-blue-600 dark:hover:bg-blue-50 transition-all shadow-xl active:scale-[0.97] space-x-2">
                    <span>Launch Verification Workspace</span>
                    <FileUp className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
