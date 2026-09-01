import React, { useState } from 'react';
import {
  Pill,
  AlertTriangle,
  CheckCircle2,
  Search,
  Package,
  Clock,
  ShieldAlert,
  Flame,
  Plus
} from 'lucide-react';
import { PhcMedicine } from '../../types';

interface PharmacyFulfillmentViewProps {
  onRefreshData?: () => void;
}

export const PharmacyFulfillmentView: React.FC<PharmacyFulfillmentViewProps> = ({ onRefreshData }) => {
  const [medicines, setMedicines] = useState<Array<{ id: number; name: string; category: string; stock: number; status: 'AVAILABLE' | 'LOW' | 'OUT'; isEmergency: boolean }>>([
    { id: 1, name: 'Tab Sorbitrate (Isosorbide Dinitrate) 5mg', category: 'Cardiovascular', stock: 12, status: 'LOW', isEmergency: true },
    { id: 2, name: 'Tab Aspirin 300mg Chewable (Soluble)', category: 'Antiplatelet', stock: 140, status: 'AVAILABLE', isEmergency: true },
    { id: 3, name: 'IV Normal Saline 500ml 0.9% NaCl', category: 'IV Fluids', stock: 18, status: 'LOW', isEmergency: true },
    { id: 4, name: 'Inj Atropine Sulfate 0.6mg/ml', category: 'Emergency Resuscitation', stock: 45, status: 'AVAILABLE', isEmergency: true },
    { id: 5, name: 'Inj Morphine Sulfate 10mg/ml', category: 'Analgesic', stock: 0, status: 'OUT', isEmergency: true },
    { id: 6, name: 'Tab Paracetamol 500mg / 650mg', category: 'Analgesic / Antipyretic', stock: 680, status: 'AVAILABLE', isEmergency: false },
    { id: 7, name: 'Tab Amlodipine 5mg / Telmisartan 40mg', category: 'Antihypertensive', stock: 240, status: 'AVAILABLE', isEmergency: false }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [dispenseSuccessMsg, setDispenseSuccessMsg] = useState('');

  const filteredMeds = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDispenseEmergencyStat = (med: any) => {
    setMedicines(medicines.map((m) => (m.id === med.id ? { ...m, stock: Math.max(0, m.stock - 1) } : m)));
    setDispenseSuccessMsg(`✓ Stat Dose for ${med.name} dispensed for Active Emergency Case!`);
    setTimeout(() => setDispenseSuccessMsg(''), 4000);
  };

  const handleRestock = (medId: number) => {
    setMedicines(medicines.map((m) => (m.id === medId ? { ...m, stock: m.stock + 50, status: 'AVAILABLE' } : m)));
    setDispenseSuccessMsg(`✓ 50 units added to ${medicines.find((m) => m.id === medId)?.name}!`);
    setTimeout(() => setDispenseSuccessMsg(''), 3000);
  };

  const outOfStockCount = medicines.filter((m) => m.status === 'OUT').length;
  const lowStockCount = medicines.filter((m) => m.status === 'LOW').length;

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl border border-blue-200 font-black">
            <Pill className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-[#263238]">💊 Pharmacy Inventory & Dispensing</h2>
              <span className="px-2.5 py-0.5 bg-blue-600 text-white rounded-full text-xs font-bold">
                PRESCRIPTION VERIFIER READY
              </span>
            </div>
            <p className="text-xs text-[#607D8B] font-semibold">Real-Time Stock Availability & Emergency Dispensing Queue</p>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search medicine stock..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
          />
        </div>
      </div>

      {dispenseSuccessMsg && (
        <div className="bg-[#E0F2F1] border-2 border-[#00695C] p-4 rounded-2xl flex items-center space-x-2 text-xs font-black text-[#00695C] shadow-md animate-in slide-in-from-top">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{dispenseSuccessMsg}</span>
        </div>
      )}

      {/* 🚨 ACTIVE EMERGENCY MEDICINE FLAG CARD */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-red-950 text-white p-5 rounded-3xl border-2 border-red-600 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-amber-400 animate-bounce" />
            <h4 className="font-black text-sm text-amber-300 uppercase tracking-wider">
              🚨 ACTIVE EMERGENCY DISPENSING FLAG
            </h4>
          </div>
          <span className="px-2.5 py-0.5 bg-red-600 text-white font-black text-[10px] rounded-full uppercase animate-pulse">
            HIGH PRIORITY
          </span>
        </div>

        <div className="p-3 bg-red-950/80 rounded-2xl border border-red-500/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-black text-white block">Rahul Kumar (42y) • Acute Cardiac Angina</span>
            <span className="text-red-200">Required: <strong>Tab Sorbitrate 5mg (Sublingual)</strong> + <strong>Aspirin 300mg</strong></span>
          </div>
          <button
            type="button"
            onClick={() => handleDispenseEmergencyStat(medicines[0])}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow transition-transform active:scale-95"
          >
            ⚡ DISPENSE STAT DOSE
          </button>
        </div>
      </div>

      {/* Summary Inventory Counters */}
      <div className="grid grid-cols-3 gap-3 text-xs font-black text-center">
        <div className="bg-red-50 border-2 border-red-300 p-3.5 rounded-2xl text-red-950">
          <span className="block text-[10px] text-red-700 uppercase">🔴 Out of Stock</span>
          <span className="text-2xl font-black text-red-600">0{outOfStockCount}</span>
        </div>
        <div className="bg-amber-50 border-2 border-amber-300 p-3.5 rounded-2xl text-amber-950">
          <span className="block text-[10px] text-amber-700 uppercase">🟠 Low Stock</span>
          <span className="text-2xl font-black text-amber-700">0{lowStockCount}</span>
        </div>
        <div className="bg-emerald-50 border-2 border-emerald-300 p-3.5 rounded-2xl text-emerald-950">
          <span className="block text-[10px] text-emerald-700 uppercase">🟢 Normal Stock</span>
          <span className="text-2xl font-black text-emerald-700">0{medicines.length - outOfStockCount - lowStockCount}</span>
        </div>
      </div>

      {/* Medicines Inventory List */}
      <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-black text-sm text-[#263238] uppercase tracking-wider">
            Pharmacy Formulary & Live Stock Check ({filteredMeds.length})
          </h3>
          <span className="text-xs text-slate-500 font-bold">Auto-Sync with Doctor E-Prescription</span>
        </div>

        <div className="space-y-3">
          {filteredMeds.map((med) => {
            const isOut = med.status === 'OUT';
            const isLow = med.status === 'LOW';

            return (
              <div
                key={med.id}
                className={`p-4 rounded-3xl border-2 transition-all flex flex-wrap items-center justify-between gap-3 ${
                  isOut
                    ? 'bg-red-50/60 border-red-300'
                    : isLow
                    ? 'bg-amber-50/50 border-amber-300'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                      isOut
                        ? 'bg-red-600 text-white'
                        : isLow
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-emerald-100 text-emerald-900'
                    }`}>
                      {isOut ? '🔴 OUT OF STOCK' : isLow ? '🟠 LOW STOCK' : '🟢 IN STOCK'}
                    </span>
                    <h4 className="font-black text-sm text-[#263238]">{med.name}</h4>
                  </div>
                  <span className="text-xs text-slate-500 font-bold block">{med.category}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right text-xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Stock</span>
                    <span className={`font-mono text-base font-black ${isOut ? 'text-red-600' : isLow ? 'text-amber-700' : 'text-slate-900'}`}>
                      {med.stock} Units
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRestock(med.id)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-[#E0F2F1] text-[#00695C] font-black text-xs rounded-xl border border-slate-300 transition-colors flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Restock 50</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
