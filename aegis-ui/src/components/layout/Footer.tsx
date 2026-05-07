import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 pt-16 pb-8 px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-500" />
            <span className="font-newsreader text-xl font-bold">Aegis Gateway.</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
            High-assurance procurement engine built for the AI for Bharat Hackathon. Providing deterministic evaluation and immutable audit trails for government tenders.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Platform</h4>
          <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <li><Link href="#upload" className="hover:text-blue-600 transition-colors">System Entry</Link></li>
            <li><Link href="#architecture" className="hover:text-blue-600 transition-colors">Evaluation Engine</Link></li>
            <li><Link href="#pillars" className="hover:text-blue-600 transition-colors">Security Guardrails</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Compliance</h4>
          <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <li>Zero Silent Rejections</li>
            <li>Append-Only DB Logs</li>
            <li>Dual-Pass Verification</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
        <p>© 2026 Aegis Gateway Prototype. Built for PAN IIT.</p>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center">
            <ShieldCheck className="w-4 h-4 mr-1" /> Source Code
          </a>
        </div>
      </div>
    </footer>
  );
}
