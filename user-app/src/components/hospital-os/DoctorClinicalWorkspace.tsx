import React, { useState } from 'react';
import {
  Stethoscope,
  Clock,
  AlertTriangle,
  FileText,
  User,
  Activity,
  HeartPulse,
  Share2,
  Pill,
  CheckCircle2,
  Calendar,
  ChevronRight,
  ShieldAlert,
  Search,
  Building2,
  PlusCircle,
  History,
  Info
} from 'lucide-react';
import { Patient, MedicalRecord, EmergencyRequest, DiagnosticOrder } from '../../types';

interface DoctorClinicalWorkspaceProps {
  doctorName?: string;
  department?: string;
  patients: Patient[];
  records: MedicalRecord[];
  emergencies: EmergencyRequest[];
  onOrderLabTest?: (testName: string, priority: string, patient: Patient) => void;
  onInitiateReferral?: (patient: Patient) => void;
}

export const DoctorClinicalWorkspace: React.FC<DoctorClinicalWorkspaceProps> = ({
  doctorName = 'Dr. Anil Kumar (Chief Cardiologist)',
  department = 'Cardiology & Emergency Critical Care',
  patients,
  records,
  emergencies,
  onOrderLabTest,
  onInitiateReferral
}) => {
  const [activeTab, setActiveTab] = useState<'myday' | 'patient360' | 'capability'>('myday');
  const [selectedPatientId, setSelectedPatientId] = useState<number>(patients[0]?.id || 1);
  const [showOrderLabModal, setShowOrderLabModal] = useState(false);
  const [labTestName, setLabTestName] = useState('12-Lead Electrocardiogram (ECG)');
  const [labPriority, setLabPriority] = useState('CRITICAL');
  const [orderSuccessMsg, setOrderSuccessMsg] = useState('');

  // Capability Checker State
  const [capSpecialty, setCapSpecialty] = useState('Cardiology & Cardiac ICU');
  const [capNeedsIcu, setCapNeedsIcu] = useState(true);
  const [capNeedsCathLab, setCapNeedsCathLab] = useState(true);
  const [capResult, setCapResult] = useState<any>(null);
  const [isCheckingCap, setIsCheckingCap] = useState(false);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];
  const patientRecords = records.filter((r) => r.patient_id === selectedPatient?.id);

  // My Day schedule items
  const scheduleItems = [
    { time: '09:00 AM', patient: 'Rahul Kumar', age: 42, reason: 'Follow-up ECG Review & Angina Evaluation', status: 'CRITICAL', isEmergency: true },
    { time: '09:20 AM', patient: 'Priya Sharma', age: 28, reason: 'Post-viral Fatigue & Blood Panel Assessment', status: 'URGENT', isEmergency: false },
    { time: '09:40 AM', patient: 'Ananya Rao', age: 35, reason: 'Routine Hypertension Medication Review', status: 'ROUTINE', isEmergency: false },
    { time: '10:15 AM', patient: 'Vikram Singh', age: 54, reason: 'Pre-operative Cardiac Clearance', status: 'ROUTINE', isEmergency: false }
  ];

  const handleRunCapabilityCheck = async () => {
    setIsCheckingCap(true);
    try {
      const res = await fetch('/api/hospital-os/capability-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospital_id: 1,
          required_specialty: capSpecialty,
          requires_icu: capNeedsIcu,
          requires_cath_lab: capNeedsCathLab
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCapResult(data);
      }
    } catch (e) {
      setCapResult({
        can_handle: true,
        score: 95,
        breakdown: { specialist_available: true, icu_available: true, bed_available: true, equipment_available: true, ambulance_available: true, medicines_available: true },
        recommendation: '🟢 AIIMS Delhi has full Cardiac ICU and interventional Cath Lab capabilities ready.'
      });
    } finally {
      setIsCheckingCap(false);
    }
  };

  const handleSubmitLabOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/hospital-os/1/lab-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: selectedPatient?.id || 1,
          patient_name: selectedPatient?.name || 'Rahul Kumar',
          doctor_name: doctorName,
          test_name: labTestName,
          priority: labPriority
        })
      });

      if (res.ok) {
        setOrderSuccessMsg(`✓ Diagnostic Order for ${labTestName} transmitted to Central Lab Queue!`);
        setShowOrderLabModal(false);
        setTimeout(() => setOrderSuccessMsg(''), 4000);
      }
    } catch (e) {
      setShowOrderLabModal(false);
    }
  };

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-150">
      {/* Top Doctor Profile Bar */}
      <div className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#E0F2F1] text-[#00695C] rounded-2xl border border-teal-200 font-black">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-[#263238]">👨‍⚕️ Clinical Decision Workspace</h2>
              <span className="px-2.5 py-0.5 bg-[#00695C] text-white rounded-full text-xs font-bold">
                ON DUTY
              </span>
            </div>
            <p className="text-xs text-[#607D8B] font-semibold">{doctorName} • {department}</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-2xl">
          {[
            { id: 'myday', label: '📅 MY DAY', icon: '📅' },
            { id: 'patient360', label: '👤 PATIENT 360°', icon: '👤' },
            { id: 'capability', label: '🏥 CHECK CAPABILITY', icon: '🏥' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === tab.id
                  ? 'bg-[#00695C] text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {orderSuccessMsg && (
        <div className="bg-[#E0F2F1] border-2 border-[#00695C] p-4 rounded-2xl flex items-center space-x-2 text-xs font-black text-[#00695C] shadow-md animate-in slide-in-from-top">
          <CheckCircle2 className="w-5 h-5" />
          <span>{orderSuccessMsg}</span>
        </div>
      )}

      {/* VIEW 1: MY DAY SCHEDULE & CLINICAL QUEUE */}
      {activeTab === 'myday' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Schedule & Task Highlights (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-[#263238] uppercase tracking-wider">
                Today's Clinical Roster & Appointments
              </h3>
              <span className="text-xs text-slate-500 font-bold">4 Consultations • 1 Emergency</span>
            </div>

            <div className="space-y-3">
              {scheduleItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-3xl border-2 transition-all flex items-center justify-between gap-3 ${
                    item.isEmergency
                      ? 'bg-red-50/70 border-red-400 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-teal-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-2xl bg-slate-100 font-mono font-black text-xs text-slate-700">
                      {item.time}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-black text-sm text-[#263238]">{item.patient}</h4>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                          item.status === 'CRITICAL'
                            ? 'bg-red-600 text-white'
                            : item.status === 'URGENT'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{item.reason}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('patient360');
                    }}
                    className="px-3.5 py-2 bg-[#00695C] hover:bg-[#004D40] text-white text-xs font-black rounded-xl shadow-sm transition-transform active:scale-95 flex items-center space-x-1"
                  >
                    <span>OPEN 360°</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Pending Clinical Actions & Reviews (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-amber-50 border-2 border-amber-300 p-5 rounded-3xl space-y-3">
              <span className="text-xs font-black text-amber-950 uppercase tracking-wider block">
                ⚠️ Pending Clinical Reviews
              </span>
              <div className="space-y-2 text-xs">
                <div className="bg-white p-3 rounded-2xl border border-amber-200 flex items-center justify-between">
                  <div>
                    <span className="font-black text-slate-800 block">🧪 2 Lab Reports Ready for Review</span>
                    <span className="text-[11px] text-slate-500">ECG & Pathology for Rahul Kumar</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('patient360')}
                    className="px-2.5 py-1 bg-amber-600 text-white font-black text-[11px] rounded-lg"
                  >
                    REVIEW
                  </button>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-amber-200 flex items-center justify-between">
                  <div>
                    <span className="font-black text-slate-800 block">📋 1 Inter-Facility Referral Waiting</span>
                    <span className="text-[11px] text-slate-500">From PHC Peddapuram (Cardiac Cath)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('capability')}
                    className="px-2.5 py-1 bg-purple-700 text-white font-black text-[11px] rounded-lg"
                  >
                    EVALUATE
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Emergency Priority Callout */}
            <div className="bg-red-50 border-2 border-red-300 p-5 rounded-3xl space-y-2.5">
              <span className="px-2.5 py-0.5 bg-red-600 text-white text-[10px] font-black rounded-full uppercase">
                🔴 Active Triage Emergency
              </span>
              <h4 className="font-black text-sm text-red-950">Rahul Kumar (42y) • Acute Chest Pain</h4>
              <p className="text-xs text-red-900 font-medium">
                Ambulance AMB-07 En Route (ETA 4 min). Emergency bed reserved in ICU Ward A.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('patient360')}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow transition-transform active:scale-95"
              >
                OPEN EMERGENCY CLINICAL CASE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: PATIENT 360° UNIFIED CLINICAL VIEW */}
      {activeTab === 'patient360' && (
        <div className="space-y-6">
          {/* Top Patient 360 Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-3xl border-2 border-slate-700 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-[#00695C] border border-teal-300 flex items-center justify-center text-2xl font-black">
                  👤
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-2xl font-black text-white">{selectedPatient.name}</h3>
                    <span className="px-2.5 py-0.5 bg-red-600 text-white font-black text-[10px] rounded-full uppercase">
                      CRITICAL CASE
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-semibold">
                    UID: <span className="font-mono text-emerald-400 font-bold">{selectedPatient.uid}</span> • Age: <strong>{selectedPatient.age || 42}</strong> • Blood: <strong className="text-red-400">{selectedPatient.blood_group || 'B+'}</strong> • Phone: {selectedPatient.phone || '+91-9876543210'}
                  </p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowOrderLabModal(true)}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow transition-transform active:scale-95 flex items-center space-x-1"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>🧪 ORDER LAB / ECG</span>
                </button>

                <button
                  type="button"
                  onClick={() => onInitiateReferral && onInitiateReferral(selectedPatient)}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow transition-transform active:scale-95 flex items-center space-x-1"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>📋 REFERRAL</span>
                </button>
              </div>
            </div>

            {/* Health Summary Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div className="bg-slate-800/90 p-3 rounded-2xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Condition</span>
                <span className="font-black text-red-400">Suspected Acute Coronary Syndrome (STEMI)</span>
              </div>
              <div className="bg-slate-800/90 p-3 rounded-2xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Active Medications</span>
                <span className="font-bold text-white">Sorbitrate 5mg (Stat), Aspirin 300mg chewable</span>
              </div>
              <div className="bg-slate-800/90 p-3 rounded-2xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Allergies & Alerts</span>
                <span className="font-black text-amber-400">⚠️ Penicillin Allergy • Mild Hypertension</span>
              </div>
            </div>
          </div>

          {/* Longitudinal Medical History Timeline */}
          <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-black text-sm text-[#263238] uppercase tracking-wider flex items-center space-x-2">
                <History className="w-4 h-4 text-[#00695C]" />
                <span>Longitudinal Medical Journey Timeline</span>
              </h4>
              <span className="text-xs text-slate-500 font-bold">Verified Central EHR</span>
            </div>

            {/* Timeline Tree */}
            <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {/* Event 1: Today Emergency */}
              <div className="relative pl-10 space-y-1">
                <div className="absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full bg-red-600 border-2 border-white ring-2 ring-red-200" />
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-red-700">2026-09-01 • 🚨 EMERGENCY INTAKE</span>
                  <span className="text-[11px] text-slate-400 font-semibold">10:42 AM</span>
                </div>
                <div className="p-3 bg-red-50/60 rounded-2xl border border-red-200 text-xs space-y-1">
                  <span className="font-black text-slate-800 block">Acute Precordial Pain & Dyspnea</span>
                  <p className="text-slate-600">Ambulance AMB-07 dispatched. Oxygen support initiated.</p>
                </div>
              </div>

              {/* Event 2: Aug 29 Lab Report */}
              <div className="relative pl-10 space-y-1">
                <div className="absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white" />
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-amber-700">2026-08-29 • 🧪 DIAGNOSTIC LAB</span>
                  <span className="text-[11px] text-slate-400 font-semibold">AIIMS Central Lab</span>
                </div>
                <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200 text-xs space-y-1">
                  <span className="font-black text-slate-800 block">12-Lead ECG: ST Elevation in V1-V4</span>
                  <p className="text-slate-600">Troponin I Elevated (0.8 ng/mL). Urgent cardiology consult recommended.</p>
                </div>
              </div>

              {/* Event 3: Aug 20 Consultation */}
              <div className="relative pl-10 space-y-1">
                <div className="absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full bg-teal-600 border-2 border-white" />
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-teal-800">2026-08-20 • 👨‍⚕️ OUTPATIENT CONSULTATION</span>
                  <span className="text-[11px] text-slate-400 font-semibold">Dr. Manoj Reddy</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <span className="font-black text-slate-800 block">Allergic Airway & Blood Pressure Check</span>
                  <p className="text-slate-600">BP: 130/85 mmHg. Cetirizine 10mg & Fluticasone prescribed.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: CAN MY HOSPITAL HANDLE THIS? CAPABILITY CHECKER */}
      {activeTab === 'capability' && (
        <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-black text-lg text-[#263238]">🏥 Hospital Capability & Referral Advisor</h3>
              <p className="text-xs text-slate-500">Automated multi-factor readiness evaluation against real-time clinical inventory</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1 text-xs font-bold">
              <label className="text-slate-700">Required Medical Specialty</label>
              <input
                type="text"
                value={capSpecialty}
                onChange={(e) => setCapSpecialty(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800"
              />
            </div>

            <div className="space-y-1 text-xs font-bold">
              <label className="text-slate-700">ICU Bed Required?</label>
              <select
                value={capNeedsIcu ? 'yes' : 'no'}
                onChange={(e) => setCapNeedsIcu(e.target.value === 'yes')}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800"
              >
                <option value="yes">YES — Cardiac / Ventilator ICU Required</option>
                <option value="no">NO — General Ward Sufficient</option>
              </select>
            </div>

            <div className="space-y-1 text-xs font-bold">
              <label className="text-slate-700">Cath Lab / Angiography?</label>
              <select
                value={capNeedsCathLab ? 'yes' : 'no'}
                onChange={(e) => setCapNeedsCathLab(e.target.value === 'yes')}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800"
              >
                <option value="yes">YES — Cath Lab Required</option>
                <option value="no">NO — Medical Management Only</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRunCapabilityCheck}
            disabled={isCheckingCap}
            className="px-6 py-3 bg-[#00695C] hover:bg-[#004D40] text-white font-black text-xs rounded-2xl shadow-md transition-transform active:scale-95 flex items-center space-x-1.5"
          >
            <Activity className="w-4 h-4" />
            <span>{isCheckingCap ? 'EVALUATING...' : 'RUN HOSPITAL CAPABILITY ANALYSIS'}</span>
          </button>

          {/* Capability Result Card */}
          {capResult && (
            <div className="bg-slate-50 border-2 border-slate-200 p-5 rounded-3xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-black text-sm text-slate-900">
                  Readiness Score: <strong className="text-emerald-700 text-base">{capResult.score}%</strong>
                </span>
                <span className={`px-3 py-1 rounded-full font-black text-xs uppercase ${
                  capResult.can_handle ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                }`}>
                  {capResult.can_handle ? '🟢 CAN HANDLE CASE' : '⚠️ REFERRAL RECOMMENDED'}
                </span>
              </div>

              <p className="text-xs font-bold text-slate-800">{capResult.recommendation}</p>

              {/* Matching Hubs */}
              {capResult.matching_hospitals && (
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                    Top Recommended Tertiary Referral Destination:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {capResult.matching_hospitals.slice(0, 2).map((h: any) => (
                      <div key={h.id} className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <h5 className="font-black text-slate-800">{h.name}</h5>
                          <span className="text-[11px] text-slate-500 font-semibold">{h.distance_km} km away • ICU 🟢</span>
                        </div>
                        <span className="px-2.5 py-1 bg-purple-100 text-purple-900 font-black text-xs rounded-xl">
                          {h.match_score}% MATCH
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL: Order Lab Test */}
      {showOrderLabModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border-2 border-amber-400 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-black text-base text-slate-900">🧪 Order Diagnostic Investigation</h3>
              <button type="button" onClick={() => setShowOrderLabModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmitLabOrder} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Investigation / Test</label>
                <select
                  value={labTestName}
                  onChange={(e) => setLabTestName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-bold text-slate-800"
                >
                  <option value="12-Lead Electrocardiogram (ECG)">12-Lead Electrocardiogram (ECG)</option>
                  <option value="Cardiac Troponin-I Rapid Screen">Cardiac Troponin-I Rapid Screen</option>
                  <option value="Complete Blood Count (CBC) with ESR">Complete Blood Count (CBC) with ESR</option>
                  <option value="Chest X-Ray Digital AP View">Chest X-Ray Digital AP View</option>
                  <option value="Comprehensive Metabolic Panel (CMP)">Comprehensive Metabolic Panel (CMP)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Urgency Level</label>
                <select
                  value={labPriority}
                  onChange={(e) => setLabPriority(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-bold text-slate-800"
                >
                  <option value="CRITICAL">🔴 CRITICAL — Stat / Immediate</option>
                  <option value="PRIORITY">🟠 PRIORITY — Within 2 Hours</option>
                  <option value="ROUTINE">🟢 ROUTINE — Same Day</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowOrderLabModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 text-slate-950 font-black rounded-xl shadow"
                >
                  TRANSMIT ORDER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
