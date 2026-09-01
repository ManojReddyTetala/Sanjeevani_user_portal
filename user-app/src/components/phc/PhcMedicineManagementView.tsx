import React, { useState } from 'react';
import {
  ArrowLeft,
  Pill,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  RefreshCw,
  Plus
} from 'lucide-react';
import { PhcMedicine } from '../../types';

interface PhcMedicineManagementViewProps {
  medicines: PhcMedicine[];
  onBack: () => void;
  onUpdateMedicineStatus: (medId: number, status: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE', stockLevel: string) => Promise<void>;
  facilityName: string;
}

export const PhcMedicineManagementView: React.FC<PhcMedicineManagementViewProps> = ({
  medicines,
  onBack,
  onUpdateMedicineStatus,
  facilityName
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const filteredMeds = medicines.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = async (medId: number, status: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE', stock: string) => {
    setUpdatingId(medId);
    try {
      await onUpdateMedicineStatus(medId, status, stock);
    } catch (e) {
      alert('Failed to update medicine stock.');
    } finally {
      setUpdatingId(null);
    }
  };

  const availableCount = medicines.filter((m) => m.status === 'AVAILABLE').length;
  const lowCount = medicines.filter((m) => m.status === 'LIMITED').length;
  const outCount = medicines.filter((m) => m.status === 'UNAVAILABLE').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between bg-white border-2 border-slate-200 p-4 rounded-2xl shadow-sm gap-3">
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
            <h2 className="text-xl font-black text-[#263238]">💊 Medicine & Supply Management</h2>
            <p className="text-xs text-[#607D8B] font-semibold">{facilityName}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-black">
            🟢 ✓ {availableCount} In Stock
          </span>
          <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-xl text-xs font-black">
            🟠 ! {lowCount} Low Stock
          </span>
          <span className="px-3 py-1 bg-red-50 text-red-800 border border-red-300 rounded-xl text-xs font-black">
            🔴 ✕ {outCount} Out of Stock
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white border-2 border-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-between">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search essential medicine by name or category (e.g. Paracetamol, Insulin, ORS)..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 pl-9 pr-4 text-xs font-bold text-[#263238] focus:outline-none focus:border-[#00695C]"
          />
        </div>
      </div>

      {/* Medicines 3-State Controls Cards */}
      <div className="space-y-3">
        {filteredMeds.map((med) => {
          const isAvail = med.status === 'AVAILABLE';
          const isLow = med.status === 'LIMITED';
          const isOut = med.status === 'UNAVAILABLE';

          return (
            <div
              key={med.id}
              className={`bg-white border-2 p-4 sm:p-5 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                isAvail ? 'border-emerald-300' : isLow ? 'border-amber-300' : 'border-red-300'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                  isAvail ? 'bg-emerald-100 text-emerald-800' : isLow ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                }`}>
                  💊
                </div>
                <div>
                  <h4 className="font-black text-base text-[#263238]">{med.name}</h4>
                  <span className="text-xs font-bold text-[#00695C] block">{med.category}</span>
                  <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">
                    Stock Level: <strong>{med.stock_level || (isAvail ? 'Adequate' : isLow ? 'Low Stock' : 'Out of Stock')}</strong>
                  </span>
                </div>
              </div>

              {/* 3 Large Accessible Tap Buttons (Available, Low Stock, Unavailable) */}
              <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => handleStatusChange(med.id, 'AVAILABLE', 'Adequate')}
                  disabled={updatingId === med.id}
                  className={`py-3 px-3.5 rounded-2xl text-xs font-black border-2 transition-all flex flex-col items-center justify-center space-y-1 active:scale-95 ${
                    isAvail
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-800'
                  }`}
                  aria-label={`Mark ${med.name} as Available`}
                >
                  <span className="text-sm font-black">🟢 ✓</span>
                  <span className="text-[10px] uppercase">AVAILABLE</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(med.id, 'LIMITED', 'Low Stock')}
                  disabled={updatingId === med.id}
                  className={`py-3 px-3.5 rounded-2xl text-xs font-black border-2 transition-all flex flex-col items-center justify-center space-y-1 active:scale-95 ${
                    isLow
                      ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-300'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50 hover:text-amber-800'
                  }`}
                  aria-label={`Mark ${med.name} as Low Stock`}
                >
                  <span className="text-sm font-black">🟠 !</span>
                  <span className="text-[10px] uppercase">LOW STOCK</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(med.id, 'UNAVAILABLE', 'Out of Stock')}
                  disabled={updatingId === med.id}
                  className={`py-3 px-3.5 rounded-2xl text-xs font-black border-2 transition-all flex flex-col items-center justify-center space-y-1 active:scale-95 ${
                    isOut
                      ? 'bg-red-600 text-white border-red-700 shadow-md ring-2 ring-red-300'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-red-50 hover:text-red-800'
                  }`}
                  aria-label={`Mark ${med.name} as Unavailable`}
                >
                  <span className="text-sm font-black">🔴 ✕</span>
                  <span className="text-[10px] uppercase">OUT OF STOCK</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
