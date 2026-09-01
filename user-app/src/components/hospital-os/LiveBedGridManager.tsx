import React, { useState } from 'react';
import {
  BedDouble,
  AlertTriangle,
  CheckCircle2,
  Users,
  ShieldCheck,
  Flame,
  Truck,
  Plus,
  RefreshCw
} from 'lucide-react';
import { BedUnit } from '../../types';

interface LiveBedGridManagerProps {
  onRefreshData?: () => void;
}

export const LiveBedGridManager: React.FC<LiveBedGridManagerProps> = ({ onRefreshData }) => {
  const [beds, setBeds] = useState<BedUnit[]>([
    { id: 1, hospital_id: 1, ward_name: 'ICU Ward A', bed_number: 'ICU-01', bed_type: 'ICU', status: 'OCCUPIED', patient_name: 'Rahul Kumar', last_updated: new Date().toISOString() },
    { id: 2, hospital_id: 1, ward_name: 'ICU Ward A', bed_number: 'ICU-02', bed_type: 'ICU', status: 'RESERVED_EMERGENCY', patient_name: 'Incoming Ambulance AMB-07', last_updated: new Date().toISOString() },
    { id: 3, hospital_id: 1, ward_name: 'ICU Ward A', bed_number: 'ICU-03', bed_type: 'ICU', status: 'AVAILABLE', last_updated: new Date().toISOString() },
    { id: 4, hospital_id: 1, ward_name: 'ICU Ward A', bed_number: 'ICU-04', bed_type: 'ICU', status: 'OCCUPIED', patient_name: 'Priya Sharma', last_updated: new Date().toISOString() },
    { id: 5, hospital_id: 1, ward_name: 'General Ward Male', bed_number: 'GW-01', bed_type: 'GENERAL', status: 'AVAILABLE', last_updated: new Date().toISOString() },
    { id: 6, hospital_id: 1, ward_name: 'General Ward Male', bed_number: 'GW-02', bed_type: 'GENERAL', status: 'AVAILABLE', last_updated: new Date().toISOString() },
    { id: 7, hospital_id: 1, ward_name: 'General Ward Male', bed_number: 'GW-03', bed_type: 'GENERAL', status: 'OCCUPIED', patient_name: 'Ananya Rao', last_updated: new Date().toISOString() },
    { id: 8, hospital_id: 1, ward_name: 'General Ward Male', bed_number: 'GW-04', bed_type: 'GENERAL', status: 'AVAILABLE', last_updated: new Date().toISOString() },
    { id: 9, hospital_id: 1, ward_name: 'General Ward Male', bed_number: 'GW-05', bed_type: 'GENERAL', status: 'AVAILABLE', last_updated: new Date().toISOString() },
    { id: 10, hospital_id: 1, ward_name: 'General Ward Male', bed_number: 'GW-06', bed_type: 'GENERAL', status: 'MAINTENANCE', last_updated: new Date().toISOString() },
    { id: 11, hospital_id: 1, ward_name: 'Emergency Trauma Bay', bed_number: 'ER-01', bed_type: 'EMERGENCY', status: 'OCCUPIED', patient_name: 'Trauma Case #101', last_updated: new Date().toISOString() },
    { id: 12, hospital_id: 1, ward_name: 'Emergency Trauma Bay', bed_number: 'ER-02', bed_type: 'EMERGENCY', status: 'AVAILABLE', last_updated: new Date().toISOString() }
  ]);

  const [reserveSuccessMsg, setReserveSuccessMsg] = useState('');

  const handleToggleBed = (bedId: number) => {
    setBeds(
      beds.map((b) => {
        if (b.id === bedId) {
          const next = b.status === 'AVAILABLE' ? 'OCCUPIED' : b.status === 'OCCUPIED' ? 'AVAILABLE' : 'AVAILABLE';
          return { ...b, status: next, patient_name: next === 'AVAILABLE' ? undefined : 'Walk-in Patient' };
        }
        return b;
      })
    );
  };

  const handleEmergencyReserve = () => {
    // Find first available ICU or Trauma bed
    const target = beds.find((b) => b.status === 'AVAILABLE' && (b.bed_type === 'ICU' || b.bed_type === 'EMERGENCY')) || beds.find((b) => b.status === 'AVAILABLE');
    if (target) {
      setBeds(beds.map((b) => (b.id === target.id ? { ...b, status: 'RESERVED_EMERGENCY', patient_name: 'Incoming Ambulance AMB-07' } : b)));
      setReserveSuccessMsg(`✓ Bed ${target.bed_number} (${target.ward_name}) RESERVED for Incoming Ambulance AMB-07!`);
      setTimeout(() => setReserveSuccessMsg(''), 4000);
    }
  };

  const availableCount = beds.filter((b) => b.status === 'AVAILABLE').length;
  const reservedCount = beds.filter((b) => b.status === 'RESERVED_EMERGENCY').length;
  const occupiedCount = beds.filter((b) => b.status === 'OCCUPIED').length;

  const wards = Array.from(new Set(beds.map((b) => b.ward_name)));

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-teal-50 text-[#00695C] rounded-2xl border border-teal-200 font-black">
            <BedDouble className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-[#263238]">🛏️ Live Hospital Capacity & Visual Bed Grid</h2>
              <span className="px-2.5 py-0.5 bg-[#00695C] text-white rounded-full text-xs font-bold">
                REAL-TIME GRID
              </span>
            </div>
            <p className="text-xs text-[#607D8B] font-semibold">General Ward, Cardiac ICU & Emergency Trauma Bed Matrix</p>
          </div>
        </div>

        {/* Emergency Bed Reservation Trigger */}
        <button
          type="button"
          onClick={handleEmergencyReserve}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-2xl shadow-md transition-transform active:scale-95 flex items-center space-x-1.5"
        >
          <Truck className="w-4 h-4" />
          <span>⚡ RESERVE EMERGENCY BED</span>
        </button>
      </div>

      {reserveSuccessMsg && (
        <div className="bg-[#E0F2F1] border-2 border-[#00695C] p-4 rounded-2xl flex items-center space-x-2 text-xs font-black text-[#00695C] shadow-md animate-in slide-in-from-top">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{reserveSuccessMsg}</span>
        </div>
      )}

      {/* Admission Pipeline Strip */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-2">
        <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
          Admission Lifecycle Pipeline
        </span>
        <div className="grid grid-cols-5 gap-1 text-center text-[10px] font-black">
          <div className="bg-red-600 p-2 rounded-xl border border-red-500">1. EMERGENCY</div>
          <div className="bg-amber-500 text-slate-950 p-2 rounded-xl border border-amber-400">2. BED REQUIRED</div>
          <div className="bg-teal-600 p-2 rounded-xl border border-teal-500 animate-pulse">3. BED RESERVED</div>
          <div className="bg-blue-600 p-2 rounded-xl border border-blue-500">4. PATIENT ARRIVED</div>
          <div className="bg-emerald-600 p-2 rounded-xl border border-emerald-500">5. ADMITTED</div>
        </div>
      </div>

      {/* Legend & Summary Counters */}
      <div className="grid grid-cols-3 gap-3 text-xs font-black text-center">
        <div className="bg-emerald-50 border-2 border-emerald-300 p-3.5 rounded-2xl text-emerald-950 flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
            <span>🟢 AVAILABLE</span>
          </div>
          <span className="text-xl font-black text-emerald-700">{availableCount} Beds</span>
        </div>

        <div className="bg-amber-50 border-2 border-amber-300 p-3.5 rounded-2xl text-amber-950 flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500" />
            <span>🟠 RESERVED (AMBULANCE)</span>
          </div>
          <span className="text-xl font-black text-amber-700">{reservedCount} Beds</span>
        </div>

        <div className="bg-red-50 border-2 border-red-300 p-3.5 rounded-2xl text-red-950 flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-3.5 rounded-full bg-red-600" />
            <span>🔴 OCCUPIED</span>
          </div>
          <span className="text-xl font-black text-red-600">{occupiedCount} Beds</span>
        </div>
      </div>

      {/* Visual Ward Bed Map Sections */}
      <div className="space-y-5">
        {wards.map((ward) => {
          const wardBeds = beds.filter((b) => b.ward_name === ward);

          return (
            <div key={ward} className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-sm text-[#263238] uppercase tracking-wider flex items-center space-x-2">
                  <BedDouble className="w-4 h-4 text-[#00695C]" />
                  <span>{ward} ({wardBeds.length} Beds)</span>
                </h3>
                <span className="text-xs text-slate-500 font-bold">
                  {wardBeds.filter((b) => b.status === 'AVAILABLE').length} Available
                </span>
              </div>

              {/* Bed Cells Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {wardBeds.map((bed) => {
                  const isAvail = bed.status === 'AVAILABLE';
                  const isReserved = bed.status === 'RESERVED_EMERGENCY';
                  const isOccupied = bed.status === 'OCCUPIED';

                  return (
                    <button
                      key={bed.id}
                      type="button"
                      onClick={() => handleToggleBed(bed.id)}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center space-y-1.5 shadow-sm active:scale-95 ${
                        isAvail
                          ? 'bg-emerald-50/80 border-emerald-400 hover:bg-emerald-100'
                          : isReserved
                          ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-300 animate-pulse'
                          : isOccupied
                          ? 'bg-red-50 border-red-400'
                          : 'bg-slate-100 border-slate-300 opacity-60'
                      }`}
                    >
                      <span className="text-2xl">{isAvail ? '🟢' : isReserved ? '🟠' : '🔴'}</span>
                      <span className="font-black text-xs text-slate-900">{bed.bed_number}</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{bed.bed_type}</span>
                      {bed.patient_name && (
                        <span className="text-[9px] font-bold text-slate-700 truncate max-w-[90px]">
                          {bed.patient_name}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
