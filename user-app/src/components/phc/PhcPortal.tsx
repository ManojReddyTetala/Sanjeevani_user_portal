import React, { useState, useEffect } from 'react';
import {
  Building2,
  Stethoscope,
  Bed,
  Pill,
  Activity,
  Users,
  QrCode,
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
  LogOut
} from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES } from '../../context/LanguageContext';
import { HospitalResource, PhcStaffMember, PhcMedicine, DiagnosticService, Referral } from '../../types';
import { PhcDashboardView } from './PhcDashboardView';
import { PhcEmergencyControlRoom } from './PhcEmergencyControlRoom';
import { PhcBedManagementView } from './PhcBedManagementView';
import { PhcStaffManagementView } from './PhcStaffManagementView';
import { PhcMedicineManagementView } from './PhcMedicineManagementView';
import { PhcDiagnosticManagementView } from './PhcDiagnosticManagementView';
import { PhcQueueManagementView } from './PhcQueueManagementView';
import { PhcPatientRecordView } from './PhcPatientRecordView';
import { PhcReferralView } from './PhcReferralView';
import { PhcVoiceAssistant } from './PhcVoiceAssistant';

interface PhcPortalProps {
  onSwitchToCitizenApp: () => void;
  staffUser?: any;
  onLogout?: () => void;
}

const DEMO_PHC_FACILITIES = [
  { id: 7, name: 'Primary Health Centre (PHC) Peddapuram', city: 'Peddapuram', state: 'Andhra Pradesh', type: 'Primary Health Centre (PHC)' },
  { id: 4, name: 'Community Health Centre (CHC) Ballabhgarh', city: 'Faridabad', state: 'Haryana', type: 'Primary Health Centre (PHC / CHC)' },
  { id: 5, name: 'Government General Hospital (GGH Kakinada)', city: 'Kakinada', state: 'Andhra Pradesh', type: 'Government Teaching Hospital' }
];

