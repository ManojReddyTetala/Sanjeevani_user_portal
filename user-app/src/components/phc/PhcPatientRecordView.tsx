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
  Trash2
} from 'lucide-react';
import { Patient, MedicalRecord, PrescriptionItem } from '../../types';

interface PhcPatientRecordViewProps {
  onBack: () => void;
  facilityName: string;
}

export const PhcPatientRecordView: React.FC<PhcPatientRecordViewProps> = ({
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
  const [newTitle, setNewTitle] = useState('PHC General Consultation');
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newRecordType, setNewRecordType] = useState('Consultation');
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    { medicine: 'Paracetamol 500mg', dosage: '1 tablet TID', duration: '3 days' }
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
        alert('Patient not found with that UID / QR token. Using demo patient record.');
      }
    } catch (err) {
      console.error('Error fetching patient:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPrescriptionRow = () => {
    setPrescriptions([...prescriptions, { medicine: '', dosage: '1 tablet daily', duration: '5 days' }]);
  };

  const handleRemovePrescriptionRow = (idx: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== idx));
  };

  const handlePrescriptionChange = (idx: number, field: keyof PrescriptionItem, val: string) => {
    const updated = [...prescriptions];
    updated[idx][field] = val;
    setPrescriptions(updated);
  };

  const handleSaveNewRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    setIsSubmittingRecord(true);
    setSaveSuccessMsg('');
    try {
      const res = await fetch('/api/phc/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patient.id,
          patient_uid: patient.uid,
          hospital_name: facilityName,
          title: newTitle || 'PHC Outpatient Consultation',
          record_type: newRecordType,
          diagnosis: newDiagnosis,
          notes: newNotes,
          prescription_data: prescriptions.filter((p) => p.medicine.trim() !== '')
        })
      });

      if (res.ok) {
        const data = await res.json();
        const newRec: MedicalRecord = {
          id: data.id || Date.now(),
          patient_id: patient.id,
          hospital_name: facilityName,
          record_type: newRecordType,
          title: newTitle,
          diagnosis: newDiagnosis,
          notes: newNotes,
          prescription_data: prescriptions.filter((p) => p.medicine.trim() !== ''),
          created_at: new Date().toISOString(),
          created_by: 'PHC Medical Officer'
        };

        setRecords([newRec, ...records]);
        setShowAddForm(false);
        setSaveSuccessMsg('✓ New consultation record added to patient central medical history!');
        setNewDiagnosis('');
        setNewNotes('');
        setTimeout(() => setSaveSuccessMsg(''), 4000);
      }
    } catch (e) {
      alert('Failed to save record.');
    } finally {
      setIsSubmittingRecord(false);
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
            <h2 className="text-xl font-black text-[#263238]">👤 Patient EHR & QR Identity Access</h2>
            <p className="text-xs text-[#607D8B] font-semibold">{facilityName}</p>
          </div>
        </div>

        {patient && (
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2.5 bg-[#00695C] hover:bg-[#004D40] text-white font-black text-xs rounded-xl shadow-sm flex items-center space-x-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'CANCEL FORM' : 'ADD NEW CONSULTATION / RX'}</span>
          </button>
        )}
      </div>

      {saveSuccessMsg && (
        <div className="bg-[#E0F2F1] border-2 border-[#00695C] p-4 rounded-2xl flex items-center space-x-3 text-xs font-black text-[#00695C]">
          <CheckCircle2 className="w-5 h-5" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* QR & UID Search Bar */}
      <div className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-sm space-y-4">
        <div className="space-y-1">
          <h3 className="font-black text-base text-[#263238] flex items-center space-x-2">
            <span>📱 Scan Permanent Health QR / Search Patient UID</span>
          </h3>
          <p className="text-xs text-slate-500">
            One Patient → One Central Medical Record. Enter UID or scan barcode token.
          </p>
        </div>

        <form onSubmit={handleSearchPatient} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <QrCode className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchUid}
              onChange={(e) => setSearchUid(e.target.value)}
              placeholder="e.g. UID-IND-9842-7104 or QR token"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-xs font-black text-[#263238] focus:outline-none focus:border-[#00695C]"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-[#00695C] hover:bg-[#004D40] text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span>{isLoading ? 'LOOKING UP...' : 'FETCH MEDICAL RECORD'}</span>
          </button>
        </form>
      </div>

      {/* Patient Information Profile Badge */}
      {patient && (
        <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-14 h-14 rounded-2xl bg-[#E0F2F1] text-[#00695C] flex items-center justify-center text-3xl font-black">
                👤
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-black text-xl text-[#263238]">{patient.name}</h3>
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-black rounded-md">
                    UID: {patient.uid}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Age: <strong>{patient.age}</strong> • Gender: <strong>{patient.gender}</strong> • Blood Group: <strong className="text-red-700">{patient.blood_group}</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.open(`/api/patients/${patient.uid}/pdf`, '_blank')}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black border border-slate-300 flex items-center space-x-1.5"
            >
              <Download className="w-4 h-4 text-[#00695C]" />
              <span>DOWNLOAD EHR PDF</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-bold text-slate-600">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase block">Phone</span>
              <span>{patient.phone || '+91-9876543210'}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase block">Emergency Contact</span>
              <span>{patient.emergency_contact || 'N/A'}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase block">Permanent QR Token</span>
              <span className="text-[11px] text-emerald-800 font-mono font-bold">QR-PAT-PERMANENT-AUTH</span>
            </div>
          </div>
        </div>
      )}

      {/* Add New Consultation / Prescription Form */}
      {showAddForm && patient && (
        <div className="bg-[#F0FDF4] border-2 border-emerald-500 p-6 rounded-3xl shadow-lg space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xl">✍️</span>
              <h4 className="font-black text-lg text-emerald-950">Add New PHC Consultation & Prescription</h4>
            </div>
            <span className="text-xs font-bold text-emerald-800">Directly adds to Central EHR</span>
          </div>

          <form onSubmit={handleSaveNewRecord} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-emerald-950">Consultation Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Acute Fever & Seasonal Allergy Review"
                  className="w-full bg-white border border-emerald-300 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-emerald-950">Record Category</label>
                <select
                  value={newRecordType}
                  onChange={(e) => setNewRecordType(e.target.value)}
                  className="w-full bg-white border border-emerald-300 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="Consultation">Outpatient Consultation</option>
                  <option value="Prescription">Pharmacy Prescription</option>
                  <option value="Diagnostic Report">Lab / Diagnostic Report</option>
                  <option value="Follow-up">Primary Care Follow-up</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-950">Clinical Diagnosis</label>
              <input
                type="text"
                value={newDiagnosis}
                onChange={(e) => setNewDiagnosis(e.target.value)}
                placeholder="e.g. Upper Respiratory Tract Infection (URTI) with mild wheezing"
                className="w-full bg-white border border-emerald-300 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-950">Clinical Notes & Recorded Vitals</label>
              <textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                rows={2}
                placeholder="BP 120/80 mmHg, Pulse 74 bpm, Temp 99.1°F. Advised warm fluids and hydration."
                className="w-full bg-white border border-emerald-300 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none"
              />
            </div>

            {/* Prescriptions Items */}
            <div className="space-y-2 pt-2 border-t border-emerald-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-emerald-950 flex items-center space-x-1">
                  <Pill className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Prescribed Medicines</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddPrescriptionRow}
                  className="text-xs font-black text-emerald-800 hover:underline flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Medicine</span>
                </button>
              </div>

              <div className="space-y-2">
                {prescriptions.map((p, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={p.medicine}
                      onChange={(e) => handlePrescriptionChange(idx, 'medicine', e.target.value)}
                      placeholder="Medicine Name (e.g. Tab Paracetamol 500mg)"
                      className="flex-1 bg-white border border-emerald-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={p.dosage}
                      onChange={(e) => handlePrescriptionChange(idx, 'dosage', e.target.value)}
                      placeholder="Dosage (e.g. 1-0-1)"
                      className="w-28 bg-white border border-emerald-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={p.duration}
                      onChange={(e) => handlePrescriptionChange(idx, 'duration', e.target.value)}
                      placeholder="Duration"
                      className="w-24 bg-white border border-emerald-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none"
                    />
                    {prescriptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePrescriptionRow(idx)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Remove medicine"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingRecord}
                className="px-6 py-2.5 bg-[#00695C] hover:bg-[#004D40] text-white font-black text-xs rounded-xl shadow-md active:scale-95 disabled:opacity-50"
              >
                {isSubmittingRecord ? 'SAVING RECORD...' : '✓ SAVE TO PATIENT CENTRAL EHR'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Patient Medical History Records Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-base text-[#263238]">
            📜 Longitudinal Medical Records Timeline ({records.length} Records)
          </h3>
          <span className="text-xs font-bold text-slate-500">Central Unified EHR</span>
        </div>

        <div className="space-y-3">
          {records.map((rec) => (
            <div
              key={rec.id}
              className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-sm space-y-3 hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">📄</span>
                  <div>
                    <h4 className="font-black text-base text-[#263238]">{rec.title}</h4>
                    <span className="text-xs text-[#00695C] font-bold">{rec.hospital_name}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(rec.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              {rec.diagnosis && (
                <div className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Clinical Diagnosis</span>
                  <span className="font-black text-[#263238]">{rec.diagnosis}</span>
                </div>
              )}

              {rec.notes && (
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {rec.notes}
                </p>
              )}

              {rec.prescription_data && rec.prescription_data.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    💊 Prescriptions Given:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {rec.prescription_data.map((med, mIdx) => (
                      <span
                        key={mIdx}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold"
                      >
                        {med.medicine} ({med.dosage} • {med.duration})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
