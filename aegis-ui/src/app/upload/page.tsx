'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import Dropzone from '@/components/layout/Dropzone';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

interface Criterion {
  id: string;
  description: string;
  threshold_value: number | null;
  threshold_type: string;
  unit: string | null;
  page_number: number;
}

export default function UploadPage() {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [extractedData, setExtractedData] = useState<{
    tender_id: string;
    criteria: Criterion[];
  } | null>(null);

  const handleFileSelect = async (file: File) => {
    setUploadStatus('uploading');
    setErrorMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/v1/tenders/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data = await response.json();
      setExtractedData(data);
      setUploadStatus('success');
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred');
      setUploadStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Back Link */}
          <Link 
            href="/" 
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Gateway
          </Link>

          <AnimatePresence mode="wait">
            {uploadStatus !== 'success' ? (
              <motion.div
                key="upload-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                <div className="max-w-2xl">
                  <h1 className="font-newsreader text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                    Initialize Procurement <br/>
                    <span className="text-blue-600 dark:text-blue-400 italic">Audit Logic.</span>
                  </h1>
                  <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                    Upload the master tender document. Aegis will extract structured criteria, threshold values, and audit-ready section mappings using high-assurance dual-pass normalization.
                  </p>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000" />
                  <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl">
                    <Dropzone 
                      onFileSelect={handleFileSelect} 
                      isUploading={uploadStatus === 'uploading'} 
                      label="Upload Master Tender (PDF)"
                    />
                    
                    {uploadStatus === 'error' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3"
                      >
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 dark:text-red-300 font-medium">{errorMessage}</p>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid md:grid-cols-3 gap-8 pt-8">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1">Audit-Ready</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Deterministic extraction with zero hallucinations.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1">Instant Mapping</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Maps criteria to exact PDF coordinates.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1">Dual-Pass</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Semantic extraction with Python-led math validation.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="upload-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-10"
              >
                <div className="flex items-center gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="font-newsreader text-4xl font-bold text-slate-900 dark:text-white">Extraction Complete.</h2>
                    <p className="text-slate-500 dark:text-slate-400">Aegis has successfully structuralized the tender criteria.</p>
                  </div>
                  <Link 
                    href={`/evaluate/${extractedData?.tender_id}`}
                    className="ml-auto flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
                  >
                    Proceed to Evaluation
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Extracted Criteria Registry</h3>
                  {extractedData?.criteria.map((criterion, idx) => (
                    <motion.div 
                      key={criterion.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group flex items-center justify-between p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-blue-300 dark:hover:border-blue-800 transition-all"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white mb-1">{criterion.description}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 uppercase tracking-tighter font-bold">
                              {criterion.threshold_type}
                            </span>
                            {criterion.threshold_value !== null && (
                              <span className="font-medium">
                                Threshold: <span className="text-slate-900 dark:text-white font-bold">{criterion.threshold_value}</span> {criterion.unit}
                              </span>
                            )}
                            <span className="flex items-center text-blue-600 dark:text-blue-400">
                              <FileText className="w-3 h-3 mr-1" />
                              Page {criterion.page_number}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ShieldCheck className="w-5 h-5 text-slate-200 dark:text-slate-800 group-hover:text-blue-500 transition-colors" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