export const PhcPortal: React.FC<PhcPortalProps> = ({
  onSwitchToCitizenApp,
  staffUser,
  onLogout
}) => {
  const { language, setLanguage, t } = useLanguage();

  // Selected Facility
  const [selectedFacilityId, setSelectedFacilityId] = useState<number>(7);
  const selectedFacility = DEMO_PHC_FACILITIES.find((f) => f.id === selectedFacilityId) || DEMO_PHC_FACILITIES[0];

  // Active PHC Navigation Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'emergency' | 'beds' | 'staff' | 'medicines' | 'diagnostics' | 'queue' | 'patient' | 'referrals'>('dashboard');
  const [emergencyCount, setEmergencyCount] = useState<number>(2);

  // Accessibility State
  const [highContrast, setHighContrast] = useState(false);
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const [talkBackAudio, setTalkBackAudio] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  // Offline / Connectivity State
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  // PHC Operational State
  const [isLoading, setIsLoading] = useState(false);
  const [resources, setResources] = useState<HospitalResource>({
    id: 1,
    hospital_id: selectedFacilityId,
    icu_beds: 0,
    general_beds: 12,
    occupied_beds: 4,
    general_ward_beds: 12,
    oxygen_cylinders: 5,
    ambulances: 1,
    doctors_on_duty: 3,
    nurses_on_duty: 5,
    icu_facility_status: 'LIMITED',
    opd_queue_count: 8,
    opd_queue_status: 'SHORT',
    status: 'AVAILABLE',
    last_updated: new Date().toISOString()
  });

  const [staffList, setStaffList] = useState<PhcStaffMember[]>([
    { id: 1, hospital_id: selectedFacilityId, name: 'Dr. Sunita Rani', role_title: 'General Physician', specialty: 'General Medicine', is_on_duty: 1, shift: 'Morning' },
    { id: 2, hospital_id: selectedFacilityId, name: 'Dr. K. Venkatesh', role_title: 'Specialist Doctor', specialty: 'Pediatrics', is_on_duty: 0, shift: 'Evening' },
    { id: 3, hospital_id: selectedFacilityId, name: 'Sister Lakshmi Devi', role_title: 'Staff Nurse', specialty: 'Maternal & Child Care', is_on_duty: 1, shift: 'Morning' },
    { id: 4, hospital_id: selectedFacilityId, name: 'Sister Anita Roy', role_title: 'Staff Nurse', specialty: 'Emergency & Triage', is_on_duty: 1, shift: 'Morning' },
    { id: 5, hospital_id: selectedFacilityId, name: 'P. Raju', role_title: 'Lab Technician', specialty: 'Pathology', is_on_duty: 1, shift: 'Morning' },
    { id: 6, hospital_id: selectedFacilityId, name: 'M. Sridhar', role_title: 'Pharmacist', specialty: 'Dispensary', is_on_duty: 1, shift: 'Morning' }
  ]);

  const [medicinesList, setMedicinesList] = useState<PhcMedicine[]>([
    { id: 1, hospital_id: selectedFacilityId, name: 'Paracetamol 500mg Tablets', category: 'Analgesics / Antipyretic', status: 'AVAILABLE', stock_level: 'Adequate', last_updated: new Date().toISOString() },
    { id: 2, hospital_id: selectedFacilityId, name: 'Amoxicillin 500mg Capsules', category: 'Antibiotics', status: 'AVAILABLE', stock_level: 'Adequate', last_updated: new Date().toISOString() },
    { id: 3, hospital_id: selectedFacilityId, name: 'ORS (Oral Rehydration Salts)', category: 'Electrolytes / Dehydration', status: 'AVAILABLE', stock_level: 'Adequate', last_updated: new Date().toISOString() },
    { id: 4, hospital_id: selectedFacilityId, name: 'Human Insulin Regular 40 IU/ml', category: 'Diabetes / Endocrine', status: 'LIMITED', stock_level: 'Low Stock', last_updated: new Date().toISOString() },
    { id: 5, hospital_id: selectedFacilityId, name: 'Cetirizine 10mg Tablets', category: 'Antihistamines', status: 'AVAILABLE', stock_level: 'Adequate', last_updated: new Date().toISOString() },
    { id: 6, hospital_id: selectedFacilityId, name: 'Metformin 500mg Tablets', category: 'Oral Hypoglycemic', status: 'AVAILABLE', stock_level: 'Adequate', last_updated: new Date().toISOString() },
    { id: 7, hospital_id: selectedFacilityId, name: 'Iron & Folic Acid (IFA) Tablets', category: 'Maternal Health', status: 'AVAILABLE', stock_level: 'Adequate', last_updated: new Date().toISOString() },
    { id: 8, hospital_id: selectedFacilityId, name: 'Azithromycin 500mg Tablets', category: 'Antibiotics', status: 'UNAVAILABLE', stock_level: 'Out of Stock', last_updated: new Date().toISOString() }
  ]);

  const [diagnosticsList, setDiagnosticsList] = useState<DiagnosticService[]>([
    { id: 1, hospital_id: selectedFacilityId, service_name: '🩸 Complete Blood Count (CBC)', category: 'Pathology', status: 'AVAILABLE', wait_time_mins: 10, last_updated: new Date().toISOString() },
    { id: 2, hospital_id: selectedFacilityId, service_name: '🩻 Diagnostic Digital X-Ray', category: 'Radiology', status: 'AVAILABLE', wait_time_mins: 15, last_updated: new Date().toISOString() },
    { id: 3, hospital_id: selectedFacilityId, service_name: '🫀 12-Lead ECG Screening', category: 'Cardiology', status: 'AVAILABLE', wait_time_mins: 5, last_updated: new Date().toISOString() },
    { id: 4, hospital_id: selectedFacilityId, service_name: '🧪 Urine Routine & Microscopy', category: 'Pathology', status: 'AVAILABLE', wait_time_mins: 10, last_updated: new Date().toISOString() },
    { id: 5, hospital_id: selectedFacilityId, service_name: '🩸 Blood Glucose (RBS / FBS)', category: 'Biochemistry', status: 'AVAILABLE', wait_time_mins: 5, last_updated: new Date().toISOString() }
  ]);

  const [referralsList, setReferralsList] = useState<Referral[]>([]);

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

  const fetchEmergencyCount = async () => {
    try {
      const res = await fetch(`/api/emergency/requests?facility_id=${selectedFacilityId}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const active = data.filter((d: any) => d.status !== 'RESOLVED' && d.status !== 'CANCELLED').length;
          setEmergencyCount(active);
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadPhcData();
    fetchEmergencyCount();

    const handleOnline = () => {
      setIsOffline(false);
      announceToScreenReader('Internet connected. Synchronizing offline updates.');
    };
    const handleOffline = () => {
      setIsOffline(true);
      announceToScreenReader('Operating in offline mode. Changes will cache locally.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // SSE Real-time Updates
    const es = new EventSource('/api/events');
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'ResourceUpdated' || data.type === 'QueueUpdated' || data.type === 'StaffUpdated') {
          loadPhcData();
        } else if (data.type === 'EmergencyRequestCreated') {
          fetchEmergencyCount();
          announceToScreenReader('Critical emergency alert! New patient emergency request received. Open emergency control room.');
        } else if (data.type === 'EmergencyRequestUpdated') {
          fetchEmergencyCount();
        }
      } catch (err) {}
    };

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      es.close();
    };
  }, [selectedFacilityId]);

  const loadPhcData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/phc/${selectedFacilityId}/overview`);
      if (res.ok) {
        const data = await res.json();
        if (data.resources) setResources(data.resources);
        if (data.staff && data.staff.length > 0) setStaffList(data.staff);
        if (data.medicines && data.medicines.length > 0) setMedicinesList(data.medicines);
        if (data.diagnostics && data.diagnostics.length > 0) setDiagnosticsList(data.diagnostics);
        if (data.recentReferrals) setReferralsList(data.recentReferrals);
      }
    } catch (err) {
      console.warn('Using cached PHC state due to network offline:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Save Bed / Resources
  const handleSaveResources = async (updated: Partial<HospitalResource>) => {
    const nextRes = { ...resources, ...updated };
    setResources(nextRes);

    announceToScreenReader(`Updated beds: ${nextRes.general_beds} total, ${nextRes.occupied_beds || 0} occupied.`);

    if (!isOffline) {
      try {
        await fetch(`/api/phc/${selectedFacilityId}/resources`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nextRes)
        });
      } catch (err) {
        setPendingSyncCount(pendingSyncCount + 1);
      }
    } else {
      setPendingSyncCount(pendingSyncCount + 1);
    }
  };

  // 2. Save OPD Queue
  const handleUpdateQueue = async (count: number, status: 'SHORT' | 'MODERATE' | 'LONG') => {
    setResources({ ...resources, opd_queue_count: count, opd_queue_status: status });
    announceToScreenReader(`OPD queue updated to ${count} patients. Status: ${status} queue.`);

    if (!isOffline) {
      try {
        await fetch(`/api/phc/${selectedFacilityId}/queue`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ opd_queue_count: count, opd_queue_status: status })
        });
      } catch (err) {
        setPendingSyncCount(pendingSyncCount + 1);
      }
    } else {
      setPendingSyncCount(pendingSyncCount + 1);
    }
  };

  // 3. Toggle Staff Duty
  const handleToggleStaffDuty = async (staffId: number, currentDuty: number) => {
    const nextDuty = currentDuty === 1 ? 0 : 1;
    setStaffList(staffList.map((s) => (s.id === staffId ? { ...s, is_on_duty: nextDuty } : s)));

    announceToScreenReader(`Staff duty status updated to ${nextDuty === 1 ? 'On Duty' : 'Absent'}.`);

    if (!isOffline) {
      try {
        await fetch(`/api/phc/${selectedFacilityId}/staff/${staffId}/duty`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_on_duty: nextDuty })
        });
      } catch (err) {
        setPendingSyncCount(pendingSyncCount + 1);
      }
    } else {
      setPendingSyncCount(pendingSyncCount + 1);
    }
  };

  // 4. Update Medicine Status
  const handleUpdateMedicineStatus = async (medId: number, status: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE', stockLevel: string) => {
    setMedicinesList(medicinesList.map((m) => (m.id === medId ? { ...m, status, stock_level: stockLevel } : m)));
    announceToScreenReader(`Medicine stock updated to ${status}.`);

    if (!isOffline) {
      try {
        await fetch(`/api/phc/${selectedFacilityId}/medicines/${medId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, stock_level: stockLevel })
        });
      } catch (err) {
        setPendingSyncCount(pendingSyncCount + 1);
      }
    } else {
      setPendingSyncCount(pendingSyncCount + 1);
    }
  };

  // 5. Update Diagnostic Status
  const handleUpdateDiagnosticStatus = async (diagId: number, status: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE', waitTime: number) => {
    setDiagnosticsList(diagnosticsList.map((d) => (d.id === diagId ? { ...d, status, wait_time_mins: waitTime } : d)));
    announceToScreenReader(`Diagnostic service updated to ${status}.`);

    if (!isOffline) {
      try {
        await fetch(`/api/phc/${selectedFacilityId}/diagnostics/${diagId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, wait_time_mins: waitTime })
        });
      } catch (err) {
        setPendingSyncCount(pendingSyncCount + 1);
      }
    } else {
      setPendingSyncCount(pendingSyncCount + 1);
    }
  };

  // Handle Voice Assistant Command
  const handleExecuteVoiceCommand = (action: { type: string; payload?: any }) => {
    if (action.type === 'NAVIGATE') {
      setActiveTab(action.payload);
    } else if (action.type === 'UPDATE_BEDS') {
      const avail = action.payload.available_beds;
      const total = Math.max(avail, resources.general_beds || 12);
      handleSaveResources({ general_beds: total, occupied_beds: total - avail });
    } else if (action.type === 'UPDATE_QUEUE') {
      const count = action.payload.count;
      handleUpdateQueue(count, count <= 10 ? 'SHORT' : count <= 30 ? 'MODERATE' : 'LONG');
    }
  };

  return (
    <div className={`min-h-screen bg-[#F7FAF9] text-[#263238] flex flex-col font-sans ${highContrast ? 'contrast-150 bg-white' : ''}`}>
      {/* Hidden Live Region for Screen Readers / TalkBack */}
      <div className="sr-only" role="status" aria-live="assertive">
        {liveAnnouncement}
      </div>

      {/* Top Operational PHC Header */}
      <header className="bg-white border-b-2 border-slate-200 sticky top-0 z-30 shadow-sm">
        {/* Tricolour Accent Line */}
        <div className="tricolour-strip h-1" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Facility Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#00695C] rounded-2xl text-white flex items-center justify-center font-black shadow-sm">
              🏥
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-black text-base sm:text-lg text-[#263238] tracking-tight">
                  PHC Operational Portal
                </h1>
                <span className="text-[10px] font-extrabold bg-[#E0F2F1] text-[#00695C] px-2 py-0.5 rounded border border-[#00695C]/20">
                  STAFF MODE
                </span>
              </div>
              <p className="text-[11px] text-[#607D8B] font-semibold">
                Healthcare Provider Resource & Queue Management
              </p>
            </div>
          </div>

          {/* Accessibility & Voice Control Suite */}
          <div className="flex flex-wrap items-center space-x-1.5 sm:space-x-2">
            {/* Voice Assistant Trigger */}
            <button
              type="button"
              onClick={() => setShowVoiceAssistant(true)}
              className="px-3 py-2 bg-[#00695C] hover:bg-[#004D40] text-white rounded-xl text-xs font-black shadow-sm flex items-center space-x-1.5 active:scale-95 transition-transform"
              aria-label="Open Voice Assistant for hands-free voice commands"
            >
              <Mic className="w-4 h-4 text-emerald-200 animate-pulse" />
              <span className="hidden sm:inline">VOICE ASSISTANT</span>
            </button>

            {/* TalkBack Audio Feedback Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !talkBackAudio;
                setTalkBackAudio(next);
                announceToScreenReader(`Screen reader audio guidance ${next ? 'enabled' : 'disabled'}`);
              }}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center space-x-1 transition-colors ${
                talkBackAudio ? 'bg-[#E0F2F1] text-[#00695C] border-[#00695C]/40' : 'bg-slate-100 text-slate-600 border-slate-300'
              }`}
              title={talkBackAudio ? 'TalkBack Audio ON' : 'TalkBack Audio Muted'}
              aria-label={talkBackAudio ? 'TalkBack Audio is enabled' : 'TalkBack Audio is disabled'}
            >
              {talkBackAudio ? <Volume2 className="w-4 h-4 text-[#00695C]" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Ultra High Contrast Toggle */}
            <button
              type="button"
              onClick={() => setHighContrast(!highContrast)}
              className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
                highContrast ? 'bg-black text-yellow-300 border-black' : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}
              title="Toggle Ultra-High Contrast Mode"
              aria-label="Toggle High Contrast Mode"
            >
              <Contrast className="w-4 h-4" />
            </button>

            {/* Language Selector */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-slate-100 border border-slate-300 hover:border-[#00695C] rounded-xl py-2 px-2.5 text-xs font-black text-[#263238] focus:outline-none"
                aria-label="Select Language"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeName} ({l.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Switch Back to Citizen App */}
            <button
              type="button"
              onClick={onSwitchToCitizenApp}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black border border-slate-300 flex items-center space-x-1"
              aria-label="Switch to Citizen Public Portal"
            >
              <Users className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden md:inline">Citizen Portal</span>
            </button>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="p-2 text-red-600 hover:bg-red-50 rounded-xl border border-red-200"
                title="Log Out Staff"
                aria-label="Log Out Staff"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Facility Selector & Connectivity Status Bar */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between text-xs gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-500">Active Facility:</span>
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(parseInt(e.target.value))}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-black text-xs text-[#00695C] focus:outline-none"
            >
              {DEMO_PHC_FACILITIES.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.city})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-3 text-[11px] font-bold">
            {isOffline ? (
              <span className="flex items-center space-x-1 text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300">
                <WifiOff className="w-3.5 h-3.5" />
                <span>OFFLINE MODE (Local Cache Active)</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300">
                <Wifi className="w-3.5 h-3.5" />
                <span>LIVE CLOUD GRID CONNECTED</span>
              </span>
            )}

            {pendingSyncCount > 0 && (
              <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md font-bold">
                {pendingSyncCount} Pending Sync
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Persistent Large Navigation Tabs Bar */}
      <nav className="bg-white border-b-2 border-slate-200 px-4 sm:px-6 py-2 overflow-x-auto" aria-label="PHC Portal Sections">
        <div className="max-w-7xl mx-auto flex items-center space-x-2 min-w-max">
          {[
            { id: 'dashboard', label: '🏠 DASHBOARD', icon: '🏠', isEmergency: false },
            { id: 'emergency', label: `🚨 EMERGENCY ROOM (${emergencyCount})`, icon: '🚨', isEmergency: true },
            { id: 'beds', label: '🛏️ BEDS & WARDS', icon: '🛏️', isEmergency: false },
            { id: 'staff', label: '👨‍⚕️ STAFF ON DUTY', icon: '👨‍⚕️', isEmergency: false },
            { id: 'medicines', label: '💊 MEDICINES', icon: '💊', isEmergency: false },
            { id: 'diagnostics', label: '🧪 TESTS & LABS', icon: '🧪', isEmergency: false },
            { id: 'queue', label: '👥 OPD QUEUE', icon: '👥', isEmergency: false },
            { id: 'patient', label: '👤 PATIENT QR / EHR', icon: '👤', isEmergency: false },
            { id: 'referrals', label: '📋 DIGITAL REFERRALS', icon: '📋', isEmergency: false }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id as any);
                announceToScreenReader(`Navigated to ${tab.label}`);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center space-x-1.5 active:scale-95 ${
                activeTab === tab.id
                  ? tab.isEmergency ? 'bg-red-600 text-white shadow-md ring-2 ring-red-300' : 'bg-[#00695C] text-white shadow-md'
                  : tab.isEmergency
                  ? 'bg-red-50 text-red-800 border-2 border-red-300 hover:bg-red-100 font-black'
                  : 'bg-slate-50 text-slate-700 hover:bg-[#E0F2F1] hover:text-[#00695C] border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main View Router */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1">
        {activeTab === 'dashboard' && (
          <PhcDashboardView
            facilityName={selectedFacility.name}
            facilityCity={selectedFacility.city}
            facilityType={selectedFacility.type}
            resources={resources}
            staff={staffList}
            medicines={medicinesList}
            diagnostics={diagnosticsList}
            emergencyCount={emergencyCount}
            onNavigate={(view) => setActiveTab(view)}
            onRefresh={loadPhcData}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'emergency' && (
          <PhcEmergencyControlRoom
            facilityId={selectedFacility.id}
            facilityName={selectedFacility.name}
            resources={resources}
            staff={staffList}
            medicines={medicinesList}
            diagnostics={diagnosticsList}
            onBack={() => setActiveTab('dashboard')}
            onRefreshData={loadPhcData}
          />
        )}

        {activeTab === 'beds' && (
          <PhcBedManagementView
            resources={resources}
            onBack={() => setActiveTab('dashboard')}
            onSaveResources={handleSaveResources}
            facilityName={selectedFacility.name}
          />
        )}

        {activeTab === 'staff' && (
          <PhcStaffManagementView
            staff={staffList}
            doctors={[]}
            onBack={() => setActiveTab('dashboard')}
            onToggleStaffDuty={handleToggleStaffDuty}
            facilityName={selectedFacility.name}
          />
        )}

        {activeTab === 'medicines' && (
          <PhcMedicineManagementView
            medicines={medicinesList}
            onBack={() => setActiveTab('dashboard')}
            onUpdateMedicineStatus={handleUpdateMedicineStatus}
            facilityName={selectedFacility.name}
          />
        )}

        {activeTab === 'diagnostics' && (
          <PhcDiagnosticManagementView
            diagnostics={diagnosticsList}
            onBack={() => setActiveTab('dashboard')}
            onUpdateDiagnosticStatus={handleUpdateDiagnosticStatus}
            facilityName={selectedFacility.name}
          />
        )}

        {activeTab === 'queue' && (
          <PhcQueueManagementView
            currentQueueCount={resources.opd_queue_count || 8}
            currentQueueStatus={resources.opd_queue_status || 'SHORT'}
            onBack={() => setActiveTab('dashboard')}
            onUpdateQueue={handleUpdateQueue}
            facilityName={selectedFacility.name}
          />
        )}

        {activeTab === 'patient' && (
          <PhcPatientRecordView
            onBack={() => setActiveTab('dashboard')}
            facilityName={selectedFacility.name}
          />
        )}

        {activeTab === 'referrals' && (
          <PhcReferralView
            referrals={referralsList}
            onBack={() => setActiveTab('dashboard')}
            facilityName={selectedFacility.name}
          />
        )}
      </main>

      {/* Voice Assistant Modal */}
      <PhcVoiceAssistant
        isOpen={showVoiceAssistant}
        onClose={() => setShowVoiceAssistant(false)}
        onExecuteCommand={handleExecuteVoiceCommand}
        facilityName={selectedFacility.name}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500 font-bold">
        Sanjeevani Health Stack • Accessible Primary Health Centre (PHC) Operations Interface © 2026
      </footer>
    </div>
  );
};
