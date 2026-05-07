'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, FileSearch, Scale, History, ArrowRight, UploadCloud } from 'lucide-react';
import Dropzone from '@/components/layout/Dropzone';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
} as const;

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Background Gradients - Only visible in dark mode to prevent 'muddy' light mode */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none -z-10 hidden dark:block" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-900/20 blur-[120px] pointer-events-none -z-10 hidden dark:block" />

      <Navbar />

      <main className="flex-grow pt-24">
        {/* HERO SECTION */}
        <section id="hero" className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center text-center">
          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="space-y-8 max-w-4xl">
            <motion.div variants={fadeUp} className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-bold tracking-widest rounded-full border border-blue-200 dark:border-blue-800/50 uppercase">
              CRPF Procurement Prototype
            </motion.div>

            <motion.h1 variants={fadeUp} className="font-newsreader text-5xl md:text-7xl font-semibold leading-[1.1] tracking-tight">
              High-Assurance AI for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 italic">
                Formal Audits.
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg text-slate-700 dark:text-slate-400 leading-relaxed font-light mx-auto max-w-2xl">
              Aegis eliminates manual evaluation bottlenecks. Using deterministic Dual-Pass Normalization, we extract, evaluate, and visually ground vendor evidence against rigid statutory criteria.
            </motion.p>

            <motion.div variants={fadeUp} className="pt-4">
              <Link href="/upload" className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white transition-all duration-200 bg-slate-900 dark:bg-white dark:text-slate-900 border border-transparent rounded-full hover:bg-blue-600 dark:hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-500/30">
                Initialize Engine
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </section>



        {/* ARCHITECTURE OVERVIEW */}
        <section id="architecture" className="max-w-full bg-slate-50/50 dark:bg-transparent py-24 scroll-mt-24">
          <div className="max-w-4xl mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="font-newsreader text-4xl font-semibold mb-12 text-center text-slate-900 dark:text-white">System Architecture</h2>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-10 shadow-xl dark:shadow-none">
                <ul className="space-y-8">
                  <li className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl shrink-0">
                      <ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Zero Silent Disqualifications</h3>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">The AI never makes final rejection decisions. All ambiguous edge cases, missing data, or proximity flags automatically default to a mandatory Human-in-the-Loop review.</p>
                    </div>
                  </li>
                  <li className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl shrink-0">
                      <FileSearch className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Visual Grounding</h3>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Extracted data is deterministically mapped to exact `[x, y]` bounding boxes. Officers click a flagged criterion and the UI jumps to the exact highlighted paragraph in the original PDF.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </section>

        {/* PILLARS */}
        <section id="pillars" className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 py-24 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
            {[
              { icon: Scale, title: "Dual-Pass Normalization", desc: "LLMs extract semantic context. A deterministic Python engine handles mathematical validation. Hallucinations are mathematically impossible." },
              { icon: FileSearch, title: "Proximity Gap Detection", desc: "If conflicting financial figures (e.g., Standalone vs. Group Turnover) exist within a 30-word radius, Aegis halts and alerts the officer." },
              { icon: History, title: "Append-Only Ledger", desc: "PostgreSQL constraints forbid updates or deletions. Every human override and algorithmic verdict is logged into a tamper-proof chain." }
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg dark:shadow-none hover:shadow-xl transition-all">
                <item.icon className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-6" />
                <h3 className="font-newsreader text-xl font-semibold mb-3 text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
