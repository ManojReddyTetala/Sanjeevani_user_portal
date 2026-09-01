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
  AlertCircle
} from 'lucide-react';
import { Referral, Hospital } from '../../types';

interface PhcReferralViewProps {
  referrals: Referral[];
  onBack: () => void;
  facilityName: string;
}

export const PhcReferralView: React.FC<PhcReferralViewProps> = ({
  referrals,
  onBack,
  facilityName
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');

  // New Referral State
  const [patientUid, setPatientUid] = useState('UID-IND-9842-7104');
  const [destinationHospitalId, setDestinationHospitalId] = useState(1);
  const [requiredSpecialty, setRequiredSpecialty] = useState('Cardiology');
  const [requiredFacility, setRequiredFacility] = useState('Super-Specialty Cardiac Evaluation & Cath Lab');
  const [clinicalNotes, setClinicalNotes] = useState(
    'Patient presenting with exertional chest discomfort and ST elevation; requires advanced 3T MRI & interventional cardiology review not available at PHC.'
  );

  const [referralList, setReferralList] = useState<Referral[]>([
    {
      id: 1,
      referral_code: 'REF-2026-9842',
      patient_id: 1,
      referring_doctor_id: 11,
      destination_hospital_id: 1,
      required_specialty: 'Cardiology',
      required_facility: 'Super-Specialty Cardiac Evaluation',
      status: 'ACCEPTED',
      clinical_notes: 'Inter-facility referral from Village PHC to AIIMS Delhi for cardiac evaluation.',
      created_at: '2026-08-18T10:30:00.000Z',
      updated_at: '2026-08-19T09:00:00.000Z',
      patient_name: 'Manoj',
      patient_uid: 'UID-IND-9842-7104',
      patient_age: 28,
      blood_group: 'O+',
      referring_doctor_name: 'Dr. Surya',
      referring_hospital_name: facilityName,
      destination_hospital_name: 'All India Institute of Medical Sciences (AIIMS Delhi)'
    },
    {
      id: 2,
      referral_code: 'REF-2026-9843',
      patient_id: 1,
      referring_doctor_id: 12,
      destination_hospital_id: 3,
      required_specialty: 'Orthopedics',
      required_facility: 'MRI Lumbar Evaluation',
      status: 'SENT',
      clinical_notes: 'Routine referral for spinal evaluation.',
      created_at: '2026-08-24T12:00:00.000Z',
      updated_at: '2026-08-24T12:00:00.000Z',
      patient_name: 'Manoj',
      patient_uid: 'UID-IND-9842-7104',
      patient_age: 28,
      blood_group: 'O+',
      referring_doctor_name: 'Dr. Sameeruddin',
      referring_hospital_name: facilityName,
      destination_hospital_name: 'Max Super Speciality Hospital, Saket'
    }
  ]);

  const [isSending, setIsSending] = useState(false);
  const [createdRefCode, setCreatedRefCode] = useState<string | null>(null);

  const destinationOptions = [
    { id: 1, name: 'AIIMS Delhi — DEMO', city: 'New Delhi', type: 'Super-Speciality Apex' },
    { id: 2, name: 'Safdarjung Hospital — DEMO', city: 'New Delhi', type: 'Government Multi-Speciality Trauma' },
    { id: 3, name: 'Max Super Speciality Hospital, Saket — DEMO', city: 'New Delhi', type: 'Private Tertiary Hub' },
    { id: 5, name: 'Government General Hospital (GGH Kakinada) — DEMO', city: 'Kakinada', type: 'Teaching Super-Speciality' },
    { id: 8, name: 'NIMS Hyderabad — DEMO', city: 'Hyderabad', type: 'Autonomous Super-Speciality' }
  ];

  const handleSendReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setCreatedRefCode(null);

    const rand = Math.floor(1000 + Math.random() * 9000);
    const code = `REF-PHC-2026-${rand}`;

    try {
      const res = await fetch('/api/phc/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_uid: patientUid,
          destination_hospital_id: destinationHospitalId,
          required_specialty: requiredSpecialty,
          required_facility: requiredFacility,
          clinical_notes: clinicalNotes
        })
      });

      const destObj = destinationOptions.find((d) => d.id === destinationHospitalId);

      const newRef: Referral = {
        id: Date.now(),
        referral_code: code,
        patient_id: 1,
        referring_doctor_id: 11,
        destination_hospital_id: destinationHospitalId,
        required_specialty: requiredSpecialty,
        required_facility: requiredFacility,
        status: 'SENT',
        clinical_notes: clinicalNotes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        patient_name: 'Manoj',
        patient_uid: patientUid,
        patient_age: 28,
        blood_group: 'O+',
        referring_doctor_name: 'Dr. Sunita Rani',
        referring_hospital_name: facilityName,
        destination_hospital_name: destObj?.name || 'Tertiary Super-Speciality Hospital'
      };

      setReferralList([newRef, ...referralList]);
      setCreatedRefCode(code);
      setActiveTab('list');
    } catch (e) {
      alert('Failed to send digital referral.');
    } finally {
      setIsSending(false);
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
            <h2 className="text-xl font-black text-[#263238]">📋 Doctor-to-Doctor Digital Referrals</h2>
            <p className="text-xs text-[#607D8B] font-semibold">{facilityName}</p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
              activeTab === 'create' ? 'bg-[#00695C] text-white shadow-sm' : 'text-slate-700 hover:text-[#00695C]'
            }`}
          >
            + CREATE REFERRAL
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
              activeTab === 'list' ? 'bg-[#00695C] text-white shadow-sm' : 'text-slate-700 hover:text-[#00695C]'
            }`}
          >
            ACTIVE REFERRALS ({referralList.length})
          </button>
        </div>
      </div>

      {createdRefCode && (
        <div className="bg-[#E0F2F1] border-2 border-[#00695C] p-5 rounded-3xl space-y-2 text-emerald-950">
          <div className="flex items-center space-x-2 font-black text-sm text-[#00695C]">
            <CheckCircle2 className="w-5 h-5" />
            <span>Digital Doctor-to-Doctor Referral Dispatched!</span>
          </div>
          <p className="text-xs text-slate-700 font-medium">
            Referral Code: <strong className="font-mono text-sm text-[#00695C]">{createdRefCode}</strong> has been transmitted to receiving specialist doctors.
          </p>
        </div>
      )}

      {/* Workflow Diagram Banner */}
      <div className="bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-700">
        <div className="flex items-center space-x-1.5 text-[#00695C]">
          <span>🏥 PHC Doctor</span>
          <span>→</span>
        </div>
        <div className="flex items-center space-x-1.5 text-amber-700">
          <span>⚠️ Specialty Unavailable</span>
          <span>→</span>
        </div>
        <div className="flex items-center space-x-1.5 text-blue-700">
          <span>🎯 Select Hospital</span>
          <span>→</span>
        </div>
        <div className="flex items-center space-x-1.5 text-purple-700">
          <span>📨 Transmit Digital Code</span>
          <span>→</span>
        </div>
        <div className="flex items-center space-x-1.5 text-emerald-800">
          <span>✓ Patient Intake at Destination</span>
        </div>
      </div>

      {activeTab === 'create' ? (
        /* Create New Referral Form */
        <div className="bg-white border-2 border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
          <div className="space-y-1 border-b border-slate-100 pb-4">
            <h3 className="font-black text-lg text-[#263238]">Initiate Inter-Facility Patient Transfer</h3>
            <p className="text-xs text-slate-500">
              Select destination hospital with active capacity to transfer patient with full digital health history.
            </p>
          </div>

          <form onSubmit={handleSendReferral} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Patient UID */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">Patient Identifier (UID / Name)</label>
                <input
                  type="text"
                  value={patientUid}
                  onChange={(e) => setPatientUid(e.target.value)}
                  placeholder="UID-IND-9842-7104"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00695C]"
                  required
                />
              </div>

              {/* Destination Hospital */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">Target Secondary / Tertiary Hospital</label>
                <select
                  value={destinationHospitalId}
                  onChange={(e) => setDestinationHospitalId(parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00695C]"
                >
                  {destinationOptions.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.city} • {h.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Specialty */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">Required Specialty</label>
                <select
                  value={requiredSpecialty}
                  onChange={(e) => setRequiredSpecialty(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00695C]"
                >
                  <option value="Cardiology">Cardiology & Cardiac Surgery</option>
                  <option value="Neurology">Neurology & Stroke Center</option>
                  <option value="Orthopedics">Orthopedics & Joint Reconstruction</option>
                  <option value="Pediatrics">Pediatric Intensive Care</option>
                  <option value="General Surgery">General & Laparoscopic Surgery</option>
                  <option value="Trauma Care">Emergency Trauma Unit (108)</option>
                </select>
              </div>

              {/* Required Facility */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">Required Facility / Equipment</label>
                <input
                  type="text"
                  value={requiredFacility}
                  onChange={(e) => setRequiredFacility(e.target.value)}
                  placeholder="e.g. 3T MRI Scan, ICU Bed with Ventilator, Cardiac Cath Lab"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00695C]"
                  required
                />
              </div>
            </div>

            {/* Clinical Referral Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700">Clinical Reason & Case Summary</label>
              <textarea
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                rows={3}
                placeholder="Describe reason for referral, diagnostic findings, and urgency..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00695C]"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSending}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#00695C] hover:bg-[#004D40] text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? 'DISPATCHING REFERRAL...' : 'TRANSMIT DIGITAL REFERRAL'}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Referral Pipeline List */
        <div className="space-y-4">
          {referralList.map((ref) => {
            const isAccepted = ref.status === 'ACCEPTED';
            const isSent = ref.status === 'SENT';

            return (
              <div
                key={ref.id}
                className="bg-white border-2 border-slate-200 p-5 sm:p-6 rounded-3xl shadow-sm space-y-4 hover:border-[#00695C]/40 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm font-black text-[#00695C] bg-[#E0F2F1] px-2.5 py-0.5 rounded-lg">
                        {ref.referral_code}
                      </span>
                      <span className="text-xs text-slate-500 font-bold">• {ref.required_specialty}</span>
                    </div>
                    <h4 className="font-black text-base text-[#263238] mt-1">
                      Patient: {ref.patient_name || 'Manoj'} ({ref.patient_uid || 'UID-IND-9842-7104'})
                    </h4>
                  </div>

                  <span className={`px-3 py-1.5 rounded-full text-xs font-black border flex items-center space-x-1.5 ${
                    isAccepted
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-400'
                      : isSent
                      ? 'bg-blue-50 text-blue-900 border-blue-400'
                      : 'bg-amber-50 text-amber-900 border-amber-400'
                  }`}>
                    {isAccepted ? <span>🟢 ✓ ACCEPTED BY SPECIALIST</span> : <span>🔵 ⏳ TRANSMITTED (SENT)</span>}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Origin Facility (PHC)</span>
                    <span className="font-black text-slate-800">{ref.referring_hospital_name || facilityName}</span>
                    <p className="text-[11px] text-slate-500 font-medium">Referring Doctor: {ref.referring_doctor_name || 'Dr. Sunita Rani'}</p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Destination Medical Hub</span>
                    <span className="font-black text-[#00695C]">{ref.destination_hospital_name}</span>
                    <p className="text-[11px] text-slate-500 font-medium">Facility: {ref.required_facility}</p>
                  </div>
                </div>

                {ref.clinical_notes && (
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Clinical Transfer Notes</span>
                    <p className="text-slate-700 font-medium leading-relaxed mt-0.5">{ref.clinical_notes}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
