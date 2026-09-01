import React, { useState, useEffect } from 'react';
import {
  Truck,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  Clock,
  Compass,
  Gauge,
  Activity,
  AlertTriangle,
  Flame,
  Radio
} from 'lucide-react';
import { EmergencyRequest } from '../../types';

interface AmbulanceMissionControlProps {
  onRefreshData?: () => void;
}

export const AmbulanceMissionControl: React.FC<AmbulanceMissionControlProps> = ({ onRefreshData }) => {
  const [activeAmbulances, setActiveAmbulances] = useState([
    { code: 'AMB-07', driver: 'Ramesh', phone: '+91-9876543110', status: 'EN_ROUTE_TO_PATIENT', speed: 44, heading: 78, distanceToPatient: 1.8, eta: 4, patient: 'Rahul Kumar', emergencyType: 'Acute STEMI Trauma' },
    { code: 'AMB-04', driver: 'Suresh', phone: '+91-9876543111', status: 'AVAILABLE', speed: 0, heading: 0, distanceToPatient: 0, eta: 0, patient: 'None', emergencyType: 'None' },
    { code: 'AMB-02', driver: 'Manish', phone: '+91-9876543112', status: 'ARRIVED_AT_PATIENT', speed: 0, heading: 140, distanceToPatient: 0.1, eta: 1, patient: 'Priya Sharma', emergencyType: 'Severe Dehydration' },
    { code: 'AMB-09', driver: 'Kiran', phone: '+91-9876543113', status: 'MAINTENANCE', speed: 0, heading: 0, distanceToPatient: 0, eta: 0, patient: 'None', emergencyType: 'Periodic Servicing' }
  ]);

  const [selectedAmbCode, setSelectedAmbCode] = useState('AMB-07');
  const [missionMsg, setMissionMsg] = useState('');

  const selectedAmb = activeAmbulances.find((a) => a.code === selectedAmbCode) || activeAmbulances[0];

  const handleAdvanceStage = (nextStatus: string) => {
    setActiveAmbulances(
      activeAmbulances.map((a) => (a.code === selectedAmbCode ? { ...a, status: nextStatus } : a))
    );
    setMissionMsg(`✓ Mission status for ${selectedAmbCode} transitioned to: ${nextStatus}`);
    setTimeout(() => setMissionMsg(''), 4000);
  };

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-200 font-black">
            <Truck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-[#263238]">🚑 Ambulance Fleet & Mission Control</h2>
              <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 rounded-full text-xs font-bold animate-pulse">
                DUAL GPS ENGINE ACTIVE
              </span>
            </div>
            <p className="text-xs text-[#607D8B] font-semibold">108 Emergency Medical Response Network</p>
          </div>
        </div>

        {/* Fleet Count Badges */}
        <div className="flex items-center space-x-2 text-xs font-black">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-900 rounded-xl border border-emerald-300">
            🟢 1 READY
          </span>
          <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-xl border border-amber-300">
            🟠 2 EN ROUTE
          </span>
          <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-xl border border-slate-300">
            ⚪ 1 MAINT
          </span>
        </div>
      </div>

      {missionMsg && (
        <div className="bg-[#E0F2F1] border-2 border-[#00695C] p-4 rounded-2xl flex items-center space-x-2 text-xs font-black text-[#00695C] shadow-md animate-in slide-in-from-top">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{missionMsg}</span>
        </div>
      )}

      {/* Grid: Fleet Overview (4 cols) + Active Mission Tactical Screen (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Fleet List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="font-black text-sm text-[#263238] uppercase tracking-wider px-1">
            Ambulance Fleet ({activeAmbulances.length})
          </h3>

          <div className="space-y-2.5">
            {activeAmbulances.map((amb) => {
              const isSelected = amb.code === selectedAmbCode;
              const isEnRoute = amb.status === 'EN_ROUTE_TO_PATIENT' || amb.status === 'ARRIVED_AT_PATIENT';

              return (
                <button
                  key={amb.code}
                  type="button"
                  onClick={() => setSelectedAmbCode(amb.code)}
                  className={`w-full text-left p-4 rounded-3xl border-2 transition-all shadow-sm space-y-2 ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-300'
                      : 'border-slate-200 bg-white hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-slate-900 flex items-center space-x-1.5">
                      <Truck className="w-4 h-4 text-amber-600" />
                      <span>{amb.code}</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                      amb.status === 'AVAILABLE'
                        ? 'bg-emerald-100 text-emerald-900'
                        : isEnRoute
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {amb.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 font-medium">
                    Driver: <strong>{amb.driver}</strong> • Patient: <strong>{amb.patient}</strong>
                  </div>

                  {isEnRoute && (
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-800 pt-1 border-t border-amber-200">
                      <span>Distance: {amb.distanceToPatient} km</span>
                      <span>ETA: {amb.eta} min</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Mission Tactical Screen (8 cols) */}
        <div className="lg:col-span-8 bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-md space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black text-xs rounded-xl">
                  🚨 ACTIVE MISSION • {selectedAmb.code}
                </span>
                <span className="text-xs text-slate-500 font-bold">Driver: {selectedAmb.driver} ({selectedAmb.phone})</span>
              </div>
              <h3 className="font-black text-xl text-[#263238] mt-1">
                Emergency Transit: {selectedAmb.patient}
              </h3>
            </div>

            <div className="flex items-center space-x-2">
              <a
                href={`tel:${selectedAmb.phone}`}
                className="px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs rounded-xl border border-amber-300 flex items-center space-x-1"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>CALL DRIVER</span>
              </a>
              <a
                href="tel:+919876543210"
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs rounded-xl border border-slate-300 flex items-center space-x-1"
              >
                <Phone className="w-3.5 h-3.5 text-[#00695C]" />
                <span>CALL PATIENT</span>
              </a>
            </div>
          </div>

          {/* Dual GPS Telemetry Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-black">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase block">Vehicle Speed</span>
              <span className="text-base text-slate-900">{selectedAmb.speed} km/h</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase block">Heading</span>
              <span className="text-base text-slate-900">{selectedAmb.heading}° ENE</span>
            </div>
            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-300">
              <span className="text-[10px] text-amber-800 uppercase block">Ambulance ➔ Patient</span>
              <span className="text-base text-amber-700">{selectedAmb.distanceToPatient} km</span>
            </div>
            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-300">
              <span className="text-[10px] text-amber-800 uppercase block">Arrival ETA</span>
              <span className="text-base text-amber-700">{selectedAmb.eta} Mins</span>
            </div>
          </div>

          {/* Automatic Arrival & Mission Step Triggers */}
          <div className="bg-slate-50 border-2 border-slate-200 p-4 rounded-3xl space-y-2.5">
            <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
              Mission Progression State Machine
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleAdvanceStage('ARRIVED_AT_PATIENT')}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-sm"
              >
                📍 1. AMBULANCE ARRIVED AT PATIENT
              </button>
              <button
                type="button"
                onClick={() => handleAdvanceStage('PATIENT_PICKED_UP')}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-sm"
              >
                👤 2. PATIENT ONBOARD / PICKED UP
              </button>
              <button
                type="button"
                onClick={() => handleAdvanceStage('EN_ROUTE_TO_HOSPITAL')}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-sm"
              >
                🏥 3. NAVIGATE TO APEX HOSPITAL
              </button>
              <button
                type="button"
                onClick={() => handleAdvanceStage('AVAILABLE')}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-sm"
              >
                ✓ 4. PATIENT HANDED OVER / READY
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
