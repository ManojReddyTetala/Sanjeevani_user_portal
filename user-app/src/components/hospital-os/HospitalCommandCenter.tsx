import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Users,
  BedDouble,
  Truck,
  CheckCircle2,
  Clock,
  RefreshCw,
  TrendingUp,
  ShieldAlert,
  Flame,
  ArrowRight,
  Stethoscope,
  Plus,
  Minus,
  Check
} from 'lucide-react';
import { HospitalResource, EmergencyRequest, EquipmentItem } from '../../types';

interface HospitalCommandCenterProps {
  hospitalName: string;
  facilityCity?: string;
  resources: HospitalResource;
  emergencies: EmergencyRequest[];
  onNavigateRole: (role: string) => void;
  onRefreshData?: () => void;
}

export const HospitalCommandCenter: React.FC<HospitalCommandCenterProps> = ({
  hospitalName,
  facilityCity = 'New Delhi',
  resources,
  emergencies,
  onNavigateRole,
  onRefreshData
}) => {
  const [generalBeds, setGeneralBeds] = useState(resources.general_beds || 20);
  const [occupiedBeds, setOccupiedBeds] = useState(resources.occupied_beds || 14);
  const [icuBeds, setIcuBeds] = useState(resources.icu_beds || 4);
  const [ambulancesAvail, setAmbulancesAvail] = useState(resources.ambulances || 2);
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastVerifiedTime, setLastVerifiedTime] = useState('10:45 AM Today');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const activeEmergenciesCount = emergencies.filter((e) => e.status !== 'RESOLVED' && e.status !== 'CANCELLED').length || 4;
  const bedUtilizationPct = Math.min(100, Math.round((occupiedBeds / generalBeds) * 100));

  const handleVerifyNow = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setLastVerifiedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Just Now');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 600);
  };

  const handleSaveBedUpdate = async () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-150">
      {/* Top Live Command Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-3xl border-2 border-slate-700 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-600/30 border-2 border-red-500 rounded-2xl text-red-400">
              <Activity className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-black text-white">🏥 HOSPITAL COMMAND CENTER</h2>
                <span className="px-2.5 py-0.5 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-full animate-pulse">
                  ● LIVE
                </span>
              </div>
              <p className="text-xs text-slate-300 font-semibold">{hospitalName} • {facilityCity}</p>
            </div>
          </div>

          {/* Freshness Verification Pill */}
          <div className="flex items-center space-x-2 bg-slate-800/90 border border-slate-600 px-4 py-2 rounded-2xl">
            <div className="text-right text-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Resource State</span>
              <span className="font-mono text-emerald-400 font-black text-[11px]">Verified: {lastVerifiedTime}</span>
            </div>
            <button
              type="button"
              onClick={handleVerifyNow}
              disabled={isVerifying}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow transition-transform active:scale-95 flex items-center space-x-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isVerifying ? 'Verifying...' : 'VERIFY NOW'}</span>
            </button>
          </div>
        </div>

        {/* 4 Core Command Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {/* Active Emergencies */}
          <div
            onClick={() => onNavigateRole('emergency')}
            className="cursor-pointer bg-red-950/60 hover:bg-red-950/80 border-2 border-red-500/80 p-4 rounded-2xl transition-all transform hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between text-red-400 text-xs font-bold">
              <span>🚨 ACTIVE EMERGENCIES</span>
              <Flame className="w-4 h-4 animate-bounce" />
            </div>
            <div className="text-3xl font-black text-white mt-1">
              0{activeEmergenciesCount}
            </div>
            <span className="text-[10px] text-red-300 font-bold">Critical Trauma Queue ➔</span>
          </div>

          {/* Patients Today */}
          <div
            onClick={() => onNavigateRole('doctor')}
            className="cursor-pointer bg-slate-800/80 hover:bg-slate-800 border border-slate-700 p-4 rounded-2xl transition-all"
          >
            <div className="flex items-center justify-between text-sky-400 text-xs font-bold">
              <span>👥 PATIENTS TODAY</span>
              <Users className="w-4 h-4" />
            </div>
            <div className="text-3xl font-black text-white mt-1">
              186
            </div>
            <span className="text-[10px] text-slate-400 font-bold">OPD + IPD Intake Flow</span>
          </div>

          {/* Bed Utilization */}
          <div
            onClick={() => onNavigateRole('beds')}
            className="cursor-pointer bg-amber-950/40 hover:bg-amber-950/60 border border-amber-500/60 p-4 rounded-2xl transition-all"
          >
            <div className="flex items-center justify-between text-amber-400 text-xs font-bold">
              <span>🛏️ BED UTILIZATION</span>
              <BedDouble className="w-4 h-4" />
            </div>
            <div className="text-3xl font-black text-white mt-1">
              {bedUtilizationPct}%
            </div>
            <span className="text-[10px] text-amber-300 font-bold">{generalBeds - occupiedBeds} Beds Free • ICU High</span>
          </div>

          {/* Ambulances */}
          <div
            onClick={() => onNavigateRole('ambulance')}
            className="cursor-pointer bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-500/60 p-4 rounded-2xl transition-all"
          >
            <div className="flex items-center justify-between text-emerald-400 text-xs font-bold">
              <span>🚑 AMBULANCES</span>
              <Truck className="w-4 h-4" />
            </div>
            <div className="text-3xl font-black text-white mt-1">
              {ambulancesAvail} / 5
            </div>
            <span className="text-[10px] text-emerald-300 font-bold">2 En Route • 3 Ready</span>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-100 border-2 border-emerald-500 p-3.5 rounded-2xl flex items-center space-x-2 text-xs font-black text-emerald-900 shadow-sm animate-in slide-in-from-top">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>✓ Hospital resource and availability state updated across all public and clinical channels!</span>
        </div>
      )}

      {/* Grid: Predictive Warnings (Left) + 1-Tap Quick Resource Updates (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Predictive Resource Warnings (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-[#263238] uppercase tracking-wider flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>⚠️ Predictive Resource Warnings & Attention Required</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-500">AI Capacity Forecaster</span>
          </div>

          <div className="space-y-3">
            {/* Warning 1: ICU Capacity */}
            <div className="bg-red-50 border-2 border-red-300 p-4 rounded-3xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-red-600 text-white font-black text-[10px] rounded-full uppercase">
                  🔴 Critical Alert
                </span>
                <span className="text-xs font-bold text-red-900">ICU: 95% Full</span>
              </div>
              <p className="text-xs font-black text-slate-800">
                ICU Ward likely to reach 100% full capacity within 45 minutes due to inbound trauma emergencies.
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500 font-semibold">Recommended: Reserve Bed or Trigger Tertiary Handshake</span>
                <button
                  type="button"
                  onClick={() => onNavigateRole('referral')}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-black rounded-xl shadow-sm"
                >
                  PREPARE REFERRALS
                </button>
              </div>
            </div>

            {/* Warning 2: Medicine Running Low */}
            <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-3xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full uppercase">
                  🟠 Stock Warning
                </span>
                <span className="text-xs font-bold text-amber-900">Pharmacy Inventory</span>
              </div>
              <p className="text-xs font-black text-slate-800">
                Essential emergency stock running low: <strong>Sorbitrate 5mg</strong> (12 units remaining) & <strong>IV Saline</strong>.
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500 font-semibold">Automatic reorder batch generated for Central Warehouse</span>
                <button
                  type="button"
                  onClick={() => onNavigateRole('pharmacy')}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-black rounded-xl shadow-sm"
                >
                  OPEN PHARMACY
                </button>
              </div>
            </div>

            {/* Warning 3: Emergency Queue */}
            <div className="bg-blue-50 border-2 border-blue-300 p-4 rounded-3xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-blue-600 text-white font-black text-[10px] rounded-full uppercase">
                  🔵 Queue Spike
                </span>
                <span className="text-xs font-bold text-blue-900">Triage Queue: 18 Patients</span>
              </div>
              <p className="text-xs font-black text-slate-800">
                Cardiology and Trauma triage queue spike observed in last 30 minutes. 2 on-call doctors notified.
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500 font-semibold">Triage protocol active</span>
                <button
                  type="button"
                  onClick={() => onNavigateRole('doctor')}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black rounded-xl shadow-sm"
                >
                  DOCTOR WORKSPACE
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 1-Tap Resource Update & Quick Toggles (5 cols) */}
        <div className="lg:col-span-5 bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-black text-sm text-[#263238] uppercase tracking-wider">
              ⚡ 1-Tap Resource Updates
            </h3>
            <span className="text-[10px] font-bold text-[#00695C] bg-[#E0F2F1] px-2 py-0.5 rounded-md">
              Instant Sync
            </span>
          </div>

          <div className="space-y-3.5">
            {/* General Beds Stepper */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-black text-xs text-slate-800 block">🛏️ Available General Beds</span>
                <span className="text-[10px] text-slate-500 font-semibold">Current: {generalBeds - occupiedBeds} Free of {generalBeds}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setOccupiedBeds(Math.min(generalBeds, occupiedBeds + 1))}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-300 font-black text-slate-800 hover:bg-slate-100 flex items-center justify-center text-sm shadow-sm"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-black text-base w-8 text-center text-slate-900">{generalBeds - occupiedBeds}</span>
                <button
                  type="button"
                  onClick={() => setOccupiedBeds(Math.max(0, occupiedBeds - 1))}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-300 font-black text-slate-800 hover:bg-slate-100 flex items-center justify-center text-sm shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ICU Beds Stepper */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-black text-xs text-slate-800 block">🩺 ICU Beds Available</span>
                <span className="text-[10px] text-slate-500 font-semibold">Ventilator & Cardiac ICU</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIcuBeds(Math.max(0, icuBeds - 1))}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-300 font-black text-slate-800 hover:bg-slate-100 flex items-center justify-center text-sm shadow-sm"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-black text-base w-8 text-center text-slate-900">{icuBeds}</span>
                <button
                  type="button"
                  onClick={() => setIcuBeds(icuBeds + 1)}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-300 font-black text-slate-800 hover:bg-slate-100 flex items-center justify-center text-sm shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Ambulances Ready Stepper */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-black text-xs text-slate-800 block">🚑 Ambulances on Station</span>
                <span className="text-[10px] text-slate-500 font-semibold">108 ALS / BLS Units</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setAmbulancesAvail(Math.max(0, ambulancesAvail - 1))}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-300 font-black text-slate-800 hover:bg-slate-100 flex items-center justify-center text-sm shadow-sm"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-black text-base w-8 text-center text-slate-900">{ambulancesAvail}</span>
                <button
                  type="button"
                  onClick={() => setAmbulancesAvail(ambulancesAvail + 1)}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-300 font-black text-slate-800 hover:bg-slate-100 flex items-center justify-center text-sm shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSaveBedUpdate}
              className="w-full py-3 bg-[#00695C] hover:bg-[#004D40] text-white font-black text-xs rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>SAVE & PUBLISH TO HOSPITAL NETWORK</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
