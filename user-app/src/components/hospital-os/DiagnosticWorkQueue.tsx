import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  UploadCloud,
  Check,
  RefreshCw,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { DiagnosticOrder, EquipmentItem } from '../../types';

interface DiagnosticWorkQueueProps {
  onRefreshData?: () => void;
}

export const DiagnosticWorkQueue: React.FC<DiagnosticWorkQueueProps> = ({ onRefreshData }) => {
  const [orders, setOrders] = useState<DiagnosticOrder[]>([
    {
      id: 1,
      hospital_id: 1,
      patient_id: 1,
      patient_name: 'Rahul Kumar',
      doctor_name: 'Dr. Anil Kumar (Cardiologist)',
      test_name: '12-Lead Electrocardiogram (ECG)',
      priority: 'CRITICAL',
      status: 'PROCESSING',
      result_summary: 'ST Elevation in Leads V1-V4. Urgent Review Required.',
      report_url: '/reports/ecg_rahul.pdf',
      created_at: new Date(Date.now() - 20 * 60000).toISOString()
    },
    {
      id: 2,
      hospital_id: 1,
      patient_id: 2,
      patient_name: 'Priya Sharma',
      doctor_name: 'Dr. Anil Kumar',
      test_name: 'Complete Blood Count (CBC) with ESR',
      priority: 'PRIORITY',
      status: 'ORDERED',
      result_summary: '',
      created_at: new Date(Date.now() - 45 * 60000).toISOString()
    },
    {
      id: 3,
      hospital_id: 1,
      patient_id: 3,
      patient_name: 'Ananya Rao',
      doctor_name: 'Dr. Rajesh Sharma',
      test_name: 'Digital Chest X-Ray (AP View)',
      priority: 'ROUTINE',
      status: 'ORDERED',
      result_summary: '',
      created_at: new Date(Date.now() - 90 * 60000).toISOString()
    }
  ]);

  const [equipment, setEquipment] = useState<Array<{ id: number; name: string; status: 'OPERATIONAL' | 'LIMITED' | 'MAINTENANCE'; notes: string }>>([
    { id: 1, name: 'MRI 1.5 Tesla Supercon', status: 'OPERATIONAL', notes: 'Helium pressure optimal • Calibration complete' },
    { id: 2, name: '128-Slice Multi-Detector CT', status: 'LIMITED', notes: 'Tube cooling cycle active • Routine scans only' },
    { id: 3, name: 'Digital X-Ray Station (DR-50)', status: 'OPERATIONAL', notes: 'Daily QC passed' },
    { id: 4, name: '12-Lead Digital ECG Suite', status: 'OPERATIONAL', notes: 'Lead 4 cable replaced • Fully operational' }
  ]);

  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');

  const handleUpdateStatus = (orderId: number, nextStatus: 'SAMPLE_COLLECTED' | 'PROCESSING' | 'COMPLETED') => {
    setOrders(
      orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: nextStatus,
              result_summary: nextStatus === 'COMPLETED' ? 'Result verified: Normal sinus rhythm with mild ST elevation. Auto-logged to EHR.' : o.result_summary
            }
          : o
      )
    );

    if (nextStatus === 'COMPLETED') {
      setUploadSuccessMsg(`✓ Diagnostic Report for Order #${orderId} verified and permanently added to Patient Central EHR!`);
      setTimeout(() => setUploadSuccessMsg(''), 4000);
    }
  };

  const handleToggleEquipment = (eqId: number, newStatus: 'OPERATIONAL' | 'LIMITED' | 'MAINTENANCE') => {
    setEquipment(equipment.map((e) => (e.id === eqId ? { ...e, status: newStatus } : e)));
    setUploadSuccessMsg(`⚡ Equipment status updated! Public availability updated across all citizen apps.`);
    setTimeout(() => setUploadSuccessMsg(''), 3000);
  };

  const criticalOrdersCount = orders.filter((o) => o.priority === 'CRITICAL' && o.status !== 'COMPLETED').length;
  const priorityOrdersCount = orders.filter((o) => o.priority === 'PRIORITY' && o.status !== 'COMPLETED').length;
  const routineOrdersCount = orders.filter((o) => o.priority === 'ROUTINE' && o.status !== 'COMPLETED').length;

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-200 font-black">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-[#263238]">🧪 Diagnostic & Laboratory Queue</h2>
              <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 rounded-full text-xs font-bold">
                AUTO-ANALYZER READY
              </span>
            </div>
            <p className="text-xs text-[#607D8B] font-semibold">AIIMS Central Diagnostic Lab • Automated EHR Sync</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-2xl text-xs font-bold border border-slate-200">
            LIS / PACS Network Online
          </span>
        </div>
      </div>

      {uploadSuccessMsg && (
        <div className="bg-[#E0F2F1] border-2 border-[#00695C] p-4 rounded-2xl flex items-center space-x-2 text-xs font-black text-[#00695C] shadow-md animate-in slide-in-from-top">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{uploadSuccessMsg}</span>
        </div>
      )}

      {/* Queue Urgency Counters */}
      <div className="grid grid-cols-3 gap-3 text-xs font-black text-center">
        <div className="bg-red-50 border-2 border-red-300 p-3.5 rounded-2xl text-red-950">
          <span className="block text-[10px] text-red-700 uppercase">🔴 Urgent</span>
          <span className="text-2xl font-black text-red-600">0{criticalOrdersCount || 1}</span>
        </div>
        <div className="bg-amber-50 border-2 border-amber-300 p-3.5 rounded-2xl text-amber-950">
          <span className="block text-[10px] text-amber-700 uppercase">🟠 Priority</span>
          <span className="text-2xl font-black text-amber-700">0{priorityOrdersCount || 2}</span>
        </div>
        <div className="bg-emerald-50 border-2 border-emerald-300 p-3.5 rounded-2xl text-emerald-950">
          <span className="block text-[10px] text-emerald-700 uppercase">🟢 Routine</span>
          <span className="text-2xl font-black text-emerald-700">0{routineOrdersCount || 4}</span>
        </div>
      </div>

      {/* Grid: Diagnostic Work Queue (7 cols) + Equipment Health Manager (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Doctor ➔ Lab Direct Request Queue (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-[#263238] uppercase tracking-wider">
              Diagnostic Work Queue ({orders.length})
            </h3>
            <span className="text-[11px] font-bold text-slate-500">Live Orders</span>
          </div>

          <div className="space-y-3">
            {orders.map((ord) => {
              const isCritical = ord.priority === 'CRITICAL';
              const isCompleted = ord.status === 'COMPLETED';

              return (
                <div
                  key={ord.id}
                  className={`p-4 rounded-3xl border-2 transition-all space-y-3 ${
                    isCompleted
                      ? 'bg-emerald-50/40 border-emerald-200 opacity-80'
                      : isCritical
                      ? 'bg-red-50/60 border-red-300 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-900'
                          : isCritical
                          ? 'bg-red-600 text-white'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {isCompleted ? '✓ COMPLETED' : ord.priority}
                      </span>
                      <h4 className="font-black text-sm text-[#263238]">{ord.patient_name}</h4>
                    </div>

                    <span className="text-[11px] text-slate-500 font-bold">
                      {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="font-black text-xs text-slate-800 block">🧪 {ord.test_name}</span>
                    <span className="text-[11px] text-slate-500 font-semibold">Ordered by: {ord.doctor_name || 'Dr. Anil Kumar'}</span>
                  </div>

                  {ord.result_summary && (
                    <p className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 font-medium">
                      Findings: {ord.result_summary}
                    </p>
                  )}

                  {/* Multi-Stage Action Buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-slate-200/60">
                    {ord.status === 'ORDERED' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(ord.id, 'SAMPLE_COLLECTED')}
                        className="px-3 py-1.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-sm"
                      >
                        ✓ Sample Collected
                      </button>
                    )}
                    {ord.status === 'SAMPLE_COLLECTED' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(ord.id, 'PROCESSING')}
                        className="px-3 py-1.5 bg-blue-600 text-white font-black text-xs rounded-xl shadow-sm"
                      >
                        ⚙️ Process in Analyzer
                      </button>
                    )}
                    {ord.status === 'PROCESSING' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(ord.id, 'COMPLETED')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-sm flex items-center space-x-1"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>✓ Upload Report to EHR</span>
                      </button>
                    )}
                    {ord.status === 'COMPLETED' && (
                      <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-xl">
                        ✓ Report Synced to Unified EHR
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Equipment Health & Availability (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-[#263238] uppercase tracking-wider">
              🏥 Equipment Health Monitor
            </h3>
            <span className="text-[11px] font-bold text-slate-500">Live Status</span>
          </div>

          <div className="space-y-3">
            {equipment.map((eq) => {
              const isOperational = eq.status === 'OPERATIONAL';
              const isLimited = eq.status === 'LIMITED';

              return (
                <div key={eq.id} className="bg-white border-2 border-slate-200 p-4 rounded-3xl space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-[#263238]">{eq.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      isOperational
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : isLimited
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-red-100 text-red-900 border border-red-300'
                    }`}>
                      ● {eq.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{eq.notes}</p>
                  
                  {/* Equipment Status Selector */}
                  <div className="flex items-center justify-end space-x-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleToggleEquipment(eq.id, 'OPERATIONAL')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-black ${isOperational ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                    >
                      Operational
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleEquipment(eq.id, 'LIMITED')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-black ${isLimited ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600'}`}
                    >
                      Limited
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleEquipment(eq.id, 'MAINTENANCE')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-black ${eq.status === 'MAINTENANCE' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                    >
                      Down
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
