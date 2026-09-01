import React, { useState, useEffect } from 'react';
import {
  Building2,
  Stethoscope,
  Users,
  Bed,
  Truck,
  Pill,
  Activity,
  FileText,
  Share2,
  Mic,
  Volume2,
  VolumeX,
  Contrast,
  Globe,
  Wifi,
  WifiOff,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Home,
  LogOut,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES } from '../../context/LanguageContext';
import { HospitalRole, HospitalResource, PhcStaffMember, PhcMedicine, DiagnosticService, EquipmentItem, MedicalSupply, Referral } from '../../types';
import { HospitalAdminDashboard } from './HospitalAdminDashboard';
import { DoctorPortalView } from './DoctorPortalView';
import { NursePortalView } from './NursePortalView';
import { DiagnosticPortalView } from './DiagnosticPortalView';
import { MedicineSupplyView } from './MedicineSupplyView';
import { AmbulanceModuleView } from './AmbulanceModuleView';
import { HospitalEmergencyControlRoom } from './HospitalEmergencyControlRoom';
import { HospitalReferralView } from './HospitalReferralView';
import { HospitalPatientRecordView } from './HospitalPatientRecordView';
import { PhcVoiceAssistant } from '../phc/PhcVoiceAssistant';

interface HospitalPortalProps {
  onSwitchToCitizenApp: () => void;
  staffUser?: any;
  onLogout?: () => void;
  initialRole?: HospitalRole;
}

const DEMO_HOSPITAL_FACILITIES = [
  { id: 1, name: 'All India Institute of Medical Sciences (AIIMS Delhi)', city: 'New Delhi', state: 'Delhi', type: 'Tertiary Care Super-Speciality Hospital' },
  { id: 5, name: 'Government General Hospital (GGH Kakinada)', city: 'Kakinada', state: 'Andhra Pradesh', type: 'Government Teaching Hospital' },
  { id: 2, name: 'Safdarjung Hospital & Medical College', city: 'New Delhi', state: 'Delhi', type: 'Government Trauma Center' },
  { id: 3, name: 'Max Super Speciality Hospital, Saket', city: 'New Delhi', state: 'Delhi', type: 'Private Super-Speciality Medical Hub' },
  { id: 7, name: 'Primary Health Centre (PHC) Peddapuram', city: 'Peddapuram', state: 'Andhra Pradesh', type: 'Primary Health Centre (PHC)' }
];

