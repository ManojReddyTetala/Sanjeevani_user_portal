import React, { useState } from 'react';
import {
  ArrowLeft,
  Users,
  Plus,
  Minus,
  Save,
  CheckCircle2,
  Clock,
  Activity,
  AlertTriangle
} from 'lucide-react';

interface PhcQueueManagementViewProps {
  currentQueueCount: number;
  currentQueueStatus: 'SHORT' | 'MODERATE' | 'LONG';
  onBack: () => void;
  onUpdateQueue: (count: number, status: 'SHORT' | 'MODERATE' | 'LONG') => Promise<void>;
  facilityName: string;
}

export const PhcQueueManagementView: React.FC<PhcQueueManagementViewProps> = ({
  currentQueueCount,
  currentQueueStatus,
  onBack,
  onUpdateQueue,
  facilityName
}) => {
  const [queueCount, setQueueCount] = useState(currentQueueCount || 8);
  const [manualStatus, setManualStatus] = useState<'SHORT' | 'MODERATE' | 'LONG' | 'AUTO'>('AUTO');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const calculatedStatus: 'SHORT' | 'MODERATE' | 'LONG' =
    manualStatus !== 'AUTO'
      ? manualStatus
      : queueCount <= 10
      ? 'SHORT'
      : queueCount <= 30
      ? 'MODERATE'
      : 'LONG';

  const handleSave = async () => {
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      await onUpdateQueue(queueCount, calculatedStatus);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      alert('Failed to update OPD queue.');
    } finally {
      setIsSaving(false);
    }
  };

  // Quick preset shortcuts
  const setQuickQueue = (val: number) => {
    setQueueCount(val);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center justify-between bg-white border-2 border-slate-200 p-4 rounded-2xl shadow-sm">
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
            <h2 className="text-xl font-black text-[#263238]">👥 OPD Queue Management</h2>
            <p className="text-xs text-[#607D8B] font-semibold">{facilityName}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 bg-[#00695C] hover:bg-[#004D40] text-white font-black text-xs rounded-xl shadow-md flex items-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'SAVING...' : 'SAVE QUEUE'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-[#E0F2F1] border-2 border-[#00695C] p-4 rounded-2xl flex items-center space-x-3 text-xs font-black text-[#00695C]">
          <CheckCircle2 className="w-5 h-5" />
          <span>✓ Today's OPD queue count updated to {queueCount} patients ({calculatedStatus} queue)!</span>
        </div>
      )}

      {/* Main Queue Counter Card */}
      <div className="bg-white border-2 border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 text-center">
        <div className="space-y-2">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
            General OPD Live Waiting Count
          </span>
          <p className="text-xs text-slate-500">Tap buttons to adjust waiting patient count quickly</p>
        </div>

        {/* Large Tactile Stepper */}
        <div className="flex items-center justify-center space-x-6 py-4">
          <button
            type="button"
            onClick={() => setQueueCount(Math.max(0, queueCount - 5))}
            className="px-4 py-3 rounded-2xl bg-slate-100 border-2 border-slate-300 text-slate-700 hover:bg-slate-200 active:scale-95 font-black text-sm shadow-sm"
            title="Decrease 5"
          >
            -5
          </button>

          <button
            type="button"
            onClick={() => setQueueCount(Math.max(0, queueCount - 1))}
            className="w-16 h-16 rounded-3xl bg-slate-100 border-2 border-slate-300 text-slate-800 hover:bg-slate-200 active:scale-95 flex items-center justify-center font-black text-3xl shadow-sm"
            aria-label="Decrease by 1"
          >
            <Minus className="w-7 h-7" />
          </button>

          <div className="min-w-[8rem]">
            <span className="text-6xl sm:text-7xl font-black text-[#263238] block tracking-tight">
              {queueCount}
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase block mt-1">Patients</span>
          </div>

          <button
            type="button"
            onClick={() => setQueueCount(queueCount + 1)}
            className="w-16 h-16 rounded-3xl bg-[#00695C] text-white hover:bg-[#004D40] active:scale-95 flex items-center justify-center font-black text-3xl shadow-lg"
            aria-label="Increase by 1"
          >
            <Plus className="w-7 h-7" />
          </button>

          <button
            type="button"
            onClick={() => setQueueCount(queueCount + 5)}
            className="px-4 py-3 rounded-2xl bg-[#00695C] text-white hover:bg-[#004D40] active:scale-95 font-black text-sm shadow-md"
            title="Increase 5"
          >
            +5
          </button>
        </div>

        {/* Status Indicator Preview */}
        <div className="flex justify-center pt-2">
          <div className={`px-5 py-2.5 rounded-2xl border-2 font-black text-sm flex items-center space-x-2 shadow-sm ${
            calculatedStatus === 'SHORT'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-400'
              : calculatedStatus === 'MODERATE'
              ? 'bg-amber-50 text-amber-900 border-amber-400'
              : 'bg-red-50 text-red-900 border-red-400'
          }`}>
            {calculatedStatus === 'SHORT' ? (
              <>
                <span className="text-lg">🟢 ✓</span>
                <span>SHORT / FREE QUEUE (Est. Wait: &lt; 15 mins)</span>
              </>
            ) : calculatedStatus === 'MODERATE' ? (
              <>
                <span className="text-lg">🟠 !</span>
                <span>MODERATE QUEUE (Est. Wait: 20–45 mins)</span>
              </>
            ) : (
              <>
                <span className="text-lg">🔴 ✕</span>
                <span>LONG / HIGH QUEUE (Est. Wait: &gt; 60 mins)</span>
              </>
            )}
          </div>
        </div>

        {/* Quick Numbers Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-center gap-2">
          <span className="text-xs font-bold text-slate-500 py-1.5 mr-2">Quick Presets:</span>
          {[0, 5, 8, 12, 20, 35, 50].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setQuickQueue(num)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold transition-colors ${
                queueCount === num
                  ? 'bg-[#00695C] text-white border-[#00695C]'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {num} Patients
            </button>
          ))}
        </div>
      </div>

      {/* Save Action Banner */}
      <div className="bg-[#E0F2F1]/60 border-2 border-[#00695C]/30 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-black text-sm text-[#00695C]">Fast Queue Synchronizer</h4>
          <p className="text-xs text-slate-600">
            Updating the OPD queue immediately adjusts estimated wait times on the patient-facing health application.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="w-full sm:w-auto px-8 py-3.5 bg-[#00695C] hover:bg-[#004D40] text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95"
        >
          <span>✓ CONFIRM & PUBLISH QUEUE</span>
        </button>
      </div>
    </div>
  );
};
