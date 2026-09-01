import React from 'react';
import {
  Stethoscope,
  Users,
  Bed,
  Truck,
  Pill,
  Activity,
  HeartPulse,
  Clock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { HospitalResource, PhcStaffMember, PhcMedicine, DiagnosticService } from '../../types';

interface PhcDashboardViewProps {
  facilityName: string;
  facilityCity: string;
  facilityType: string;
  resources: HospitalResource;
  staff: PhcStaffMember[];
  medicines: PhcMedicine[];
  diagnostics: DiagnosticService[];
  emergencyCount?: number;
  onNavigate: (view: 'emergency' | 'beds' | 'staff' | 'medicines' | 'diagnostics' | 'queue' | 'patient' | 'referrals') => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const PhcDashboardView: React.FC<PhcDashboardViewProps> = ({
  facilityName,
  facilityCity,
  facilityType,
  resources,
  staff,
  medicines,
  diagnostics,
  emergencyCount = 2,
  onNavigate,
  onRefresh,
  isLoading
}) => {
  // Counts & Calculations
  const docsOnDuty = staff.filter((s) => s.is_on_duty === 1 && (s.role_title.includes('Doctor') || s.role_title.includes('Physician'))).length;
  const docsTotal = staff.filter((s) => s.role_title.includes('Doctor') || s.role_title.includes('Physician')).length;
  const nursesOnDuty = staff.filter((s) => s.is_on_duty === 1 && s.role_title.includes('Nurse')).length;
  const nursesTotal = staff.filter((s) => s.role_title.includes('Nurse')).length;

  const totalBeds = resources.general_beds || 12;
  const occupiedBeds = resources.occupied_beds || 0;
  const availableBeds = Math.max(0, totalBeds - occupiedBeds);

  const availableMeds = medicines.filter((m) => m.status === 'AVAILABLE').length;
  const totalMeds = medicines.length || 10;

  const availableDiags = diagnostics.filter((d) => d.status === 'AVAILABLE').length;
  const totalDiags = diagnostics.length || 8;

  const queueCount = resources.opd_queue_count ?? 8;
  const queueStatus = resources.opd_queue_status || (queueCount <= 10 ? 'SHORT' : queueCount <= 30 ? 'MODERATE' : 'LONG');

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* High Priority Emergency Attention Banner */}
      <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-5 rounded-3xl shadow-lg flex flex-wrap items-center justify-between gap-4 border-2 border-red-500">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black shadow-inner">
            🚨
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-black text-lg sm:text-xl tracking-tight">
                🔴 {emergencyCount} EMERGENCIES NEED IMMEDIATE ATTENTION
              </h3>
            </div>
            <p className="text-xs text-rose-100 font-medium">
              Incoming patient requests with live GPS, reported symptoms & automated capability matching.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('emergency')}
          className="px-6 py-3 bg-white text-red-700 hover:bg-rose-50 font-black text-xs rounded-2xl shadow-md transition-all active:scale-95 flex items-center space-x-2"
        >
          <span>OPEN EMERGENCY CONTROL ROOM</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Top Welcome & Facility Overview */}
      <div className="bg-white border-2 border-slate-200 p-5 sm:p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#00695C] bg-[#E0F2F1] px-2.5 py-0.5 rounded-lg border border-[#00695C]/20">
                🏥 {facilityType || 'Primary Health Centre'}
              </span>
              <span className="text-xs text-slate-500 font-bold">• {facilityCity}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#263238] tracking-tight">{facilityName}</h2>
            <p className="text-xs text-[#607D8B] font-medium">
              Live operational availability status synchronized with patient discovery and regional health grid.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="px-3.5 py-2 bg-slate-100 hover:bg-[#E0F2F1] text-[#263238] hover:text-[#00695C] border border-slate-300 rounded-xl text-xs font-black transition-colors flex items-center space-x-1.5 active:scale-95 disabled:opacity-50"
              aria-label="Refresh live PHC resource status"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'SYNCING...' : 'REFRESH'}</span>
            </button>
          </div>
        </div>

        {/* High-Level Operational Summary Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
              🛏️
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Available Beds</span>
              <span className="text-base font-black text-[#263238]">{availableBeds} / {totalBeds}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black">
              👨‍⚕️
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Staff on Duty</span>
              <span className="text-base font-black text-[#263238]">{docsOnDuty + nursesOnDuty} Active</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-black">
              👥
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Current OPD Queue</span>
              <span className="text-base font-black text-[#263238]">{queueCount} Waiting</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
              🚑
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Ambulances</span>
              <span className="text-base font-black text-[#263238]">{resources.ambulances ?? 1} Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* 8-Category Operational Control Grid (Large Tactile Touch Targets) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-[#263238] flex items-center space-x-2">
            <span>⚡ PHC Service & Resource Management</span>
          </h3>
          <span className="text-xs font-bold text-[#607D8B]">Tap card to view & update</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. DOCTORS */}
          <button
            type="button"
            onClick={() => onNavigate('staff')}
            className="bg-white border-2 border-slate-200 hover:border-[#00695C] p-5 rounded-3xl text-left shadow-sm hover:shadow-md transition-all active:scale-[0.98] group flex flex-col justify-between space-y-4"
            aria-label="Manage Doctors and Physicians. Current status: Doctors on duty"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#E0F2F1] text-[#00695C] flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                👨‍⚕️
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-black border flex items-center space-x-1 ${
                docsOnDuty > 0 ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-red-50 text-red-800 border-red-300'
              }`}>
                {docsOnDuty > 0 ? <span>🟢 ✓ ON DUTY</span> : <span>🔴 ✕ UNAVAILABLE</span>}
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase">Physicians</span>
              <h4 className="text-lg font-black text-[#263238] group-hover:text-[#00695C]">DOCTORS</h4>
              <p className="text-xs text-slate-600 mt-1 font-semibold">
                <strong>{docsOnDuty}</strong> of {docsTotal || 3} doctors on duty today
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-extrabold text-[#00695C]">
              <span>UPDATE DOCTORS</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* 2. NURSES */}
          <button
            type="button"
            onClick={() => onNavigate('staff')}
            className="bg-white border-2 border-slate-200 hover:border-[#00695C] p-5 rounded-3xl text-left shadow-sm hover:shadow-md transition-all active:scale-[0.98] group flex flex-col justify-between space-y-4"
            aria-label="Manage Nurses and Healthcare Staff"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#00695C] flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                👩‍⚕️
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-black border flex items-center space-x-1 ${
                nursesOnDuty > 0 ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-red-50 text-red-800 border-red-300'
              }`}>
                {nursesOnDuty > 0 ? <span>🟢 ✓ AVAILABLE</span> : <span>🔴 ✕ UNAVAILABLE</span>}
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase">Nursing Staff</span>
              <h4 className="text-lg font-black text-[#263238] group-hover:text-[#00695C]">NURSES</h4>
              <p className="text-xs text-slate-600 mt-1 font-semibold">
                <strong>{nursesOnDuty}</strong> active nurses on shift
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-extrabold text-[#00695C]">
              <span>UPDATE NURSES</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* 3. BEDS */}
          <button
            type="button"
            onClick={() => onNavigate('beds')}
            className="bg-white border-2 border-slate-200 hover:border-[#00695C] p-5 rounded-3xl text-left shadow-sm hover:shadow-md transition-all active:scale-[0.98] group flex flex-col justify-between space-y-4"
            aria-label="Manage Bed Availability. Total and Occupied beds."
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                🛏️
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-black border flex items-center space-x-1 ${
                availableBeds > 3
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : availableBeds > 0
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-red-50 text-red-800 border-red-300'
              }`}>
                {availableBeds > 3 ? <span>🟢 ✓ AVAILABLE</span> : availableBeds > 0 ? <span>🟠 ! LIMITED</span> : <span>🔴 ✕ FULL</span>}
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase">Inpatient Capacity</span>
              <h4 className="text-lg font-black text-[#263238] group-hover:text-[#00695C]">BEDS</h4>
              <p className="text-xs text-slate-600 mt-1 font-semibold">
                <strong>{availableBeds}</strong> free / <strong>{occupiedBeds}</strong> occupied ({totalBeds} total)
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-extrabold text-[#00695C]">
              <span>UPDATE BEDS</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* 4. AMBULANCE */}
          <button
            type="button"
            onClick={() => onNavigate('beds')}
            className="bg-white border-2 border-slate-200 hover:border-[#00695C] p-5 rounded-3xl text-left shadow-sm hover:shadow-md transition-all active:scale-[0.98] group flex flex-col justify-between space-y-4"
            aria-label="Manage Emergency Ambulance Dispatch status"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                🚑
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-black border flex items-center space-x-1 ${
                (resources.ambulances ?? 1) > 0 ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-red-50 text-red-800 border-red-300'
              }`}>
                {(resources.ambulances ?? 1) > 0 ? <span>🟢 ✓ READY</span> : <span>🔴 ✕ OCCUPIED</span>}
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase">Emergency Transport</span>
              <h4 className="text-lg font-black text-[#263238] group-hover:text-[#00695C]">AMBULANCE</h4>
              <p className="text-xs text-slate-600 mt-1 font-semibold">
                <strong>{resources.ambulances ?? 1}</strong> emergency ambulance on station
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-extrabold text-[#00695C]">
              <span>UPDATE VEHICLE</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* 5. MEDICINES */}
          <button
            type="button"
            onClick={() => onNavigate('medicines')}
            className="bg-white border-2 border-slate-200 hover:border-[#00695C] p-5 rounded-3xl text-left shadow-sm hover:shadow-md transition-all active:scale-[0.98] group flex flex-col justify-between space-y-4"
            aria-label="Manage Essential Medicine Inventory Stock"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                💊
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-black border flex items-center space-x-1 ${
                availableMeds >= 5 ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}>
                {availableMeds >= 5 ? <span>🟢 ✓ IN STOCK</span> : <span>🟠 ! LOW STOCK</span>}
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase">Pharmacy Stock</span>
              <h4 className="text-lg font-black text-[#263238] group-hover:text-[#00695C]">MEDICINES</h4>
              <p className="text-xs text-slate-600 mt-1 font-semibold">
                <strong>{availableMeds}</strong> of {totalMeds} essential medicines available
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-extrabold text-[#00695C]">
              <span>UPDATE MEDICINES</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* 6. DIAGNOSTIC SERVICES */}
          <button
            type="button"
            onClick={() => onNavigate('diagnostics')}
            className="bg-white border-2 border-slate-200 hover:border-[#00695C] p-5 rounded-3xl text-left shadow-sm hover:shadow-md transition-all active:scale-[0.98] group flex flex-col justify-between space-y-4"
            aria-label="Manage Diagnostic Services and Equipment availability"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                🧪
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-black border flex items-center space-x-1 ${
                availableDiags >= 3 ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}>
                {availableDiags >= 3 ? <span>🟢 ✓ TESTS ACTIVE</span> : <span>🟠 ! LIMITED</span>}
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase">Laboratory & Scans</span>
              <h4 className="text-lg font-black text-[#263238] group-hover:text-[#00695C]">TESTS</h4>
              <p className="text-xs text-slate-600 mt-1 font-semibold">
                Blood Test, X-Ray, ECG, Urine Analysis
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-extrabold text-[#00695C]">
              <span>UPDATE TESTS</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* 7. ICU / CRITICAL CARE */}
          <button
            type="button"
            onClick={() => onNavigate('beds')}
            className="bg-white border-2 border-slate-200 hover:border-[#00695C] p-5 rounded-3xl text-left shadow-sm hover:shadow-md transition-all active:scale-[0.98] group flex flex-col justify-between space-y-4"
            aria-label="Critical Care & ICU capacity status"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                🏥
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-black border flex items-center space-x-1 ${
                (resources.icu_beds ?? 0) > 0 ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}>
                {(resources.icu_beds ?? 0) > 0 ? <span>🟢 ✓ ACTIVE ({resources.icu_beds})</span> : <span>⚪ N/A (REFER)</span>}
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase">Emergency Facility</span>
              <h4 className="text-lg font-black text-[#263238] group-hover:text-[#00695C]">ICU / CRITICAL</h4>
              <p className="text-xs text-slate-600 mt-1 font-semibold">
                Oxygen: <strong>{resources.oxygen_cylinders ?? 5}</strong> cylinders on stand-by
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-extrabold text-[#00695C]">
              <span>MANAGE CRITICAL</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* 8. CURRENT OPD QUEUE */}
          <button
            type="button"
            onClick={() => onNavigate('queue')}
            className="bg-white border-2 border-slate-200 hover:border-[#00695C] p-5 rounded-3xl text-left shadow-sm hover:shadow-md transition-all active:scale-[0.98] group flex flex-col justify-between space-y-4"
            aria-label="Manage OPD Patient Queue. Current waiting count and queue status."
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                👥
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-black border flex items-center space-x-1 ${
                queueStatus === 'SHORT'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : queueStatus === 'MODERATE'
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-red-50 text-red-800 border-red-300'
              }`}>
                {queueStatus === 'SHORT' ? (
                  <span>🟢 ✓ SHORT QUEUE</span>
                ) : queueStatus === 'MODERATE' ? (
                  <span>🟠 ! MODERATE QUEUE</span>
                ) : (
                  <span>🔴 ✕ LONG QUEUE</span>
                )}
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase">Today's OPD Queue</span>
              <h4 className="text-lg font-black text-[#263238] group-hover:text-[#00695C]">PATIENT QUEUE</h4>
              <p className="text-xs text-slate-600 mt-1 font-semibold">
                <strong>{queueCount}</strong> patients waiting in general OPD
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-extrabold text-[#00695C]">
              <span>UPDATE QUEUE</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* Quick Action Clinical Banner (Scan Patient QR & Digital Referrals) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Patient QR Scanner */}
        <div className="bg-gradient-to-br from-[#00695C] to-[#004D40] text-white p-6 rounded-3xl shadow-md flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full inline-block">
              One Patient → One Central Record
            </span>
            <h4 className="text-xl font-black">Scan Patient Permanent QR</h4>
            <p className="text-xs text-emerald-100 leading-relaxed">
              Scan patient's permanent health identity QR token to access longitudinal EHR, past prescriptions, diagnostics, and add new consultations.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('patient')}
            className="w-full py-3.5 bg-white text-[#00695C] hover:bg-emerald-50 font-black text-xs rounded-xl shadow-sm transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
          >
            <span>📱 SCAN QR OR ENTER PATIENT UID</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Doctor-to-Doctor Digital Referral */}
        <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full inline-block">
              Doctor-to-Doctor Transfer
            </span>
            <h4 className="text-xl font-black text-[#263238]">Inter-Facility Digital Referral</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Quickly refer patients requiring unavailable specialist care, advanced surgery, or tertiary diagnostic facilities directly to secondary/tertiary hospital doctors.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('referrals')}
            className="w-full py-3.5 bg-[#00695C] hover:bg-[#004D40] text-white font-black text-xs rounded-xl shadow-sm transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
          >
            <span>📋 SEND DIGITAL REFERRAL</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
