"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getTenderReport } from "@/lib/api";
import { 
  Download, 
  FileCheck, 
  ShieldAlert, 
  UserCircle, 
  Search,
  ExternalLink,
  ChevronRight,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReportPage() {
  const { tenderId } = useParams();
  const [report, setReport] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAudit, setSelectedAudit] = useState<any | null>(null);

  useEffect(() => {
    async function loadReport() {
      try {
        const data = await getTenderReport(tenderId as string);
        setReport(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [tenderId]);

  const handleExportCSV = () => {
    window.location.href = `http://localhost:8080/api/v1/evaluation/report/${tenderId}?format=csv`;
  };

  // Group data by vendor for the matrix view
  const vendors = Array.from(new Set(report.map(r => r.vendor_id))).map(id => {
    const records = report.filter(r => r.vendor_id === id);
    return {
      id,
      name: records[0]?.vendor_name || "Unknown",
      criteria: records
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center px-8 shadow-sm justify-between">
          <div className="flex items-center space-x-3">
            <FileCheck className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800">Compliance Audit Dashboard</h1>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export Immutable CSV</span>
          </button>
        </header>

        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-blue-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
               <div className="relative z-10">
                 <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Audit Record</p>
                 <h2 className="text-3xl font-bold mb-4">{tenderId}</h2>
                 <div className="flex space-x-8">
                    <div>
                      <p className="text-blue-200 text-[10px] uppercase font-bold">Total Vendors</p>
                      <p className="text-xl font-bold">{vendors.length}</p>
                    </div>
                    <div>
                      <p className="text-blue-200 text-[10px] uppercase font-bold">Human Overrides</p>
                      <p className="text-xl font-bold">{report.filter(r => r.evaluated_by).length}</p>
                    </div>
                    <div>
                      <p className="text-blue-200 text-[10px] uppercase font-bold">Status</p>
                      <p className="text-xl font-bold">LOCKED / AUDITABLE</p>
                    </div>
                 </div>
               </div>
               <ShieldAlert className="absolute right-[-20px] bottom-[-20px] w-64 h-64 text-blue-500/20" />
            </div>

            {/* Matrix View Table */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b bg-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-gray-700">Vendor Compliance Matrix</h3>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-[10px] text-gray-500 font-bold">PASS</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <span className="text-[10px] text-gray-500 font-bold">FAIL</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-[10px] text-gray-500 font-bold">OVERRIDDEN</span>
                  </div>
                </div>
              </div>
              
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-400 font-bold border-b">
                    <th className="px-6 py-4">Vendor Name</th>
                    <th className="px-6 py-4">Criteria Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-800 text-sm">{vendor.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{vendor.id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {vendor.criteria.map((crit, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedAudit(crit)}
                              className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 shadow-sm",
                                crit.status === 'PASS' && !crit.evaluated_by && "bg-green-100 text-green-600 border border-green-200",
                                crit.status === 'FAIL' && "bg-red-100 text-red-600 border border-red-200",
                                crit.evaluated_by && "bg-blue-100 text-blue-600 border border-blue-200",
                              )}
                              title={crit.criterion_id}
                            >
                              <span className="text-[10px] font-bold">{idx + 1}</span>
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-400 hover:text-gray-600">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Audit Detail Sidebar */}
      <aside className={cn(
        "w-96 bg-white border-l shadow-2xl h-screen overflow-y-auto transition-all duration-300 transform",
        selectedAudit ? "translate-x-0" : "translate-x-full absolute right-0"
      )}>
        {selectedAudit && (
          <div className="flex flex-col h-full">
            <header className="p-6 border-b flex items-center justify-between bg-gray-50">
              <h4 className="font-bold text-gray-800">Audit Trail Entry</h4>
              <button onClick={() => setSelectedAudit(null)} className="p-1 hover:bg-gray-200 rounded-full">
                <ChevronRight className="w-5 h-5 text-gray-500" />
              </button>
            </header>
            
            <div className="p-6 space-y-8">
              <div className="space-y-3">
                 <div className={cn(
                   "inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold",
                   selectedAudit.status === 'PASS' && "bg-green-100 text-green-700",
                   selectedAudit.status === 'FAIL' && "bg-red-100 text-red-700",
                   selectedAudit.evaluated_by && "bg-blue-100 text-blue-700",
                 )}>
                   {selectedAudit.evaluated_by ? <UserCircle className="w-3 h-3" /> : <Search className="w-3 h-3" />}
                   <span>{selectedAudit.status} {selectedAudit.evaluated_by ? "(OVERRIDDEN)" : "(AUTOMATED)"}</span>
                 </div>
                 <h5 className="text-sm font-bold text-gray-800">Criterion: {selectedAudit.criterion_id}</h5>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center space-x-1">
                   <Info className="w-3 h-3" />
                   <span>Rational & Audit Log</span>
                </p>
                <div className="p-4 bg-gray-50 rounded-xl border text-xs text-gray-600 font-mono leading-relaxed">
                  {selectedAudit.reason}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Grounding Evidence</p>
                <div className="p-4 bg-gray-50 rounded-xl border space-y-4">
                  <div>
                    <p className="text-[10px] text-gray-400 mb-1">Extracted String</p>
                    <p className="text-xs font-bold text-gray-800">{selectedAudit.evidence.raw_string}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 mb-1">Context Sentence</p>
                    <p className="text-[10px] text-gray-600 italic">"{selectedAudit.evidence.context_sentence}"</p>
                  </div>
                </div>
              </div>

              {selectedAudit.evaluated_by && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-1">
                   <p className="text-[10px] text-blue-400 uppercase font-bold">Officer ID</p>
                   <p className="text-xs font-bold text-blue-700">{selectedAudit.evaluated_by}</p>
                   <p className="text-[9px] text-blue-400">Manual review bypass authorized via Human-in-the-loop.</p>
                </div>
              )}

              <div className="pt-8 text-center">
                 <p className="text-[10px] text-gray-300">Timestamp: {new Date(selectedAudit.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
