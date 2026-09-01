import React, { useState } from 'react';
import {
  ArrowLeft,
  Stethoscope,
  Users,
  CheckCircle2,
  XCircle,
  Phone,
  Clock,
  ShieldCheck,
  Plus,
  Search
} from 'lucide-react';
import { PhcStaffMember, Doctor } from '../../types';

interface PhcStaffManagementViewProps {
  staff: PhcStaffMember[];
  doctors: Doctor[];
  onBack: () => void;
  onToggleStaffDuty: (staffId: number, currentDuty: number) => Promise<void>;
  facilityName: string;
}

export const PhcStaffManagementView: React.FC<PhcStaffManagementViewProps> = ({
  staff,
  doctors,
  onBack,
  onToggleStaffDuty,
  facilityName
}) => {
  const [filterRole, setFilterRole] = useState<'ALL' | 'DOCTOR' | 'NURSE' | 'TECHNICIAN'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const filteredStaff = staff.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.role_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (s.specialty && s.specialty.toLowerCase().includes(searchTerm.toLowerCase()));
    if (!matchesSearch) return false;
    if (filterRole === 'DOCTOR') return s.role_title.includes('Doctor') || s.role_title.includes('Physician');
    if (filterRole === 'NURSE') return s.role_title.includes('Nurse');
    if (filterRole === 'TECHNICIAN') return s.role_title.includes('Technician') || s.role_title.includes('Pharmacist');
    return true;
  });

  const handleToggle = async (staffId: number, currentDuty: number) => {
    setTogglingId(staffId);
    try {
      await onToggleStaffDuty(staffId, currentDuty);
    } catch (e) {
      alert('Failed to update duty status.');
    } finally {
      setTogglingId(null);
    }
  };

  const docsOnDuty = staff.filter((s) => s.is_on_duty === 1 && (s.role_title.includes('Doctor') || s.role_title.includes('Physician'))).length;
  const nursesOnDuty = staff.filter((s) => s.is_on_duty === 1 && s.role_title.includes('Nurse')).length;

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
            <h2 className="text-xl font-black text-[#263238]">👨‍⚕️ Doctor & Staff Management</h2>
            <p className="text-xs text-[#607D8B] font-semibold">{facilityName}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-[#E0F2F1] text-[#00695C] border border-[#00695C]/30 rounded-xl text-xs font-black">
            👨‍⚕️ {docsOnDuty} Doctors on Duty
          </span>
          <span className="px-3 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-xl text-xs font-black">
            👩‍⚕️ {nursesOnDuty} Nurses on Duty
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white border-2 border-slate-200 p-4 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'DOCTOR', 'NURSE', 'TECHNICIAN'] as const).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setFilterRole(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                filterRole === role
                  ? 'bg-[#00695C] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {role === 'ALL' ? 'ALL STAFF' : role === 'DOCTOR' ? '👨‍⚕️ DOCTORS' : role === 'NURSE' ? '👩‍⚕️ NURSES' : '🧪 TECHNICIANS'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search staff by name..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 pl-9 pr-3 text-xs font-bold text-[#263238] focus:outline-none focus:border-[#00695C]"
          />
        </div>
      </div>

      {/* Staff Members List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStaff.map((person) => {
          const isOnDuty = person.is_on_duty === 1;
          const isDoc = person.role_title.includes('Doctor') || person.role_title.includes('Physician');
          const isNurse = person.role_title.includes('Nurse');

          return (
            <div
              key={person.id}
              className={`bg-white border-2 p-5 rounded-3xl shadow-sm flex flex-col justify-between space-y-4 transition-all ${
                isOnDuty ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200 bg-slate-50/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black ${
                    isDoc ? 'bg-blue-100 text-blue-800' : isNurse ? 'bg-teal-100 text-teal-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {isDoc ? '👨‍⚕️' : isNurse ? '👩‍⚕️' : '🧪'}
                  </div>
                  <div>
                    <h4 className="font-black text-base text-[#263238]">{person.name}</h4>
                    <p className="text-xs font-bold text-[#00695C]">{person.role_title}</p>
                    {person.specialty && (
                      <span className="text-[11px] text-slate-500 font-semibold block">
                        Specialty: {person.specialty}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Badge with Icon + Text + Pattern */}
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-black border flex items-center space-x-1 ${
                  isOnDuty
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-400'
                    : 'bg-red-50 text-red-800 border-red-300'
                }`}>
                  {isOnDuty ? <span>🟢 ✓ ON DUTY</span> : <span>🔴 ✕ ABSENT</span>}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100 gap-2">
                <div className="flex items-center space-x-3 text-[11px] font-bold text-slate-500">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Shift: {person.shift || 'Morning'}</span>
                  </span>
                  {person.phone && (
                    <span className="flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{person.phone}</span>
                    </span>
                  )}
                </div>

                {/* Big Duty Toggle Button */}
                <button
                  type="button"
                  onClick={() => handleToggle(person.id, person.is_on_duty)}
                  disabled={togglingId === person.id}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95 shadow-sm flex items-center space-x-1.5 ${
                    isOnDuty
                      ? 'bg-red-100 hover:bg-red-200 text-red-800 border border-red-300'
                      : 'bg-[#00695C] hover:bg-[#004D40] text-white'
                  }`}
                  aria-label={`Toggle duty status for ${person.name}. Currently ${isOnDuty ? 'On Duty' : 'Absent'}`}
                >
                  {isOnDuty ? (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      <span>MARK ABSENT</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>SET ON DUTY</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
