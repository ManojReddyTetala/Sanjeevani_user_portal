import React, { useState } from 'react';
import {
  Building2,
  Stethoscope,
  Users,
  Bed,
  Truck,
  Activity,
  HeartPulse,
  Pill,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Save,
  RefreshCw,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Zap,
  Radio
} from 'lucide-react';
import { HospitalResource, PhcStaffMember, PhcMedicine, DiagnosticService } from '../../types';

interface HospitalAdminDashboardProps {
  facilityId: number;
  facilityName: string;
  facilityCity: string;
  facilityType: string;
  resources: HospitalResource;
  staff: PhcStaffMember[];
  medicines: PhcMedicine[];
  diagnostics: DiagnosticService[];
  emergencyCount: number;
  onUpdateResources: (updated: Partial<HospitalResource>) => Promise<void>;
  onNavigate: (tab: any) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const HospitalAdminDashboard: React.FC<HospitalAdminDashboardProps> = ({
  facilityId,
  facilityName,
  facilityCity,
  facilityType,
  resources,
  staff,
  medicines,
  diagnostics,
  emergencyCount,
  onUpdateResources,
  onNavigate,
  onRefresh,
  isLoading
}) => {
  // Local state for fast live adjustments
  const [totalBeds, setTotalBeds] = useState(resources.general_beds || 100);
  const [occupiedBeds, setOccupiedBeds] = useState(resources.occupied_beds || 88);
  const [icuBeds, setIcuBeds] = useState(resources.icu_beds || 12);
  const [oxygenCylinders, setOxygenCylinders] = useState(resources.oxygen_cylinders || 60);
  const [ambulances, setAmbulances] = useState(resources.ambulances || 5);
  const [doctorsOnDuty, setDoctorsOnDuty] = useState(resources.doctors_on_duty || 18);
  const [nursesOnDuty, setNursesOnDuty] = useState(resources.nurses_on_duty || 32);
  const [queueCount, setQueueCount] = useState(resources.opd_queue_count || 24);
  const [icuStatus, setIcuStatus] = useState(resources.icu_facility_status || 'AVAILABLE');
  const [isSaving, setIsSaving] = useState(false);
  const [saveBanner, setSaveBanner] = useState(false);

  const availableBeds = Math.max(0, totalBeds - occupiedBeds);

  // Specialist Roster State
  const [specialists, setSpecialists] = useState([
    { name: 'Cardiologist', status: 'AVAILABLE', count: 3, onCall: 'Dr. Manoj Reddy' },
    { name: 'Neurologist', status: 'LIMITED', count: 1, onCall: 'Dr. Ramesh Verma' },
    { name: 'Orthopedic Surgeon', status: 'AVAILABLE', count: 2, onCall: 'Dr. Sameeruddin' },
    { name: 'Oncologist', status: 'UNAVAILABLE', count: 0, onCall: 'None on Duty' },
    { name: 'General Surgeon', status: 'AVAILABLE', count: 4, onCall: 'Dr. Vikram Malhotra' },
    { name: 'Pediatrician', status: 'AVAILABLE', count: 3, onCall: 'Dr. Sunita Rani' },
    { name: 'Gynecologist', status: 'AVAILABLE', count: 2, onCall: 'Dr. Ananya Rao' },
    { name: 'ENT Specialist', status: 'LIMITED', count: 1, onCall: 'Dr. Priya Sharma' }
  ]);

  const handleToggleSpecialistStatus = (idx: number) => {
    const next = [...specialists];
    const curr = next[idx].status;
    const newStatus = curr === 'AVAILABLE' ? 'LIMITED' : curr === 'LIMITED' ? 'UNAVAILABLE' : 'AVAILABLE';
    next[idx].status = newStatus;
    next[idx].count = newStatus === 'AVAILABLE' ? 2 : newStatus === 'LIMITED' ? 1 : 0;
    setSpecialists(next);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await onUpdateResources({
        general_beds: totalBeds,
        occupied_beds: occupiedBeds,
        general_ward_beds: totalBeds,
        icu_beds: icuBeds,
        oxygen_cylinders: oxygenCylinders,
        ambulances,
        doctors_on_duty: doctorsOnDuty,
        nurses_on_duty: nursesOnDuty,
        opd_queue_count: queueCount,
        icu_facility_status: icuStatus as any
      });
      setSaveBanner(true);
      setTimeout(() => setSaveBanner(false), 4000);
    } catch (e) {
      console.error('Save error:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* High Priority Emergency Notification Banner */}
      <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-5 rounded-3xl shadow-lg flex flex-wrap items-center justify-between gap-4 border-2 border-red-500">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-black shadow-inner">
            🚨
          </div>
          <div>
            <h3 className="font-black text-lg sm:text-xl tracking-tight">
              🔴 {emergencyCount} ACTIVE EMERGENCY CASES IN PROGRESS
            </h3>
            <p className="text-xs text-rose-100 font-medium">
              Real-time telemetry, GPS ambulance dispatch & triage across trauma and cardiac wings.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('emergency')}
          className="px-5 py-3 bg-white text-red-700 hover:bg-rose-50 font-black text-xs rounded-2xl shadow-md transition-all active:scale-95 flex items-center space-x-2"
        >
          <span>OPEN EMERGENCY CONTROL ROOM</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {saveBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Hospital operational capability matrix updated & broadcast across Regional Health Stack!</span>
        </div>
      )}

      {/* Facility Header Control Center Card */}
      <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#00695C] bg-[#E0F2F1] px-2.5 py-0.5 rounded-lg border border-[#00695C]/20">
              🛠️ HOSPITAL OPERATIONAL CONTROL CENTER
            </span>
            <span className="text-xs text-slate-500 font-bold">• {facilityCity}</span>
          </div>
          <h2 className="text-2xl font-black text-[#263238] tracking-tight">{facilityName}</h2>
          <p className="text-xs text-[#607D8B] font-medium">
            Centralized administration of hospital beds, ICUs, specialists, nurses, medicines, oxygen and diagnostics.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-5 py-3 bg-[#00695C] hover:bg-[#004D40] text-white font-black text-xs rounded-xl shadow transition-all active:scale-95 flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'SAVING CAPABILITY...' : 'SAVE & BROADCAST CHANGES'}</span>
          </button>

          <button
            type="button"
            onClick={onRefresh}
            className="p-3 bg-slate-100 hover:bg-[#E0F2F1] text-[#263238] rounded-xl border border-slate-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 9-GRID HOSPITAL CONTROL CENTER CAPACITY STATUS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
        {/* Doctors on Duty */}
        <div className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-2xl bg-[#E0F2F1] text-[#00695C] flex items-center justify-center text-xl font-black">
              👨‍⚕️
            </span>
            <span className="text-xs font-black text-[#00695C] bg-[#E0F2F1] px-2.5 py-0.5 rounded-lg border border-[#00695C]/20">
              🟢 {doctorsOnDuty} AVAILABLE
            </span>
          </div>
          <div>
            <h4 className="text-xs font-black text-[#263238]">DOCTORS ON DUTY</h4>
            <div className="flex items-center space-x-2 mt-2">
              <button
                type="button"
                onClick={() => setDoctorsOnDuty(Math.max(1, doctorsOnDuty - 1))}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center font-black text-xs"
              >
                -
              </button>
              <span className="text-sm font-black text-[#263238]">{doctorsOnDuty}</span>
              <button
                type="button"
                onClick={() => setDoctorsOnDuty(doctorsOnDuty + 1)}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center font-black text-xs"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Nurses on Duty */}
        <div className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-2xl bg-[#E0F2F1] text-[#00695C] flex items-center justify-center text-xl font-black">
              👩‍⚕️
            </span>
            <span className="text-xs font-black text-[#00695C] bg-[#E0F2F1] px-2.5 py-0.5 rounded-lg border border-[#00695C]/20">
              🟢 {nursesOnDuty} AVAILABLE
            </span>
          </div>
          <div>
            <h4 className="text-xs font-black text-[#263238]">NURSES ON DUTY</h4>
            <div className="flex items-center space-x-2 mt-2">
              <button
                type="button"
                onClick={() => setNursesOnDuty(Math.max(1, nursesOnDuty - 1))}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center font-black text-xs"
              >
                -
              </button>
              <span className="text-sm font-black text-[#263238]">{nursesOnDuty}</span>
              <button
                type="button"
                onClick={() => setNursesOnDuty(nursesOnDuty + 1)}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center font-black text-xs"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* General Beds */}
        <div className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-2xl bg-amber-50 text-[#F57C00] flex items-center justify-center text-xl font-black">
              🛏️
            </span>
            <span
              className={`text-xs font-black px-2.5 py-0.5 rounded-lg border ${
                availableBeds > 15
                  ? 'bg-[#E0F2F1] text-[#00695C] border-[#00695C]/20'
                  : availableBeds > 0
                  ? 'bg-amber-50 text-[#F57C00] border-[#F57C00]/20'
                  : 'bg-red-50 text-red-600 border-red-200'
              }`}
            >
              {availableBeds > 15 ? '🟢' : availableBeds > 0 ? '🟠' : '🔴'} {availableBeds} AVAILABLE
            </span>
          </div>
          <div>
            <h4 className="text-xs font-black text-[#263238]">BEDS (TOTAL: {totalBeds})</h4>
            <div className="flex items-center justify-between text-xs mt-2 text-slate-600 font-bold">
              <span>Occupied: {occupiedBeds}</span>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setOccupiedBeds(Math.max(0, occupiedBeds - 1))}
                  className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => setOccupiedBeds(Math.min(totalBeds, occupiedBeds + 1))}
                  className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ICU Beds */}
        <div className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl font-black">
              🏥
            </span>
            <span
              className={`text-xs font-black px-2.5 py-0.5 rounded-lg border ${
                icuBeds > 5
                  ? 'bg-[#E0F2F1] text-[#00695C] border-[#00695C]/20'
                  : icuBeds > 0
                  ? 'bg-amber-50 text-[#F57C00] border-[#F57C00]/20'
                  : 'bg-red-50 text-red-600 border-red-200'
              }`}
            >
              {icuBeds > 5 ? '🟢' : icuBeds > 0 ? '🟠' : '🔴'} {icuBeds} AVAILABLE
            </span>
          </div>
          <div>
            <h4 className="text-xs font-black text-[#263238]">ICU CAPACITY</h4>
            <div className="flex items-center space-x-2 mt-2">
              <button
                type="button"
                onClick={() => setIcuBeds(Math.max(0, icuBeds - 1))}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center font-black text-xs"
              >
                -
              </button>
              <span className="text-sm font-black text-[#263238]">{icuBeds} Beds</span>
              <button
                type="button"
                onClick={() => setIcuBeds(icuBeds + 1)}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center font-black text-xs"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Medicines Stock */}
        <div className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-black">
              💊
            </span>
            <span className="text-xs font-black text-[#00695C] bg-[#E0F2F1] px-2.5 py-0.5 rounded-lg border border-[#00695C]/20">
              🟢 STOCKED
            </span>
          </div>
          <div>
            <h4 className="text-xs font-black text-[#263238]">MEDICINES & PHARMACY</h4>
            <span className="text-[11px] text-[#607D8B] block mt-1">
              Essential drugs & life-saving antibiotics available
            </span>
          </div>
        </div>

        {/* Diagnostic Equipment */}
        <div className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl font-black">
              🧪
            </span>
            <span className="text-xs font-black text-[#00695C] bg-[#E0F2F1] px-2.5 py-0.5 rounded-lg border border-[#00695C]/20">
              🟢 OPERATIONAL
            </span>
          </div>
          <div>
            <h4 className="text-xs font-black text-[#263238]">DIAGNOSTICS & LAB</h4>
            <span className="text-[11px] text-[#607D8B] block mt-1">
              X-Ray, ECG, CT & Pathology active
            </span>
          </div>
        </div>

        {/* Ambulances */}
        <div className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-2xl bg-[#E0F2F1] text-[#00695C] flex items-center justify-center text-xl font-black">
              🚑
            </span>
            <span className="text-xs font-black text-[#00695C] bg-[#E0F2F1] px-2.5 py-0.5 rounded-lg border border-[#00695C]/20">
              🟢 {ambulances} READY
            </span>
          </div>
          <div>
            <h4 className="text-xs font-black text-[#263238]">AMBULANCE FLEET</h4>
            <div className="flex items-center space-x-2 mt-2">
              <button
                type="button"
                onClick={() => setAmbulances(Math.max(0, ambulances - 1))}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center font-black text-xs"
              >
                -
              </button>
              <span className="text-sm font-black text-[#263238]">{ambulances} Units</span>
              <button
                type="button"
                onClick={() => setAmbulances(ambulances + 1)}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center font-black text-xs"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* OPD Queue */}
        <div className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-2xl bg-amber-50 text-[#F57C00] flex items-center justify-center text-xl font-black">
              👥
            </span>
            <span className="text-xs font-black text-[#F57C00] bg-amber-50 px-2.5 py-0.5 rounded-lg border border-[#F57C00]/20">
              🟠 MODERATE ({queueCount})
            </span>
          </div>
          <div>
            <h4 className="text-xs font-black text-[#263238]">OPD QUEUE STATUS</h4>
            <div className="flex items-center space-x-2 mt-2">
              <button
                type="button"
                onClick={() => setQueueCount(Math.max(0, queueCount - 5))}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center font-black text-xs"
              >
                -5
              </button>
              <span className="text-sm font-black text-[#263238]">{queueCount} Patients</span>
              <button
                type="button"
                onClick={() => setQueueCount(queueCount + 5)}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center font-black text-xs"
              >
                +5
              </button>
            </div>
          </div>
        </div>

        {/* Emergencies */}
        <div className="bg-white border-2 border-red-200 p-5 rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-xl font-black">
              🚨
            </span>
            <span className="text-xs font-black text-red-600 bg-red-50 px-2.5 py-0.5 rounded-lg border border-red-200">
              🔴 {emergencyCount} ACTIVE
            </span>
          </div>
          <div>
            <h4 className="text-xs font-black text-[#263238]">EMERGENCY TRIAGE</h4>
            <span className="text-[11px] text-red-600 font-bold block mt-1">
              Immediate attention in Trauma Wing
            </span>
          </div>
        </div>
      </div>

      {/* SPECIALIST ROSTER & AVAILABILITY STATUS (Cardiologist, Neurologist, etc.) */}
      <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-[#263238]">🩺 Specialist Availability Matrix</h3>
            <p className="text-xs text-[#607D8B]">
              Real-time specialist status feeds the citizen discovery and inter-facility referral engines.
            </p>
          </div>
          <span className="text-[10px] text-slate-500 font-bold">Tap status badge to cycle G/O/R</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {specialists.map((spec, idx) => (
            <div
              key={spec.name}
              className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-[#263238]">{spec.name}</h4>
                  <button
                    type="button"
                    onClick={() => handleToggleSpecialistStatus(idx)}
                    className={`px-2 py-0.5 rounded text-[10px] font-black border transition-all cursor-pointer ${
                      spec.status === 'AVAILABLE'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : spec.status === 'LIMITED'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}
                  >
                    {spec.status === 'AVAILABLE' ? '🟢 Available' : spec.status === 'LIMITED' ? '🟠 Limited' : '🔴 Unavailable'}
                  </button>
                </div>
                <span className="text-[11px] text-[#607D8B] block">On-Duty Doctor: {spec.onCall}</span>
              </div>

              <div className="text-[10px] text-slate-500 font-medium pt-1 border-t border-slate-200 flex items-center justify-between">
                <span>Active Roster: {spec.count}</span>
                <span className="text-[#00695C] font-bold">1-Tap Toggle ↻</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
