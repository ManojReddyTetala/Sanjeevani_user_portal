import React, { useState } from 'react';
import {
  Pill,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  RefreshCw,
  Search,
  Package,
  Layers,
  ShieldAlert
} from 'lucide-react';
import { PhcMedicine, MedicalSupply } from '../../types';

interface MedicineSupplyViewProps {
  facilityName: string;
  facilityCity: string;
  medicines: PhcMedicine[];
  supplies: MedicalSupply[];
  onRefresh?: () => void;
}

export const MedicineSupplyView: React.FC<MedicineSupplyViewProps> = ({
  facilityName,
  facilityCity,
  medicines: initialMedicines,
  supplies: initialSupplies,
  onRefresh
}) => {
  const [medicinesList, setMedicinesList] = useState<PhcMedicine[]>(
    initialMedicines && initialMedicines.length > 0
      ? initialMedicines
      : [
          { id: 1, hospital_id: 1, name: 'Paracetamol 500mg Tablets', category: 'Analgesics / Antipyretic', status: 'AVAILABLE', stock_level: 'Adequate', last_updated: new Date().toISOString() },
          { id: 2, hospital_id: 1, name: 'Amoxicillin 500mg Capsules', category: 'Antibiotics', status: 'AVAILABLE', stock_level: 'Adequate', last_updated: new Date().toISOString() },
          { id: 3, hospital_id: 1, name: 'ORS (Oral Rehydration Salts)', category: 'Electrolytes', status: 'AVAILABLE', stock_level: 'Adequate', last_updated: new Date().toISOString() },
          { id: 4, hospital_id: 1, name: 'Human Insulin Regular 40 IU/ml', category: 'Diabetes / Endocrine', status: 'LIMITED', stock_level: 'Low Stock', last_updated: new Date().toISOString() },
          { id: 5, hospital_id: 1, name: 'Cetirizine 10mg Tablets', category: 'Antihistamines', status: 'AVAILABLE', stock_level: 'Adequate', last_updated: new Date().toISOString() },
          { id: 6, hospital_id: 1, name: 'Azithromycin 500mg Tablets', category: 'Antibiotics', status: 'UNAVAILABLE', stock_level: 'Out of Stock', last_updated: new Date().toISOString() },
          { id: 7, hospital_id: 1, name: 'Amlodipine 5mg Tablets', category: 'Cardiac / Hypertension', status: 'AVAILABLE', stock_level: 'Adequate', last_updated: new Date().toISOString() }
        ]
  );

  const [suppliesList, setSuppliesList] = useState<MedicalSupply[]>(
    initialSupplies && initialSupplies.length > 0
      ? initialSupplies
      : [
          { id: 1, hospital_id: 1, name: 'Oxygen Cylinders (Type D 46.7L)', category: 'Respiratory', quantity: 60, unit: 'cylinders', status: 'AVAILABLE', stock_level: 'Adequate', last_updated: new Date().toISOString() },
          { id: 2, hospital_id: 1, name: 'IV Normal Saline 500ml', category: 'Infusion', quantity: 340, unit: 'bottles', status: 'AVAILABLE', stock_level: 'Adequate', last_updated: new Date().toISOString() },
          { id: 3, hospital_id: 1, name: 'Sterile Surgical Gloves', category: 'Consumables', quantity: 850, unit: 'pairs', status: 'AVAILABLE', stock_level: 'Adequate', last_updated: new Date().toISOString() },
          { id: 4, hospital_id: 1, name: 'Suture Packs (Vicryl / Silk)', category: 'Surgical', quantity: 180, unit: 'packs', status: 'LIMITED', stock_level: 'Low Stock', last_updated: new Date().toISOString() }
        ]
  );

  const [activeSubTab, setActiveSubTab] = useState<'medicines' | 'supplies'>('medicines');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const handleToggleMedicineStatus = async (medId: number) => {
    const next = medicinesList.map((m) => {
      if (m.id === medId) {
        const nextStat = m.status === 'AVAILABLE' ? 'LIMITED' : m.status === 'LIMITED' ? 'UNAVAILABLE' : 'AVAILABLE';
        const stockLvl = nextStat === 'AVAILABLE' ? 'Adequate' : nextStat === 'LIMITED' ? 'Low Stock' : 'Out of Stock';
        return { ...m, status: nextStat as any, stock_level: stockLvl };
      }
      return m;
    });
    setMedicinesList(next);

    const changed = next.find((m) => m.id === medId);
    if (changed) {
      try {
        await fetch(`/api/phc/1/medicines/${medId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: changed.status, stock_level: changed.stock_level })
        });
        setSuccessBanner(`Updated ${changed.name} stock level to ${changed.status}`);
        setTimeout(() => setSuccessBanner(null), 3000);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleToggleSupplyStatus = async (supId: number) => {
    const next = suppliesList.map((s) => {
      if (s.id === supId) {
        const nextStat = s.status === 'AVAILABLE' ? 'LIMITED' : s.status === 'LIMITED' ? 'UNAVAILABLE' : 'AVAILABLE';
        const stockLvl = nextStat === 'AVAILABLE' ? 'Adequate' : nextStat === 'LIMITED' ? 'Low Stock' : 'Out of Stock';
        return { ...s, status: nextStat as any, stock_level: stockLvl };
      }
      return s;
    });
    setSuppliesList(next);

    const changed = next.find((s) => s.id === supId);
    if (changed) {
      try {
        await fetch(`/api/hospital/1/supplies/${supId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: changed.status, stock_level: changed.stock_level })
        });
        setSuccessBanner(`Updated ${changed.name} to ${changed.status}`);
        setTimeout(() => setSuccessBanner(null), 3000);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Profile */}
      <div className="bg-gradient-to-r from-emerald-700 to-[#00695C] text-white p-6 rounded-3xl shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black shadow-inner border border-white/30">
            💊
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-200 bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-400/30">
                💊 MEDICINE & SUPPLY MODULE
              </span>
              <span className="text-xs text-emerald-100">• {facilityName}</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">Pharmacy & Medical Supply Control</h2>
            <p className="text-xs text-emerald-100 font-medium">
              Live inventory tracking of essential pharmaceuticals, oxygen cylinders & surgical consumables.
            </p>
          </div>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center space-x-2 bg-black/20 p-1.5 rounded-2xl border border-white/20">
          <button
            type="button"
            onClick={() => setActiveSubTab('medicines')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              activeSubTab === 'medicines' ? 'bg-white text-[#00695C] shadow' : 'text-emerald-100 hover:text-white'
            }`}
          >
            💊 Medicine Stock ({medicinesList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('supplies')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              activeSubTab === 'supplies' ? 'bg-white text-[#00695C] shadow' : 'text-emerald-100 hover:text-white'
            }`}
          >
            📦 Medical Supplies ({suppliesList.length})
          </button>
        </div>
      </div>

      {successBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* MEDICINE STOCK VIEW */}
      {activeSubTab === 'medicines' && (
        <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-black text-[#263238] uppercase tracking-wider">
                💊 Essential Medicine Stock Registry
              </h3>
              <p className="text-xs text-[#607D8B]">Tap status button to cycle Green (Available) / Orange (Low) / Red (Out of Stock)</p>
            </div>
            <button
              type="button"
              onClick={onRefresh}
              className="p-2 bg-slate-100 hover:bg-[#E0F2F1] rounded-xl text-slate-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {medicinesList.map((med) => (
              <div
                key={med.id}
                className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-center justify-between gap-3 hover:border-[#00695C] transition-all"
              >
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-[#263238]">{med.name}</h4>
                  <span className="text-[10px] text-slate-500 font-bold block">{med.category} • Level: {med.stock_level}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleMedicineStatus(med.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer active:scale-95 ${
                    med.status === 'AVAILABLE'
                      ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300'
                      : med.status === 'LIMITED'
                      ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
                      : 'bg-rose-100 hover:bg-rose-200 text-rose-900 border-rose-300'
                  }`}
                >
                  {med.status === 'AVAILABLE' ? '🟢 AVAILABLE' : med.status === 'LIMITED' ? '🟠 LOW STOCK' : '🔴 UNAVAILABLE'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MEDICAL SUPPLIES VIEW */}
      {activeSubTab === 'supplies' && (
        <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-black text-[#263238] uppercase tracking-wider">
                📦 Critical Medical Supplies & Consumables
              </h3>
              <p className="text-xs text-[#607D8B]">Oxygen cylinders, IV fluids, PPE kits & surgical consumables</p>
            </div>
            <button
              type="button"
              onClick={onRefresh}
              className="p-2 bg-slate-100 hover:bg-[#E0F2F1] rounded-xl text-slate-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suppliesList.map((sup) => (
              <div
                key={sup.id}
                className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-center justify-between gap-3 hover:border-[#00695C] transition-all"
              >
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-[#263238]">{sup.name}</h4>
                  <span className="text-[10px] text-slate-500 font-bold block">
                    {sup.category} • Quantity: {sup.quantity} {sup.unit} ({sup.stock_level})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleSupplyStatus(sup.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer active:scale-95 ${
                    sup.status === 'AVAILABLE'
                      ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300'
                      : sup.status === 'LIMITED'
                      ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
                      : 'bg-rose-100 hover:bg-rose-200 text-rose-900 border-rose-300'
                  }`}
                >
                  {sup.status === 'AVAILABLE' ? '🟢 AVAILABLE' : sup.status === 'LIMITED' ? '🟠 LIMITED' : '🔴 UNAVAILABLE'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
