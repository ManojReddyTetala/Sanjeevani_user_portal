import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  QrCode,
  Clock,
  Eye,
  CheckCircle2,
  AlertCircle,
  Calendar,
  History,
  FileText,
  UserCheck
} from 'lucide-react';
import { AccessAuditLog, PatientConsentGrant } from '../../types';

interface PatientConsentAndAuditViewProps {
  patientName?: string;
  patientUid?: string;
  onRefreshData?: () => void;
}

export const PatientConsentAndAuditView: React.FC<PatientConsentAndAuditViewProps> = ({
  patientName = 'Rahul Kumar',
  patientUid = 'UID-IND-9842-7104',
  onRefreshData
}) => {
  const [scopes, setScopes] = useState({
    reports: true,
    prescriptions: true,
    history: true,
    imaging: false
  });

  const [targetDoctor, setTargetDoctor] = useState('Dr. Anil Kumar (Chief Cardiologist)');
  const [durationMins, setDurationMins] = useState(30);
  const [consentGranted, setConsentGranted] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AccessAuditLog[]>([
    { id: 1, patient_id: 1, health_id: patientUid, accessor_name: 'Dr. Anil Kumar', accessor_role: 'Cardiologist', facility_name: 'AIIMS Delhi', action: 'VIEW_RECORD', resource_accessed: '12-Lead ECG Report & Vitals Flowsheet', timestamp: '10:48 AM Today' },
    { id: 2, patient_id: 1, health_id: patientUid, accessor_name: 'Sister Lakshmi Devi', accessor_role: 'ICU Nurse', facility_name: 'AIIMS Delhi', action: 'ADMINISTER_MEDICATION', resource_accessed: 'Sorbitrate 5mg & Aspirin 300mg', timestamp: '10:35 AM Today' },
    { id: 3, patient_id: 1, health_id: patientUid, accessor_name: 'Pathology Lab Desk', accessor_role: 'Lab Tech', facility_name: 'AIIMS Central Lab', action: 'UPLOAD_REPORT', resource_accessed: 'Cardiac Troponin-I Diagnostic Report', timestamp: '09:50 AM Today' },
    { id: 4, patient_id: 1, health_id: patientUid, accessor_name: 'Dr. Surya', accessor_role: 'Medical Officer', facility_name: 'PHC Peddapuram', action: 'VIEW_RECORD', resource_accessed: 'Longitudinal EHR & Medical History', timestamp: 'Yesterday' }
  ]);

  const handleGrantConsent = (e: React.FormEvent) => {
    e.preventDefault();
    setConsentGranted(true);
    const newLog: AccessAuditLog = {
      id: Date.now(),
      patient_id: 1,
      health_id: patientUid,
      accessor_name: 'Patient Self-Service',
      accessor_role: 'PATIENT',
      facility_name: 'Patient Mobile App',
      action: 'GRANT_CONSENT',
      resource_accessed: `Granted ${durationMins}-minute access to ${targetDoctor}`,
      timestamp: 'Just Now'
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-200 font-black">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-[#263238]">👤 Patient 360° EHR & Granular Consent Manager</h2>
              <span className="px-2.5 py-0.5 bg-indigo-600 text-white rounded-full text-xs font-bold">
                ABDM / FHIR COMPLIANT
              </span>
            </div>
            <p className="text-xs text-[#607D8B] font-semibold">{patientName} • UID: <span className="font-mono text-[#00695C] font-bold">{patientUid}</span></p>
          </div>
        </div>
      </div>

      {consentGranted && (
        <div className="bg-emerald-50 border-2 border-emerald-500 p-4 rounded-2xl flex items-center space-x-2 text-xs font-black text-emerald-900 shadow-md animate-in slide-in-from-top">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>✓ Time-bound access granted to {targetDoctor} for {durationMins} minutes! Access token linked to your Health QR.</span>
        </div>
      )}

      {/* Grid: Granular Consent Generator (Left) + Security Access Audit Trail (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: "Share My Record" Consent Generator (6 cols) */}
        <div className="lg:col-span-6 bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-black text-sm text-[#263238] uppercase tracking-wider flex items-center space-x-2">
              <Lock className="w-4 h-4 text-indigo-600" />
              <span>📋 "Share My Record" Granular Consent</span>
            </h3>
            <span className="text-xs text-slate-500 font-bold">Zero Unrestricted Access</span>
          </div>

          <form onSubmit={handleGrantConsent} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-black text-slate-700">Authorizing Doctor / Clinical Desk</label>
              <select
                value={targetDoctor}
                onChange={(e) => setTargetDoctor(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-bold text-slate-800"
              >
                <option value="Dr. Anil Kumar (Chief Cardiologist)">Dr. Anil Kumar (Chief Cardiologist) — AIIMS Delhi</option>
                <option value="Dr. Sunita Rani (Medical Officer)">Dr. Sunita Rani (Medical Officer) — PHC Peddapuram</option>
                <option value="Sister Lakshmi Devi (ICU Nurse)">Sister Lakshmi Devi (ICU Nurse) — Emergency Ward</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-black text-slate-700 block">Select Authorized Data Scopes</label>
              <div className="grid grid-cols-2 gap-2 font-bold text-slate-800">
                <label className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scopes.reports}
                    onChange={(e) => setScopes({ ...scopes, reports: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span>☑ Lab & ECG Reports</span>
                </label>

                <label className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scopes.prescriptions}
                    onChange={(e) => setScopes({ ...scopes, prescriptions: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span>☑ Prescriptions</span>
                </label>

                <label className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scopes.history}
                    onChange={(e) => setScopes({ ...scopes, history: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span>☑ Medical History</span>
                </label>

                <label className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scopes.imaging}
                    onChange={(e) => setScopes({ ...scopes, imaging: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span>☐ CT / MRI Scans</span>
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-black text-slate-700">Consent Access Duration</label>
              <select
                value={durationMins}
                onChange={(e) => setDurationMins(parseInt(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-bold text-slate-800"
              >
                <option value={30}>⏳ 30 Minutes (Standard Consultation)</option>
                <option value={60}>⏳ 1 Hour (Emergency Triage)</option>
                <option value={1440}>⏳ 24 Hours (Hospital Inpatient Stay)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-700 hover:bg-indigo-800 text-white font-black text-xs rounded-2xl shadow-md transition-transform active:scale-95 flex items-center justify-center space-x-1.5"
            >
              <QrCode className="w-4 h-4" />
              <span>🔐 AUTHORIZE & GENERATE ONE-TIME ACCESS QR</span>
            </button>
          </form>
        </div>

        {/* Right Column: Security Access Audit History (6 cols) */}
        <div className="lg:col-span-6 bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-black text-sm text-[#263238] uppercase tracking-wider flex items-center space-x-2">
              <Eye className="w-4 h-4 text-slate-700" />
              <span>🔐 Record Access Audit Trail</span>
            </h3>
            <span className="text-xs text-slate-500 font-bold">Immutable Event Log</span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-800">{log.accessor_name}</span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">{log.timestamp}</span>
                </div>
                <div className="flex items-center space-x-2 text-[11px] text-indigo-700 font-bold">
                  <span>{log.facility_name}</span>
                  <span>•</span>
                  <span>{log.action}</span>
                </div>
                <p className="text-slate-600 font-medium bg-white p-2 rounded-xl border border-slate-200">
                  {log.resource_accessed}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
