import React, { useState } from 'react';
import {
  Share2,
  CheckCircle2,
  Clock,
  Building2,
  User,
  ShieldCheck,
  Truck,
  ArrowRight,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { Referral } from '../../types';

interface ReferralCareTransferCenterProps {
  onRefreshData?: () => void;
}

export const ReferralCareTransferCenter: React.FC<ReferralCareTransferCenterProps> = ({ onRefreshData }) => {
  const [referrals, setReferrals] = useState<Array<{
    id: number;
    code: string;
    patient: string;
    source: string;
    destination: string;
    specialty: string;
    matchScore: number;
    status: 'WAITING_ACCEPTANCE' | 'ACCEPTED' | 'TRANSFER_IN_PROGRESS' | 'PATIENT_ARRIVED';
    notes: string;
  }>>([
    {
      id: 1,
      code: 'REF-2026-9842',
      patient: 'Rahul Kumar (42y)',
      source: 'Primary Health Centre (PHC)',
      destination: 'AIIMS Delhi — Apex Trauma & Cardiac Unit',
      specialty: 'Interventional Cardiology & Cath Lab',
      matchScore: 95,
      status: 'ACCEPTED',
      notes: 'Suspected acute STEMI. Initial stabilization provided at PHC; emergency angiography recommended.'
    },
    {
      id: 2,
      code: 'REF-2026-8812',
      patient: 'Priya Sharma (28y)',
      source: 'Community Health Centre (CHC)',
      destination: 'Safdarjung Hospital — Multi-Specialty Trauma Center',
      specialty: 'Gastroenterology & Critical Care',
      matchScore: 92,
      status: 'WAITING_ACCEPTANCE',
      notes: 'Intractable vomiting and acute dehydration unresponsive to IV rehydration.'
    }
  ]);

  const [handshakeMsg, setHandshakeMsg] = useState('');

  const handleAdvanceHandshake = (refId: number, nextStatus: 'ACCEPTED' | 'TRANSFER_IN_PROGRESS' | 'PATIENT_ARRIVED') => {
    setReferrals(
      referrals.map((r) => (r.id === refId ? { ...r, status: nextStatus } : r))
    );
    setHandshakeMsg(`✓ Referral ${referrals.find((r) => r.id === refId)?.code} transitioned to: ${nextStatus}`);
    setTimeout(() => setHandshakeMsg(''), 4000);
  };

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl border border-purple-200 font-black">
            <Share2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-[#263238]">📋 Intelligent Care Transfer & Referral Center</h2>
              <span className="px-2.5 py-0.5 bg-purple-700 text-white rounded-full text-xs font-bold">
                2-WAY HANDSHAKE
              </span>
            </div>
            <p className="text-xs text-[#607D8B] font-semibold">Doctor-to-Doctor Confirmed Inter-Facility Transfer Network</p>
          </div>
        </div>
      </div>

      {handshakeMsg && (
        <div className="bg-[#E0F2F1] border-2 border-[#00695C] p-4 rounded-2xl flex items-center space-x-2 text-xs font-black text-[#00695C] shadow-md animate-in slide-in-from-top">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{handshakeMsg}</span>
        </div>
      )}

      {/* Referral Handshake Pipeline Strip */}
      <div className="bg-purple-950 text-white p-4 rounded-2xl border border-purple-800 space-y-2">
        <span className="text-[10px] font-black text-purple-300 uppercase tracking-wider block">
          2-Way Doctor Referral Handshake Protocol
        </span>
        <div className="grid grid-cols-5 gap-1 text-center text-[10px] font-black">
          <div className="bg-purple-800 p-2 rounded-xl border border-purple-700">1. SEND REFERRAL</div>
          <div className="bg-amber-500 text-slate-950 p-2 rounded-xl border border-amber-400">2. DOCTOR REVIEWS</div>
          <div className="bg-teal-600 p-2 rounded-xl border border-teal-500">3. BED CONFIRMED</div>
          <div className="bg-blue-600 p-2 rounded-xl border border-blue-500">4. AMBULANCE TRANSFER</div>
          <div className="bg-emerald-600 p-2 rounded-xl border border-emerald-500">5. ARRIVED</div>
        </div>
      </div>

      {/* Referrals Stream */}
      <div className="space-y-4">
        {referrals.map((ref) => {
          const isAccepted = ref.status === 'ACCEPTED';
          const isEnRoute = ref.status === 'TRANSFER_IN_PROGRESS';
          const isArrived = ref.status === 'PATIENT_ARRIVED';

          return (
            <div key={ref.id} className="bg-white border-2 border-purple-200 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-100 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-purple-700 text-white font-mono font-black text-xs rounded-xl">
                    {ref.code}
                  </span>
                  <h4 className="font-black text-base text-slate-900">{ref.patient}</h4>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-purple-100 text-purple-900 font-black text-xs rounded-full flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                    <span>MATCH SCORE: {ref.matchScore}%</span>
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${
                    isArrived
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : isEnRoute
                      ? 'bg-blue-100 text-blue-900 border-blue-300'
                      : isAccepted
                      ? 'bg-teal-100 text-teal-900 border-teal-300'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}>
                    ● {ref.status}
                  </span>
                </div>
              </div>

              {/* Match Criteria Transparent Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
                <div className="bg-purple-50/50 p-2.5 rounded-xl border border-purple-100">
                  <span className="text-[10px] text-slate-400 uppercase block">Specialist</span>
                  <span className="font-black text-emerald-700">🟢 Available</span>
                </div>
                <div className="bg-purple-50/50 p-2.5 rounded-xl border border-purple-100">
                  <span className="text-[10px] text-slate-400 uppercase block">Cardiac ICU</span>
                  <span className="font-black text-emerald-700">🟢 Bed Reserved</span>
                </div>
                <div className="bg-purple-50/50 p-2.5 rounded-xl border border-purple-100">
                  <span className="text-[10px] text-slate-400 uppercase block">Distance</span>
                  <span className="font-black text-purple-900">8.2 km (12 mins)</span>
                </div>
                <div className="bg-purple-50/50 p-2.5 rounded-xl border border-purple-100">
                  <span className="text-[10px] text-slate-400 uppercase block">Cath Lab</span>
                  <span className="font-black text-emerald-700">🟢 Operational</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-500 block">Transfer Clinical Summary:</span>
                <p className="text-slate-800 font-medium">"{ref.notes}"</p>
              </div>

              {/* Handshake Progression Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                {ref.status === 'WAITING_ACCEPTANCE' && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceHandshake(ref.id, 'ACCEPTED')}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl shadow-sm"
                  >
                    ✓ ACCEPT REFERRAL & CONFIRM BED
                  </button>
                )}
                {ref.status === 'ACCEPTED' && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceHandshake(ref.id, 'TRANSFER_IN_PROGRESS')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-sm flex items-center space-x-1"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>START AMBULANCE TRANSFER</span>
                  </button>
                )}
                {ref.status === 'TRANSFER_IN_PROGRESS' && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceHandshake(ref.id, 'PATIENT_ARRIVED')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-sm"
                  >
                    ✓ CONFIRM PATIENT ARRIVAL AT HUB
                  </button>
                )}
                {ref.status === 'PATIENT_ARRIVED' && (
                  <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-xl">
                    ✓ Patient Admitted at Apex Destination
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