export const HospitalPortal: React.FC<HospitalPortalProps> = ({
  onSwitchToCitizenApp,
  staffUser,
  onLogout,
  initialRole = 'ADMIN'
}) => {
  const { language, setLanguage, t } = useLanguage();

  // Selected Facility
  const [selectedFacilityId, setSelectedFacilityId] = useState<number>(1);
  const selectedFacility = DEMO_HOSPITAL_FACILITIES.find((f) => f.id === selectedFacilityId) || DEMO_HOSPITAL_FACILITIES[0];

  // Active Role / Operational Sub-Portal
  const [activeRole, setActiveRole] = useState<HospitalRole>(initialRole);
  const [emergencyCount, setEmergencyCount] = useState<number>(2);

  // Accessibility State
  const [highContrast, setHighContrast] = useState(false);
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const [talkBackAudio, setTalkBackAudio] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  // Offline / Connectivity State
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lowDataMode, setLowDataMode] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(new Date().toLocaleTimeString());

  // Hospital Resources State
  const [isLoading, setIsLoading] = useState(false);
  const [resources, setResources] = useState<HospitalResource>({
    id: 1,
    hospital_id: selectedFacilityId,
    icu_beds: 12,
    general_beds: 100,
    occupied_beds: 88,
    general_ward_beds: 100,
    oxygen_cylinders: 60,
    ambulances: 5,
    doctors_on_duty: 18,
    nurses_on_duty: 32,
    icu_facility_status: 'AVAILABLE',
    opd_queue_count: 24,
    opd_queue_status: 'MODERATE',
    status: 'AVAILABLE',
    last_updated: new Date().toISOString()
  });

  const [staffList, setStaffList] = useState<PhcStaffMember[]>([]);
  const [medicinesList, setMedicinesList] = useState<PhcMedicine[]>([]);
  const [diagnosticsList, setDiagnosticsList] = useState<DiagnosticService[]>([]);
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);
  const [suppliesList, setSuppliesList] = useState<MedicalSupply[]>([]);

  // TalkBack Announcement helper
  const announceToScreenReader = (msg: string) => {
    setLiveAnnouncement(msg);
    if (talkBackAudio && 'speechSynthesis' in window) {
      try {
        const u = new SpeechSynthesisUtterance(msg);
        u.rate = 1.0;
        window.speechSynthesis.speak(u);
      } catch (e) {}
    }
  };

  const fetchHospitalData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/hospital/${selectedFacilityId}/overview`);
      if (res.ok) {
        const data = await res.json();
        if (data.resources) setResources(data.resources);
        if (data.staff) setStaffList(data.staff);
        if (data.medicines) setMedicinesList(data.medicines);
        if (data.diagnostics) setDiagnosticsList(data.diagnostics);
        if (data.equipment) setEquipmentList(data.equipment);
        if (data.supplies) setSuppliesList(data.supplies);
        if (data.emergencies) {
          const active = data.emergencies.filter((e: any) => e.status !== 'RESOLVED' && e.status !== 'CANCELLED').length;
          setEmergencyCount(active);
        }
        setLastUpdatedTime(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.warn('Network error, using offline cached hospital data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitalData();
  }, [selectedFacilityId]);

  // Real-time SSE Synchronization
  useEffect(() => {
    if (isOffline) return;

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');
      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (
            parsed.type === 'HospitalResourceUpdated' ||
            parsed.type === 'StaffUpdated' ||
            parsed.type === 'MedicineUpdated' ||
            parsed.type === 'DiagnosticUpdated' ||
            parsed.type === 'EmergencyRequestCreated' ||
            parsed.type === 'EmergencyRequestUpdated' ||
            parsed.type === 'EquipmentUpdated' ||
            parsed.type === 'SupplyUpdated' ||
            parsed.type === 'NurseTaskCreated' ||
            parsed.type === 'NurseTaskUpdated'
          ) {
            fetchHospitalData();
          }
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [isOffline, selectedFacilityId]);

  // Online / Offline Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      announceToScreenReader('Network restored. Synchronizing live hospital data.');
      fetchHospitalData();
    };
    const handleOffline = () => {
      setIsOffline(true);
      announceToScreenReader('Warning: Offline mode. Displaying cached hospital data.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleUpdateResources = async (updated: Partial<HospitalResource>) => {
    try {
      const res = await fetch(`/api/hospital/${selectedFacilityId}/resources`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.resources) setResources(data.resources);
      }
    } catch (e) {
      console.error(e);
      setResources((prev) => ({ ...prev, ...updated }));
    }
  };

  const currentDoctorName = staffUser?.name || 'Dr. Anil Kumar';
  const currentDoctorSpecialty = 'General Physician & Intensive Care';

  return (
    <div
      className={`min-h-screen bg-[#F7FAF9] text-[#263238] flex flex-col font-sans ${
        highContrast ? 'contrast-125 bg-black text-white' : ''
      }`}
    >
      {/* Screen Reader Live Region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* TOP HOSPITAL OS NAVIGATION BAR */}
      <header className="bg-white border-b-2 border-slate-200 sticky top-0 z-40 shadow-sm">
        {/* Tricolour Accent Line */}
        <div className="tricolour-strip h-1 w-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Logo & Facility Title */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onSwitchToCitizenApp}
                className="w-10 h-10 bg-[#E0F2F1] hover:bg-[#b2dfdb] text-[#00695C] rounded-xl flex items-center justify-center transition-colors shadow-sm"
                title="Switch to Citizen Portal"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="w-10 h-10 bg-[#00695C] p-2 rounded-xl text-white shadow flex items-center justify-center font-black text-xl">
                🏥
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="font-black text-base sm:text-lg text-[#263238] tracking-tight">
                    Sanjeevani Hospital OS
                  </h1>
                  <span className="text-[10px] font-black text-[#00695C] bg-[#E0F2F1] px-2 py-0.5 rounded border border-[#00695C]/20">
                    Connected Platform
                  </span>
                </div>
                <p className="text-[11px] text-[#607D8B] font-medium hidden sm:block">
                  Role-Based Hospital Operating System • National Health Stack
                </p>
              </div>
            </div>

            {/* Facility Selector Dropdown & Accessibility Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Facility Picker */}
              <div className="relative">
                <select
                  value={selectedFacilityId}
                  onChange={(e) => {
                    const nextId = parseInt(e.target.value);
                    setSelectedFacilityId(nextId);
                    announceToScreenReader(`Switched facility to ${DEMO_HOSPITAL_FACILITIES.find(f => f.id === nextId)?.name}`);
                  }}
                  className="bg-slate-100 border border-slate-300 hover:border-[#00695C] text-xs font-black text-[#263238] rounded-xl py-2 px-3 pr-8 focus:outline-none cursor-pointer"
                >
                  {DEMO_HOSPITAL_FACILITIES.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Multilingual Selector */}
              <div className="relative flex items-center bg-slate-100 border border-slate-300 rounded-xl px-2 py-1.5 text-xs font-bold">
                <Globe className="w-3.5 h-3.5 text-[#00695C] mr-1.5" />
                <select
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value as any);
                    announceToScreenReader(`Language switched to ${e.target.value}`);
                  }}
                  className="bg-transparent text-xs font-black text-[#263238] focus:outline-none cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeName} ({lang.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* High Contrast */}
              <button
                type="button"
                onClick={() => {
                  setHighContrast(!highContrast);
                  announceToScreenReader(highContrast ? 'High contrast disabled' : 'High contrast enabled');
                }}
                className={`p-2 rounded-xl border text-xs font-black transition-colors ${
                  highContrast ? 'bg-black text-yellow-300 border-yellow-300' : 'bg-slate-100 hover:bg-[#E0F2F1] text-slate-700 border-slate-300'
                }`}
                title="Toggle High Contrast"
              >
                <Contrast className="w-4 h-4" />
              </button>

              {/* TalkBack Audio */}
              <button
                type="button"
                onClick={() => {
                  const next = !talkBackAudio;
                  setTalkBackAudio(next);
                  announceToScreenReader(next ? 'TalkBack audio enabled' : 'TalkBack audio muted');
                }}
                className={`p-2 rounded-xl border text-xs font-black transition-colors ${
                  talkBackAudio ? 'bg-[#00695C] text-white border-[#00695C]' : 'bg-slate-100 hover:bg-[#E0F2F1] text-slate-700 border-slate-300'
                }`}
                title="Toggle TalkBack Voice Reader"
              >
                {talkBackAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Voice Assistant */}
              <button
                type="button"
                onClick={() => setShowVoiceAssistant(true)}
                className="px-3 py-2 bg-[#00695C] hover:bg-[#004D40] text-white rounded-xl text-xs font-black shadow flex items-center space-x-1.5 transition-all active:scale-95"
              >
                <Mic className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Voice Assistant</span>
              </button>

              {/* Citizen App Switcher */}
              <button
                type="button"
                onClick={onSwitchToCitizenApp}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#00695C] border border-[#00695C]/30 rounded-xl text-xs font-black transition-all"
              >
                👤 Citizen App
              </button>

              {/* Logout */}
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-black transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ROLE-BASED OPERATIONAL PORTAL SELECTOR TABS */}
      <nav className="bg-slate-100 border-b border-slate-300 px-4 py-2.5 overflow-x-auto scrollbar-thin">
        <div className="max-w-7xl mx-auto flex items-center space-x-2">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider pr-1 hidden lg:inline">
            PORTALS:
          </span>

          <button
            type="button"
            onClick={() => {
              setActiveRole('ADMIN');
              announceToScreenReader('Navigated to Hospital Admin Control Center');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeRole === 'ADMIN'
                ? 'bg-[#00695C] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <span>🛠️ Hospital Admin</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveRole('DOCTOR');
              announceToScreenReader('Navigated to Doctor Portal');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeRole === 'DOCTOR'
                ? 'bg-[#00695C] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <span>👨‍⚕️ Doctor Portal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveRole('NURSE');
              announceToScreenReader('Navigated to Nurse Portal');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeRole === 'NURSE'
                ? 'bg-[#00695C] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <span>👩‍⚕️ Nurse Portal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveRole('DIAGNOSTIC');
              announceToScreenReader('Navigated to Diagnostic & Lab Portal');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeRole === 'DIAGNOSTIC'
                ? 'bg-[#00695C] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <span>🧪 Diagnostic & Lab</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveRole('SUPPLY');
              announceToScreenReader('Navigated to Medicine & Supply Module');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeRole === 'SUPPLY'
                ? 'bg-[#00695C] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <span>💊 Medicine / Supply</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveRole('AMBULANCE');
              announceToScreenReader('Navigated to Ambulance Fleet');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeRole === 'AMBULANCE'
                ? 'bg-[#00695C] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <span>🚑 Ambulance Fleet</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveRole('EMERGENCY');
              announceToScreenReader('Navigated to Emergency Control Room');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeRole === 'EMERGENCY'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
            }`}
          >
            <span>🚨 Emergency Room</span>
            {emergencyCount > 0 && (
              <span className="w-4 h-4 bg-white text-red-700 rounded-full text-[9px] flex items-center justify-center font-black">
                {emergencyCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveRole('REFERRAL');
              announceToScreenReader('Navigated to Referral Center');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeRole === 'REFERRAL'
                ? 'bg-[#00695C] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <span>📋 Referral Center</span>
          </button>
        </div>
      </nav>

      {/* CONNECTIVITY / OFFLINE CACHE BANNER */}
      <div className="bg-white border-b border-slate-200 px-4 py-1.5 text-xs text-[#607D8B] flex flex-wrap items-center justify-between gap-2 shadow-inner">
        <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            {isOffline ? (
              <span className="flex items-center space-x-1 text-red-600 font-bold">
                <WifiOff className="w-3.5 h-3.5" />
                <span>OFFLINE CACHE MODE • Last Updated: {lastUpdatedTime}</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-emerald-700 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>LIVE SSE GRID ACTIVE • Real-time Data Synced with Central Health Stack</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            <span>Active Hospital: <strong>{selectedFacility.name}</strong></span>
            <button
              type="button"
              onClick={() => setLowDataMode(!lowDataMode)}
              className={`px-2 py-0.5 rounded text-[10px] font-black ${
                lowDataMode ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {lowDataMode ? '📶 Low-Data Mode ON' : '📶 Standard Mode'}
            </button>
          </div>
        </div>
      </div>

      {/* MAIN HOSPITAL OPERATIONAL BODY */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 1. 🛠️ HOSPITAL ADMIN DASHBOARD */}
        {activeRole === 'ADMIN' && (
          <HospitalAdminDashboard
            facilityId={selectedFacilityId}
            facilityName={selectedFacility.name}
            facilityCity={selectedFacility.city}
            facilityType={selectedFacility.type}
            resources={resources}
            staff={staffList}
            medicines={medicinesList}
            diagnostics={diagnosticsList}
            emergencyCount={emergencyCount}
            onUpdateResources={handleUpdateResources}
            onNavigate={(role) => setActiveRole(role)}
            onRefresh={fetchHospitalData}
            isLoading={isLoading}
          />
        )}

        {/* 2. 👨‍⚕️ DOCTOR PORTAL */}
        {activeRole === 'DOCTOR' && (
          <DoctorPortalView
            doctorName={currentDoctorName}
            doctorSpecialty={currentDoctorSpecialty}
            facilityName={selectedFacility.name}
            facilityCity={selectedFacility.city}
            resources={resources}
            emergencyCount={emergencyCount}
            onOpenEmergency={() => setActiveRole('EMERGENCY')}
            onRefreshData={fetchHospitalData}
          />
        )}

        {/* 3. 👩‍⚕️ NURSE PORTAL */}
        {activeRole === 'NURSE' && (
          <NursePortalView
            nurseName="Sister Lakshmi Devi"
            facilityName={selectedFacility.name}
            onRefresh={fetchHospitalData}
          />
        )}

        {/* 4. 🧪 DIAGNOSTIC PORTAL */}
        {activeRole === 'DIAGNOSTIC' && (
          <DiagnosticPortalView
            facilityName={selectedFacility.name}
            facilityCity={selectedFacility.city}
            diagnostics={diagnosticsList}
            equipment={equipmentList}
            onRefresh={fetchHospitalData}
          />
        )}

        {/* 5. 💊 MEDICINE / SUPPLY */}
        {activeRole === 'SUPPLY' && (
          <MedicineSupplyView
            facilityName={selectedFacility.name}
            facilityCity={selectedFacility.city}
            medicines={medicinesList}
            supplies={suppliesList}
            onRefresh={fetchHospitalData}
          />
        )}

        {/* 6. 🚑 AMBULANCE MODULE */}
        {activeRole === 'AMBULANCE' && (
          <AmbulanceModuleView
            facilityName={selectedFacility.name}
            facilityCity={selectedFacility.city}
            onRefresh={fetchHospitalData}
          />
        )}

        {/* 7. 🚨 EMERGENCY CONTROL ROOM */}
        {activeRole === 'EMERGENCY' && (
          <HospitalEmergencyControlRoom
            facilityId={selectedFacilityId}
            facilityName={selectedFacility.name}
            resources={resources}
            staff={staffList}
            medicines={medicinesList}
            diagnostics={diagnosticsList}
            onBack={() => setActiveRole('ADMIN')}
            onRefreshData={fetchHospitalData}
          />
        )}

        {/* 8. 📋 REFERRAL CENTER */}
        {activeRole === 'REFERRAL' && (
          <HospitalReferralView
            facilityName={selectedFacility.name}
            onBack={() => setActiveRole('ADMIN')}
          />
        )}
      </main>

      {/* Voice Assistant Modal */}
      {showVoiceAssistant && (
        <PhcVoiceAssistant
          isOpen={showVoiceAssistant}
          onClose={() => setShowVoiceAssistant(false)}
          facilityName={selectedFacility.name}
          onExecuteCommand={(action: { type: string; payload?: any }) => {
            if (action.type === 'NAVIGATE') {
              const target = action.payload?.view;
              if (target === 'emergency') setActiveRole('EMERGENCY');
              else if (target === 'beds') setActiveRole('ADMIN');
              else if (target === 'staff') setActiveRole('DOCTOR');
              else if (target === 'medicines') setActiveRole('SUPPLY');
              else if (target === 'diagnostics') setActiveRole('DIAGNOSTIC');
              else if (target === 'referrals') setActiveRole('REFERRAL');
            } else if (action.type === 'UPDATE_STATUS') {
              fetchHospitalData();
            }
          }}
        />
      )}
    </div>
  );
};
