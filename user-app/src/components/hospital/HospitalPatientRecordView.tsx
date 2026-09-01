import React, { useState } from 'react';
import {
  ArrowLeft,
  QrCode,
  Search,
  User,
  FileText,
  Plus,
  Save,
  CheckCircle2,
  Calendar,
  Clock,
  Pill,
  Activity,
  AlertCircle,
  Download,
  Trash2,
  Sparkles
} from 'lucide-react';
import { Patient, MedicalRecord, PrescriptionItem } from '../../types';

interface HospitalPatientRecordViewProps {
  onBack: () => void;
  facilityName: string;
}

export const HospitalPatientRecordView: React.FC<HospitalPatientRecordViewProps> = ({
  onBack,
  facilityName
}) => {
  const [searchUid, setSearchUid] = useState('UID-IND-9842-7104');
  const [patient, setPatient] = useState<Patient | null>({
    id: 1,
    uid: 'UID-IND-9842-7104',
    name: 'Manoj',
    age: 28,
    gender: 'Male',
    blood_group: 'O+',
    phone: '+91-9876543210',
    emergency_contact: 'Suresh Kumar (+91-9876500000)',
    language: 'en',
    qr_token: 'QR-PAT-9842-7104-PERMANENT',
    created_at: '2026-08-18T10:00:00.000Z'
  });

  const [records, setRecords] = useState<MedicalRecord[]>([
    {
      id: 101,
      patient_id: 1,
      hospital_name: 'AIIMS Delhi — DEMO',
      record_type: 'Consultation',
      title: '🩺 Cardiology Consultation Report',
      diagnosis: 'Acute Allergic Rhinitis & Mild Sinusitis',
      notes: 'Patient presented with mild sinus headache. Vitals: BP 120/80 mmHg, HR 72 bpm, SpO2 98%.',
      prescription_data: [
        { medicine: 'Aspirin 75mg', dosage: '1 tablet daily', duration: '30 days' },
        { medicine: 'Cetirizine 10mg', dosage: '1 tablet PRN', duration: '14 days' }
      ],
      created_at: '2026-08-28T10:30:00.000Z',
      created_by: 'Dr. Manoj Reddy'
    },
    {
      id: 102,
      patient_id: 1,
      hospital_name: 'Max Super Specialty Hospital — DEMO',
      record_type: 'Radiology Report',
      title: '🧠 MRI Brain 3T Radiology Report',
      diagnosis: 'Unremarkable Brain Parenchyma',
      notes: '3T MRI Brain scan without contrast. Findings: Normal ventricles and cerebral sulci.',
      prescription_data: [],
      created_at: '2026-08-25T14:15:00.000Z',
      created_by: 'Dr. Sameeruddin'
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Consultation Form State
  const [newTitle, setNewTitle] = useState('Hospital Super-Speciality Consultation');
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newRecordType, setNewRecordType] = useState('Consultation');
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    { medicine: 'Tab Paracetamol 500mg', dosage: '1 tablet TID', duration: '3 days' }
  ]);
  const [isSubmittingRecord, setIsSubmittingRecord] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const handleSearchPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUid.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/patients/${encodeURIComponent(searchUid.trim())}`);
      if (res.ok) {
        const pData = await res.json();
        setPatient(pData);

        const recRes = await fetch(`/api/patients/${pData.uid}/records`);
        if (recRes.ok) {
          const recData = await recRes.json();
          setRecords(recData.records || []);
        }
      } else {
        alert('Patient not found with that UID or QR token');
      }
    } catch (error) {
      console.error('Error searching patient:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPrescriptionRow = () => {
    setPrescriptions([...prescriptions, { medicine: '', dosage: '1 tablet daily', duration: '5 days' }]);
  };

  const handleRemovePrescriptionRow = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handleSubmitNewRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    setIsSubmittingRecord(true);
    setSaveSuccessMsg('');

    try {
      const validPrescriptions = prescriptions.filter((p) => p.medicine.trim().length > 0);

      const payload = {
        patient_uid: patient.uid,
        patient_id: patient.id,
        hospital_name: facilityName,
        title: newTitle.trim(),
        record_type: newRecordType,
        diagnosis: newDiagnosis.trim(),
        notes: newNotes.trim(),
        prescription_data: validPrescriptions
      };

      const res = await fetch('/api/phc/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setSaveSuccessMsg('Medical record successfully saved to National Central Health Stack!');

        // Prepend to local records list
        const newRecordItem: MedicalRecord = {
          id: data.id || Date.now(),
          patient_id: patient.id,
          hospital_name: facilityName,
          record_type: newRecordType,
          title: newTitle.trim(),
          diagnosis: newDiagnosis.trim(),
          notes: newNotes.trim(),
          prescription_data: validPrescriptions,
          created_at: new Date().toISOString(),
          created_by: 'Attending Hospital Doctor',
          version: 1
        };

        setRecords([newRecordItem, ...records]);
        setShowAddForm(false);
        setNewDiagnosis('');
        setNewNotes('');
      }
    } catch (error) {
      console.error('Error adding record:', error);
    } finally {
      setIsSubmittingRecord(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#00695C] to-[#004D40] text-white p-6 rounded-3xl shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black shadow-inner border border-white/30">
            👤
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-200 bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-400/30">
                👤 PATIENT CENTRAL MEDICAL RECORD
              </span>
              <span className="text-xs text-emerald-100">• {facilityName}</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">EHR Record Access & QR Identity</h2>
            <p className="text-xs text-emerald-100 font-medium">
              National Health Stack • UID → Permanent QR Code → Authorized Longitudinal EHR
            </p>
          </div>
        </div>

        {patient && (
          <a
            href={`/api/patients/${patient.uid}/pdf`}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-3 bg-white text-[#00695C] hover:bg-[#E0F2F1] font-black text-xs rounded-2xl shadow-md transition-all active:scale-95 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT 6-PAGE CLINICAL PDF</span>
          </a>
        )}
      </div>

      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Patient Search Bar */}
      <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-3">
        <h3 className="text-sm font-black text-[#263238] uppercase tracking-wider">
          🔍 Lookup Patient by Health ID (UID) or Scan Permanent QR
        </h3>
        <form onSubmit={handleSearchPatient} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#607D8B] absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchUid}
              onChange={(e) => setSearchUid(e.target.value)}
              placeholder="e.g. UID-IND-9842-7104 or QR-PAT-9842-7104-PERMANENT"
              className="w-full bg-slate-50 border border-slate-300 focus:border-[#00695C] rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-[#263238] placeholder-slate-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-[#00695C] hover:bg-[#004D40] text-white font-black text-xs rounded-xl shadow transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'FETCHING...' : 'AUTHORIZE & FETCH EHR'}
          </button>
        </form>
      </div>

      {/* Patient Card & Health Records */}
      {patient && (
        <div className="space-y-6">
          {/* Patient Profile Card */}
          <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-[#E0F2F1] text-[#00695C] flex items-center justify-center text-2xl font-black shadow-inner border border-[#00695C]/20">
                👤
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#00695C] bg-[#E0F2F1] px-2 py-0.5 rounded border border-[#00695C]/20">
                    VERIFIED PATIENT IDENTITY
                  </span>
                  <span className="text-xs text-slate-500 font-bold">• Blood Group: {patient.blood_group}</span>
                </div>
                <h3 className="text-xl font-black text-[#263238]">{patient.name}</h3>
                <p className="text-xs text-[#607D8B]">
                  UID: <strong>{patient.uid}</strong> • Age: {patient.age} yrs • Gender: {patient.gender} • Emergency Contact: {patient.emergency_contact}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2.5 bg-[#00695C] hover:bg-[#004D40] text-white font-extrabold text-xs rounded-xl shadow transition-all active:scale-95 flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddForm ? 'CANCEL' : 'ADD NEW RECORD'}</span>
            </button>
          </div>

          {/* Add Record Form */}
          {showAddForm && (
            <div className="bg-white border-2 border-[#00695C]/30 p-6 rounded-3xl shadow-sm space-y-4">
              <h4 className="text-sm font-black text-[#263238] uppercase tracking-wider flex items-center space-x-2">
                <Plus className="w-4 h-4 text-[#00695C]" />
                <span>Record New Hospital Consultation or Diagnostic Report</span>
              </h4>

              <form onSubmit={handleSubmitNewRecord} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#263238]">Record Title</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 text-xs font-bold text-[#263238] focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#263238]">Diagnosis / Findings</label>
                    <input
                      type="text"
                      value={newDiagnosis}
                      onChange={(e) => setNewDiagnosis(e.target.value)}
                      placeholder="e.g. Acute Bronchitis / Normal Sinus Rhythm"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 text-xs font-bold text-[#263238] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#263238]">Clinical Notes</label>
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    rows={3}
                    placeholder="Enter detailed clinical observations..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-medium text-[#263238] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingRecord}
                  className="px-6 py-3 bg-[#00695C] hover:bg-[#004D40] text-white font-black text-xs rounded-xl shadow transition-all active:scale-95 disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmittingRecord ? 'SAVING...' : 'SAVE & SYNC TO EHR'}</span>
                </button>
              </form>
            </div>
          )}

          {/* Records Timeline */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-[#263238] uppercase tracking-wider">
              📜 Longitudinal Medical History ({records.length} Records)
            </h3>

            <div className="space-y-3">
              {records.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-sm space-y-3 hover:border-[#00695C] transition-all"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-200 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-black uppercase text-[#00695C] bg-[#E0F2F1] px-2.5 py-0.5 rounded-lg border border-[#00695C]/20">
                          {rec.record_type}
                        </span>
                        <h4 className="text-sm font-black text-[#263238]">{rec.title}</h4>
                      </div>
                      <span className="text-xs text-[#607D8B] block mt-0.5">
                        Facility: <strong>{rec.hospital_name}</strong> • By: {rec.created_by || 'Doctor'}
                      </span>
                    </div>

                    <span className="text-xs text-slate-500 font-bold flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(rec.created_at).toLocaleDateString()}</span>
                    </span>
                  </div>

                  {rec.diagnosis && (
                    <div className="text-xs">
                      <span className="font-bold text-[#263238]">Diagnosis: </span>
                      <span className="text-slate-700">{rec.diagnosis}</span>
                    </div>
                  )}

                  {rec.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      {rec.notes}
                    </p>
                  )}

                  {rec.prescription_data && rec.prescription_data.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-xs font-bold text-[#263238] flex items-center space-x-1">
                        <Pill className="w-3.5 h-3.5 text-[#00695C]" />
                        <span>Prescribed Medicines:</span>
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {rec.prescription_data.map((p, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900"
                          >
                            <span className="font-bold block">{p.medicine}</span>
                            <span className="text-[11px] text-emerald-700">{p.dosage} • {p.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
