import React, { useState } from 'react';
import {
  ArrowLeft,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Search,
  Plus
} from 'lucide-react';
import { DiagnosticService } from '../../types';

interface PhcDiagnosticManagementViewProps {
  diagnostics: DiagnosticService[];
  onBack: () => void;
  onUpdateDiagnosticStatus: (diagId: number, status: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE', waitTime: number) => Promise<void>;
  facilityName: string;
}

export const PhcDiagnosticManagementView: React.FC<PhcDiagnosticManagementViewProps> = ({
  diagnostics,
  onBack,
  onUpdateDiagnosticStatus,
  facilityName
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const filteredDiags = diagnostics.filter((d) =>
    d.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = async (diagId: number, status: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE', waitTime: number) => {
    setUpdatingId(diagId);
    try {
      await onUpdateDiagnosticStatus(diagId, status, waitTime);
    } catch (e) {
      alert('Failed to update diagnostic service.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between bg-white border-2 border-slate-200 p-4 rounded-2xl shadow-sm gap-3">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 bg-slate-100 hover:bg-[#E0F2F1] text-[#00695C] rounded-xl border border-slate-300 transition-colors"
            aria-label="Back to PHC Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-black text-[#263238]">🧪 Diagnostic & Laboratory Tests</h2>
            <p className="text-xs text-[#607D8B] font-semibold">{facilityName}</p>
          </div>
        </div>

        <span className="px-3 py-1 bg-[#E0F2F1] text-[#00695C] border border-[#00695C]/30 rounded-xl text-xs font-black">
          {diagnostics.filter((d) => d.status === 'AVAILABLE').length} Tests Active
        </span>
      </div>

      {/* Search Input */}
      <div className="bg-white border-2 border-slate-200 p-4 rounded-2xl shadow-sm">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search diagnostic test (e.g. Blood Test, X-Ray, ECG, Urine)..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 pl-9 pr-4 text-xs font-bold text-[#263238] focus:outline-none focus:border-[#00695C]"
          />
        </div>
      </div>

      {/* Diagnostic Service Items */}
      <div className="space-y-3">
        {filteredDiags.map((diag) => {
          const isAvail = diag.status === 'AVAILABLE';
          const isLim = diag.status === 'LIMITED';
          const isUnavail = diag.status === 'UNAVAILABLE';

          return (
            <div
              key={diag.id}
              className={`bg-white border-2 p-4 sm:p-5 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                isAvail ? 'border-emerald-300' : isLim ? 'border-amber-300' : 'border-red-300'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                  isAvail ? 'bg-cyan-100 text-cyan-800' : isLim ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                }`}>
                  🧪
                </div>
                <div>
                  <h4 className="font-black text-base text-[#263238]">{diag.service_name}</h4>
                  <span className="text-xs font-bold text-[#00695C] block">{diag.category}</span>
                  <span className="text-[11px] text-slate-500 font-semibold block mt-0.5 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Est. Turnaround Wait: <strong>{diag.wait_time_mins || 15} mins</strong></span>
                  </span>
                </div>
              </div>

              {/* 3 Large Accessible Buttons */}
              <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => handleStatusChange(diag.id, 'AVAILABLE', diag.wait_time_mins || 10)}
                  disabled={updatingId === diag.id}
                  className={`py-3 px-3 rounded-2xl text-xs font-black border-2 transition-all flex flex-col items-center justify-center space-y-1 active:scale-95 ${
                    isAvail
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-800'
                  }`}
                >
                  <span className="text-sm font-black">🟢 ✓</span>
                  <span className="text-[10px] uppercase">AVAILABLE</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(diag.id, 'LIMITED', diag.wait_time_mins ? diag.wait_time_mins * 2 : 30)}
                  disabled={updatingId === diag.id}
                  className={`py-3 px-3 rounded-2xl text-xs font-black border-2 transition-all flex flex-col items-center justify-center space-y-1 active:scale-95 ${
                    isLim
                      ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-300'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50 hover:text-amber-800'
                  }`}
                >
                  <span className="text-sm font-black">🟠 !</span>
                  <span className="text-[10px] uppercase">LIMITED</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(diag.id, 'UNAVAILABLE', 0)}
                  disabled={updatingId === diag.id}
                  className={`py-3 px-3 rounded-2xl text-xs font-black border-2 transition-all flex flex-col items-center justify-center space-y-1 active:scale-95 ${
                    isUnavail
                      ? 'bg-red-600 text-white border-red-700 shadow-md ring-2 ring-red-300'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-red-50 hover:text-red-800'
                  }`}
                >
                  <span className="text-sm font-black">🔴 ✕</span>
                  <span className="text-[10px] uppercase">OFFLINE</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
