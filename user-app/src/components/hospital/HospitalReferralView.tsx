import React, { useState } from 'react';
import {
  ArrowLeft,
  Send,
  Plus,
  CheckCircle2,
  Clock,
  Building2,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Activity,
  Share2,
  Search,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Referral } from '../../types';

interface HospitalReferralViewProps {
  facilityName: string;
  onBack: () => void;
}

export const HospitalReferralView: React.FC<HospitalReferralViewProps> = ({
  facilityName,
  onBack
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'incoming' | 'outgoing' | 'create'>('incoming');

  // Incoming referrals from PHCs & Regional clinics
  const [incomingReferrals, setIncomingReferrals] = useState<Referral[]>([
    {
      id: 101,
      referral_code: 'REF-PHC-9842',
      patient_id: 1,
      referring_doctor_id: 11,
      destination_hospital_id: 1,
      required_specialty: 'Cardiology',
      required_facility: 'Super-Specialty Cardiac Evaluation & 3T MRI',
      status: 'WAITING_ACCEPTANCE' as any,
      clinical_notes: 'Patient presented with acute exertional chest discomfort and ST elevation; referred from Primary Health Centre Peddapuram.',
      created_at: '2026-08-30T10:30:00.000Z',
      updated_at: '2026-08-30T10:30:00.000Z',
      patient_name: 'Rahul Kumar',
      patient_uid: 'UID-IND-9842-7104',
      patient_age: 42,
      blood_group: 'B+',
      referring_doctor_name: 'Dr. Sunita Rani',
      referring_doctor_specialty: 'General Physician',
      referring_hospital_name: 'Primary Health Centre (PHC) Peddapuram',
      destination_hospital_name: facilityName
    },
    {
      id: 102,
      referral_code: 'REF-PHC-1102',
      patient_id: 2,
      referring_doctor_id: 13,
      destination_hospital_id: 1,
      required_specialty: 'Neurology',
      required_facility: 'Trauma & Stroke Evaluation',
      status: 'ACCEPTED',
      clinical_notes: 'Subacute neurological deficit with left-sided weakness.',
      created_at: '2026-08-29T14:15:00.000Z',
      updated_at: '2026-08-29T15:00:00.000Z',
      patient_name: 'Rajesh Kumar',
      patient_uid: 'UID-IND-1102-4458',
      patient_age: 45,
      blood_group: 'O+',
      referring_doctor_name: 'Dr. Surya',
      referring_doctor_specialty: 'Medical Officer',
      referring_hospital_name: 'Community Health Centre (CHC) Ballabhgarh',
      destination_hospital_name: facilityName
    }
  ]);

  // Outgoing referrals from this hospital to Apex Tertiary Centers
  const [outgoingReferrals, setOutgoingReferrals] = useState<Referral[]>([
    {
      id: 201,
      referral_code: 'REF-HOSP-2026',
      patient_id: 3,
      referring_doctor_id: 10,
      destination_hospital_id: 8,
      required_specialty: 'Surgical Oncology',
      required_facility: 'Advanced Robotic Surgery & PET-CT',
      status: 'SENT',
      clinical_notes: 'Complex thoracic tumor evaluation required.',
      created_at: '2026-08-31T09:00:00.000Z',
      updated_at: '2026-08-31T09:00:00.000Z',
      patient_name: 'Ananya Rao',
      patient_uid: 'UID-IND-1002-3401',
      patient_age: 26,
      blood_group: 'B+',
      referring_doctor_name: 'Dr. Manoj Reddy',
      referring_hospital_name: facilityName,
      destination_hospital_name: 'NIMS Hyderabad Autonomous Super-Speciality'
    }
  ]);

  const handleUpdateStatus = (refId: number, newStatus: any, isIncoming: boolean) => {
    if (isIncoming) {
      setIncomingReferrals(
        incomingReferrals.map((r) => (r.id === refId ? { ...r, status: newStatus, updated_at: new Date().toISOString() } : r))
      );
    } else {
      setOutgoingReferrals(
        outgoingReferrals.map((r) => (r.id === refId ? { ...r, status: newStatus, updated_at: new Date().toISOString() } : r))
      );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#00695C] to-[#004D40] text-white p-6 rounded-3xl shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black shadow-inner border border-white/30">
            📋
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-200 bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-400/30">
                📋 REFERRAL CENTER
              </span>
              <span className="text-xs text-emerald-100">• {facilityName}</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">Inter-Hospital Doctor Referral Pipeline</h2>
            <p className="text-xs text-emerald-100 font-medium">
              Seamless patient transfers between Primary Health Centres, District Hospitals & Apex Institutes.
            </p>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center space-x-2 bg-black/20 p-1.5 rounded-2xl border border-white/20">
          <button
            type="button"
            onClick={() => setActiveSubTab('incoming')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              activeSubTab === 'incoming' ? 'bg-white text-[#00695C] shadow' : 'text-emerald-100 hover:text-white'
            }`}
          >
            📥 Incoming from PHCs ({incomingReferrals.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('outgoing')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              activeSubTab === 'outgoing' ? 'bg-white text-[#00695C] shadow' : 'text-emerald-100 hover:text-white'
            }`}
          >
            📤 Outgoing Referrals ({outgoingReferrals.length})
          </button>
        </div>
      </div>

      {/* INCOMING REFERRALS FROM PHCs */}
      {activeSubTab === 'incoming' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#263238] uppercase tracking-wider">
              📥 Inbound Referrals Awaiting Hospital Action
            </h3>
            <span className="text-xs font-bold text-[#00695C]">
              {incomingReferrals.length} Cases Received from PHCs
            </span>
          </div>

          <div className="space-y-4">
            {incomingReferrals.map((ref) => (
              <div
                key={ref.id}
                className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-4 hover:border-[#00695C] transition-all"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-[#00695C] bg-[#E0F2F1] px-2.5 py-0.5 rounded-lg border border-[#00695C]/20">
                        {ref.referral_code}
                      </span>
                      <h4 className="text-base font-black text-[#263238]">{ref.patient_name}</h4>
                      <span className="text-xs text-slate-500 font-bold">
                        ({ref.patient_age} yrs • Blood: {ref.blood_group})
                      </span>
                    </div>
                    <span className="text-xs text-[#607D8B] block mt-0.5">
                      Referring Facility: <strong>{ref.referring_hospital_name}</strong> • Doctor: {ref.referring_doctor_name} ({ref.referring_doctor_specialty})
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black border ${
                      ref.status === 'ACCEPTED'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : ref.status === 'PATIENT_ARRIVED'
                        ? 'bg-sky-100 text-sky-800 border-sky-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                    }`}
                  >
                    {ref.status === 'ACCEPTED'
                      ? '🟢 ACCEPTED'
                      : ref.status === 'PATIENT_ARRIVED'
                      ? '🔵 PATIENT ARRIVED'
                      : '🟠 WAITING ACCEPTANCE'}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-[#263238] block">Required Specialty & Care:</span>
                  <p className="text-slate-700 font-medium">
                    {ref.required_specialty} — {ref.required_facility}
                  </p>
                  <span className="font-bold text-[#263238] block pt-1">Referring Clinical Notes:</span>
                  <p className="text-slate-600">{ref.clinical_notes}</p>
                </div>

                {/* 6-Stage Tracking Ribbon */}
                <div className="grid grid-cols-6 gap-1 pt-1 text-center">
                  {['SENT', 'RECEIVED', 'WAITING', 'ACCEPTED', 'ARRIVED', 'TREATMENT'].map((stg, i) => (
                    <div key={stg} className="space-y-1">
                      <div
                        className={`h-2 rounded-full ${
                          ref.status === 'ACCEPTED' && i <= 3
                            ? 'bg-[#00695C]'
                            : ref.status === 'PATIENT_ARRIVED' && i <= 4
                            ? 'bg-[#00695C]'
                            : i <= 2
                            ? 'bg-[#F57C00]'
                            : 'bg-slate-200'
                        }`}
                      />
                      <span className="text-[9px] font-extrabold text-slate-500 block truncate">{stg}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {ref.status !== 'ACCEPTED' && ref.status !== 'PATIENT_ARRIVED' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(ref.id, 'ACCEPTED', true)}
                      className="px-4 py-2 bg-[#00695C] hover:bg-[#004D40] text-white font-extrabold text-xs rounded-xl shadow transition-all active:scale-95 flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ACCEPT REFERRAL & RESERVE BED</span>
                    </button>
                  )}

                  {ref.status === 'ACCEPTED' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(ref.id, 'PATIENT_ARRIVED', true)}
                      className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white font-extrabold text-xs rounded-xl shadow transition-all active:scale-95 flex items-center space-x-1"
                    >
                      <span>MARK PATIENT ARRIVED AT HOSPITAL</span>
                    </button>
                  )}

                  <a
                    href={`/api/patients/${ref.patient_uid}/pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-slate-100 hover:bg-[#E0F2F1] text-[#263238] font-extrabold text-xs rounded-xl border border-slate-300 transition-colors"
                  >
                    📄 View Patient Attached EHR
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OUTGOING REFERRALS */}
      {activeSubTab === 'outgoing' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#263238] uppercase tracking-wider">
              📤 Outbound Referrals to Apex Tertiary Centers
            </h3>
            <span className="text-xs font-bold text-[#00695C]">
              {outgoingReferrals.length} Outgoing Referrals
            </span>
          </div>

          <div className="space-y-4">
            {outgoingReferrals.map((ref) => (
              <div
                key={ref.id}
                className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-4 hover:border-[#00695C] transition-all"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-[#00695C] bg-[#E0F2F1] px-2.5 py-0.5 rounded-lg border border-[#00695C]/20">
                        {ref.referral_code}
                      </span>
                      <h4 className="text-base font-black text-[#263238]">{ref.patient_name}</h4>
                    </div>
                    <span className="text-xs text-[#607D8B] block mt-0.5">
                      Destination Institute: <strong>{ref.destination_hospital_name}</strong> • Specialty: {ref.required_specialty}
                    </span>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
                    {ref.status}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  <span className="font-bold text-[#263238] block mb-1">Clinical Reason:</span>
                  <p className="text-slate-600">{ref.clinical_notes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
