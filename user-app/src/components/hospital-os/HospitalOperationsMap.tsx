import React, { useState } from 'react';
import {
  Navigation,
  Truck,
  MapPin,
  Building2,
  Users,
  Flame,
  Layers,
  Activity,
  Compass
} from 'lucide-react';

interface HospitalOperationsMapProps {
  onRefreshData?: () => void;
}

export const HospitalOperationsMap: React.FC<HospitalOperationsMapProps> = ({ onRefreshData }) => {
  const [layers, setLayers] = useState({
    ambulances: true,
    emergencies: true,
    phcs: true,
    referrals: true,
    patients: true
  });

  const [selectedEntity, setSelectedEntity] = useState<any>({
    type: 'AMBULANCE',
    title: 'Ambulance AMB-07',
    driver: 'Ramesh (+91-9876543110)',
    mission: 'En Route to Rahul Kumar (Acute STEMI)',
    speed: '44 km/h',
    eta: '4 Mins',
    coords: '17.0198, 82.1292'
  });

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-150">
      {/* Top Header with Layer Filter Badges */}
      <div className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-slate-900 text-emerald-400 rounded-2xl font-black">
              <Navigation className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-[#263238]">🗺️ Live Hospital Network Operations Map</h2>
                <span className="px-2.5 py-0.5 bg-emerald-600 text-white rounded-full text-xs font-bold animate-pulse">
                  5 LAYERS ACTIVE
                </span>
              </div>
              <p className="text-xs text-[#607D8B] font-semibold">Real-Time Geographical Tracking of Ambulances, Emergencies, and Referral Routes</p>
            </div>
          </div>
        </div>

        {/* Layer Toggles */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setLayers({ ...layers, ambulances: !layers.ambulances })}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors flex items-center space-x-1.5 ${
              layers.ambulances ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-slate-100 text-slate-400'
            }`}
          >
            <span>🚑 Ambulances (3)</span>
          </button>

          <button
            type="button"
            onClick={() => setLayers({ ...layers, emergencies: !layers.emergencies })}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors flex items-center space-x-1.5 ${
              layers.emergencies ? 'bg-red-600 text-white shadow-sm' : 'bg-slate-100 text-slate-400'
            }`}
          >
            <span>🚨 Emergencies (4)</span>
          </button>

          <button
            type="button"
            onClick={() => setLayers({ ...layers, phcs: !layers.phcs })}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors flex items-center space-x-1.5 ${
              layers.phcs ? 'bg-[#00695C] text-white shadow-sm' : 'bg-slate-100 text-slate-400'
            }`}
          >
            <span>🏥 PHCs (2)</span>
          </button>

          <button
            type="button"
            onClick={() => setLayers({ ...layers, referrals: !layers.referrals })}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors flex items-center space-x-1.5 ${
              layers.referrals ? 'bg-purple-700 text-white shadow-sm' : 'bg-slate-100 text-slate-400'
            }`}
          >
            <span>🏨 Referral Hubs (3)</span>
          </button>

          <button
            type="button"
            onClick={() => setLayers({ ...layers, patients: !layers.patients })}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors flex items-center space-x-1.5 ${
              layers.patients ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-400'
            }`}
          >
            <span>👤 Active Patients</span>
          </button>
        </div>
      </div>

      {/* Main Map Graphic & Telemetry Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950 rounded-3xl p-6 border-2 border-slate-800 text-white shadow-2xl relative min-h-[360px] flex items-center justify-center overflow-hidden">
          {/* Radial Grid Pattern */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]" />

          {/* SVG Vector Routes */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line x1="25%" y1="35%" x2="50%" y2="55%" stroke="#0ea5e9" strokeWidth="3" strokeDasharray="6" opacity="0.6" />
            <line x1="50%" y1="55%" x2="78%" y2="68%" stroke="#f59e0b" strokeWidth="4" strokeDasharray="4" className="animate-pulse" />
            <line x1="25%" y1="35%" x2="80%" y2="25%" stroke="#a855f7" strokeWidth="3" strokeDasharray="8" opacity="0.8" />
          </svg>

          {/* 1. Base Hospital AIIMS Delhi */}
          <div
            onClick={() =>
              setSelectedEntity({
                type: 'HOSPITAL',
                title: 'AIIMS Delhi — Base Command',
                driver: 'Dr. Anil Kumar (Chief)',
                mission: 'Trauma Hub & Secondary ICU Destination',
                speed: 'Stationary',
                eta: 'Base',
                coords: '28.5672, 77.2100'
              })
            }
            className="absolute left-[25%] top-[35%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group flex flex-col items-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-teal-600 border-2 border-emerald-300 flex items-center justify-center text-2xl shadow-xl shadow-teal-950 transition-transform group-hover:scale-110">
              🏥
            </div>
            <span className="text-[10px] font-black bg-slate-900 px-2 py-0.5 rounded-md border border-emerald-400 text-emerald-300 mt-1">
              AIIMS Delhi (Base)
            </span>
          </div>

          {/* 2. Ambulance AMB-07 (Moving) */}
          {layers.ambulances && (
            <div
              onClick={() =>
                setSelectedEntity({
                  type: 'AMBULANCE',
                  title: 'Ambulance AMB-07',
                  driver: 'Ramesh (+91-9876543110)',
                  mission: 'En Route to Rahul Kumar (Acute STEMI)',
                  speed: '44 km/h',
                  eta: '4 Mins',
                  coords: '17.0198, 82.1292'
                })
              }
              className="absolute left-[50%] top-[55%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group flex flex-col items-center z-10"
            >
              <div className="relative">
                <div className="w-13 h-13 rounded-2xl bg-amber-500 border-2 border-amber-200 flex items-center justify-center text-2xl shadow-xl shadow-amber-950 animate-bounce">
                  🚑
                </div>
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 animate-ping" />
              </div>
              <span className="text-[10px] font-black bg-slate-900 px-2 py-0.5 rounded-md border border-amber-400 text-amber-300 mt-1">
                AMB-07 (4 min ETA)
              </span>
            </div>
          )}

          {/* 3. Emergency Patient Rahul Kumar */}
          {layers.emergencies && (
            <div
              onClick={() =>
                setSelectedEntity({
                  type: 'PATIENT',
                  title: 'Rahul Kumar (Patient)',
                  driver: 'Self-reported via Voice App',
                  mission: 'Awaiting Ambulance AMB-07 (Severe Chest Pain)',
                  speed: 'Stationary',
                  eta: 'Waiting 6 mins',
                  coords: '17.0214, 82.1384'
                })
              }
              className="absolute left-[78%] top-[68%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group flex flex-col items-center"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-red-600 border-2 border-rose-300 flex items-center justify-center text-2xl shadow-xl shadow-red-950">
                  👤
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-400 animate-ping" />
              </div>
              <span className="text-[10px] font-black bg-slate-900 px-2 py-0.5 rounded-md border border-rose-400 text-rose-300 mt-1">
                Rahul Kumar (Trauma)
              </span>
            </div>
          )}

          {/* 4. Apex Referral Hub (Safdarjung Hospital) */}
          {layers.referrals && (
            <div
              onClick={() =>
                setSelectedEntity({
                  type: 'REFERRAL_HUB',
                  title: 'Safdarjung Super-Specialty Hub',
                  driver: 'Hospital Reception',
                  mission: 'Tertiary Care Partner (Cath Lab Active)',
                  speed: 'Stationary',
                  eta: '14 mins via Corridor',
                  coords: '28.5700, 77.2050'
                })
              }
              className="absolute left-[80%] top-[25%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group flex flex-col items-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-700 border-2 border-purple-300 flex items-center justify-center text-2xl shadow-xl shadow-purple-950">
                🏨
              </div>
              <span className="text-[10px] font-black bg-slate-900 px-2 py-0.5 rounded-md border border-purple-400 text-purple-300 mt-1">
                Safdarjung Hub
              </span>
            </div>
          )}
        </div>

        {/* Selected Entity Inspector (4 cols) */}
        <div className="lg:col-span-4 bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              Node Inspector
            </span>
            <span className="px-2.5 py-0.5 bg-slate-100 font-black text-[10px] rounded-full text-slate-700">
              {selectedEntity.type}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="font-black text-lg text-slate-900">{selectedEntity.title}</h3>
            <p className="text-xs text-slate-600 font-medium">{selectedEntity.mission}</p>
          </div>

          <div className="space-y-2.5 text-xs font-bold pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-slate-500">Speed:</span>
              <span className="text-slate-900 font-black">{selectedEntity.speed}</span>
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-slate-500">Live ETA:</span>
              <span className="text-amber-700 font-black">{selectedEntity.eta}</span>
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-slate-500">GPS Coords:</span>
              <span className="font-mono text-slate-700">{selectedEntity.coords}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
