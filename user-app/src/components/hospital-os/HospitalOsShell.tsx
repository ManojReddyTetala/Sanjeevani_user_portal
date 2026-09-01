import React, { useState, useEffect } from 'react';
import {
  Activity,
  Stethoscope,
  HeartPulse,
  Pill,
  BedDouble,
  Truck,
  Share2,
  ShieldCheck,
  Navigation,
  Sparkles,
  Volume2,
  VolumeX,
  Eye,
  Wifi,
  WifiOff,
  RefreshCw,
  Building2,
  ChevronDown
} from 'lucide-react';
import { HospitalResource, EmergencyRequest, Patient, MedicalRecord } from '../../types';
import { HospitalCommandCenter } from './HospitalCommandCenter';
import { DoctorClinicalWorkspace } from './DoctorClinicalWorkspace';
import { NurseCareCenter } from './NurseCareCenter';
import { DiagnosticWorkQueue } from './DiagnosticWorkQueue';
import { PharmacyFulfillmentView } from './PharmacyFulfillmentView';
import { LiveBedGridManager } from './LiveBedGridManager';
import { AmbulanceMissionControl } from './AmbulanceMissionControl';
import { ReferralCareTransferCenter } from './ReferralCareTransferCenter';
import { PatientConsentAndAuditView } from './PatientConsentAndAuditView';
import { HospitalOperationsMap } from './HospitalOperationsMap';
import { StaffAiAssistantModal } from './StaffAiAssistantModal';
import { PhcEmergencyControlRoom } from '../phc/PhcEmergencyControlRoom';

interface HospitalOsShellProps {
  onBackToMain?: () => void;
}

