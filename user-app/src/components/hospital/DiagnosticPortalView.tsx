import React, { useState } from 'react';
import {
  FileText,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  RefreshCw,
  Plus,
  Search,
  Eye,
  Download,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { DiagnosticService, EquipmentItem } from '../../types';

interface DiagnosticPortalViewProps {
  facilityName: string;
  facilityCity: string;
  diagnostics: DiagnosticService[];
  equipment: EquipmentItem[];
  onRefresh?: () => void;
}

export const DiagnosticPortalView: React.FC<DiagnosticPortalViewProps> = ({
  facilityName,
  facilityCity,
  diagnostics: initialDiagnostics,
  equipment: initialEquipment,
  onRefresh
}) => {
  // Local diagnostic test list state
  const [tests, setTests] = useState<DiagnosticService[]>(
    initialDiagnostics && initialDiagnostics.length > 0
      ? initialDiagnostics
      : [
          { id: 1, hospital_id: 1, service_name: 'Complete Blood Count (CBC & ESR)', category: 'Pathology', status: 'AVAILABLE', wait_time_mins: 10, last_updated: new Date().toISOString() },
          { id: 2, hospital_id: 1, service_name: 'Diagnostic Digital X-Ray Chest/Spine', category: 'Radiology', status: 'AVAILABLE', wait_time_mins: 15, last_updated: new Date().toISOString() },
          { id: 3, hospital_id: 1, service_name: '12-Lead ECG Screening', category: 'Cardiology', status: 'AVAILABLE', wait_time_mins: 5, last_updated: new Date().toISOString() },
          { id: 4, hospital_id: 1, service_name: 'CT Scan 128-Slice (Brain / Abdomen)', category: 'Radiology', status: 'LIMITED', wait_time_mins: 35, last_updated: new Date().toISOString() },
          { id: 5, hospital_id: 1, service_name: '3T MRI Scan (Neuro / Cardiac / Spine)', category: 'Radiology', status: 'UNAVAILABLE', wait_time_mins: 0, last_updated: new Date().toISOString() },
          { id: 6, hospital_id: 1, service_name: 'Ultrasound Sonography (USG Whole Abdomen)', category: 'Radiology', status: 'AVAILABLE', wait_time_mins: 20, last_updated: new Date().toISOString() }
        ]
  );

  // Local equipment state
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>(
    initialEquipment && initialEquipment.length > 0
      ? initialEquipment
      : [
          { id: 1, hospital_id: 1, name: 'Digital X-Ray Machine (Siemens 500mA)', category: 'Radiology', status: 'OPERATIONAL', notes: 'Calibrated 2 days ago' },
          { id: 2, hospital_id: 1, name: '12-Lead ECG Machine (CardioMax Pro)', category: 'Cardiology', status: 'OPERATIONAL', notes: 'Active in OPD Bay 4' },
          { id: 3, hospital_id: 1, name: 'CT Scanner 128-Slice Unit', category: 'Radiology', status: 'LIMITED', notes: 'Operating with backup tube' },
          { id: 4, hospital_id: 1, name: '3T MRI Scanner (Siemens Magnetom)', category: 'Radiology', status: 'DOWN', notes: 'Coolant refill in progress' }
        ]
  );

  const [filterCategory, setFilterCategory] = useState('ALL');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const handleToggleTestStatus = async (testId: number) => {
    const next = tests.map((t) => {
      if (t.id === testId) {
        const nextStat = t.status === 'AVAILABLE' ? 'LIMITED' : t.status === 'LIMITED' ? 'UNAVAILABLE' : 'AVAILABLE';
        return { ...t, status: nextStat as any };
      }
      return t;
    });
    setTests(next);

    const changed = next.find((t) => t.id === testId);
    if (changed) {
      try {
        await fetch(`/api/phc/1/diagnostics/${testId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: changed.status, wait_time_mins: changed.wait_time_mins })
        });
        setSuccessBanner(`Updated ${changed.service_name} status to ${changed.status}`);
        setTimeout(() => setSuccessBanner(null), 3000);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleToggleEquipmentStatus = async (eqId: number) => {
    const next = equipmentList.map((eq) => {
      if (eq.id === eqId) {
        const nextStat = eq.status === 'OPERATIONAL' ? 'LIMITED' : eq.status === 'LIMITED' ? 'DOWN' : 'OPERATIONAL';
        return { ...eq, status: nextStat as any };
      }
      return eq;
    });
    setEquipmentList(next);

    const changed = next.find((e) => e.id === eqId);
    if (changed) {
      try {
        await fetch(`/api/hospital/1/equipment/${eqId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: changed.status })
        });
        setSuccessBanner(`Updated ${changed.name} to ${changed.status}`);
        setTimeout(() => setSuccessBanner(null), 3000);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const filteredTests = filterCategory === 'ALL' ? tests : tests.filter((t) => t.category === filterCategory);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-700 to-cyan-800 text-white p-6 rounded-3xl shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black shadow-inner border border-white/30">
            🧪
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-cyan-200 bg-cyan-950/60 px-2.5 py-0.5 rounded-lg border border-cyan-400/30">
                🧪 DIAGNOSTIC & LAB PORTAL
              </span>
              <span className="text-xs text-cyan-100">• {facilityName}</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">Diagnostic & Imaging Center</h2>
            <p className="text-xs text-cyan-100 font-medium">
              Live status monitoring of clinical laboratory tests, diagnostic equipment & turnaround times.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Sync Status</span>
        </button>
      </div>

      {successBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* DIAGNOSTIC OVERVIEW DASHBOARD */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {tests.slice(0, 5).map((t) => (
          <div
            key={t.id}
            onClick={() => handleToggleTestStatus(t.id)}
            className="p-4 bg-white border-2 border-slate-200 hover:border-[#00695C] rounded-2xl shadow-sm transition-all cursor-pointer space-y-2 flex flex-col justify-between"
          >
            <div className="space-y-1">
              <span className="text-xs font-black text-[#263238] block truncate">{t.service_name}</span>
              <span className="text-[10px] text-slate-500 block">{t.category}</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                  t.status === 'AVAILABLE'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : t.status === 'LIMITED'
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-rose-100 text-rose-800 border-rose-300'
                }`}
              >
                {t.status === 'AVAILABLE' ? '🟢 Available' : t.status === 'LIMITED' ? '🟠 Limited' : '🔴 Unavailable'}
              </span>
              <span className="text-[10px] text-[#00695C] font-bold">↻ Toggle</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* DIAGNOSTIC SERVICES LIST */}
        <div className="lg:col-span-2 bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-black text-[#263238] uppercase tracking-wider">
                🧪 Registered Diagnostic Tests ({tests.length})
              </h3>
              <p className="text-xs text-[#607D8B]">Tap status badge to cycle Available 🟢 / Limited 🟠 / Unavailable 🔴</p>
            </div>

            <div className="flex items-center space-x-1.5">
              {['ALL', 'Radiology', 'Pathology', 'Cardiology'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                    filterCategory === cat
                      ? 'bg-[#00695C] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredTests.map((test) => (
              <div
                key={test.id}
                className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 hover:border-[#00695C] transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-black text-[#263238]">{test.service_name}</h4>
                    <span className="text-[10px] text-slate-500 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                      {test.category}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-600 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-[#00695C]" />
                    <span>Average Turnaround / Wait Time: ~{test.wait_time_mins} mins</span>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleToggleTestStatus(test.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer active:scale-95 ${
                      test.status === 'AVAILABLE'
                        ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300'
                        : test.status === 'LIMITED'
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
                        : 'bg-rose-100 hover:bg-rose-200 text-rose-900 border-rose-300'
                    }`}
                  >
                    {test.status === 'AVAILABLE' ? '🟢 AVAILABLE' : test.status === 'LIMITED' ? '🟠 LIMITED' : '🔴 UNAVAILABLE'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* EQUIPMENT OPERATIONAL STATUS */}
        <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-sm font-black text-[#263238] uppercase tracking-wider flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[#00695C]" />
              <span>Medical Equipment Status</span>
            </h3>
            <p className="text-xs text-[#607D8B]">Real-time operational monitoring of diagnostic scanners</p>
          </div>

          <div className="space-y-3">
            {equipmentList.map((eq) => (
              <div
                key={eq.id}
                className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-2 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5 className="text-xs font-black text-[#263238]">{eq.name}</h5>
                    <span className="text-[10px] text-slate-500 block">{eq.category} • {eq.notes}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleEquipmentStatus(eq.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-black border transition-all ${
                      eq.status === 'OPERATIONAL'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : eq.status === 'LIMITED'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}
                  >
                    {eq.status === 'OPERATIONAL' ? '🟢 OPERATIONAL' : eq.status === 'LIMITED' ? '🟠 LIMITED' : '🔴 DOWN'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
