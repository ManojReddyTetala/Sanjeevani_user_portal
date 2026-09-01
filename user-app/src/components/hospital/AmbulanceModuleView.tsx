import React, { useState } from 'react';
import {
  Truck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Phone,
  MapPin,
  Clock,
  Compass,
  Gauge,
  Activity,
  Send,
  RefreshCw,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface AmbulanceModuleViewProps {
  facilityName: string;
  facilityCity: string;
  onRefresh?: () => void;
}

interface AmbulanceFleetItem {
  id: string;
  type: string;
  status: string;
  driver: string;
  location?: string;
  battery_o2?: string;
  patient?: string;
  emergency?: string;
  patientLocation?: string;
  ambulanceLocation?: string;
  distance_km?: number;
  speed_kmh?: number;
  heading?: number;
  eta_mins?: number;
  lifecycle?: string;
}

export const AmbulanceModuleView: React.FC<AmbulanceModuleViewProps> = ({
  facilityName,
  facilityCity,
  onRefresh
}) => {
  // Fleet list
  const [fleet, setFleet] = useState<AmbulanceFleetItem[]>([
    {
      id: 'AMB-01',
      type: 'Advanced Life Support (ALS) with Ventilator',
      status: 'AVAILABLE',
      driver: 'K. Suresh (+91-9876500111)',
      location: 'Hospital Ambulance Bay 1',
      battery_o2: '100% O2 / Full Fuel'
    },
    {
      id: 'AMB-02',
      type: 'Cardiac Emergency Unit (AED & Defibrillator)',
      status: 'EN_ROUTE',
      driver: 'Ramesh (+91-9876543210)',
      patient: 'Rahul Kumar',
      emergency: 'Severe chest pain / Cardiac Triage',
      patientLocation: '17.0214° N, 82.1384° E',
      ambulanceLocation: '17.0192° N, 82.1285° E',
      distance_km: 1.8,
      speed_kmh: 46,
      heading: 78,
      eta_mins: 4,
      lifecycle: 'EN_ROUTE_TO_PATIENT'
    },
    {
      id: 'AMB-03',
      type: 'Basic Life Support (BLS) Transport',
      status: 'AVAILABLE',
      driver: 'M. Naidu (+91-9876500113)',
      location: 'Hospital Ambulance Bay 2',
      battery_o2: '90% O2 / Ready'
    },
    {
      id: 'AMB-04',
      type: 'Neonatal & Pediatric Care Ambulance',
      status: 'MAINTENANCE',
      driver: 'Standby Roster',
      location: 'Service Workshop',
      battery_o2: 'Scheduled Inspection'
    }
  ]);

  const [selectedAmbulance, setSelectedAmbulance] = useState<any>(fleet[1]);

  const handleAdvanceLifecycle = (ambId: string) => {
    const lifecycles = [
      'ASSIGNED',
      'DISPATCHED',
      'EN_ROUTE_TO_PATIENT',
      'ARRIVED_AT_PATIENT',
      'PATIENT_PICKED_UP',
      'EN_ROUTE_TO_HOSPITAL',
      'ARRIVED',
      'AVAILABLE'
    ];

    setFleet(
      fleet.map((a) => {
        if (a.id === ambId) {
          const currIdx = lifecycles.indexOf(a.lifecycle || 'EN_ROUTE_TO_PATIENT');
          const nextIdx = (currIdx + 1) % lifecycles.length;
          const nextState = lifecycles[nextIdx];
          const newStatus = nextState === 'AVAILABLE' ? 'AVAILABLE' : 'EN_ROUTE';
          const updated = { ...a, lifecycle: nextState, status: newStatus };
          if (selectedAmbulance?.id === ambId) setSelectedAmbulance(updated);
          return updated;
        }
        return a;
      })
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Profile */}
      <div className="bg-gradient-to-r from-[#00695C] to-teal-800 text-white p-6 rounded-3xl shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black shadow-inner border border-white/30">
            🚑
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-200 bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-400/30">
                🚑 AMBULANCE CONTROL & LIVE GPS
              </span>
              <span className="text-xs text-teal-100">• {facilityName}</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">Emergency Ambulance Fleet Network</h2>
            <p className="text-xs text-teal-100 font-medium">
              Real-time GPS dispatch, patient-ambulance telemetry sync & 108 emergency coordination.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Sync GPS Telemetry</span>
        </button>
      </div>

      {/* 3 FLEET SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#607D8B]">AMB-01</span>
            <span className="text-xs font-black text-[#00695C] bg-[#E0F2F1] px-2 py-0.5 rounded">🟢 AVAILABLE</span>
          </div>
          <span className="text-base font-black text-[#263238]">Advanced Life Support (ALS)</span>
          <span className="text-[11px] text-slate-500 block">Bay 1 • Ready for Instant Dispatch</span>
        </div>

        <div className="bg-white border-2 border-amber-300 bg-amber-50/20 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#F57C00]">AMB-02</span>
            <span className="text-xs font-black text-[#F57C00] bg-amber-100 px-2 py-0.5 rounded">🟠 EN ROUTE</span>
          </div>
          <span className="text-base font-black text-[#263238]">Active Emergency Dispatch</span>
          <span className="text-[11px] text-slate-600 block">Patient: Rahul Kumar (ETA ~4 min)</span>
        </div>

        <div className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#607D8B]">AMB-03</span>
            <span className="text-xs font-black text-[#00695C] bg-[#E0F2F1] px-2 py-0.5 rounded">🟢 AVAILABLE</span>
          </div>
          <span className="text-base font-black text-[#263238]">Basic Life Support (BLS)</span>
          <span className="text-[11px] text-slate-500 block">Bay 2 • Ready for Transport</span>
        </div>
      </div>

      {/* ACTIVE EMERGENCY GPS TELEMETRY & ROUTE TRACKING SCREEN */}
      {selectedAmbulance && (
        <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div className="flex items-center space-x-3">
              <span className="w-12 h-12 rounded-2xl bg-amber-100 text-[#F57C00] flex items-center justify-center text-2xl font-black">
                🚑
              </span>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-black text-[#263238]">{selectedAmbulance.id} Live Telemetry</h3>
                  <span className="text-xs font-black text-[#F57C00] bg-amber-50 px-2.5 py-0.5 rounded-lg border border-[#F57C00]/20">
                    {selectedAmbulance.lifecycle || selectedAmbulance.status}
                  </span>
                </div>
                <span className="text-xs text-[#607D8B]">Driver: {selectedAmbulance.driver}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleAdvanceLifecycle(selectedAmbulance.id)}
                className="px-4 py-2 bg-[#00695C] hover:bg-[#004D40] text-white font-extrabold text-xs rounded-xl shadow transition-all active:scale-95 flex items-center space-x-1"
              >
                <span>Advance State (Next State ➔)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live GPS Telemetry Dashboard */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                  <span className="text-[10px] font-bold text-[#607D8B] block flex items-center justify-center space-x-1">
                    <Clock className="w-3 h-3 text-[#00695C]" />
                    <span>ETA TO PATIENT</span>
                  </span>
                  <span className="text-xl font-black text-[#00695C]">{selectedAmbulance.eta_mins || 4} MINS</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                  <span className="text-[10px] font-bold text-[#607D8B] block flex items-center justify-center space-x-1">
                    <MapPin className="w-3 h-3 text-[#00695C]" />
                    <span>DISTANCE</span>
                  </span>
                  <span className="text-xl font-black text-[#263238]">{selectedAmbulance.distance_km || 1.8} KM</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                  <span className="text-[10px] font-bold text-[#607D8B] block flex items-center justify-center space-x-1">
                    <Gauge className="w-3 h-3 text-[#00695C]" />
                    <span>VEHICLE SPEED</span>
                  </span>
                  <span className="text-xl font-black text-[#263238]">{selectedAmbulance.speed_kmh || 46} km/h</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                  <span className="text-[10px] font-bold text-[#607D8B] block flex items-center justify-center space-x-1">
                    <Compass className="w-3 h-3 text-[#00695C]" />
                    <span>HEADING</span>
                  </span>
                  <span className="text-xl font-black text-[#263238]">{selectedAmbulance.heading || 78}° ENE</span>
                </div>
              </div>

              {/* Coordinates & Route */}
              <div className="p-4 bg-[#E0F2F1]/60 rounded-2xl border border-[#00695C]/20 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#00695C] flex items-center space-x-1">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <span>Patient Live GPS: 17.0214° N, 82.1384° E</span>
                  </span>
                  <span className="text-emerald-700 font-bold">Accuracy: ±4.5m</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#00695C] flex items-center space-x-1">
                    <Truck className="w-4 h-4 text-[#00695C]" />
                    <span>Ambulance Live GPS: 17.0192° N, 82.1285° E</span>
                  </span>
                  <span className="text-[#00695C] font-bold">Signal: 4G High Bandwidth</span>
                </div>
              </div>
            </div>

            {/* Emergency Action Controls */}
            <div className="bg-slate-50 border-2 border-slate-200 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <h4 className="text-xs font-black text-[#263238] uppercase tracking-wider">
                  Driver & Patient Communication
                </h4>
                <p className="text-xs text-slate-600">
                  Direct encrypted audio channel to the ambulance paramedic team on duty.
                </p>
              </div>

              <div className="space-y-2">
                <a
                  href="tel:+919876543210"
                  className="w-full py-3 bg-[#00695C] hover:bg-[#004D40] text-white font-black text-xs rounded-xl shadow flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>CALL DRIVER RAMESH</span>
                </a>

                <button
                  type="button"
                  onClick={() => alert('Dispatched turn-by-turn route updates to ambulance onboard tablet.')}
                  className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 text-[#263238] font-bold text-xs rounded-xl transition-all"
                >
                  🗺️ Push Route Telemetry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