export const HospitalOsShell: React.FC<HospitalOsShellProps> = ({ onBackToMain }) => {
  const [activeRole, setActiveRole] = useState<string>('admin');
  const [selectedHospitalId, setSelectedHospitalId] = useState<number>(1);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [liveSyncTime, setLiveSyncTime] = useState('10:52 AM Today');
  const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState('');

  // Sample data states
  const [resources, setResources] = useState<HospitalResource>({
    id: 1,
    hospital_id: 1,
    general_beds: 20,
    occupied_beds: 14,
    icu_beds: 4,
    icu_facility_status: 'AVAILABLE',
    oxygen_cylinders: 60,
    ambulances: 2,
    nurses_on_duty: 6,
    doctors_on_duty: 4,
    status: 'AVAILABLE',
    last_updated: new Date().toISOString()
  });

  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>([
    {
      id: 101,
      patient_id: 1,
      patient_name: 'Rahul Kumar',
      patient_age: 42,
      patient_blood_group: 'B+',
      patient_phone: '+91-9876543210',
      health_id: 'UID-IND-9842-7104',
      facility_id: 1,
      facility_name: 'AIIMS Delhi',
      facility_type: 'Super-Speciality Hospital',
      latitude: 17.0214,
      longitude: 82.1384,
      patient_accuracy_m: 6.5,
      patient_last_updated: new Date().toISOString(),
      distance_km: 3.4,
      priority: 'CRITICAL',
      description: 'Severe chest pain radiating to left arm, sweating, and difficulty breathing for the past 20 minutes.',
      status: 'AMBULANCE_DISPATCHED',
      ambulance_status: 'DISPATCHED',
      ambulance_code: 'AMB-07',
      ambulance_lat: 17.0192,
      ambulance_lng: 82.1285,
      ambulance_speed_kmh: 44.0,
      ambulance_heading: 78,
      ambulance_accuracy_m: 4.2,
      ambulance_lifecycle_state: 'EN_ROUTE_TO_PATIENT',
      ambulance_last_updated: new Date().toISOString(),
      assigned_doctor: 'Dr. Anil Kumar (Chief Cardiologist)',
      assigned_driver: 'Ramesh (Driver) • 108 Emergency Unit',
      eta_minutes: 4,
      created_at: new Date(Date.now() - 6 * 60000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 60000).toISOString()
    }
  ]);

  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 1,
      uid: 'UID-IND-9842-7104',
      name: 'Rahul Kumar',
      age: 42,
      gender: 'Male',
      blood_group: 'B+',
      language: 'English',
      phone: '+91-9876543210',
      address: 'Near Gandhi Chowk, Peddapuram',
      emergency_contact: 'Suresh Kumar (+91-9876500001)',
      qr_token: 'QR-PAT-001',
      created_at: '2026-08-01T00:00:00Z'
    },
    {
      id: 2,
      uid: 'UID-IND-8812-4401',
      name: 'Priya Sharma',
      age: 28,
      gender: 'Female',
      blood_group: 'A+',
      language: 'English',
      phone: '+91-9876500112',
      address: 'Main Road, Kakinada',
      emergency_contact: 'Amit Sharma (+91-9876500002)',
      qr_token: 'QR-PAT-002',
      created_at: '2026-08-05T00:00:00Z'
    }
  ]);

  const [records, setRecords] = useState<MedicalRecord[]>([
    {
      id: 1,
      patient_id: 1,
      hospital_name: 'AIIMS Delhi',
      record_type: 'Laboratory Report',
      title: '12-Lead Electrocardiogram (ECG)',
      diagnosis: 'ST Elevation in Leads V1-V4 (Suspected Anteroseptal MI)',
      notes: 'Urgent cardiac cath lab evaluation indicated.',
      prescription_data: [{ medicine: 'Tab Sorbitrate 5mg', dosage: 'Stat sublingual', duration: '1 day' }],
      created_at: '2026-08-29T10:00:00.000Z',
      created_by: 'Dr. Anil Kumar'
    }
  ]);

  const announceToScreenReader = (text: string) => {
    setScreenReaderAnnouncement(text);
    if (isVoiceEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.0;
      window.speechSynthesis.speak(u);
    }
  };

  // SSE Subscription for Event-Driven updates
  useEffect(() => {
    const es = new EventSource('/api/events');
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'DoctorEscalationTriggered') {
          announceToScreenReader(`Critical emergency escalation received from Nurse: ${data.data?.reason}`);
        } else if (data.type === 'BedReserved') {
          announceToScreenReader('Emergency Bed reserved for incoming ambulance');
        }
      } catch (e) {}
    };

    return () => {
      es.close();
    };
  }, [isVoiceEnabled]);

  const hospitalList = [
    { id: 1, name: 'AIIMS Delhi — Apex Super-Specialty Hub', city: 'New Delhi' },
    { id: 2, name: 'Safdarjung Hospital — Multi-Specialty Trauma Center', city: 'New Delhi' },
    { id: 7, name: 'Primary Health Centre (PHC Peddapuram)', city: 'Peddapuram' },
    { id: 5, name: 'Government General Hospital (GGH Kakinada)', city: 'Kakinada' }
  ];

  const currentHospital = hospitalList.find((h) => h.id === selectedHospitalId) || hospitalList[0];

  const roleTabs = [
    { id: 'admin', label: '🏥 COMMAND CENTER', icon: '🏥' },
    { id: 'doctor', label: '👨‍⚕️ DOCTOR (360°)', icon: '👨‍⚕️' },
    { id: 'nurse', label: '👩‍⚕️ NURSE CARE', icon: '👩‍⚕️' },
    { id: 'lab', label: '🧪 DIAGNOSTIC LAB', icon: '🧪' },
    { id: 'pharmacy', label: '💊 PHARMACY', icon: '💊' },
    { id: 'beds', label: '🛏️ BED GRID', icon: '🛏️' },
    { id: 'ambulance', label: '🚑 AMBULANCE', icon: '🚑' },
    { id: 'referral', label: '📋 REFERRAL', icon: '📋' },
    { id: 'consent', label: '👤 EHR & CONSENT', icon: '👤' },
    { id: 'emergency', label: '🚨 EMERGENCY ROOM', icon: '🚨' },
    { id: 'map', label: '🗺️ OPERATIONS MAP', icon: '🗺️' }
  ];

  return (
    <div className={`min-h-screen ${isHighContrast ? 'bg-black text-yellow-300' : 'bg-slate-100 text-slate-900'} font-sans flex flex-col`}>
      {/* ARIA Live Region for TalkBack Accessibility */}
      <div className="sr-only" aria-live="assertive" role="alert">
        {screenReaderAnnouncement}
      </div>

      {/* Top Hospital OS Header Bar */}
      <header className="bg-white border-b-2 border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Hospital Selector */}
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#00695C] text-white rounded-2xl font-black text-base shadow">
              🏥 OS
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <select
                  value={selectedHospitalId}
                  onChange={(e) => setSelectedHospitalId(parseInt(e.target.value))}
                  className="font-black text-sm text-[#263238] bg-slate-50 border border-slate-300 rounded-xl px-2 py-1 focus:outline-none"
                >
                  {hospitalList.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Hospital Operating System • Unified Clinical Bus
              </span>
            </div>
          </div>

          {/* Quick Tools: Staff AI, High Contrast, Voice, Sync Status */}
          <div className="flex items-center space-x-2">
            {/* Staff AI Assistant Button */}
            <button
              type="button"
              onClick={() => setIsAiModalOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-teal-700 to-[#00695C] text-white font-black text-xs rounded-2xl shadow-sm transition-transform active:scale-95 flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4 text-emerald-300 animate-spin" />
              <span>🤖 STAFF AI</span>
            </button>

            {/* High Contrast Toggle */}
            <button
              type="button"
              onClick={() => setIsHighContrast(!isHighContrast)}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-300"
              title="Toggle High Contrast Mode"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Voice Narration Toggle */}
            <button
              type="button"
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              className={`p-2 rounded-xl border transition-colors ${
                isVoiceEnabled ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-400 border-slate-300'
              }`}
              title="Toggle Voice Speech Synthesis"
            >
              {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Sync State Pill */}
            <div className="hidden sm:flex items-center space-x-1.5 bg-emerald-50 text-emerald-900 border border-emerald-300 px-3 py-1.5 rounded-full text-[11px] font-black">
              <Wifi className="w-3.5 h-3.5 text-emerald-700" />
              <span>LIVE SYNC</span>
            </div>
          </div>
        </div>

        {/* Persistent Role-Specific Window Tabs Navigation */}
        <nav className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-2 overflow-x-auto" aria-label="Hospital OS Role Portals">
          <div className="max-w-7xl mx-auto flex items-center space-x-1.5 min-w-max">
            {roleTabs.map((tab) => {
              const isActive = activeRole === tab.id;
              const isEmergency = tab.id === 'emergency';

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveRole(tab.id);
                    announceToScreenReader(`Switched to ${tab.label}`);
                  }}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all flex items-center space-x-1.5 active:scale-95 ${
                    isActive
                      ? isEmergency
                        ? 'bg-red-600 text-white shadow-md ring-2 ring-red-300'
                        : 'bg-[#00695C] text-white shadow-md'
                      : isEmergency
                      ? 'bg-red-50 text-red-800 border border-red-300 hover:bg-red-100'
                      : 'bg-white text-slate-700 hover:bg-[#E0F2F1] hover:text-[#00695C] border border-slate-200'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Main View Router */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1">
        {activeRole === 'admin' && (
          <HospitalCommandCenter
            hospitalName={currentHospital.name}
            facilityCity={currentHospital.city}
            resources={resources}
            emergencies={emergencies}
            onNavigateRole={(role) => setActiveRole(role)}
          />
        )}

        {activeRole === 'doctor' && (
          <DoctorClinicalWorkspace
            patients={patients}
            records={records}
            emergencies={emergencies}
            onInitiateReferral={() => setActiveRole('referral')}
          />
        )}

        {activeRole === 'nurse' && <NurseCareCenter />}

        {activeRole === 'lab' && <DiagnosticWorkQueue />}

        {activeRole === 'pharmacy' && <PharmacyFulfillmentView />}

        {activeRole === 'beds' && <LiveBedGridManager />}

        {activeRole === 'ambulance' && <AmbulanceMissionControl />}

        {activeRole === 'referral' && <ReferralCareTransferCenter />}

        {activeRole === 'consent' && <PatientConsentAndAuditView />}

        {activeRole === 'emergency' && (
          <PhcEmergencyControlRoom
            facilityId={selectedHospitalId}
            facilityName={currentHospital.name}
            resources={resources}
            staff={[]}
            medicines={[]}
            diagnostics={[]}
            onBack={() => setActiveRole('admin')}
          />
        )}

        {activeRole === 'map' && <HospitalOperationsMap />}
      </main>

      {/* Staff AI Assistant Modal */}
      <StaffAiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
    </div>
  );
};
