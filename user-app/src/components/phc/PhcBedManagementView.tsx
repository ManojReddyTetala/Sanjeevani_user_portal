import React, { useState } from 'react';
import {
  Bed,
  ArrowLeft,
  CheckCircle2,
  Plus,
  Minus,
  Save,
  Truck,
  HeartPulse,
  Activity,
  Home,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { HospitalResource } from '../../types';

interface PhcBedManagementViewProps {
  resources: HospitalResource;
  onBack: () => void;
  onSaveResources: (updated: Partial<HospitalResource>) => Promise<void>;
  facilityName: string;
}

export const PhcBedManagementView: React.FC<PhcBedManagementViewProps> = ({
  resources,
  onBack,
  onSaveResources,
  facilityName
}) => {
  const [totalBeds, setTotalBeds] = useState(resources.general_beds || 12);
  const [occupiedBeds, setOccupiedBeds] = useState(resources.occupied_beds || 4);
  const [generalWardBeds, setGeneralWardBeds] = useState(resources.general_ward_beds || 12);
  const [icuBeds, setIcuBeds] = useState(resources.icu_beds || 0);
  const [oxygenCylinders, setOxygenCylinders] = useState(resources.oxygen_cylinders || 5);
  const [ambulances, setAmbulances] = useState(resources.ambulances || 1);
  const [occupiedRooms, setOccupiedRooms] = useState(2);
  const [totalRooms, setTotalRooms] = useState(4);

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const availableBeds = Math.max(0, totalBeds - occupiedBeds);
  const availableRooms = Math.max(0, totalRooms - occupiedRooms);

  const handleSave = async () => {
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      await onSaveResources({
        general_beds: totalBeds,
        occupied_beds: occupiedBeds,
        general_ward_beds: generalWardBeds,
        icu_beds: icuBeds,
        oxygen_cylinders: oxygenCylinders,
        ambulances: ambulances
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      alert('Failed to save bed capacity.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between bg-white border-2 border-slate-200 p-4 rounded-2xl shadow-sm">
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
            <h2 className="text-xl font-black text-[#263238]">🛏️ Bed & Facility Management</h2>
            <p className="text-xs text-[#607D8B] font-semibold">{facilityName}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 bg-[#00695C] hover:bg-[#004D40] text-white font-black text-xs rounded-xl shadow-md flex items-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
          aria-label="Save updated bed availability"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'SAVING...' : 'SAVE CHANGES'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-[#E0F2F1] border-2 border-[#00695C] p-4 rounded-2xl flex items-center space-x-3 text-xs font-black text-[#00695C]">
          <CheckCircle2 className="w-5 h-5" />
          <span>✓ Bed availability updated and broadcast to patient discovery in real time!</span>
        </div>
      )}

      {/* Main Bed Status Card */}
      <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 gap-2">
          <div>
            <h3 className="text-lg font-black text-[#263238]">Overall Bed Availability</h3>
            <p className="text-xs text-slate-500 font-medium">Use large tactile + / − buttons to update counts</p>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1.5 rounded-full text-xs font-black border flex items-center space-x-1.5 ${
              availableBeds > 3
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : availableBeds > 0
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-red-50 text-red-800 border-red-300'
            }`}>
              {availableBeds > 3 ? <span>🟢 ✓ AVAILABLE ({availableBeds} FREE)</span> : availableBeds > 0 ? <span>🟠 ! LIMITED ({availableBeds} FREE)</span> : <span>🔴 ✕ ALL OCCUPIED</span>}
            </span>
          </div>
        </div>

        {/* Tactile Counter Rows */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Total Beds Stepper */}
          <div className="bg-slate-50 border-2 border-slate-200 p-5 rounded-2xl space-y-3 text-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Beds Setup</span>
            <div className="flex items-center justify-center space-x-4">
              <button
                type="button"
                onClick={() => setTotalBeds(Math.max(1, totalBeds - 1))}
                className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-100 active:scale-95 flex items-center justify-center font-black text-xl shadow-sm"
                aria-label="Decrease Total Beds"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="text-3xl font-black text-[#263238] min-w-[3rem]">{totalBeds}</span>
              <button
                type="button"
                onClick={() => setTotalBeds(totalBeds + 1)}
                className="w-12 h-12 rounded-2xl bg-[#00695C] text-white hover:bg-[#004D40] active:scale-95 flex items-center justify-center font-black text-xl shadow-md"
                aria-label="Increase Total Beds"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[11px] text-slate-500 font-bold">Physical bed infrastructure</p>
          </div>

          {/* 2. Occupied Beds Stepper */}
          <div className="bg-slate-50 border-2 border-slate-200 p-5 rounded-2xl space-y-3 text-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Occupied Beds</span>
            <div className="flex items-center justify-center space-x-4">
              <button
                type="button"
                onClick={() => setOccupiedBeds(Math.max(0, occupiedBeds - 1))}
                className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-100 active:scale-95 flex items-center justify-center font-black text-xl shadow-sm"
                aria-label="Decrease Occupied Beds"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="text-3xl font-black text-amber-700 min-w-[3rem]">{occupiedBeds}</span>
              <button
                type="button"
                onClick={() => setOccupiedBeds(Math.min(totalBeds, occupiedBeds + 1))}
                className="w-12 h-12 rounded-2xl bg-[#00695C] text-white hover:bg-[#004D40] active:scale-95 flex items-center justify-center font-black text-xl shadow-md"
                aria-label="Increase Occupied Beds"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[11px] text-slate-500 font-bold">Patients currently admitted</p>
          </div>

          {/* 3. Available (Free) Beds Summary */}
          <div className="bg-[#E0F2F1]/50 border-2 border-[#00695C]/40 p-5 rounded-2xl space-y-3 text-center flex flex-col justify-center">
            <span className="text-xs font-black text-[#00695C] uppercase tracking-wider block">Available Free Beds</span>
            <div className="text-4xl font-black text-[#00695C]">{availableBeds}</div>
            <p className="text-[11px] text-[#00695C] font-bold">Ready for new patient intake</p>
          </div>
        </div>
      </div>

      {/* Ward, ICU, and Room Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. General Ward Capacity */}
        <div className="bg-white border-2 border-slate-200 p-5 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-xl font-bold">
              🏥
            </div>
            <div>
              <h4 className="font-black text-base text-[#263238]">General Ward</h4>
              <p className="text-xs text-slate-500 font-medium">Ward capacity</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-600">Capacity:</span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setGeneralWardBeds(Math.max(1, generalWardBeds - 1))}
                className="w-8 h-8 rounded-lg bg-slate-100 border text-slate-700 flex items-center justify-center font-bold"
              >
                -
              </button>
              <span className="text-base font-black text-[#263238]">{generalWardBeds}</span>
              <button
                type="button"
                onClick={() => setGeneralWardBeds(generalWardBeds + 1)}
                className="w-8 h-8 rounded-lg bg-[#00695C] text-white flex items-center justify-center font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* 2. Critical Care & ICU Facilities */}
        <div className="bg-white border-2 border-slate-200 p-5 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center text-xl font-bold">
              🚨
            </div>
            <div>
              <h4 className="font-black text-base text-[#263238]">ICU / Critical Care</h4>
              <p className="text-xs text-slate-500 font-medium">Equipped critical beds</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-600">ICU Beds:</span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIcuBeds(Math.max(0, icuBeds - 1))}
                className="w-8 h-8 rounded-lg bg-slate-100 border text-slate-700 flex items-center justify-center font-bold"
              >
                -
              </button>
              <span className="text-base font-black text-red-700">{icuBeds}</span>
              <button
                type="button"
                onClick={() => setIcuBeds(icuBeds + 1)}
                className="w-8 h-8 rounded-lg bg-[#00695C] text-white flex items-center justify-center font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* 3. Rooms & Oxygen Support */}
        <div className="bg-white border-2 border-slate-200 p-5 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center text-xl font-bold">
              💨
            </div>
            <div>
              <h4 className="font-black text-base text-[#263238]">Oxygen Cylinders</h4>
              <p className="text-xs text-slate-500 font-medium">Ready cylinders</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-600">Cylinders:</span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setOxygenCylinders(Math.max(0, oxygenCylinders - 1))}
                className="w-8 h-8 rounded-lg bg-slate-100 border text-slate-700 flex items-center justify-center font-bold"
              >
                -
              </button>
              <span className="text-base font-black text-cyan-800">{oxygenCylinders}</span>
              <button
                type="button"
                onClick={() => setOxygenCylinders(oxygenCylinders + 1)}
                className="w-8 h-8 rounded-lg bg-[#00695C] text-white flex items-center justify-center font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Big Action Save Footer */}
      <div className="bg-slate-100 border-2 border-slate-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate-600">
          💡 Changes take effect immediately across all citizen search filters and inter-facility referral checks.
        </span>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="w-full sm:w-auto px-8 py-3.5 bg-[#00695C] hover:bg-[#004D40] text-white font-black text-xs rounded-xl shadow flex items-center justify-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>SAVE BED AVAILABILITY</span>
        </button>
      </div>
    </div>
  );
};
