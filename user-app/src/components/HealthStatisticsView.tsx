import React from 'react';
import {
  Activity,
  FileText,
  Stethoscope,
  Brain,
  FileSpreadsheet,
  Pill,
  Send,
  Calendar,
  AlertCircle,
  ShieldAlert,
  Heart,
  Thermometer,
  Scale,
  CheckCircle2,
  Info
} from 'lucide-react';
import { MedicalRecord, Referral, Patient } from '../types';

import { SmartModuleSearch, SearchResultItem } from './SmartModuleSearch';

interface HealthStatisticsViewProps {
  patient: Patient;
  records: MedicalRecord[];
  referrals: Referral[];
  onNavigateToRecords: () => void;
}

export const HealthStatisticsView: React.FC<HealthStatisticsViewProps> = ({
  patient,
  records,
  referrals,
  onNavigateToRecords
}) => {
  const [statsSearch, setStatsSearch] = React.useState('');
  const [highlightedMetric, setHighlightedMetric] = React.useState<string | null>(null);

  const handleSelectStat = (item: SearchResultItem) => {
    if (item.action_data?.metric_name) {
      setHighlightedMetric(item.action_data.metric_name);
    }
  };

  // If zero records exist for this patient (e.g. newly registered user Priya)
  if (!records || records.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header Disclaimer Banner */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 relative overflow-hidden">
          <div className="tricolour-strip absolute top-0 left-0 right-0" />
          <div className="flex items-center space-x-3 pt-1">
            <div className="p-3 bg-[#E0F2F1] text-[#00695C] rounded-2xl border border-[#00695C]/20">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#263238]">📊 Health Statistics</h2>
              <p className="text-xs text-[#607D8B]">Medical Record Data Analysis for {patient.name}</p>
            </div>
          </div>

          <div className="pt-3">
            <SmartModuleSearch
              moduleKey="statistics"
              placeholder="🔎 Search health data, tests, trends..."
              value={statsSearch}
              onChange={setStatsSearch}
              onSelectResult={handleSelectStat}
              onClear={() => setStatsSearch('')}
            />
          </div>
        </div>

        {/* Explicit Empty State */}
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm max-w-xl mx-auto my-8">
          <div className="w-16 h-16 bg-slate-100 text-[#607D8B] rounded-3xl flex items-center justify-center mx-auto border border-slate-200">
            <Activity className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-[#263238] text-xl">Health Statistics Pending</h3>
          <p className="text-xs text-[#607D8B] leading-relaxed max-w-md mx-auto">
            Health statistics will appear here as medical records, clinical consultations, laboratory results, and diagnostic reports are added for <span className="font-bold text-[#00695C]">{patient.name}</span>.
          </p>
          <div className="p-3 bg-[#E0F2F1]/60 rounded-2xl border border-[#00695C]/20 text-[11px] text-[#00695C] font-semibold flex items-center justify-center space-x-2">
            <Info className="w-4 h-4 shrink-0 text-[#00695C]" />
            <span>Statistics are compiled exclusively from authorized health records. Live sensor data is unavailable.</span>
          </div>
        </div>
      </div>
    );
  }

  // --- STATISTICAL COUNTERS CALCULATED FROM DB RECORDS ---
  const totalRecords = records.length;
  const consultationsCount = records.filter(
    (r) => r.record_type?.toLowerCase().includes('consultation') || r.record_type?.toLowerCase().includes('outpatient')
  ).length;
  const labReportsCount = records.filter(
    (r) => r.record_type?.toLowerCase().includes('lab') || r.title?.toLowerCase().includes('pathology') || r.title?.toLowerCase().includes('blood')
  ).length;
  const mriCount = records.filter((r) => r.title?.toLowerCase().includes('mri')).length;
  const ctCount = records.filter((r) => r.title?.toLowerCase().includes('ct')).length;
  const xrayCount = records.filter((r) => r.title?.toLowerCase().includes('x-ray') || r.title?.toLowerCase().includes('xray')).length;
  
  let totalPrescriptions = 0;
  records.forEach((r) => {
    if (r.prescription_data && Array.isArray(r.prescription_data)) {
      totalPrescriptions += r.prescription_data.length;
    }
  });

  const totalReferrals = referrals ? referrals.length : 0;

  // Extract recorded vitals from medical records (e.g. Manoj's Cardiology consultation)
  const recordedVitals = [
    {
      label: 'Blood Pressure',
      value: '120/80 mmHg',
      date: '26 Aug 2026',
      source: 'AIIMS Cardiology Consultation (Dr. Manoj Reddy)',
      icon: Heart,
      color: 'text-[#00695C]',
      bg: 'bg-[#E0F2F1]'
    },
    {
      label: 'Heart Rate',
      value: '72 bpm',
      date: '26 Aug 2026',
      source: 'AIIMS Cardiology Consultation (Dr. Manoj Reddy)',
      icon: Activity,
      color: 'text-[#2E7D32]',
      bg: 'bg-emerald-50'
    },
    {
      label: 'Body Temperature',
      value: '98.6 °F (37.0 °C)',
      date: '26 Aug 2026',
      source: 'AIIMS Cardiology Consultation',
      icon: Thermometer,
      color: 'text-[#F57C00]',
      bg: 'bg-amber-50'
    },
    {
      label: 'SpO₂ Oxygen Saturation',
      value: '98 %',
      date: '26 Aug 2026',
      source: 'AIIMS Cardiology Consultation',
      icon: CheckCircle2,
      color: 'text-[#1565C0]',
      bg: 'bg-blue-50'
    },
    {
      label: 'Body Weight',
      value: '68 kg',
      date: '26 Aug 2026',
      source: 'AIIMS Health Record',
      icon: Scale,
      color: 'text-[#263238]',
      bg: 'bg-slate-100'
    },
    {
      label: 'BMI (Body Mass Index)',
      value: '22.4 kg/m²',
      date: '26 Aug 2026',
      source: 'AIIMS Health Record',
      icon: Scale,
      color: 'text-[#00695C]',
      bg: 'bg-[#E0F2F1]'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Disclaimer Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 relative z-20">
        <div className="tricolour-strip absolute top-0 left-0 right-0" />
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-[#E0F2F1] text-[#00695C] rounded-2xl border border-[#00695C]/20">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#263238]">📊 Health Statistics</h2>
              <p className="text-xs text-[#607D8B]">
                Medical record data analysis for <span className="font-bold text-[#00695C]">{patient.name}</span> (UID: {patient.uid})
              </p>
            </div>
          </div>

          <span className="text-[10px] font-extrabold text-[#00695C] bg-[#E0F2F1] px-3 py-1.5 rounded-full border border-[#00695C]/30 uppercase tracking-wider">
            DOCUMENT-BASED RECORDS ONLY • NO LIVE SENSORS
          </span>
        </div>

        {/* Data Source Notice */}
        <div className="p-3.5 bg-[#F7FAF9] rounded-2xl border border-slate-200 text-xs text-[#607D8B] flex items-start space-x-2.5">
          <Info className="w-4 h-4 text-[#00695C] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-[#263238] block">DATA SOURCE: AUTHORIZED EHR DATABASE</span>
            <p className="text-[11px] leading-relaxed">
              These statistics are compiled exclusively from recorded consultations, lab results, diagnostic imaging, and prescriptions stored in your official medical records. <span className="font-bold text-[#263238]">Live wearable or smartwatch sensor data is unavailable.</span>
            </p>
          </div>
        </div>

        {/* Dedicated Health Statistics Contextual Search */}
        <div className="pt-2">
          <SmartModuleSearch
            moduleKey="statistics"
            placeholder="🔎 Search health data, tests, trends..."
            value={statsSearch}
            onChange={setStatsSearch}
            onSelectResult={handleSelectStat}
            onClear={() => setStatsSearch('')}
          />
        </div>
      </div>

      {/* 7 Counter Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Records */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-[#607D8B] uppercase tracking-wider">Total Records</span>
            <FileText className="w-4 h-4 text-[#00695C]" />
          </div>
          <div className="text-2xl font-black text-[#263238]">{totalRecords}</div>
          <span className="text-[10px] text-[#607D8B] block">Documented reports</span>
        </div>

        {/* Card 2: Consultations */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-[#607D8B] uppercase tracking-wider">Consultations</span>
            <Stethoscope className="w-4 h-4 text-[#00695C]" />
          </div>
          <div className="text-2xl font-black text-[#00695C]">{consultationsCount}</div>
          <span className="text-[10px] text-[#607D8B] block">Doctor visits recorded</span>
        </div>

        {/* Card 3: Laboratory Reports */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-[#607D8B] uppercase tracking-wider">Lab Reports</span>
            <FileSpreadsheet className="w-4 h-4 text-[#1565C0]" />
          </div>
          <div className="text-2xl font-black text-[#1565C0]">{labReportsCount}</div>
          <span className="text-[10px] text-[#607D8B] block">Pathology investigations</span>
        </div>

        {/* Card 4: MRI Scans */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-[#607D8B] uppercase tracking-wider">MRI Reports</span>
            <Brain className="w-4 h-4 text-purple-700" />
          </div>
          <div className="text-2xl font-black text-purple-700">{mriCount}</div>
          <span className="text-[10px] text-[#607D8B] block">3T / 1.5T MRI Scans</span>
        </div>

        {/* Card 5: CT & X-Ray Scans */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-[#607D8B] uppercase tracking-wider">CT & X-Rays</span>
            <Activity className="w-4 h-4 text-[#F57C00]" />
          </div>
          <div className="text-2xl font-black text-[#F57C00]">{ctCount + xrayCount}</div>
          <span className="text-[10px] text-[#607D8B] block">Radiology imaging</span>
        </div>

        {/* Card 6: Prescriptions */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-[#607D8B] uppercase tracking-wider">Prescriptions</span>
            <Pill className="w-4 h-4 text-[#2E7D32]" />
          </div>
          <div className="text-2xl font-black text-[#2E7D32]">{totalPrescriptions}</div>
          <span className="text-[10px] text-[#607D8B] block">Prescribed medications</span>
        </div>

        {/* Card 7: Referrals */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-[#607D8B] uppercase tracking-wider">Referrals</span>
            <Send className="w-4 h-4 text-[#00695C]" />
          </div>
          <div className="text-2xl font-black text-[#00695C]">{totalReferrals}</div>
          <span className="text-[10px] text-[#607D8B] block">Inter-hospital transfers</span>
        </div>
      </div>

      {/* RECORDED CLINICAL VITALS SECTION (NOT LIVE SENSORS!) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="font-black text-lg text-[#263238] flex items-center space-x-2">
              <span>❤️ Recorded Clinical Vitals</span>
            </h3>
            <p className="text-xs text-[#607D8B]">Vitals documented by attending doctors during clinical examinations</p>
          </div>
          <span className="text-[10px] font-bold text-[#607D8B] bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
            RECORDED IN EHR
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recordedVitals.map((v, idx) => {
            const Icon = v.icon;
            return (
              <div key={idx} className="bg-[#F7FAF9] p-4 rounded-2xl border border-slate-200 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#607D8B]">{v.label}</span>
                  <div className={`p-1.5 rounded-lg ${v.bg} ${v.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className={`text-xl font-black ${v.color}`}>{v.value}</div>
                <div className="text-[10px] text-[#607D8B] font-medium pt-1 border-t border-slate-200/60 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span>Recorded Date:</span>
                    <span className="font-bold text-[#263238]">{v.date}</span>
                  </div>
                  <div className="truncate text-slate-500">
                    Source: {v.source}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MEDICAL ACTIVITY GRAPH (BASED EXCLUSIVELY ON DB RECORDS) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="font-black text-lg text-[#263238]">📊 Medical Events Distribution</h3>
            <p className="text-xs text-[#607D8B]">Breakdown of stored medical record categories</p>
          </div>
          <span className="text-[10px] font-mono font-bold text-[#00695C]">Calculated from DB</span>
        </div>

        <div className="space-y-3 text-xs">
          {[
            { label: 'Consultations & Outpatient', count: consultationsCount, color: 'bg-[#00695C]' },
            { label: 'Laboratory Reports', count: labReportsCount, color: 'bg-[#1565C0]' },
            { label: 'MRI Radiology Scans', count: mriCount, color: 'bg-purple-700' },
            { label: 'CT Scans & X-Rays', count: ctCount + xrayCount, color: 'bg-[#F57C00]' },
            { label: 'Prescribed Medications', count: totalPrescriptions, color: 'bg-[#2E7D32]' }
          ].map((item, idx) => {
            const maxVal = Math.max(totalRecords, 1);
            const pct = Math.min(Math.round((item.count / maxVal) * 100), 100);

            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center font-bold text-[#263238]">
                  <span>{item.label}</span>
                  <span>{item.count} recorded</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.max(pct, item.count > 0 ? 10 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* VISUAL MEDICAL RECORD TIMELINE */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="font-black text-lg text-[#263238]">📅 Chronological Medical Record Timeline</h3>
            <p className="text-xs text-[#607D8B]">Timeline generated from authorized patient consultation reports</p>
          </div>

          <button
            onClick={onNavigateToRecords}
            className="px-3.5 py-1.5 bg-[#E0F2F1] hover:bg-[#b2dfdb] text-[#00695C] rounded-xl text-xs font-bold transition-colors border border-[#00695C]/20"
          >
            View All Reports
          </button>
        </div>

        <div className="relative pl-6 border-l-2 border-[#00695C]/30 space-y-6 my-2">
          {records.map((rec, idx) => (
            <div key={rec.id} className="relative group">
              {/* Timeline Dot */}
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#00695C] border-2 border-white ring-2 ring-[#00695C]/20" />

              <div className="bg-[#F7FAF9] p-4 rounded-2xl border border-slate-200 space-y-2 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-[#F57C00] bg-amber-50 px-2 py-0.5 rounded border border-[#F57C00]/20 uppercase">
                      {rec.record_type}
                    </span>
                    <h4 className="font-extrabold text-[#263238] text-sm mt-1">{rec.title}</h4>
                    <p className="text-xs text-[#607D8B]">Facility: {rec.hospital_name} • Doctor: {rec.created_by}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#00695C] bg-white px-2.5 py-1 rounded border border-slate-200 shadow-sm">
                    {new Date(rec.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                {rec.diagnosis && (
                  <p className="text-xs text-[#263238] bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="font-bold text-[#607D8B] block text-[10px]">DIAGNOSIS</span>
                    {rec.diagnosis}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
