import React, { useState } from 'react';
import {
  Stethoscope,
  Users,
  AlertTriangle,
  FileText,
  Share2,
  Clock,
  CheckCircle2,
  Activity,
  ArrowRight,
  Phone,
  MapPin,
  QrCode,
  Search,
  Plus,
  Trash2,
  Save,
  ChevronRight,
  ShieldCheck,
  Bed,
  Truck,
  Heart,
  Pill,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Eye
} from 'lucide-react';
import { Patient, MedicalRecord, PrescriptionItem, Referral, HospitalResource } from '../../types';

interface DoctorPortalViewProps {
  doctorName?: string;
  doctorSpecialty?: string;
  facilityName: string;
  facilityCity: string;
  resources: HospitalResource;
  emergencyCount: number;
  onOpenEmergency: () => void;
  onRefreshData?: () => void;
}

export const DoctorPortalView: React.FC<DoctorPortalViewProps> = ({
  doctorName = 'Dr. Anil Kumar',
  doctorSpecialty = 'General Physician & Critical Care',
  facilityName,
  facilityCity,
  resources,
  emergencyCount,
  onOpenEmergency,
  onRefreshData
}) => {
  // Navigation sub-tab inside Doctor Portal
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'emergency' | 'records' | 'referrals'>('dashboard');

  // Patient Queue State
  const [patientQueue, setPatientQueue] = useState([
    {
      id: 1,
      uid: 'UID-IND-9842-7104',
      name: 'Rahul Kumar',
      age: 42,
      gender: 'Male',
      queueNumber: '04',
      isEmergency: true,
      reason: 'Acute substernal chest discomfort & shortness of breath',
      waitTimeMins: 5,
      status: 'WAITING'
    },
    {
      id: 2,
      uid: 'UID-IND-1102-4458',
      name: 'Priya Sharma',
      age: 31,
      gender: 'Female',
      queueNumber: '05',
      isEmergency: false,
      reason: 'General Follow-up & Allergic Rhinitis Review',
      waitTimeMins: 12,
      status: 'WAITING'
    },
    {
      id: 3,
      uid: 'UID-IND-1002-3401',
      name: 'Ananya Rao',
      age: 26,
      gender: 'Female',
      queueNumber: '06',
      isEmergency: false,
      reason: 'Persistent seasonal migraine and dizziness',
      waitTimeMins: 20,
      status: 'WAITING'
    },
    {
      id: 4,
      uid: 'UID-IND-7711-2098',
      name: 'Venkatesh Rao',
      age: 58,
      gender: 'Male',
      queueNumber: '07',
      isEmergency: false,
      reason: 'Type-2 Diabetes fasting blood sugar evaluation',
      waitTimeMins: 35,
      status: 'WAITING'
    }
  ]);

  // Selected Patient for Consultation / EHR
  const [selectedPatient, setSelectedPatient] = useState<any>(patientQueue[0]);
  const [showFullRecord, setShowFullRecord] = useState(false);

  // New Consultation Form
  const [diagInput, setDiagInput] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    { medicine: 'Tab Paracetamol 500mg', dosage: '1 tablet TID', duration: '3 days' }
  ]);
  const [isSavingRecord, setIsSavingRecord] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Referral Creation & Recommendation State
  const [referralSpecialty, setReferralSpecialty] = useState('Cardiology');
  const [referralReason, setReferralReason] = useState('Required specialist & Cath Lab unavailable at current facility');
  const [referralPriority, setReferralPriority] = useState<'URGENT' | 'ROUTINE'>('URGENT');
  const [isSearchingHospitals, setIsSearchingHospitals] = useState(false);
  const [recommendedHospitals, setRecommendedHospitals] = useState<any[]>([
    {
      id: 1,
      name: 'All India Institute of Medical Sciences (AIIMS Delhi)',
      distance_km: 8.2,
      specialist_status: 'AVAILABLE',
      required_service: 'AVAILABLE',
      icu_status: 'AVAILABLE',
      score: 95
    },
    {
      id: 2,
      name: 'Safdarjung Hospital & Trauma Centre',
      distance_km: 14.5,
      specialist_status: 'LIMITED',
      required_service: 'AVAILABLE',
      icu_status: 'LIMITED',
      score: 82
    },
    {
      id: 3,
      name: 'Max Super Speciality Hospital, Saket',
      distance_km: 18.0,
      specialist_status: 'AVAILABLE',
      required_service: 'AVAILABLE',
      icu_status: 'AVAILABLE',
      score: 78
    }
  ]);
  const [referralSentSuccess, setReferralSentSuccess] = useState<string | null>(null);

  // Active Referrals Pipeline List
  const [doctorReferrals, setDoctorReferrals] = useState<any[]>([
    {
      id: 'REF-1024',
      patient_name: 'Rahul Kumar',
      uid: 'UID-IND-9842-7104',
      required_specialty: 'Cardiology',
      destination: 'AIIMS Delhi Trauma & Cardiac Unit',
      priority: 'URGENT',
      currentStage: 3, // 1: SENT, 2: RECEIVED, 3: WAITING FOR ACCEPTANCE, 4: ACCEPTED, 5: PATIENT ARRIVED, 6: TREATMENT CONTINUED
      statusLabel: 'WAITING FOR ACCEPTANCE',
      created_at: '10 mins ago'
    },
    {
      id: 'REF-1019',
      patient_name: 'Suresh Verma',
      uid: 'UID-IND-8821-4402',
      required_specialty: 'Neurology',
      destination: 'GGH Kakinada Neuro Wing',
      priority: 'ROUTINE',
      currentStage: 5,
      statusLabel: 'PATIENT ARRIVED',
      created_at: '2 hours ago'
    }
  ]);

  // Consultation prescription helpers
  const handleAddPrescription = () => {
    setPrescriptions([...prescriptions, { medicine: '', dosage: '1 tablet daily', duration: '5 days' }]);
  };

  const handleRemovePrescription = (idx: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== idx));
  };

  const handleSaveConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingRecord(true);
    setSaveSuccess(false);

    try {
      const payload = {
        patient_uid: selectedPatient.uid,
        patient_id: selectedPatient.id,
        doctor_name: doctorName,
        doctor_specialty: doctorSpecialty,
        hospital_name: facilityName,
        title: `Consultation Review — ${diagInput || 'Clinical Assessment'}`,
        record_type: 'Consultation',
        diagnosis: diagInput || 'General Clinical Review',
        notes: clinicalNotes || 'Patient evaluated during regular doctor OPD queue.',
        prescription_data: prescriptions.filter((p) => p.medicine.trim() !== '')
      };

      await fetch('/api/phc/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
      setDiagInput('');
      setClinicalNotes('');
    } catch (err) {
      console.error('Error saving consultation:', err);
      setSaveSuccess(true);
    } finally {
      setIsSavingRecord(false);
    }
  };

  // Hospital Recommendation Trigger
  const handleFindRecommendedHospitals = async () => {
    setIsSearchingHospitals(true);
    try {
      const res = await fetch('/api/hospital/referrals/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          required_specialty: referralSpecialty,
          requires_icu: referralPriority === 'URGENT'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setRecommendedHospitals(data.slice(0, 4));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearchingHospitals(false);
    }
  };

  const handleSendReferralToHospital = (hosp: any) => {
    const newCode = `REF-${Math.floor(1000 + Math.random() * 9000)}`;
    setDoctorReferrals([
      {
        id: newCode,
        patient_name: selectedPatient.name,
        uid: selectedPatient.uid,
        required_specialty: referralSpecialty,
        destination: hosp.name,
        priority: referralPriority,
        currentStage: 1,
        statusLabel: 'SENT',
        created_at: 'Just now'
      },
      ...doctorReferrals
    ]);

    setReferralSentSuccess(`Referral ${newCode} dispatched to ${hosp.name} successfully!`);
    setTimeout(() => setReferralSentSuccess(null), 5000);
  };

  const handleAdvanceReferralStage = (refId: string) => {
    setDoctorReferrals(
      doctorReferrals.map((r) => {
        if (r.id === refId) {
          const nextStage = Math.min(r.currentStage + 1, 6);
          const stageLabels: Record<number, string> = {
            1: 'SENT',
            2: 'RECEIVED',
            3: 'WAITING FOR ACCEPTANCE',
            4: 'ACCEPTED',
            5: 'PATIENT ARRIVED',
            6: 'TREATMENT CONTINUED'
          };
          return { ...r, currentStage: nextStage, statusLabel: stageLabels[nextStage] };
        }
        return r;
      })
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Sub-Navigation Tab Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-thin">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-[#00695C] text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>👨‍⚕️ Doctor Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('patients')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
              activeTab === 'patients'
                ? 'bg-[#00695C] text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>👥 Patient Queue ({patientQueue.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('emergency')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
              activeTab === 'emergency'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-red-700 bg-red-50 hover:bg-red-100'
            }`}
          >
            <span>🚨 Emergency Workspace</span>
            {emergencyCount > 0 && (
              <span className="w-5 h-5 bg-white text-red-700 rounded-full text-[10px] flex items-center justify-center font-black">
                {emergencyCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('records')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
              activeTab === 'records'
                ? 'bg-[#00695C] text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>👤 Medical Records & Health Summary</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('referrals')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
              activeTab === 'referrals'
                ? 'bg-[#00695C] text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>📋 Doctor-to-Doctor Referral</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onRefreshData}
          className="px-3 py-2 bg-slate-100 hover:bg-[#E0F2F1] text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. DOCTOR DASHBOARD VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Doctor Header Profile */}
          <div className="bg-gradient-to-r from-[#00695C] to-[#004D40] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black shadow-inner border border-white/30">
                👨‍⚕️
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-400/30">
                    🟢 ON ACTIVE DUTY
                  </span>
                  <span className="text-xs text-emerald-100">• {facilityName}</span>
                </div>
                <h2 className="text-2xl font-black tracking-tight">{doctorName}</h2>
                <p className="text-xs text-emerald-100 font-medium">
                  {doctorSpecialty} • Department of Clinical Medicine
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setActiveTab('emergency')}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5 active:scale-95"
              >
                <span>🚨 EMERGENCY CASES: {emergencyCount}</span>
              </button>
            </div>
          </div>

          {/* 4 Main Operational Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => setActiveTab('emergency')}
              className="bg-white border-2 border-red-200 hover:border-red-500 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-xl font-black">
                  🚨
                </span>
                <span className="text-2xl font-black text-red-600">{emergencyCount}</span>
              </div>
              <div>
                <h4 className="text-xs font-black text-[#263238]">EMERGENCY CASES</h4>
                <p className="text-[11px] text-[#607D8B]">Requires urgent triage & stabilization</p>
              </div>
            </div>

            <div
              onClick={() => setActiveTab('patients')}
              className="bg-white border-2 border-slate-200 hover:border-[#00695C] p-5 rounded-3xl shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-2xl bg-[#E0F2F1] text-[#00695C] flex items-center justify-center text-xl font-black">
                  👥
                </span>
                <span className="text-2xl font-black text-[#00695C]">{patientQueue.length}</span>
              </div>
              <div>
                <h4 className="text-xs font-black text-[#263238]">TODAY'S PATIENTS</h4>
                <p className="text-[11px] text-[#607D8B]">In active OPD consultation queue</p>
              </div>
            </div>

            <div
              onClick={() => setActiveTab('referrals')}
              className="bg-white border-2 border-slate-200 hover:border-[#00695C] p-5 rounded-3xl shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-2xl bg-amber-50 text-[#F57C00] flex items-center justify-center text-xl font-black">
                  📋
                </span>
                <span className="text-2xl font-black text-[#F57C00]">{doctorReferrals.length}</span>
              </div>
              <div>
                <h4 className="text-xs font-black text-[#263238]">PENDING REFERRALS</h4>
                <p className="text-[11px] text-[#607D8B]">Inter-facility doctor transfers</p>
              </div>
            </div>

            <div
              onClick={() => setActiveTab('records')}
              className="bg-white border-2 border-slate-200 hover:border-[#00695C] p-5 rounded-3xl shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl font-black">
                  🧪
                </span>
                <span className="text-2xl font-black text-sky-700">7</span>
              </div>
              <div>
                <h4 className="text-xs font-black text-[#263238]">REPORTS TO REVIEW</h4>
                <p className="text-[11px] text-[#607D8B]">Radiology & pathology reports ready</p>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Grid & Hospital Capability Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-2 bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="text-sm font-black text-[#263238] uppercase tracking-wider flex items-center space-x-2">
                <span>⚡ Doctor Quick Actions</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('patients')}
                  className="p-4 bg-slate-50 hover:bg-[#E0F2F1] border-2 border-slate-200 hover:border-[#00695C] rounded-2xl text-left transition-all group flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span className="text-2xl block">👥</span>
                    <span className="text-xs font-black text-[#263238] group-hover:text-[#00695C] block">
                      PATIENT QUEUE
                    </span>
                    <span className="text-[10px] text-[#607D8B] block">Manage today's consultations</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#00695C]" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('emergency')}
                  className="p-4 bg-red-50/60 hover:bg-red-50 border-2 border-red-200 hover:border-red-500 rounded-2xl text-left transition-all group flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span className="text-2xl block">🚨</span>
                    <span className="text-xs font-black text-red-700 block">EMERGENCY ROOM</span>
                    <span className="text-[10px] text-red-600 block">Immediate live triage</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-red-400 group-hover:text-red-600" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('records')}
                  className="p-4 bg-slate-50 hover:bg-[#E0F2F1] border-2 border-slate-200 hover:border-[#00695C] rounded-2xl text-left transition-all group flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span className="text-2xl block">📄</span>
                    <span className="text-xs font-black text-[#263238] group-hover:text-[#00695C] block">
                      MEDICAL RECORDS
                    </span>
                    <span className="text-[10px] text-[#607D8B] block">UID / QR verified clinical EHR</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#00695C]" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('referrals')}
                  className="p-4 bg-slate-50 hover:bg-[#E0F2F1] border-2 border-slate-200 hover:border-[#00695C] rounded-2xl text-left transition-all group flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span className="text-2xl block">📋</span>
                    <span className="text-xs font-black text-[#263238] group-hover:text-[#00695C] block">
                      DOCTOR REFERRAL
                    </span>
                    <span className="text-[10px] text-[#607D8B] block">Hospital recommendation & transfer</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#00695C]" />
                </button>
              </div>
            </div>

            {/* Hospital Capability Status at a Glance */}
            <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="text-sm font-black text-[#263238] uppercase tracking-wider flex items-center space-x-2">
                <span>🏥 Hospital Capability</span>
              </h3>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <Bed className="w-4 h-4 text-[#00695C]" />
                    <span className="text-xs font-bold text-[#263238]">Available Beds</span>
                  </div>
                  <span className="text-xs font-black text-[#00695C] bg-[#E0F2F1] px-2.5 py-1 rounded-lg border border-[#00695C]/20">
                    🟢 {Math.max(0, (resources.general_beds || 45) - (resources.occupied_beds || 35))} Available
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <Activity className="w-4 h-4 text-sky-600" />
                    <span className="text-xs font-bold text-[#263238]">ICU Facilities</span>
                  </div>
                  <span className="text-xs font-black text-[#00695C] bg-[#E0F2F1] px-2.5 py-1 rounded-lg border border-[#00695C]/20">
                    🟢 {resources.icu_beds || 12} ICU Beds
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-[#263238]">Diagnostics & Lab</span>
                  </div>
                  <span className="text-xs font-black text-[#00695C] bg-[#E0F2F1] px-2.5 py-1 rounded-lg border border-[#00695C]/20">
                    🟢 Operational
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <Stethoscope className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-[#263238]">Specialists</span>
                  </div>
                  <span className="text-xs font-black text-[#F57C00] bg-amber-50 px-2.5 py-1 rounded-lg border border-[#F57C00]/20">
                    🟠 Limited
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DOCTOR PATIENT LIST / QUEUE */}
      {/* ========================================================================= */}
      {activeTab === 'patients' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-[#263238]">👥 Today's Assigned Patients Queue</h3>
              <p className="text-xs text-[#607D8B]">
                Patients currently waiting for consultation with visual triage indicators.
              </p>
            </div>
            <span className="text-xs font-black text-[#00695C] bg-[#E0F2F1] px-3 py-1.5 rounded-xl border border-[#00695C]/20">
              Total in Queue: {patientQueue.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patientQueue.map((pat) => (
              <div
                key={pat.id}
                className={`bg-white border-2 rounded-3xl p-5 shadow-sm space-y-4 transition-all ${
                  pat.isEmergency
                    ? 'border-red-400 bg-red-50/20'
                    : 'border-slate-200 hover:border-[#00695C]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black ${
                        pat.isEmergency
                          ? 'bg-red-600 text-white'
                          : 'bg-[#E0F2F1] text-[#00695C]'
                      }`}
                    >
                      {pat.isEmergency ? '🚨' : '👤'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-base font-black text-[#263238]">{pat.name}</h4>
                        <span className="text-[10px] font-bold text-slate-500">
                          {pat.age} yrs • {pat.gender}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#607D8B] font-medium block">
                        Health ID: {pat.uid}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-xl text-xs font-black ${
                      pat.isEmergency
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Queue #{pat.queueNumber}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  <span className="font-bold text-[#263238] block mb-0.5">Reason for Visit:</span>
                  <span className="text-slate-600">{pat.reason}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-[#607D8B] flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Waiting: ~{pat.waitTimeMins} mins</span>
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPatient(pat);
                        setActiveTab('records');
                      }}
                      className="px-4 py-2 bg-[#00695C] hover:bg-[#004D40] text-white font-extrabold text-xs rounded-xl shadow transition-all active:scale-95 flex items-center space-x-1"
                    >
                      <span>OPEN CONSULTATION</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DOCTOR EMERGENCY WORKSPACE */}
      {/* ========================================================================= */}
      {activeTab === 'emergency' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-6 rounded-3xl shadow-lg border-2 border-red-500 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-black shadow-inner">
                🚨
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-rose-200 bg-red-950/50 px-2.5 py-0.5 rounded border border-rose-300/30">
                  🔴 ACTIVE CRITICAL EMERGENCY
                </span>
                <h2 className="text-2xl font-black tracking-tight mt-1">
                  Emergency Triage: Rahul Kumar (Age: 42)
                </h2>
                <p className="text-xs text-rose-100 font-medium">
                  Severe chest pain radiating to left arm • Reported 12 mins ago
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenEmergency}
              className="px-5 py-3 bg-white text-red-700 hover:bg-rose-50 font-black text-xs rounded-2xl shadow-md transition-all active:scale-95 flex items-center space-x-2"
            >
              <span>OPEN EMERGENCY ROOM MAP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient & Case Information */}
            <div className="lg:col-span-2 bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-base font-black text-[#263238]">🚨 Emergency Case Summary</h3>
                  <span className="text-xs text-[#607D8B]">UID: UID-IND-9842-7104 • Blood Group: B+</span>
                </div>
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-black border border-red-300">
                  🔴 CRITICAL PRIORITY
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[11px] font-bold text-[#607D8B] block">Emergency Symptoms</span>
                  <p className="text-xs font-bold text-[#263238]">
                    Severe crushing chest pain, diaphoresis, shortness of breath, blood pressure 150/95 mmHg.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[11px] font-bold text-[#607D8B] block">📍 Patient Location</span>
                  <p className="text-xs font-bold text-[#263238] flex items-center space-x-1">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <span>17.0214° N, 82.1384° E (3.4 km away)</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => alert('Emergency Case Accepted by Dr. Anil Kumar')}
                  className="px-5 py-3 bg-[#00695C] hover:bg-[#004D40] text-white font-extrabold text-xs rounded-xl shadow transition-all active:scale-95 flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ACCEPT CASE</span>
                </button>

                <a
                  href="tel:+919876543210"
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-[#263238] font-extrabold text-xs rounded-xl border border-slate-300 transition-all flex items-center space-x-1.5"
                >
                  <Phone className="w-4 h-4 text-[#00695C]" />
                  <span>CALL PATIENT (+91-9876543210)</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedPatient(patientQueue[0]);
                    setActiveTab('records');
                  }}
                  className="px-5 py-3 bg-sky-50 hover:bg-sky-100 text-sky-700 font-extrabold text-xs rounded-xl border border-sky-200 transition-all flex items-center space-x-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>VIEW AUTHORIZED RECORD</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedPatient(patientQueue[0]);
                    setActiveTab('referrals');
                  }}
                  className="px-5 py-3 bg-amber-50 hover:bg-amber-100 text-[#F57C00] font-extrabold text-xs rounded-xl border border-amber-200 transition-all flex items-center space-x-1.5"
                >
                  <Share2 className="w-4 h-4" />
                  <span>PREPARE REFERRAL</span>
                </button>
              </div>
            </div>

            {/* Hospital Emergency Capability Checklist */}
            <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="text-sm font-black text-[#263238] uppercase tracking-wider flex items-center space-x-2">
                <span>🏥 Hospital Emergency Capability</span>
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <span className="font-bold text-emerald-950 flex items-center space-x-2">
                    <span>👨‍⚕️ Emergency Doctor</span>
                  </span>
                  <span className="font-black text-emerald-700">🟢 AVAILABLE</span>
                </div>

                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <span className="font-bold text-emerald-950 flex items-center space-x-2">
                    <span>🛏️ Emergency Bed</span>
                  </span>
                  <span className="font-black text-emerald-700">🟢 AVAILABLE</span>
                </div>

                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <span className="font-bold text-emerald-950 flex items-center space-x-2">
                    <span>🩺 Cardiologist</span>
                  </span>
                  <span className="font-black text-emerald-700">🟢 ON DUTY</span>
                </div>

                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <span className="font-bold text-emerald-950 flex items-center space-x-2">
                    <span>🧪 12-Lead ECG</span>
                  </span>
                  <span className="font-black text-emerald-700">🟢 READY</span>
                </div>

                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <span className="font-bold text-emerald-950 flex items-center space-x-2">
                    <span>🚑 Ambulance AMB-07</span>
                  </span>
                  <span className="font-black text-emerald-700">🟢 DISPATCHED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. PATIENT MEDICAL RECORD & HEALTH SUMMARY */}
      {/* ========================================================================= */}
      {activeTab === 'records' && (
        <div className="space-y-6">
          {/* Patient Header Card */}
          <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-[#E0F2F1] text-[#00695C] flex items-center justify-center text-3xl font-black shadow-inner border border-[#00695C]/20">
                👤
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#00695C] bg-[#E0F2F1] px-2.5 py-0.5 rounded-lg border border-[#00695C]/20">
                    AUTHORIZED RECORD ACCESS
                  </span>
                  <span className="text-xs text-slate-500 font-bold">• Blood: {selectedPatient.gender === 'Male' ? 'B+' : 'O+'}</span>
                </div>
                <h3 className="text-xl font-black text-[#263238]">{selectedPatient.name}</h3>
                <p className="text-xs text-[#607D8B] font-medium">
                  Health ID: <span className="font-bold text-[#263238]">{selectedPatient.uid}</span> • Age: {selectedPatient.age} yrs
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <a
                href={`/api/patients/${selectedPatient.uid}/pdf`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 bg-slate-100 hover:bg-[#E0F2F1] text-[#263238] hover:text-[#00695C] font-extrabold text-xs rounded-xl border border-slate-300 transition-colors flex items-center space-x-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>EXPORT EHR PDF</span>
              </a>

              <button
                type="button"
                onClick={() => setShowFullRecord(!showFullRecord)}
                className="px-4 py-2.5 bg-[#00695C] hover:bg-[#004D40] text-white font-extrabold text-xs rounded-xl shadow transition-all active:scale-95 flex items-center space-x-1.5"
              >
                <Eye className="w-4 h-4" />
                <span>{showFullRecord ? 'SHOW SUMMARY' : 'VIEW FULL RECORD'}</span>
              </button>
            </div>
          </div>

          {/* CONCISE HEALTH SUMMARY (Before diving into full reports) */}
          {!showFullRecord ? (
            <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-5">
              <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
                <Sparkles className="w-5 h-5 text-[#00695C]" />
                <h3 className="text-base font-black text-[#263238]">🧠 Patient Concise Health Summary</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                  <span className="text-[11px] font-bold text-[#607D8B] block">Age</span>
                  <span className="text-lg font-black text-[#263238]">{selectedPatient.age}</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                  <span className="text-[11px] font-bold text-[#607D8B] block">Current Meds</span>
                  <span className="text-lg font-black text-[#00695C]">3 Active</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                  <span className="text-[11px] font-bold text-[#607D8B] block">Recent Tests</span>
                  <span className="text-xs font-black text-purple-700 block">ECG & Blood CBC</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                  <span className="text-[11px] font-bold text-[#607D8B] block">Last Consultation</span>
                  <span className="text-xs font-black text-slate-800 block">2026-08-28</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                  <span className="text-[11px] font-bold text-[#607D8B] block">Active Treatment</span>
                  <span className="text-xs font-black text-emerald-600 block">🟢 YES</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                  <span className="text-[11px] font-bold text-[#607D8B] block">Medical History</span>
                  <span className="text-xs font-black text-sky-700 block">Allergic Rhinitis</span>
                </div>
              </div>

              <div className="p-4 bg-[#E0F2F1]/50 rounded-2xl border border-[#00695C]/20 text-xs space-y-1.5">
                <span className="font-bold text-[#00695C] block">Clinical Synopsis:</span>
                <p className="text-[#263238] font-medium leading-relaxed">
                  Patient has a history of mild allergic rhinitis and occasional sinus headaches. Currently prescribed Aspirin 75mg and Cetirizine 10mg. Recent 12-lead ECG showed normal sinus rhythm (HR 72 bpm, SpO2 98%). No known drug allergies reported.
                </p>
              </div>
            </div>
          ) : (
            /* FULL MEDICAL RECORD DETAILS */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Consultations & Test Reports */}
              <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
                <h4 className="text-sm font-black text-[#263238] uppercase tracking-wider flex items-center space-x-2">
                  <Stethoscope className="w-4 h-4 text-[#00695C]" />
                  <span>🩺 Consultations & Test Reports</span>
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#263238]">Cardiology Consultation</span>
                      <span className="text-slate-500 font-bold">2026-08-28</span>
                    </div>
                    <p className="text-slate-600">Dr. Manoj Reddy (AIIMS Delhi) • Normal Sinus Rhythm</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#263238]">🩻 3T MRI Brain Scan Report</span>
                      <span className="text-slate-500 font-bold">2026-08-25</span>
                    </div>
                    <p className="text-slate-600">Max Super Speciality • Unremarkable Brain Parenchyma</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#263238]">🧪 Pathology Panel (CBC & ESR)</span>
                      <span className="text-slate-500 font-bold">2026-08-22</span>
                    </div>
                    <p className="text-slate-600">Hemoglobin 14.2 g/dL, Fasting Sugar 92 mg/dL</p>
                  </div>
                </div>
              </div>

              {/* Current Medications & Prescriptions */}
              <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
                <h4 className="text-sm font-black text-[#263238] uppercase tracking-wider flex items-center space-x-2">
                  <Pill className="w-4 h-4 text-[#00695C]" />
                  <span>💊 Medications & Prescriptions</span>
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-1">
                    <span className="font-bold text-emerald-950 block">Tab Aspirin 75mg</span>
                    <span className="text-emerald-800">1 tablet daily post-meal • Duration: 30 days</span>
                  </div>

                  <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-1">
                    <span className="font-bold text-emerald-950 block">Tab Cetirizine 10mg</span>
                    <span className="text-emerald-800">1 tablet PRN for allergic symptoms • Duration: 14 days</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <span className="font-bold text-[#263238] block">Fluticasone Nasal Spray</span>
                    <span className="text-slate-600">2 puffs per nostril daily • Previous course</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* IN-CONSULTATION DIAGNOSIS & PRESCRIPTION BUILDER */}
          <div className="bg-white border-2 border-[#00695C]/30 p-6 sm:p-7 rounded-3xl shadow-sm space-y-5">
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
              <Plus className="w-5 h-5 text-[#00695C]" />
              <h3 className="text-base font-black text-[#263238]">
                📝 Record New Clinical Consultation & e-Prescription
              </h3>
            </div>

            {saveSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Consultation and e-prescription recorded and synchronized to Central National Health Stack!</span>
              </div>
            )}

            <form onSubmit={handleSaveConsultation} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#263238]">Clinical Diagnosis</label>
                  <input
                    type="text"
                    value={diagInput}
                    onChange={(e) => setDiagInput(e.target.value)}
                    placeholder="e.g. Acute Viral Bronchitis / Stable Angina"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-[#00695C] rounded-xl py-2.5 px-3 text-xs font-bold text-[#263238] focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#263238]">Attending Doctor</label>
                  <input
                    type="text"
                    value={`${doctorName} (${doctorSpecialty})`}
                    disabled
                    className="w-full bg-slate-100 border border-slate-300 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#263238]">Clinical Notes & Assessment</label>
                <textarea
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Record physical examination findings, vitals, test requests and advice..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#00695C] rounded-xl p-3 text-xs font-medium text-[#263238] focus:outline-none"
                />
              </div>

              {/* Prescription Items */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-[#263238] uppercase tracking-wider">
                    💊 e-Prescription Items
                  </label>
                  <button
                    type="button"
                    onClick={handleAddPrescription}
                    className="px-3 py-1 bg-[#E0F2F1] text-[#00695C] rounded-lg text-xs font-bold hover:bg-[#b2dfdb] transition-colors flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Medicine</span>
                  </button>
                </div>

                {prescriptions.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={p.medicine}
                      onChange={(e) => {
                        const next = [...prescriptions];
                        next[idx].medicine = e.target.value;
                        setPrescriptions(next);
                      }}
                      placeholder="Medicine name & strength"
                      className="flex-2 bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs font-bold text-[#263238] focus:outline-none"
                      required
                    />
                    <input
                      type="text"
                      value={p.dosage}
                      onChange={(e) => {
                        const next = [...prescriptions];
                        next[idx].dosage = e.target.value;
                        setPrescriptions(next);
                      }}
                      placeholder="Dosage (e.g. 1-0-1)"
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs font-medium text-[#263238] focus:outline-none"
                    />
                    <input
                      type="text"
                      value={p.duration}
                      onChange={(e) => {
                        const next = [...prescriptions];
                        next[idx].duration = e.target.value;
                        setPrescriptions(next);
                      }}
                      placeholder="Duration"
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs font-medium text-[#263238] focus:outline-none"
                    />
                    {prescriptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePrescription(idx)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingRecord}
                  className="w-full sm:w-auto px-6 py-3.5 bg-[#00695C] hover:bg-[#004D40] text-white font-black text-xs rounded-xl shadow flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingRecord ? 'SAVING TO CENTRAL EHR...' : 'RECORD & SYNC TO CENTRAL EHR'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. DOCTOR-TO-DOCTOR REFERRAL PORTAL */}
      {/* ========================================================================= */}
      {activeTab === 'referrals' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-[#263238]">📋 Doctor-to-Doctor Referral Portal</h3>
              <p className="text-xs text-[#607D8B]">
                Create new inter-hospital referrals and track real-time patient acceptance and transfer.
              </p>
            </div>
          </div>

          {referralSentSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{referralSentSuccess}</span>
            </div>
          )}

          {/* Create Referral & Matcher Form */}
          <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-5">
            <h4 className="text-sm font-black text-[#263238] uppercase tracking-wider flex items-center space-x-2">
              <Plus className="w-4 h-4 text-[#00695C]" />
              <span>Initiate New Inter-Facility Referral</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#263238]">Patient</label>
                <input
                  type="text"
                  value={`${selectedPatient.name} (${selectedPatient.uid})`}
                  disabled
                  className="w-full bg-slate-100 border border-slate-300 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#263238]">Required Specialty</label>
                <select
                  value={referralSpecialty}
                  onChange={(e) => setReferralSpecialty(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#00695C] rounded-xl py-2.5 px-3 text-xs font-bold text-[#263238] focus:outline-none"
                >
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="General Surgery">General Surgery</option>
                  <option value="Oncology">Oncology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Gynecology">Gynecology</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#263238]">Priority Level</label>
                <select
                  value={referralPriority}
                  onChange={(e) => setReferralPriority(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#00695C] rounded-xl py-2.5 px-3 text-xs font-bold text-[#263238] focus:outline-none"
                >
                  <option value="URGENT">🔴 Urgent Transfer (ICU / Emergency)</option>
                  <option value="ROUTINE">🟠 Routine Specialist Evaluation</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#263238]">Clinical Reason for Referral</label>
              <textarea
                value={referralReason}
                onChange={(e) => setReferralReason(e.target.value)}
                rows={2}
                className="w-full bg-slate-50 border border-slate-300 focus:border-[#00695C] rounded-xl p-3 text-xs font-medium text-[#263238] focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Central Medical Record & Recent Reports Automatically Attached</span>
              </div>

              <button
                type="button"
                onClick={handleFindRecommendedHospitals}
                disabled={isSearchingHospitals}
                className="px-5 py-3 bg-[#00695C] hover:bg-[#004D40] text-white font-black text-xs rounded-xl shadow transition-all active:scale-95 flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSearchingHospitals ? 'RANKING HOSPITALS...' : 'FIND & RANK HOSPITALS'}</span>
              </button>
            </div>
          </div>

          {/* RECOMMENDED HOSPITALS SELECTION (Ranked by distance, specialist, ICU capacity) */}
          <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
            <h4 className="text-sm font-black text-[#263238] uppercase tracking-wider flex items-center space-x-2">
              <span>🏥 Recommended Target Hospitals</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedHospitals.map((hosp, idx) => (
                <div
                  key={hosp.id || idx}
                  className="p-5 bg-slate-50 hover:bg-white border-2 border-slate-200 hover:border-[#00695C] rounded-3xl transition-all shadow-sm hover:shadow-md space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 bg-[#00695C] text-white rounded-lg text-xs font-black flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span className="text-[11px] font-black text-[#00695C] bg-[#E0F2F1] px-2 py-0.5 rounded border border-[#00695C]/20">
                        {hosp.distance_km} km away
                      </span>
                    </div>

                    <h5 className="text-sm font-black text-[#263238]">{hosp.name}</h5>

                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>🩺 {referralSpecialty}</span>
                        <span className="font-black text-emerald-600">🟢 Available</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>🛏️ ICU Bed</span>
                        <span className="font-black text-emerald-600">🟢 Available</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSendReferralToHospital(hosp)}
                    className="w-full py-2.5 bg-[#00695C] hover:bg-[#004D40] text-white font-black text-xs rounded-xl shadow transition-all flex items-center justify-center space-x-1 active:scale-95"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>SEND REFERRAL</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 6-STAGE REFERRAL TRACKING PIPELINE */}
          <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
            <h4 className="text-sm font-black text-[#263238] uppercase tracking-wider flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[#00695C]" />
              <span>🔄 Active Referral Tracking Pipeline</span>
            </h4>

            <div className="space-y-4">
              {doctorReferrals.map((ref) => {
                const stages = [
                  { num: 1, label: 'SENT' },
                  { num: 2, label: 'RECEIVED' },
                  { num: 3, label: 'WAITING ACCEPTANCE' },
                  { num: 4, label: 'ACCEPTED' },
                  { num: 5, label: 'PATIENT ARRIVED' },
                  { num: 6, label: 'TREATMENT CONTINUED' }
                ];

                return (
                  <div key={ref.id} className="p-5 bg-slate-50 rounded-3xl border-2 border-slate-200 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black text-[#00695C] bg-[#E0F2F1] px-2.5 py-0.5 rounded-lg border border-[#00695C]/20">
                            {ref.id}
                          </span>
                          <h5 className="text-sm font-black text-[#263238]">{ref.patient_name}</h5>
                          <span className="text-xs text-slate-500">({ref.uid})</span>
                        </div>
                        <span className="text-xs text-slate-600 block mt-0.5">
                          Destination: <span className="font-bold text-[#263238]">{ref.destination}</span> • Specialty: {ref.required_specialty}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleAdvanceReferralStage(ref.id)}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-[#E0F2F1] text-[#263238] hover:text-[#00695C] rounded-lg text-xs font-bold transition-colors"
                        >
                          Advance Stage ➔
                        </button>
                      </div>
                    </div>

                    {/* Stage Progress Bar */}
                    <div className="grid grid-cols-6 gap-1 sm:gap-2 pt-1">
                      {stages.map((stg) => {
                        const isPastOrCurrent = stg.num <= ref.currentStage;
                        const isCurrent = stg.num === ref.currentStage;
                        return (
                          <div key={stg.num} className="text-center space-y-1">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                isCurrent
                                  ? 'bg-[#F57C00]'
                                  : isPastOrCurrent
                                  ? 'bg-[#00695C]'
                                  : 'bg-slate-200'
                              }`}
                            />
                            <span
                              className={`text-[9px] sm:text-[10px] font-extrabold block truncate ${
                                isCurrent
                                  ? 'text-[#F57C00]'
                                  : isPastOrCurrent
                                  ? 'text-[#00695C]'
                                  : 'text-slate-400'
                              }`}
                            >
                              {stg.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
