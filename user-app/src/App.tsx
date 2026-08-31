import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Building2,
  Stethoscope,
  FileText,
  QrCode,
  MapPin,
  Filter,
  Phone,
  Clock,
  ChevronRight,
  ShieldCheck,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Activity,
  ArrowLeft,
  Map,
  X,
  Bell,
  Send,
  Sparkles,
  Copy,
  Download,
  Share2,
  Bed,
  Truck,
  Heart,
  Navigation,
  RefreshCw,
  Info,
  User
} from 'lucide-react';
import {
  getDistanceBadge,
  getBedAvailabilityBadge,
  getIcuBadge,
  getStaffBadge,
  getDiagnosticBadge,
  getEmergencyBadge,
  getOverallFacilityStatus
} from './utils/statusUtils';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { LocationProvider, useLocationService, PRESET_LOCATIONS } from './context/LocationContext';
import { LocationPermissionScreen } from './components/LocationPermissionScreen';
import { InteractiveHealthcareMap } from './components/InteractiveHealthcareMap';
import { Navbar } from './components/Navbar';
import { OfflineBanner } from './components/OfflineBanner';
import { SearchAutocompleteInput } from './components/SearchAutocompleteInput';
import { AiChatbotWidget } from './components/AiChatbotWidget';
import { AuthModal } from './components/AuthModal';
import { LoginPage } from './components/LoginPage';
import { LocationSetupModal } from './components/LocationSetupModal';
import { BottomNav } from './components/BottomNav';
import { HealthStatisticsView } from './components/HealthStatisticsView';
import { EmergencyView } from './components/EmergencyView';
import { HealthTrackView } from './components/HealthTrackView';
import { SmartModuleSearch, SearchResultItem } from './components/SmartModuleSearch';
import { Hospital, Patient, MedicalRecord, Referral } from './types';
import {
  fetchNearbyHospitals,
  searchSpecialists,
  searchDiagnostics,
  fetchPatientByUid,
  fetchPatientRecords,
  fetchPhcReferrals
} from './api';

const DEMO_FALLBACK_HOSPITALS: Hospital[] = [
  {
    id: 1,
    name: 'All India Institute of Medical Sciences (AIIMS Delhi) — DEMO',
    city: 'New Delhi',
    state: 'Delhi',
    address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi - 110029',
    latitude: 28.5672,
    longitude: 77.2100,
    phone: '+91-11-26588500',
    emergency_number: '102 / 108',
    facility_type: 'Tertiary Care Super-Speciality Hospital',
    distance_km: 2.4,
    icu_beds: 12,
    general_beds: 45,
    oxygen_cylinders: 60,
    ambulances: 5,
    doctors_on_duty: 8,
    status: 'AVAILABLE'
  },
  {
    id: 2,
    name: 'Safdarjung Hospital & Medical College — DEMO',
    city: 'New Delhi',
    state: 'Delhi',
    address: 'Ring Road, Opposite AIIMS, New Delhi - 110029',
    latitude: 28.5689,
    longitude: 77.2065,
    phone: '+91-11-26707444',
    emergency_number: '102 / 108',
    facility_type: 'Government Multi-Speciality Trauma Center',
    distance_km: 3.1,
    icu_beds: 8,
    general_beds: 30,
    oxygen_cylinders: 40,
    ambulances: 4,
    doctors_on_duty: 6,
    status: 'AVAILABLE'
  },
  {
    id: 3,
    name: 'Max Super Speciality Hospital, Saket — DEMO',
    city: 'New Delhi',
    state: 'Delhi',
    address: '1, 2 Press Enclave Marg, Saket Institutional Area, New Delhi - 110017',
    latitude: 28.5284,
    longitude: 77.2118,
    phone: '+91-11-26515050',
    emergency_number: '+91-11-40554055',
    facility_type: 'Private Super-Speciality Medical Hub',
    distance_km: 6.8,
    icu_beds: 2,
    general_beds: 10,
    oxygen_cylinders: 25,
    ambulances: 2,
    doctors_on_duty: 4,
    status: 'LIMITED'
  },
  {
    id: 4,
    name: 'Community Health Centre (CHC) Ballabhgarh — DEMO',
    city: 'Faridabad',
    state: 'Haryana',
    address: 'Main Highway Road, Ballabhgarh, Faridabad - 121004',
    latitude: 28.3412,
    longitude: 77.3245,
    phone: '+91-129-2241002',
    emergency_number: '102 / 108',
    facility_type: 'Primary Health Centre (PHC / CHC)',
    distance_km: 26.5,
    icu_beds: 0,
    general_beds: 5,
    oxygen_cylinders: 10,
    ambulances: 1,
    doctors_on_duty: 2,
    status: 'UNAVAILABLE'
  },
  {
    id: 5,
    name: 'Government General Hospital (GGH Kakinada) — DEMO',
    city: 'Kakinada',
    state: 'Andhra Pradesh',
    address: 'Nagamallithota Junction, Kakinada - 533001',
    latitude: 16.9891,
    longitude: 82.2475,
    phone: '+91-884-2361284',
    emergency_number: '108',
    facility_type: 'Government Teaching Super-Speciality Hospital',
    distance_km: 4.2,
    icu_beds: 15,
    general_beds: 50,
    oxygen_cylinders: 50,
    ambulances: 4,
    doctors_on_duty: 7,
    status: 'AVAILABLE'
  },
  {
    id: 6,
    name: 'Apollo Speciality Hospitals, Kakinada — DEMO',
    city: 'Kakinada',
    state: 'Andhra Pradesh',
    address: '13-1-3, Main Road, Kakinada - 533001',
    latitude: 16.9582,
    longitude: 82.2384,
    phone: '+91-884-2300000',
    emergency_number: '1066 / 108',
    facility_type: 'Private Super-Speciality Hospital',
    distance_km: 8.5,
    icu_beds: 4,
    general_beds: 15,
    oxygen_cylinders: 30,
    ambulances: 2,
    doctors_on_duty: 5,
    status: 'LIMITED'
  },
  {
    id: 7,
    name: 'Primary Health Centre (PHC) Peddapuram — DEMO',
    city: 'Peddapuram',
    state: 'Andhra Pradesh',
    address: 'Main Road, Peddapuram, Kakinada District - 533437',
    latitude: 17.0789,
    longitude: 82.1384,
    phone: '+91-884-2370102',
    emergency_number: '108',
    facility_type: 'Primary Health Centre (PHC)',
    distance_km: 14.1,
    icu_beds: 0,
    general_beds: 8,
    oxygen_cylinders: 5,
    ambulances: 1,
    doctors_on_duty: 2,
    status: 'AVAILABLE'
  },
  {
    id: 8,
    name: 'Nizam’s Institute of Medical Sciences (NIMS Hyderabad) — DEMO',
    city: 'Hyderabad',
    state: 'Telangana',
    address: 'Punjagutta, Hyderabad - 500082',
    latitude: 17.4239,
    longitude: 78.4526,
    phone: '+91-40-23489000',
    emergency_number: '108',
    facility_type: 'Autonomous Super-Speciality Medical Institute',
    distance_km: 5.0,
    icu_beds: 18,
    general_beds: 60,
    oxygen_cylinders: 75,
    ambulances: 6,
    doctors_on_duty: 10,
    status: 'AVAILABLE'
  },
  {
    id: 9,
    name: 'Yashoda Hospitals, Secunderabad — DEMO',
    city: 'Hyderabad',
    state: 'Telangana',
    address: 'Alexander Road, Secunderabad - 500003',
    latitude: 17.4399,
    longitude: 78.4983,
    phone: '+91-40-45674567',
    emergency_number: '+91-40-105710',
    facility_type: 'Private Tertiary Multi-Speciality Hospital',
    distance_km: 9.2,
    icu_beds: 3,
    general_beds: 20,
    oxygen_cylinders: 35,
    ambulances: 3,
    doctors_on_duty: 5,
    status: 'LIMITED'
  },
  {
    id: 10,
    name: 'Reddy Diagnostic & Imaging Centre — DEMO',
    city: 'New Delhi',
    state: 'Delhi',
    address: 'Plot 14, Hauz Khas Enclave, New Delhi - 110016',
    latitude: 28.5492,
    longitude: 77.2021,
    phone: '+91-11-26860000',
    emergency_number: '102 / 108',
    facility_type: 'Diagnostic & Imaging Centre',
    distance_km: 3.8,
    icu_beds: 0,
    general_beds: 0,
    oxygen_cylinders: 0,
    ambulances: 1,
    doctors_on_duty: 3,
    status: 'AVAILABLE'
  }
];

const DEFAULT_MANOJ_RECORDS: MedicalRecord[] = [
  {
    id: 101,
    patient_id: 1,
    hospital_name: 'AIIMS Delhi — DEMO',
    record_type: 'Consultation',
    title: '🩺 Cardiology Consultation Report — DEMO',
    diagnosis: 'Acute Allergic Rhinitis & Mild Sinusitis',
    notes: '[DEMO / SAMPLE RECORD — NOT A REAL MEDICAL RECORD] Patient presented with mild exertional discomfort and sinus headache. Recorded Vitals: BP 120/80 mmHg, HR 72 bpm, Temp 98.6°F, SpO2 98%, Weight 68kg, BMI 22.4.',
    prescription_data: [
      { medicine: 'Aspirin 75mg', dosage: '1 tablet daily', duration: '30 days' },
      { medicine: 'Cetirizine 10mg', dosage: '1 tablet PRN', duration: '14 days' }
    ],
    created_at: '2026-08-28T10:30:00.000Z',
    created_by: 'Dr. Manoj Reddy'
  },
  {
    id: 102,
    patient_id: 1,
    hospital_name: 'Max Super Specialty Hospital — DEMO',
    record_type: 'Radiology Report',
    title: '🧠 MRI Brain 3T Radiology Report — DEMO',
    diagnosis: 'Unremarkable Brain Parenchyma',
    notes: '[DEMO / SAMPLE RECORD — NOT A REAL MEDICAL RECORD] 3T MRI Brain scan without contrast. Findings: Normal ventricles and cerebral sulci. No acute ischemic stroke or mass effect.',
    prescription_data: [],
    created_at: '2026-08-25T14:15:00.000Z',
    created_by: 'Dr. Sameeruddin'
  },
  {
    id: 103,
    patient_id: 1,
    hospital_name: 'District General Hospital — DEMO',
    record_type: 'Radiology Report',
    title: '🩻 CT Head Radiology Report — DEMO',
    diagnosis: 'Mild Maxillary Sinus Mucosal Thickening',
    notes: '[DEMO / SAMPLE RECORD — NOT A REAL MEDICAL RECORD] Non-contrast CT Head scan. Findings: Bilateral maxillary sinuses show minimal mucosal thickening. Intracranial structures within normal limits.',
    prescription_data: [],
    created_at: '2026-08-23T11:00:00.000Z',
    created_by: 'Dr. Sunita Rani'
  },
  {
    id: 104,
    patient_id: 1,
    hospital_name: 'Reddy Diagnostic & Imaging Centre — DEMO',
    record_type: 'Laboratory Report',
    title: '🧪 Comprehensive Pathology Panel — DEMO',
    diagnosis: 'Normal Hematology & Metabolic Panel',
    notes: '[DEMO / SAMPLE RECORD — NOT A REAL MEDICAL RECORD] Hemoglobin: 14.2 g/dL (Ref: 13.0-17.0), Fasting Glucose: 92 mg/dL (Ref: 70-100), Serum Creatinine: 0.9 mg/dL (Ref: 0.7-1.3), Total Cholesterol: 175 mg/dL (Ref: <200).',
    prescription_data: [],
    created_at: '2026-08-22T09:00:00.000Z',
    created_by: 'Dr. Manoj Reddy'
  },
  {
    id: 105,
    patient_id: 1,
    hospital_name: 'AIIMS Delhi — DEMO',
    record_type: 'Prescription',
    title: '💊 Outpatient Clinical Prescription — DEMO',
    diagnosis: 'Allergic Airway Hyper-responsiveness',
    notes: '[DEMO / SAMPLE RECORD — NOT A REAL MEDICAL RECORD] Prescribed oral antihistamines and nasal spray.',
    prescription_data: [
      { medicine: 'Tab Cetirizine 10mg', dosage: '1-0-1', duration: '5 days' },
      { medicine: 'Fluticasone Nasal Spray', dosage: '2 puffs/day', duration: '14 days' },
      { medicine: 'Tab Paracetamol 500mg', dosage: 'SOS for fever/pain', duration: '3 days' }
    ],
    created_at: '2026-08-20T16:20:00.000Z',
    created_by: 'Dr. Manoj Reddy'
  },
  {
    id: 106,
    patient_id: 1,
    hospital_name: 'Primary Health Centre (PHC) — DEMO',
    record_type: 'Follow-up',
    title: '🩺 Primary Health Care Follow-up — DEMO',
    diagnosis: 'Routine Clinical Follow-up',
    notes: '[DEMO / SAMPLE RECORD — NOT A REAL MEDICAL RECORD] Routine follow-up at local PHC. Inter-facility referral REF-2026-9842 initiated for super-specialty cardiac evaluation.',
    prescription_data: [],
    created_at: '2026-08-18T10:00:00.000Z',
    created_by: 'Dr. Surya'
  }
];

const DEFAULT_MANOJ_REFERRALS: Referral[] = [
  {
    id: 1,
    referral_code: 'REF-2026-9842',
    patient_id: 1,
    referring_doctor_id: 11,
    destination_hospital_id: 1,
    required_specialty: 'Cardiology',
    required_facility: 'Super-Specialty Cardiac Evaluation',
    status: 'ACCEPTED',
    clinical_notes: '[DEMO / SAMPLE] Inter-facility referral from Village PHC to AIIMS Delhi for cardiac evaluation.',
    created_at: '2026-08-18T10:30:00.000Z',
    updated_at: '2026-08-19T09:00:00.000Z',
    referring_hospital_name: 'Primary Health Centre (PHC) — DEMO',
    destination_hospital_name: 'AIIMS Delhi — DEMO',
    referring_doctor_name: 'Dr. Surya'
  },
  {
    id: 2,
    referral_code: 'REF-2026-9843',
    patient_id: 1,
    referring_doctor_id: 12,
    destination_hospital_id: 3,
    required_specialty: 'Orthopedics',
    required_facility: 'MRI Lumbar Evaluation',
    status: 'SENT',
    clinical_notes: '[DEMO / SAMPLE] Routine referral for spinal evaluation.',
    created_at: '2026-08-24T12:00:00.000Z',
    updated_at: '2026-08-24T12:00:00.000Z',
    referring_hospital_name: 'Safdarjung Hospital — DEMO',
    destination_hospital_name: 'Max Super Specialty Hospital — DEMO',
    referring_doctor_name: 'Dr. Sameeruddin'
  }
];

export const CitizenAppContent: React.FC = () => {
  const { t } = useLanguage();
  const { location, setLocation, permissionStatus, isGpsActive, gpsStatusMessage, requestDeviceGps, setManualLocation } = useLocationService();

  // Authentication Session State (Patient Identity Single Source of Truth - Starts at Login Page)
  const [authSession, setAuthSession] = useState<{ token: string; user: any; patient: Patient } | null>(null);

  // Active View Router
  const [activeView, setActiveView] = useState<'home' | 'hospitals' | 'doctors' | 'diagnostics' | 'identity' | 'records' | 'referrals' | 'profile' | 'statistics' | 'emergency' | 'health_track'>('home');

  // Radius & Sorting Controls
  const [radiusKm, setRadiusKm] = useState(50);
  const [sortBy, setSortBy] = useState<'distance' | 'availability' | 'icu' | 'general_beds'>('distance');

  // UI Modals & Drawers
  const [highContrast, setHighContrast] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | string | null>(null);

  // Manual Location Search State in Modal
  const [manualSearchQuery, setManualSearchQuery] = useState('');
  const [manualSearchResolving, setManualSearchResolving] = useState(false);

  // Global Search State
  const [globalSearchInput, setGlobalSearchInput] = useState('');

  // Contextual Module Search States (Independent per module)
  const [healthcareSearch, setHealthcareSearch] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [diagnosticSearch, setDiagnosticSearch] = useState('');
  const [recordSearch, setRecordSearch] = useState('');
  const [referralSearch, setReferralSearch] = useState('');
  const [healthcareMobileTab, setHealthcareMobileTab] = useState<'list' | 'map'>('list');

  const handleSelectHealthcareResult = (item: SearchResultItem) => {
    if (item.action_data?.hospital_id) {
      setSelectedHospitalId(item.action_data.hospital_id);
      const found = hospitals.find((h) => h.id === item.action_data.hospital_id);
      if (found) setViewingFacilityModal(found);
    } else if (item.action_data?.filter) {
      setFacilityFilter(item.action_data.filter);
    }
  };

  const handleSelectDoctorResult = (item: SearchResultItem) => {
    if (item.action_data?.specialty) {
      setSpecialistFilter(item.action_data.specialty);
    } else if (item.action_data?.doctor_name) {
      alert(`Selected Doctor: ${item.action_data.doctor_name} (${item.action_data.specialty})`);
    }
  };

  const handleSelectDiagnosticResult = (item: SearchResultItem) => {
    if (item.action_data?.service_name) {
      setDiagnosticSearch(item.action_data.service_name);
    }
  };

  const handleSelectRecordResult = (item: SearchResultItem) => {
    if (item.action_data?.record) {
      setViewingDocRecord(item.action_data.record);
    }
  };

  const handleSelectReferralResult = (item: SearchResultItem) => {
    if (item.action_data?.referral_code) {
      setReferralSearch(item.action_data.referral_code);
    }
  };

  // Hospital Discovery State
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [facilityFilter, setFacilityFilter] = useState<string>('ALL');
  const [viewingFacilityModal, setViewingFacilityModal] = useState<Hospital | null>(null);

  // Doctor Discovery State
  const [specialistFilter, setSpecialistFilter] = useState('');

  // Selected Document Viewer Modal State
  const [viewingDocRecord, setViewingDocRecord] = useState<MedicalRecord | null>(null);
  const [diagnosticSearchInput, setDiagnosticSearchInput] = useState('');
  const [networkIp, setNetworkIp] = useState<string>('');

  // Patient Identity & Records State
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(authSession?.patient || null);
  const [patientRecords, setPatientRecords] = useState<MedicalRecord[]>(() => {
    return authSession?.patient?.name === 'Srija' ? [] : DEFAULT_MANOJ_RECORDS;
  });
  const [patientReferrals, setPatientReferrals] = useState<Referral[]>(() => {
    return authSession?.patient?.name === 'Srija' ? [] : DEFAULT_MANOJ_REFERRALS;
  });

  // Profile Edit Form State
  const [editName, setEditName] = useState(authSession?.patient?.name || '');
  const [editAge, setEditAge] = useState(authSession?.patient?.age || 28);
  const [editGender, setEditGender] = useState(authSession?.patient?.gender || 'Female');
  const [editBloodGroup, setEditBloodGroup] = useState(authSession?.patient?.blood_group || 'O+');
  const [editEmergencyContact, setEditEmergencyContact] = useState(authSession?.patient?.emergency_contact || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, title: 'Referral Update', body: 'Digital referral update received for patient record.', time: '10 mins ago' },
    { id: 2, title: 'Health System Notification', body: 'Longitudinal EHR electronic record synchronized.', time: '1 hour ago' }
  ]);

  useEffect(() => {
    fetch('/api/config/network-ip')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.ip) setNetworkIp(data.ip);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (authSession?.patient) {
      setEditName(authSession.patient.name || '');
      setEditAge(authSession.patient.age || 28);
      setEditGender(authSession.patient.gender || 'Female');
      setEditBloodGroup(authSession.patient.blood_group || 'O+');
      setEditEmergencyContact(authSession.patient.emergency_contact || '');
      setCurrentPatient(authSession.patient);
      loadUserSpecificData(authSession.token);
    }
  }, [authSession?.token]);

  useEffect(() => {
    if (permissionStatus !== 'prompt') {
      loadHospitals();
    }

    // Server-Sent Events (SSE) Real-Time Data Synchronization Hub
    const es = new EventSource('/api/events');
    es.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.type === 'ResourceUpdated' || parsed.type === 'HospitalUpdated') {
          loadHospitals();
        }
        if (parsed.type === 'ReferralCreated' || parsed.type === 'ReferralUpdated') {
          if (authSession?.token) loadUserSpecificData(authSession.token);
        }
      } catch (e) {}
    };

    return () => {
      es.close();
    };
  }, [location, radiusKm, statusFilter, sortBy, permissionStatus]);

  const handleLoginSuccess = (user: any, patient: Patient, token: string) => {
    const session = { token, user, patient };
    setAuthSession(session);
    localStorage.setItem('sih_patient_session', JSON.stringify(session));
    setCurrentPatient(patient);
    setEditName(patient.name);
    setEditAge(patient.age || 28);
    setEditGender(patient.gender || 'Female');
    setEditBloodGroup(patient.blood_group || 'O+');
    setEditEmergencyContact(patient.emergency_contact || '');
    loadUserSpecificData(token);
    setShowLocationModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('sih_patient_session');
    setAuthSession(null);
    setCurrentPatient(null);
    setPatientRecords([]);
    setPatientReferrals([]);
    setActiveView('home');
  };

  const loadUserSpecificData = async (token: string) => {
    try {
      const resRecs = await fetch('/api/me/records', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resRecs.ok) {
        const dataRecs = await resRecs.json();
        if (dataRecs.records && dataRecs.records.length > 0) {
          setPatientRecords(dataRecs.records);
        } else if (dataRecs.patient?.name === 'Manoj' || !dataRecs.patient) {
          setPatientRecords(DEFAULT_MANOJ_RECORDS);
        } else {
          setPatientRecords([]);
        }
        if (dataRecs.patient) setCurrentPatient(dataRecs.patient);
      } else {
        setPatientRecords(DEFAULT_MANOJ_RECORDS);
      }
      const resRefs = await fetch('/api/me/referrals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resRefs.ok) {
        const dataRefs = await resRefs.json();
        if (Array.isArray(dataRefs) && dataRefs.length > 0) {
          setPatientReferrals(dataRefs);
        } else if (authSession?.patient?.name === 'Manoj' || !authSession?.patient) {
          setPatientReferrals(DEFAULT_MANOJ_REFERRALS);
        } else {
          setPatientReferrals([]);
        }
      } else {
        setPatientReferrals(DEFAULT_MANOJ_REFERRALS);
      }
    } catch (e) {
      console.error('Error loading user-specific data, using default demo dataset:', e);
      setPatientRecords(DEFAULT_MANOJ_RECORDS);
      setPatientReferrals(DEFAULT_MANOJ_REFERRALS);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authSession) return;
    setIsUpdatingProfile(true);
    try {
      const res = await fetch('/api/me/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authSession.token}`
        },
        body: JSON.stringify({
          name: editName,
          age: editAge,
          gender: editGender,
          blood_group: editBloodGroup,
          emergency_contact: editEmergencyContact
        })
      });
      if (res.ok) {
        const data = await res.json();
        const updatedPatient = data.patient;
        const updatedSession = { ...authSession, patient: updatedPatient, user: { ...authSession.user, name: updatedPatient.name } };
        setAuthSession(updatedSession);
        localStorage.setItem('sih_patient_session', JSON.stringify(updatedSession));
        setCurrentPatient(updatedPatient);
        alert('Profile updated successfully!');
      }
    } catch (err) {
      alert('Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const loadHospitals = async () => {
    setLoadingHospitals(true);
    try {
      const data = await fetchNearbyHospitals(location.latitude, location.longitude, radiusKm, statusFilter, '', sortBy);
      const res = data.hospitals || [];
      if (res.length > 0) {
        setHospitals(res);
        if (!selectedHospitalId) setSelectedHospitalId(res[0].id);
      } else {
        setHospitals(DEMO_FALLBACK_HOSPITALS);
        if (!selectedHospitalId) setSelectedHospitalId(DEMO_FALLBACK_HOSPITALS[0].id);
      }
    } catch (e) {
      console.error('Error fetching hospitals, using rich fallback demo dataset:', e);
      setHospitals(DEMO_FALLBACK_HOSPITALS);
      if (!selectedHospitalId) setSelectedHospitalId(DEMO_FALLBACK_HOSPITALS[0].id);
    } finally {
      setLoadingHospitals(false);
    }
  };

  // Resolve Manual Text Location Search
  const handleResolveManualModalSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSearchQuery.trim()) return;

    setManualSearchResolving(true);
    try {
      const res = await fetch(`/api/location/resolve?q=${encodeURIComponent(manualSearchQuery.trim())}`);
      const data = await res.json();
      if (res.ok && data.latitude && data.longitude) {
        setManualLocation({
          latitude: data.latitude,
          longitude: data.longitude,
          label: `Selected: ${data.formatted_address || data.query}`,
          isGps: false
        });
        setShowLocationModal(false);
        setManualSearchQuery('');
      } else {
        alert('Location not found. Try entering a city, pincode, or landmark.');
      }
    } catch (err) {
      alert('Failed to resolve location search.');
    } finally {
      setManualSearchResolving(false);
    }
  };

  // Open Authentic Google Maps Directions
  const openGoogleMapsDirections = (h: Hospital) => {
    const origin = `${location.latitude},${location.longitude}`;
    const destination = (h as any).place_id
      ? `destination=${encodeURIComponent(h.name)}&destination_place_id=${(h as any).place_id}`
      : `destination=${h.latitude},${h.longitude}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&${destination}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Download Dynamic Server-Generated PDF Medical Report
  const downloadPdfReport = () => {
    const uid = currentPatient?.uid || authSession?.patient?.uid || 'UID-IND-9842-7104';
    window.open(`/api/patients/${uid}/pdf`, '_blank');
  };

  // Handle Autocomplete Suggestion Selection
  const handleSelectSuggestion = (suggestion: any) => {
    if (suggestion.target_tab === 'hospitals' || suggestion.type === 'hospital') {
      setActiveView('hospitals');
    } else if (suggestion.target_tab === 'specialists' || suggestion.type === 'doctor') {
      setActiveView('doctors');
      setSpecialistFilter(suggestion.text.split('(')[0].trim());
    } else if (suggestion.target_tab === 'diagnostics' || suggestion.type === 'diagnostic') {
      setActiveView('diagnostics');
      setDiagnosticSearchInput(suggestion.text);
    }
  };

  // Handle AI Structured Action Dispatch
  const handleExecuteAiAction = (action: any) => {
    if (action.type === 'NAVIGATE' || action.type === 'navigate') {
      const target = action.target || action.view;
      if (target === 'emergency') setActiveView('emergency');
      else if (target === 'hospitals') setActiveView('hospitals');
      else if (target === 'doctors') setActiveView('doctors');
      else if (target === 'diagnostics') setActiveView('diagnostics');
      else if (target === 'records') setActiveView('records');
      else if (target === 'identity') setActiveView('identity');
      else if (target === 'profile') setActiveView('profile');
      else if (target === 'statistics') setActiveView('statistics');
    } else if (action.type === 'set_radius') {
      setRadiusKm(Number(action.value) || 50);
    } else if (action.type === 'set_filter') {
      if (action.key === 'specialty') {
        setActiveView('doctors');
        setSpecialistFilter(String(action.value));
      } else if (action.key === 'test') {
        setActiveView('diagnostics');
        setDiagnosticSearchInput(String(action.value));
      }
    }
  };

  // --- REQUIRE LOGIN FIRST BEFORE PORTAL ACCESS ---
  if (!authSession) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // --- RENDER LOCATION PERMISSION SCREEN IF PROMPT ---
  if (permissionStatus === 'prompt') {
    return (
      <LocationPermissionScreen
        onGrantGps={requestDeviceGps}
        onSelectManual={setManualLocation}
        gpsStatusMessage={gpsStatusMessage}
        permissionStatus={permissionStatus}
      />
    );
  }

  const activePatientName = authSession.patient.name;
  const activePatientUid = authSession.patient.uid;

  return (
    <div className={`min-h-screen bg-[#F7FAF9] text-[#263238] flex flex-col font-sans ${highContrast ? 'contrast-125' : ''}`}>
      {/* Top Navbar */}
      <Navbar
        currentSession={{ id: authSession.user.id, name: activePatientName, patient_id: authSession.patient.id }}
        onLogout={handleLogout}
        onOpenProfile={() => setActiveView('profile')}
        onOpenEmergency={() => setActiveView('emergency')}
        onOpenHealthTrack={() => setActiveView('health_track')}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
      />

      {/* Dynamic Location Status Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between text-xs gap-2 shadow-sm">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-[#00695C]" />
          <span className="font-bold text-[#263238]">
            {isGpsActive ? '📍 Current Location:' : '📍 Selected Location:'}
          </span>
          <span className="text-[#607D8B] font-medium">{location.label}</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isGpsActive ? 'bg-[#E0F2F1] text-[#00695C] border border-[#00695C]/20' : 'bg-amber-50 text-[#F57C00] border border-[#F57C00]/20'}`}>
            {isGpsActive ? 'GPS ACTIVE' : 'MANUAL LOCATION'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowLocationModal(true)}
            className="px-3 py-1 bg-[#E0F2F1] hover:bg-[#b2dfdb] text-[#00695C] rounded-lg text-xs font-bold transition-colors border border-[#00695C]/20"
          >
            Change Location
          </button>
        </div>
      </div>

      <OfflineBanner />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6 space-y-6">
        {/* Navigation Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          {/* Main Module Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-thin">
            {[
              { id: 'home', label: 'Home' },
              { id: 'hospitals', label: 'Healthcare' },
              { id: 'doctors', label: 'Doctors' },
              { id: 'diagnostics', label: 'Diagnostics' },
              { id: 'identity', label: 'Health ID' },
              { id: 'records', label: 'Records' },
              { id: 'statistics', label: '📊 Statistics' },
              { id: 'referrals', label: 'Referrals' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  activeView === tab.id
                    ? 'bg-[#00695C] text-white shadow'
                    : 'text-[#607D8B] hover:text-[#263238] hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeView !== 'home' && (
            <button
              onClick={() => setActiveView('home')}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-[#00695C] rounded-xl text-xs font-bold flex items-center space-x-1 shrink-0 border border-slate-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </button>
          )}
        </div>

        {/* --- VIEW 1: PATIENT HOME DASHBOARD (NO MAP ON HOME) --- */}
        {activeView === 'home' && (
          <div className="space-y-6">
            {/* Patient Header Banner */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 relative overflow-hidden">
              <div className="tricolour-strip absolute top-0 left-0 right-0" />
              <div className="flex justify-between items-start pt-1">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#263238]">
                    Good afternoon, {activePatientName} 👋
                  </h2>
                  <p className="text-xs text-[#607D8B] mt-1">
                    Sanjeevani Health ID: <span className="font-mono text-[#00695C] font-bold">{activePatientUid}</span>
                  </p>
                </div>

                {/* Notifications Bell */}
                <button
                  onClick={() => setShowNotificationsDrawer(true)}
                  className="relative p-2.5 bg-slate-50 hover:bg-[#E0F2F1] text-[#00695C] rounded-2xl border border-slate-200 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5 text-[#00695C]" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#F57C00] text-white font-black text-[10px] rounded-full flex items-center justify-center shadow">
                      {notifications.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Global Healthcare Autocomplete Search */}
              <div className="pt-2">
                <SearchAutocompleteInput
                  value={globalSearchInput}
                  onChange={setGlobalSearchInput}
                  onSelectSuggestion={handleSelectSuggestion}
                  placeholder="Search hospitals, doctors, diagnostics, ICU beds..."
                  lat={location.latitude}
                  lng={location.longitude}
                />
              </div>
            </div>

            {/* 6 Primary Action Cards (Clean White Cards on Soft Light Background) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Featured Card 0: Health Track Care Journey */}
              <button
                onClick={() => setActiveView('health_track')}
                className="bg-white hover:bg-slate-50 p-6 rounded-3xl border-2 border-[#00695C] transition-all text-left space-y-4 group shadow-md hover:shadow-lg relative overflow-hidden"
              >
                <div className="bg-[#00695C] text-white px-3 py-1 text-[9px] font-black rounded-br-xl uppercase tracking-wider absolute top-0 left-0">
                  LIVE CARE TRACKER
                </div>
                <div className="w-12 h-12 bg-[#E0F2F1] text-[#00695C] rounded-2xl border border-[#00695C]/20 flex items-center justify-center group-hover:scale-105 transition-transform mt-2">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-[#263238] group-hover:text-[#00695C] transition-colors flex items-center space-x-1.5">
                    <span>🩺 Health Track</span>
                  </h3>
                  <p className="text-xs text-[#607D8B] mt-1">
                    Live care journey, next action guide, and report dependency manager.
                  </p>
                </div>
                <div className="flex items-center space-x-1 text-xs font-extrabold text-[#00695C]">
                  <span>Track Treatment Pathway</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
              {/* Card 1: Find Healthcare */}
              <button
                onClick={() => setActiveView('hospitals')}
                className="bg-white hover:bg-slate-50 p-6 rounded-3xl border border-slate-200 transition-all text-left space-y-4 group shadow-sm hover:shadow-md"
              >
                <div className="w-12 h-12 bg-[#E0F2F1] text-[#00695C] rounded-2xl border border-[#00695C]/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-[#263238] group-hover:text-[#00695C] transition-colors">
                    🏥 Find Healthcare
                  </h3>
                  <p className="text-xs text-[#607D8B] mt-1">
                    Find hospitals, PHCs and healthcare facilities near you.
                  </p>
                </div>
                <div className="flex items-center space-x-1 text-xs font-extrabold text-[#00695C]">
                  <span>Explore Facilities</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Card 2: Find Doctor */}
              <button
                onClick={() => setActiveView('doctors')}
                className="bg-white hover:bg-slate-50 p-6 rounded-3xl border border-slate-200 transition-all text-left space-y-4 group shadow-sm hover:shadow-md"
              >
                <div className="w-12 h-12 bg-[#E0F2F1] text-[#00695C] rounded-2xl border border-[#00695C]/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-[#263238] group-hover:text-[#00695C] transition-colors">
                    🩺 Find Doctor
                  </h3>
                  <p className="text-xs text-[#607D8B] mt-1">
                    Find doctors and specialties.
                  </p>
                </div>
                <div className="flex items-center space-x-1 text-xs font-extrabold text-[#00695C]">
                  <span>Search Specialists</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Card 3: Diagnostics */}
              <button
                onClick={() => setActiveView('diagnostics')}
                className="bg-white hover:bg-slate-50 p-6 rounded-3xl border border-slate-200 transition-all text-left space-y-4 group shadow-sm hover:shadow-md"
              >
                <div className="w-12 h-12 bg-blue-50 text-[#1565C0] rounded-2xl border border-blue-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-[#263238] group-hover:text-[#1565C0] transition-colors">
                    🧪 Diagnostics
                  </h3>
                  <p className="text-xs text-[#607D8B] mt-1">
                    Find MRI, CT, X-Ray, pathology and other services.
                  </p>
                </div>
                <div className="flex items-center space-x-1 text-xs font-extrabold text-[#1565C0]">
                  <span>Find Diagnostic Centers</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Card 4: My Health ID */}
              <button
                onClick={() => setActiveView('identity')}
                className="bg-white hover:bg-slate-50 p-6 rounded-3xl border border-slate-200 transition-all text-left space-y-4 group shadow-sm hover:shadow-md"
              >
                <div className="w-12 h-12 bg-purple-50 text-purple-700 rounded-2xl border border-purple-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-[#263238] group-hover:text-purple-700 transition-colors">
                    🪪 My Health ID
                  </h3>
                  <p className="text-xs text-[#607D8B] mt-1">
                    Health ID and QR.
                  </p>
                </div>
                <div className="flex items-center space-x-1 text-xs font-extrabold text-purple-700">
                  <span>View Health ID Token</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Card 5: My Health Records */}
              <button
                onClick={() => setActiveView('records')}
                className="bg-white hover:bg-slate-50 p-6 rounded-3xl border border-slate-200 transition-all text-left space-y-4 group shadow-sm hover:shadow-md"
              >
                <div className="w-12 h-12 bg-emerald-50 text-[#2E7D32] rounded-2xl border border-emerald-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-[#263238] group-hover:text-[#2E7D32] transition-colors">
                    📋 My Medical Records
                  </h3>
                  <p className="text-xs text-[#607D8B] mt-1">
                    Consultations, reports and prescriptions.
                  </p>
                </div>
                <div className="flex items-center space-x-1 text-xs font-extrabold text-[#2E7D32]">
                  <span>View Health Timeline</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Card 6: My Referrals */}
              <button
                onClick={() => setActiveView('referrals')}
                className="bg-white hover:bg-slate-50 p-6 rounded-3xl border border-slate-200 transition-all text-left space-y-4 group shadow-sm hover:shadow-md"
              >
                <div className="w-12 h-12 bg-[#E0F2F1] text-[#00695C] rounded-2xl border border-[#00695C]/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Send className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-[#263238] group-hover:text-[#00695C] transition-colors">
                    📨 My Referrals
                  </h3>
                  <p className="text-xs text-[#607D8B] mt-1">
                    Track healthcare referrals.
                  </p>
                </div>
                <div className="flex items-center space-x-1 text-xs font-extrabold text-[#00695C]">
                  <span>Track Status</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Card 7: Health Statistics */}
              <button
                onClick={() => setActiveView('statistics')}
                className="bg-white hover:bg-slate-50 p-6 rounded-3xl border border-slate-200 transition-all text-left space-y-4 group shadow-sm hover:shadow-md"
              >
                <div className="w-12 h-12 bg-[#E0F2F1] text-[#00695C] rounded-2xl border border-[#00695C]/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-[#263238] group-hover:text-[#00695C] transition-colors">
                    📊 Health Statistics
                  </h3>
                  <p className="text-xs text-[#607D8B] mt-1">
                    Medical record analysis & vitals history.
                  </p>
                </div>
                <div className="flex items-center space-x-1 text-xs font-extrabold text-[#00695C]">
                  <span>View Statistics</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>

            {/* Emergency Help Banner (Red #C62828 strictly for Emergency Action) */}
            <div className="bg-red-50 border-2 border-[#C62828] p-5 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-[#C62828] text-white rounded-2xl font-black">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-[#C62828] text-base">🚑 EMERGENCY ASSISTANCE (102 / 108)</h4>
                  <p className="text-xs text-red-800">Immediate trauma ambulance response & critical emergency assistance.</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveView('emergency')}
                  className="px-4 py-2.5 bg-white border border-[#C62828] text-[#C62828] text-xs font-black rounded-xl hover:bg-red-100 transition-colors shadow-sm"
                >
                  OPEN EMERGENCY VIEW
                </button>

                <a
                  href="tel:108"
                  className="px-5 py-2.5 bg-[#C62828] hover:bg-red-800 text-white text-xs font-black rounded-xl shadow transition-colors flex items-center space-x-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>CALL 108</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW 2: FIND HEALTHCARE (HOSPITALS & PHCs - WITH MAP INSIDE DISCOVERY) --- */}
        {activeView === 'hospitals' && (() => {
          const filteredHospitals = hospitals.filter((h) => {
            if (healthcareSearch.trim()) {
              const q = healthcareSearch.toLowerCase();
              const match = h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q) || h.facility_type.toLowerCase().includes(q) || h.address.toLowerCase().includes(q);
              if (!match) return false;
            }
            if (facilityFilter === 'NEARBY') return (h.distance_km ?? 0) <= 5;
            if (facilityFilter === 'BEDS') return (h.general_beds ?? 0) > 0;
            if (facilityFilter === 'ICU') return (h.icu_beds ?? 0) > 0;
            if (facilityFilter === 'EMERGENCY') return !!(h.emergency_number || h.name.toLowerCase().includes('hospital') || h.name.toLowerCase().includes('aiims') || h.name.toLowerCase().includes('ggh'));
            if (facilityFilter === 'MRI') return h.name.toLowerCase().includes('mri') || h.facility_type.toLowerCase().includes('diagnostic') || h.name.toLowerCase().includes('aiims') || h.name.toLowerCase().includes('ggh');
            if (facilityFilter === 'CT') return h.name.toLowerCase().includes('ct') || h.name.toLowerCase().includes('aiims') || h.name.toLowerCase().includes('ggh');
            if (facilityFilter === 'HOSPITAL') return h.facility_type.toLowerCase().includes('hospital');
            if (facilityFilter === 'PHC') return h.facility_type.toLowerCase().includes('phc') || h.facility_type.toLowerCase().includes('primary');
            return true;
          });

          return (
            <div className="space-y-6">
              {/* Header Bar */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-black text-xl text-[#263238]">Healthcare Facilities Discovery</h3>
                    <p className="text-xs text-[#607D8B]">
                      Showing hospitals & PHCs near <span className="text-[#00695C] font-bold">{location.label}</span>
                    </p>
                  </div>

                  {/* Radius Search Controls */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-[#607D8B]">Radius:</span>
                    {[10, 25, 50].map((r) => (
                      <button
                        key={r}
                        onClick={() => setRadiusKm(r)}
                        className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all ${
                          radiusKm === r ? 'bg-[#00695C] text-white shadow' : 'bg-slate-100 text-[#263238] hover:bg-slate-200'
                        }`}
                      >
                        {r} KM
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dedicated Healthcare Contextual Search Bar */}
                <SmartModuleSearch
                  moduleKey="healthcare"
                  placeholder="🔎 Search hospitals, PHCs, clinics, services..."
                  value={healthcareSearch}
                  onChange={setHealthcareSearch}
                  onSelectResult={handleSelectHealthcareResult}
                  onClear={() => setHealthcareSearch('')}
                  localDataset={hospitals}
                />
              </div>

              {/* System Legend Bar (Distance & Availability Indicators) */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 text-xs space-y-3 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[#607D8B] tracking-wider block">
                      📍 DISTANCE INDICATOR:
                    </span>
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded border bg-emerald-50 text-[#2E7D32] border-emerald-300 font-bold">🟢 0–5 km (Very Near)</span>
                      <span className="px-2 py-0.5 rounded border bg-amber-50 text-[#F9A825] border-amber-300 font-bold">🟡 &gt;5–10 km (Nearby)</span>
                      <span className="px-2 py-0.5 rounded border bg-blue-50 text-[#1565C0] border-blue-300 font-bold">🔵 &gt;10–25 km (Moderate)</span>
                      <span className="px-2 py-0.5 rounded border bg-red-50 text-[#C62828] border-red-300 font-bold">🔴 &gt;25 km+ (Farther)</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[#607D8B] tracking-wider block">
                      🏥 AVAILABILITY STATUS:
                    </span>
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded border bg-emerald-50 text-[#2E7D32] border-emerald-300 font-bold">🟢 AVAILABLE</span>
                      <span className="px-2 py-0.5 rounded border bg-amber-50 text-[#F9A825] border-amber-300 font-bold">🟡 LIMITED</span>
                      <span className="px-2 py-0.5 rounded border bg-blue-50 text-[#1565C0] border-blue-300 font-bold">🔵 SERVICE AVAILABLE</span>
                      <span className="px-2 py-0.5 rounded border bg-red-50 text-[#C62828] border-red-300 font-bold">🔴 UNAVAILABLE</span>
                      <span className="px-2 py-0.5 rounded border bg-slate-100 text-[#78909C] border-slate-300 font-bold">⚪ LIVE DATA UNAVAILABLE</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Functional Filters System */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
                <span className="text-xs font-bold text-[#607D8B] shrink-0 flex items-center space-x-1">
                  <Filter className="w-3.5 h-3.5 text-[#00695C]" />
                  <span>Filter:</span>
                </span>

                {[
                  { id: 'ALL', label: 'All Facilities' },
                  { id: 'NEARBY', label: '🟢 Nearby (< 5 km)' },
                  { id: 'BEDS', label: '🟢 Beds Available' },
                  { id: 'ICU', label: '🟢 ICU Available' },
                  { id: 'EMERGENCY', label: '🟢 Emergency Service' },
                  { id: 'MRI', label: '🧠 MRI / Diagnostics' },
                  { id: 'CT', label: '🩻 CT Scan' },
                  { id: 'HOSPITAL', label: '🏥 Hospitals' },
                  { id: 'PHC', label: '🩺 PHCs' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFacilityFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold shrink-0 border transition-all ${
                      facilityFilter === f.id
                        ? 'bg-[#00695C] text-white border-[#00695C] shadow'
                        : 'bg-white text-[#263238] hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Mobile View Toggle Bar ([ 📋 LIST VIEW ] [ 🗺️ MAP VIEW ]) */}
              <div className="lg:hidden flex items-center bg-[#E0F2F1] p-1 rounded-2xl border border-[#00695C]/20 shadow-xs mb-2">
                <button
                  onClick={() => setHealthcareMobileTab('list')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 ${
                    healthcareMobileTab === 'list'
                      ? 'bg-[#00695C] text-white shadow-md'
                      : 'text-[#00695C] hover:bg-white/50'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>📋 LIST VIEW ({filteredHospitals.length})</span>
                </button>

                <button
                  onClick={() => setHealthcareMobileTab('map')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 ${
                    healthcareMobileTab === 'map'
                      ? 'bg-[#00695C] text-white shadow-md'
                      : 'text-[#00695C] hover:bg-white/50'
                  }`}
                >
                  <Map className="w-4 h-4" />
                  <span>🗺️ MAP VIEW</span>
                </button>
              </div>

              {/* Desktop Side-by-Side & Mobile Tabbed Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Healthcare Results Cards (col-span-7) */}
                <div className={`lg:col-span-7 space-y-4 ${healthcareMobileTab === 'map' ? 'hidden lg:block' : 'block'}`}>
                  {filteredHospitals.length === 0 ? (
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3">
                      <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
                      <h4 className="font-bold text-[#263238] text-base">No Matching Facilities Found</h4>
                      <p className="text-xs text-[#607D8B]">Try changing your filter settings or expanding your search radius.</p>
                      <button
                        onClick={() => setFacilityFilter('ALL')}
                        className="px-4 py-2 bg-[#00695C] text-white text-xs font-bold rounded-xl"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredHospitals.map((h) => {
                        const isSelected = String(h.id) === String(selectedHospitalId);
                        const distBadge = getDistanceBadge(h.distance_km);
                        const bedBadge = getBedAvailabilityBadge(h);
                        const icuBadge = getIcuBadge(h);
                        const staffBadge = getStaffBadge(h);
                        const mriBadge = getDiagnosticBadge('MRI', h);
                        const emergencyBadge = getEmergencyBadge(h);
                        const overallStatus = getOverallFacilityStatus(h);

                        return (
                          <div
                            key={h.id}
                            onClick={() => setSelectedHospitalId(h.id)}
                            className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-4 shadow-sm ${
                              isSelected
                                ? 'bg-white border-[#00695C] ring-2 ring-[#00695C]/30'
                                : 'bg-white hover:border-slate-300 border-slate-200'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-[10px] font-bold text-[#00695C] uppercase bg-[#E0F2F1] px-2 py-0.5 rounded border border-[#00695C]/20">
                                    {h.facility_type || 'Healthcare Facility'}
                                  </span>
                                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded border ${overallStatus.badgeClass}`}>
                                    Overall: {overallStatus.label}
                                  </span>
                                </div>
                                <h4 className="font-black text-[#263238] text-base mt-1">🏥 {h.name}</h4>
                                <p className="text-xs text-[#607D8B]">{h.address || h.city}</p>
                              </div>

                              {/* Separate Distance & Availability Badges */}
                              <div className="flex flex-col items-end space-y-1 ml-2 shrink-0">
                                <span className={`px-3 py-1 text-xs font-black rounded-full border ${distBadge.badgeClass}`}>
                                  {distBadge.label}
                                </span>
                                <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border ${bedBadge.badgeClass}`}>
                                  {bedBadge.label}
                                </span>
                              </div>
                            </div>

                            {/* Structured Facility Availability Grid */}
                            <div className="bg-[#F7FAF9] p-3.5 rounded-2xl border border-slate-200 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200">
                                <span className="text-[#607D8B] font-bold text-[11px] flex items-center space-x-1">
                                  <Bed className="w-3.5 h-3.5 text-[#00695C]" />
                                  <span>ICU Beds:</span>
                                </span>
                                <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded border ${icuBadge.badgeClass}`}>
                                  {icuBadge.label}
                                </span>
                              </div>

                              <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200">
                                <span className="text-[#607D8B] font-bold text-[11px] flex items-center space-x-1">
                                  <Bed className="w-3.5 h-3.5 text-[#00695C]" />
                                  <span>General Beds:</span>
                                </span>
                                <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded border ${bedBadge.badgeClass}`}>
                                  {bedBadge.label}
                                </span>
                              </div>

                              <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200">
                                <span className="text-[#607D8B] font-bold text-[11px] flex items-center space-x-1">
                                  <Stethoscope className="w-3.5 h-3.5 text-[#1565C0]" />
                                  <span>Staff / Doctors:</span>
                                </span>
                                <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded border ${staffBadge.badgeClass}`}>
                                  {staffBadge.label}
                                </span>
                              </div>

                              <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200">
                                <span className="text-[#607D8B] font-bold text-[11px] flex items-center space-x-1">
                                  <Activity className="w-3.5 h-3.5 text-purple-700" />
                                  <span>MRI / CT Diagnostics:</span>
                                </span>
                                <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded border ${mriBadge.badgeClass}`}>
                                  {mriBadge.label}
                                </span>
                              </div>
                            </div>

                            {/* Actions Bar */}
                            <div className="flex items-center space-x-2 pt-1">
                              {/* Secondary Button: [ VIEW DETAILS ] (White background, #00695C border & text) */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewingFacilityModal(h);
                                }}
                                className="flex-1 py-2 bg-white hover:bg-slate-50 text-[#00695C] border border-[#00695C] rounded-xl text-xs font-extrabold text-center transition-colors flex items-center justify-center space-x-1"
                              >
                                <Info className="w-3.5 h-3.5" />
                                <span>VIEW DETAILS</span>
                              </button>

                              {/* Primary Button: [ DIRECTIONS ] (#00695C background, white text) */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openGoogleMapsDirections(h);
                                }}
                                className="flex-1 py-2 bg-[#00695C] hover:bg-[#004D40] text-white rounded-xl text-xs font-extrabold text-center shadow transition-colors flex items-center justify-center space-x-1.5"
                              >
                                <Navigation className="w-3.5 h-3.5" />
                                <span>DIRECTIONS</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right Column: Sticky Google Maps Canvas Side-by-Side (col-span-5) */}
                <div className={`lg:col-span-5 lg:sticky lg:top-20 space-y-3 ${healthcareMobileTab === 'list' ? 'hidden lg:block' : 'block'}`}>
                  <InteractiveHealthcareMap
                    userLat={location.latitude}
                    userLng={location.longitude}
                    userLabel={location.label}
                    hospitals={filteredHospitals}
                    selectedHospitalId={selectedHospitalId}
                    onSelectHospital={(h) => setSelectedHospitalId(h.id)}
                    onOpenDirections={openGoogleMapsDirections}
                  />
                </div>
              </div>
            </div>
          );
        })()}

        {/* --- VIEW 3: FIND DOCTOR --- */}
        {activeView === 'doctors' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-black text-xl text-[#263238]">Specialist Doctor Discovery</h3>

              <SmartModuleSearch
                moduleKey="doctors"
                placeholder="🔎 Search doctor, specialty, department..."
                value={doctorSearch}
                onChange={setDoctorSearch}
                onSelectResult={handleSelectDoctorResult}
                onClear={() => setDoctorSearch('')}
              />

              <div className="flex flex-wrap gap-2 pt-1">
                {['Cardiology', 'General Physician', 'Orthopedics', 'Neurologist'].map((spec) => (
                  <button
                    key={spec}
                    onClick={() => setSpecialistFilter(specialistFilter === spec ? '' : spec)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      specialistFilter === spec ? 'bg-[#00695C] text-white border-[#00695C] shadow' : 'bg-slate-100 text-[#263238] hover:bg-slate-200 border-slate-200'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: 'Dr. Manoj Reddy', spec: 'Cardiologist', dept: 'Cardiology & Intensive Care', exp: '12 years exp', lang: 'English, Telugu, Hindi', mode: 'In-person / Tele-consultation', reg: 'MCI-DEL-2012-4421', hosp: 'AIIMS Delhi — DEMO', status: 'ON DUTY' },
                { name: 'Dr. Surya', spec: 'General Physician', dept: 'Internal Medicine', exp: '8 years exp', lang: 'English, Hindi', mode: 'In-person', reg: 'MCI-DEL-2015-8890', hosp: 'Safdarjung Hospital — DEMO', status: 'ON DUTY' },
                { name: 'Dr. Sameeruddin', spec: 'Orthopedist', dept: 'Orthopedics & Joint Surgery', exp: '15 years exp', lang: 'English, Hindi, Urdu', mode: 'In-person', reg: 'MCI-DEL-2010-1123', hosp: 'Max Super Speciality Hospital — DEMO', status: 'ON DUTY' },
                { name: 'Dr. Sunita Rani', spec: 'Pediatrician', dept: 'Maternal & Child Health', exp: '7 years exp', lang: 'English, Hindi', mode: 'In-person', reg: 'MCI-HR-2018-9901', hosp: 'Community Health Centre (CHC) Ballabhgarh — DEMO', status: 'ON DUTY' },
                { name: 'Dr. Ramesh Verma', spec: 'Neurologist', dept: 'Neurology & Stroke Care', exp: '16 years exp', lang: 'English, Telugu', mode: 'In-person', reg: 'APMC-2009-3344', hosp: 'GGH Kakinada — DEMO', status: 'ON DUTY' },
                { name: 'Dr. Ananya Rao', spec: 'Gynecologist', dept: 'Obstetrics & Women Care', exp: '10 years exp', lang: 'English, Telugu', mode: 'In-person', reg: 'APMC-2014-7711', hosp: 'Apollo Hospitals Kakinada — DEMO', status: 'ON DUTY' },
                { name: 'Dr. Vikram Malhotra', spec: 'General Surgeon', dept: 'Surgical Gastroenterology', exp: '14 years exp', lang: 'English, Telugu, Hindi', mode: 'In-person', reg: 'TSMC-2011-5544', hosp: 'NIMS Hyderabad — DEMO', status: 'ON DUTY' },
                { name: 'Dr. Priya Sharma', spec: 'ENT Specialist', dept: 'Otorhinolaryngology', exp: '9 years exp', lang: 'English, Hindi, Telugu', mode: 'In-person', reg: 'TSMC-2016-2211', hosp: 'Yashoda Hospitals Secunderabad — DEMO', status: 'ON DUTY' }
              ]
                .filter((d) => {
                  if (specialistFilter && !d.spec.toLowerCase().includes(specialistFilter.toLowerCase())) return false;
                  if (doctorSearch.trim()) {
                    const q = doctorSearch.toLowerCase();
                    return d.name.toLowerCase().includes(q) || d.spec.toLowerCase().includes(q) || d.dept.toLowerCase().includes(q) || d.hosp.toLowerCase().includes(q);
                  }
                  return true;
                })
                .map((doc, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-[#263238] text-lg">🩺 {doc.name}</h4>
                        <p className="text-xs text-[#00695C] font-bold">{doc.spec} • {doc.hosp}</p>
                        <p className="text-xs text-[#607D8B] mt-0.5">{doc.dept} • {doc.exp}</p>
                        <p className="text-[10px] font-mono text-slate-500 mt-1">Reg: {doc.reg} • Languages: {doc.lang}</p>
                      </div>
                      <span className="px-3 py-1 bg-emerald-50 text-[#2E7D32] border border-emerald-300 text-xs font-extrabold rounded-full">
                        {doc.status}
                      </span>
                    </div>

                    <button
                      onClick={() => alert(`Consultation request initiated for ${doc.name} at ${doc.hosp}`)}
                      className="w-full py-2.5 bg-[#00695C] hover:bg-[#004D40] text-white rounded-xl text-xs font-extrabold shadow transition-colors"
                    >
                      BOOK CONSULTATION ({doc.mode})
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* --- VIEW 4: DIAGNOSTICS --- */}
        {activeView === 'diagnostics' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-black text-xl text-[#263238]">Diagnostic Test & Lab Facilities</h3>
              <p className="text-xs text-[#607D8B]">Search MRI 3T, CT Scan 128 Slice, Digital X-Ray, Pathology & Biomarkers</p>

              <SmartModuleSearch
                moduleKey="diagnostics"
                placeholder="🔎 Search tests, scans, diagnostic centres..."
                value={diagnosticSearch}
                onChange={setDiagnosticSearch}
                onSelectResult={handleSelectDiagnosticResult}
                onClear={() => setDiagnosticSearch('')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: 'MRI Scan 3T', cat: 'Radiology', hosp: 'AIIMS Delhi — DEMO', wait: '15 mins', lat: 28.5672, lng: 77.2100, status: '🟢 AVAILABLE — DEMO' },
                { name: 'CT Scan 128 Slice', cat: 'Radiology', hosp: 'AIIMS Delhi — DEMO', wait: '10 mins', lat: 28.5672, lng: 77.2100, status: '🟢 AVAILABLE — DEMO' },
                { name: 'Digital X-Ray & Ultrasound', cat: 'Radiology', hosp: 'Safdarjung Hospital — DEMO', wait: '20 mins', lat: 28.5689, lng: 77.2065, status: '🟢 AVAILABLE — DEMO' },
                { name: 'Pathology & Cardiac Biomarkers', cat: 'Pathology', hosp: 'Max Super Speciality Hospital — DEMO', wait: '5 mins', lat: 28.5284, lng: 77.2118, status: '🟡 LIMITED — DEMO' },
                { name: 'MRI 1.5T & CT Diagnostics', cat: 'Radiology', hosp: 'GGH Kakinada — DEMO', wait: '12 mins', lat: 16.9891, lng: 82.2475, status: '🟢 AVAILABLE — DEMO' },
                { name: 'Advanced Cath Lab & Cardiac MRI', cat: 'Cardiology', hosp: 'NIMS Hyderabad — DEMO', wait: '10 mins', lat: 17.4239, lng: 78.4526, status: '🟢 AVAILABLE — DEMO' },
                { name: 'Whole Body PET-CT & MRI', cat: 'Nuclear Radiology', hosp: 'Reddy Diagnostic & Imaging Centre — DEMO', wait: '15 mins', lat: 28.5492, lng: 77.2021, status: '🔵 SERVICE AVAILABLE — DEMO' },
                { name: 'Complete Blood Count (CBC) & Metabolic Panel', cat: 'Pathology', hosp: 'Apollo Hospitals Kakinada — DEMO', wait: '8 mins', lat: 16.9582, lng: 82.2384, status: '🟢 AVAILABLE — DEMO' }
              ]
                .filter((diag) => {
                  if (!diagnosticSearch.trim()) return true;
                  const q = diagnosticSearch.toLowerCase();
                  return diag.name.toLowerCase().includes(q) || diag.cat.toLowerCase().includes(q) || diag.hosp.toLowerCase().includes(q);
                })
                .map((diag, idx) => (
                <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-[#263238] text-lg">🧪 {diag.name}</h4>
                      <p className="text-xs text-[#1565C0] font-bold">{diag.cat} • {diag.hosp}</p>
                      <span className="text-[10px] font-bold text-[#2E7D32] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-1 inline-block">
                        {diag.status}
                      </span>
                    </div>
                    <span className="px-3 py-1 bg-blue-50 text-[#1565C0] border border-blue-300 text-xs font-extrabold rounded-full">
                      Wait: {diag.wait}
                    </span>
                  </div>

                  <button
                    onClick={() => openGoogleMapsDirections({ latitude: diag.lat, longitude: diag.lng, name: diag.hosp } as any)}
                    className="w-full py-2.5 bg-[#00695C] hover:bg-[#004D40] text-white rounded-xl text-xs font-extrabold shadow flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>VIEW FACILITY & DIRECTIONS</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- VIEW 5: MY HEALTH ID (HEALTHCARE TEAL + SUBTLE SAFFRON ACCENT) --- */}
        {activeView === 'identity' && (() => {
          const publicAppUrl = (import.meta as any).env?.VITE_PUBLIC_APP_URL;
          const targetHost = publicAppUrl
            ? publicAppUrl
            : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            ? (networkIp ? `http://${networkIp}:5000` : window.location.origin)
            : window.location.origin;

          const qrToken = activePatientUid;
          const mobileQrUrl = `${targetHost}/api/health-records/access/${qrToken}`;

          return (
            <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-slate-200 space-y-6 text-center shadow-md relative overflow-hidden">
              <div className="tricolour-strip absolute top-0 left-0 right-0" />

              <div className="pt-2">
                <span className="text-[10px] font-bold text-[#00695C] bg-[#E0F2F1] px-3 py-1 rounded-full border border-[#00695C]/20 tracking-wider uppercase">
                  OFFICIAL SIH HEALTH ID
                </span>
                <h3 className="font-black text-2xl text-[#263238] mt-2">{activePatientName}</h3>
                <p className="text-xs font-mono text-[#00695C] font-bold mt-1">
                  UID: {activePatientUid}
                </p>
              </div>

              {/* Exact User-Uploaded QR Code Image */}
              <div className="bg-white p-4 rounded-2xl max-w-[220px] mx-auto shadow border-2 border-[#00695C]/40 space-y-2">
                <img
                  src="/health_id_qr.png"
                  alt={`${activePatientName} Health ID QR Code`}
                  className="w-[180px] h-[180px] mx-auto object-contain cursor-pointer hover:scale-105 transition-transform"
                  onClick={downloadPdfReport}
                />
                <span className="text-[10px] font-extrabold text-[#263238] uppercase block tracking-wider">
                  PERMANENT HEALTH QR
                </span>
              </div>

              {/* Scannable Wi-Fi SVG QR Code Backup */}
              <div className="bg-[#F7FAF9] p-4 rounded-2xl border border-slate-200 space-y-2 text-center">
                <span className="text-[10px] font-mono text-[#00695C] font-bold block uppercase">
                  📱 Mobile Phone Scannable QR Code
                </span>
                <div className="bg-white p-3 rounded-xl max-w-[150px] mx-auto border border-slate-200">
                  <QRCodeSVG
                    value={mobileQrUrl}
                    size={120}
                    level="H"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  onClick={downloadPdfReport}
                  className="w-full py-3 bg-[#00695C] hover:bg-[#004D40] text-white font-extrabold text-xs rounded-xl shadow flex items-center justify-center space-x-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Clinical EHR Report (PDF)</span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activePatientUid);
                    alert(`Permanent Health ID (${activePatientUid}) copied to clipboard!`);
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-[#263238] rounded-xl text-xs font-extrabold border border-slate-300 flex items-center justify-center space-x-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy UID</span>
                </button>
              </div>
            </div>
          );
        })()}

        {/* --- VIEW 6: MY HEALTH RECORDS (CLINICAL MOSTLY WHITE THEME) --- */}
        {activeView === 'records' && (() => {
          const filteredRecords = patientRecords.filter((rec) => {
            if (!recordSearch.trim()) return true;
            const q = recordSearch.toLowerCase();
            return (
              rec.title.toLowerCase().includes(q) ||
              rec.record_type.toLowerCase().includes(q) ||
              (rec.diagnosis && rec.diagnosis.toLowerCase().includes(q)) ||
              (rec.notes && rec.notes.toLowerCase().includes(q)) ||
              rec.hospital_name.toLowerCase().includes(q) ||
              (rec.created_by && rec.created_by.toLowerCase().includes(q))
            );
          });

          return (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-black text-xl text-[#263238]">Centralized Medical Timeline</h3>
                    <p className="text-xs text-[#607D8B]">
                      Authorized medical consultations & radiology reports for <span className="text-[#00695C] font-bold">{activePatientName}</span>
                    </p>
                  </div>

                  <button
                    onClick={downloadPdfReport}
                    className="px-4 py-2.5 bg-[#00695C] hover:bg-[#004D40] text-white text-xs font-extrabold rounded-xl shadow flex items-center space-x-1.5 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export PDF Report</span>
                  </button>
                </div>

                <SmartModuleSearch
                  moduleKey="records"
                  placeholder="🔎 Search medical records, doctors, diagnoses..."
                  value={recordSearch}
                  onChange={setRecordSearch}
                  onSelectResult={handleSelectRecordResult}
                  onClear={() => setRecordSearch('')}
                  localDataset={patientRecords}
                />
              </div>

              {filteredRecords.length === 0 ? (
                <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center space-y-3 shadow-sm">
                  <FileText className="w-12 h-12 text-[#607D8B] mx-auto" />
                  <h4 className="font-extrabold text-[#263238] text-lg">No Medical Records Available</h4>
                  <p className="text-xs text-[#607D8B] max-w-sm mx-auto">
                    No medical records match your search <span className="text-[#00695C] font-bold">"{recordSearch}"</span> for <span className="text-[#00695C] font-bold">{activePatientName}</span>.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRecords.map((rec) => (
                    <div key={rec.id} className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold text-[#F57C00] bg-amber-50 px-2.5 py-1 rounded border border-[#F57C00]/20">
                            {rec.record_type}
                          </span>
                          <h4 className="font-extrabold text-[#263238] text-base mt-2">📋 {rec.title}</h4>
                          <p className="text-xs text-[#607D8B]">Facility: {rec.hospital_name} • Attending: {rec.created_by}</p>
                        </div>
                        <div className="text-right space-y-2">
                          <span className="text-xs text-[#607D8B] font-mono block">
                            {new Date(rec.created_at).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => setViewingDocRecord(rec)}
                            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-[#00695C] rounded-xl text-xs font-black border border-[#00695C] shadow-sm transition-colors"
                          >
                            [ VIEW REPORT ]
                          </button>
                        </div>
                      </div>

                      {rec.diagnosis && (
                        <div className="bg-[#F7FAF9] p-3 rounded-xl border border-slate-200 text-xs">
                          <span className="text-[#607D8B] font-bold block text-[10px]">DIAGNOSIS</span>
                          <p className="text-[#263238]">{rec.diagnosis}</p>
                        </div>
                      )}

                      {rec.prescription_data && rec.prescription_data.length > 0 && (
                        <div className="bg-[#F7FAF9] p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                          <span className="text-[#2E7D32] font-bold block text-[10px]">PRESCRIBED MEDICATION</span>
                          {rec.prescription_data.map((m: any, idx: number) => (
                            <div key={idx} className="text-[#263238] font-mono text-[11px]">
                              • {m.medicine} - {m.dosage} ({m.duration})
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* --- VIEW 7: MY REFERRALS --- */}
        {activeView === 'referrals' && (() => {
          const filteredReferrals = patientReferrals.filter((ref) => {
            if (!referralSearch.trim()) return true;
            const q = referralSearch.toLowerCase();
            return (
              ref.referral_code.toLowerCase().includes(q) ||
              ref.required_specialty.toLowerCase().includes(q) ||
              (ref.destination_hospital_name && ref.destination_hospital_name.toLowerCase().includes(q)) ||
              ref.status.toLowerCase().includes(q)
            );
          });

          return (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div>
                  <h3 className="font-black text-xl text-[#263238]">Inter-Hospital Transfer Referrals</h3>
                  <p className="text-xs text-[#607D8B]">Track status of clinical transfer requests for <span className="text-[#00695C] font-bold">{activePatientName}</span></p>
                </div>

                <SmartModuleSearch
                  moduleKey="referrals"
                  placeholder="🔎 Search referrals, code, doctor, specialty..."
                  value={referralSearch}
                  onChange={setReferralSearch}
                  onSelectResult={handleSelectReferralResult}
                  onClear={() => setReferralSearch('')}
                  localDataset={patientReferrals}
                />
              </div>

              {filteredReferrals.length === 0 ? (
                <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center space-y-3 shadow-sm">
                  <Send className="w-12 h-12 text-[#607D8B] mx-auto" />
                  <h4 className="font-extrabold text-[#263238] text-lg">No Transfer Referrals Found</h4>
                  <p className="text-xs text-[#607D8B] max-w-sm mx-auto">
                    No inter-hospital transfer referrals match your search <span className="text-[#00695C] font-bold">"{referralSearch}"</span> for <span className="text-[#00695C] font-bold">{activePatientName}</span>.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReferrals.map((ref) => (
                    <div key={ref.id} className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-mono font-bold text-[#00695C] bg-[#E0F2F1] px-2.5 py-1 rounded border border-[#00695C]/20">
                            {ref.referral_code}
                          </span>
                          <h4 className="font-black text-[#263238] text-lg mt-2">Transfer to {ref.destination_hospital_name}</h4>
                          <p className="text-xs text-[#607D8B]">Referring Facility: {ref.referring_hospital_name} • Doctor: {ref.referring_doctor_name}</p>
                        </div>
                        <span className="px-3 py-1 bg-amber-50 text-[#F9A825] border border-amber-200 text-xs font-extrabold rounded-full">
                          {ref.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* --- VIEW: HEALTH STATISTICS (MEDICAL-RECORD DATA ONLY) --- */}
        {activeView === 'statistics' && authSession && (
          <HealthStatisticsView
            patient={authSession.patient}
            records={patientRecords}
            referrals={patientReferrals}
            onNavigateToRecords={() => setActiveView('records')}
          />
        )}

        {/* --- VIEW: EMERGENCY ASSISTANCE MODULE --- */}
        {activeView === 'emergency' && authSession && (
          <EmergencyView
            patient={authSession.patient}
            location={{ latitude: location.latitude, longitude: location.longitude, label: location.label }}
            hospitals={hospitals}
            records={patientRecords}
            onOpenDirections={openGoogleMapsDirections}
            onNavigateToHospital={(hId) => {
              setSelectedHospitalId(hId);
              setActiveView('hospitals');
            }}
          />
        )}

        {/* --- VIEW: HEALTH TRACK — COMPLETE TREATMENT JOURNEY --- */}
        {activeView === 'health_track' && authSession && (
          <HealthTrackView
            patient={authSession.patient}
            records={patientRecords}
            onFindFacility={(query, module) => {
              if (module === 'diagnostics') {
                setDiagnosticSearchInput(query);
                setActiveView('diagnostics');
              } else if (module === 'doctors') {
                setSpecialistFilter(query);
                setActiveView('doctors');
              } else {
                setHealthcareSearch(query);
                setActiveView('hospitals');
              }
            }}
            onSelectRecord={(rec) => {
              setViewingDocRecord(rec);
            }}
          />
        )}

        {/* --- VIEW 8: USER PROFILE & SESSION IDENTITY --- */}
        {activeView === 'profile' && authSession && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6 shadow-sm relative overflow-hidden">
              <div className="tricolour-strip absolute top-0 left-0 right-0" />
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 pt-1">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 bg-[#E0F2F1] text-[#00695C] rounded-2xl border border-[#00695C]/20 flex items-center justify-center font-black text-2xl">
                    {activePatientName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-2xl text-[#263238]">{activePatientName}</h3>
                    <p className="text-xs font-mono text-[#00695C] font-bold">
                      Health ID (UID): {activePatientUid}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-[#C62828] border border-red-200 rounded-xl text-xs font-black shadow-sm transition-colors"
                >
                  Log Out
                </button>
              </div>

              {/* Profile Details Form */}
              <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
                <h4 className="font-extrabold text-[#263238] uppercase text-xs tracking-wider">
                  Editable Account Profile & Identity
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[#607D8B] font-bold">Full Patient Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-[#00695C] rounded-xl py-2.5 px-3 text-xs font-bold text-[#263238] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#607D8B] font-bold">Age (Years)</label>
                    <input
                      type="number"
                      value={editAge}
                      onChange={(e) => setEditAge(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-[#00695C] rounded-xl py-2.5 px-3 text-xs font-bold text-[#263238] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#607D8B] font-bold">Gender</label>
                    <select
                      value={editGender}
                      onChange={(e) => setEditGender(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-[#00695C] rounded-xl py-2.5 px-3 text-xs font-bold text-[#263238] focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#607D8B] font-bold">Blood Group</label>
                    <input
                      type="text"
                      value={editBloodGroup}
                      onChange={(e) => setEditBloodGroup(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-[#00695C] rounded-xl py-2.5 px-3 text-xs font-bold text-[#263238] focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[#607D8B] font-bold">Emergency Contact Phone / Name</label>
                    <input
                      type="text"
                      value={editEmergencyContact}
                      onChange={(e) => setEditEmergencyContact(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-[#00695C] rounded-xl py-2.5 px-3 text-xs font-bold text-[#263238] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="px-6 py-3 bg-[#00695C] hover:bg-[#004D40] text-white font-extrabold text-xs rounded-xl shadow transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isUpdatingProfile ? 'Saving Changes...' : 'SAVE PROFILE CHANGES'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* --- LOCATION SELECTION MODAL --- */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-black text-lg text-[#263238]">Select Your Active Location</h3>
              <button onClick={() => setShowLocationModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveManualModalSearch} className="space-y-3">
              <label className="text-xs font-bold text-[#263238] block">Search City, Pincode, or Landmark</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={manualSearchQuery}
                  onChange={(e) => setManualSearchQuery(e.target.value)}
                  placeholder="e.g. Kakinada, Delhi, Safdarjung..."
                  className="flex-1 bg-slate-50 border border-slate-300 focus:border-[#00695C] rounded-xl p-2.5 text-xs text-[#263238] placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={manualSearchResolving}
                  className="px-4 py-2.5 bg-[#00695C] hover:bg-[#004D40] text-white text-xs font-bold rounded-xl shadow disabled:opacity-50"
                >
                  {manualSearchResolving ? 'Resolving...' : 'Search'}
                </button>
              </div>
            </form>

            <div className="relative flex items-center justify-center my-2">
              <span className="bg-white px-3 text-[10px] font-bold text-[#607D8B] uppercase tracking-wider z-10">Or Use Device GPS / Presets</span>
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  requestDeviceGps();
                  setShowLocationModal(false);
                }}
                className="w-full p-3 bg-[#00695C] hover:bg-[#004D40] text-white text-xs font-extrabold rounded-xl flex items-center justify-between shadow"
              >
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>📍 Use Device GPS Hardware Location</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>

              {PRESET_LOCATIONS.map((loc: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => {
                    setManualLocation({
                      latitude: loc.latitude,
                      longitude: loc.longitude,
                      label: `Selected: ${loc.label}`,
                      isGps: false
                    });
                    setShowLocationModal(false);
                  }}
                  className="w-full p-3 bg-slate-50 hover:bg-[#E0F2F1] text-[#263238] text-xs font-bold rounded-xl border border-slate-200 flex items-center justify-between transition-colors"
                >
                  <span>{loc.label}</span>
                  <span className="text-[10px] font-mono text-[#607D8B]">({loc.latitude}°, {loc.longitude}°)</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- NOTIFICATIONS DRAWER --- */}
      {showNotificationsDrawer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-end z-50">
          <div className="bg-white border-l border-slate-200 w-full max-w-sm h-full p-6 space-y-6 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-[#00695C]" />
                <h3 className="font-black text-lg text-[#263238]">Notifications for {activePatientName}</h3>
              </div>
              <button
                onClick={() => setShowNotificationsDrawer(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-xs font-extrabold text-[#00695C]">{n.title}</span>
                  <p className="text-xs text-[#263238]">{n.body}</p>
                  <span className="text-[10px] text-[#607D8B] block text-right pt-1">{n.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- A4-STYLE DOCUMENT VIEWER MODAL --- */}
      {viewingDocRecord && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white text-[#263238] w-full max-w-2xl rounded-2xl p-8 space-y-6 shadow-2xl border border-slate-300 font-sans my-8">
            {/* Report Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-wider border border-amber-200">
                  DEMO / SAMPLE — CLINICAL E-HEALTH RECORD
                </span>
                <h3 className="font-black text-2xl text-slate-900 mt-1 uppercase tracking-tight">
                  {viewingDocRecord.hospital_name || 'DEMO HEALTHCARE FACILITY'}
                </h3>
                <p className="text-xs text-slate-600">Official Clinical Consultation & Diagnostic Imaging Report</p>
              </div>
              <button
                onClick={() => setViewingDocRecord(null)}
                className="p-1 text-slate-400 hover:text-slate-900 bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Demographics Summary */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-xs">
              <div><span className="font-bold text-slate-900">PATIENT NAME:</span> {activePatientName}</div>
              <div><span className="font-bold text-slate-900">HEALTH ID (UID):</span> {activePatientUid}</div>
              <div><span className="font-bold text-slate-900">AGE / GENDER:</span> {authSession.patient.age || 28} Yrs / {authSession.patient.gender || 'Female'}</div>
              <div><span className="font-bold text-slate-900">BLOOD GROUP:</span> {authSession.patient.blood_group || 'O+'}</div>
              <div><span className="font-bold text-slate-900">STUDY / REPORT:</span> {viewingDocRecord.title}</div>
              <div><span className="font-bold text-slate-900">REPORT DATE:</span> {new Date(viewingDocRecord.created_at).toLocaleDateString()}</div>
            </div>

            {/* Document Content Sections */}
            <div className="space-y-4 text-xs text-slate-800">
              <div>
                <h4 className="font-black text-slate-900 uppercase text-xs border-b border-slate-300 pb-1 mb-1">
                  CLINICAL INDICATION & TECHNIQUE
                </h4>
                <p className="text-slate-600">
                  {viewingDocRecord.title.includes('MRI')
                    ? 'Multiplanar T1, T2, FLAIR, and DWI sequences acquired on 3T Siemens MRI scanner without contrast.'
                    : viewingDocRecord.title.includes('CT')
                    ? 'High-Resolution 128-Slice CT Scan acquired in axial plane during single breath-hold.'
                    : 'Standard clinical evaluation and routine laboratory specimen collection.'}
                </p>
              </div>

              <div>
                <h4 className="font-black text-slate-900 uppercase text-xs border-b border-slate-300 pb-1 mb-1">
                  FINDINGS & DIAGNOSTIC IMPRESSION
                </h4>
                <p className="text-slate-800 font-medium leading-relaxed">
                  {viewingDocRecord.diagnosis || viewingDocRecord.notes || 'Brain parenchyma displays normal signal intensity. Ventricles and sulci are within normal age-appropriate limits. No acute intracranial hemorrhage or midline shift identified.'}
                </p>
              </div>

              {viewingDocRecord.prescription_data && viewingDocRecord.prescription_data.length > 0 && (
                <div>
                  <h4 className="font-black text-slate-900 uppercase text-xs border-b border-slate-300 pb-1 mb-1">
                    PRESCRIBED PHARMACOTHERAPY SCHEDULE
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2">MEDICINE</th>
                          <th className="p-2">DOSAGE</th>
                          <th className="p-2">DURATION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {viewingDocRecord.prescription_data.map((item, idx) => (
                          <tr key={idx}>
                            <td className="p-2 font-bold">{item.medicine}</td>
                            <td className="p-2">{item.dosage}</td>
                            <td className="p-2 text-slate-600">{item.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Signature & Action Buttons */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-xs">
              <div>
                <span className="font-bold text-slate-900 block">Attending Physician / Radiologist:</span>
                <span className="text-slate-600 font-mono">{viewingDocRecord.created_by || 'Dr. Manoj Reddy (MD Radiology)'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={downloadPdfReport}
                  className="px-4 py-2 bg-[#00695C] hover:bg-[#004D40] text-white font-bold rounded-xl shadow flex items-center space-x-1"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => setViewingDocRecord(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- FACILITY STATUS DETAILS MODAL --- */}
      {viewingFacilityModal && (() => {
        const distBadge = getDistanceBadge(viewingFacilityModal.distance_km);
        const bedBadge = getBedAvailabilityBadge(viewingFacilityModal);
        const icuBadge = getIcuBadge(viewingFacilityModal);
        const staffBadge = getStaffBadge(viewingFacilityModal);
        const mriBadge = getDiagnosticBadge('MRI', viewingFacilityModal);
        const ctBadge = getDiagnosticBadge('CT Scan', viewingFacilityModal);
        const emergencyBadge = getEmergencyBadge(viewingFacilityModal);
        const overallStatus = getOverallFacilityStatus(viewingFacilityModal);

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-6 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded border ${overallStatus.badgeClass}`}>
                    Overall: {overallStatus.label}
                  </span>
                  <h3 className="font-black text-xl text-[#263238] mt-1">{viewingFacilityModal.name}</h3>
                  <p className="text-xs text-[#607D8B]">{viewingFacilityModal.facility_type} • {viewingFacilityModal.address || viewingFacilityModal.city}</p>
                </div>
                <button onClick={() => setViewingFacilityModal(null)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase text-[#00695C] tracking-wider">
                  FACILITY STATUS BREAKDOWN
                </h4>

                <div className="bg-[#F7FAF9] p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-[#607D8B] font-bold">📍 Distance:</span>
                    <span className={`font-extrabold px-2.5 py-0.5 rounded border ${distBadge.badgeClass}`}>{distBadge.label}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-[#607D8B] font-bold">🛏 General Beds:</span>
                    <span className={`font-extrabold px-2.5 py-0.5 rounded border ${bedBadge.badgeClass}`}>{bedBadge.label}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-[#607D8B] font-bold">🏥 ICU Beds:</span>
                    <span className={`font-extrabold px-2.5 py-0.5 rounded border ${icuBadge.badgeClass}`}>{icuBadge.label}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-[#607D8B] font-bold">👨‍⚕️ Doctors / Staff:</span>
                    <span className={`font-extrabold px-2.5 py-0.5 rounded border ${staffBadge.badgeClass}`}>{staffBadge.label}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-[#607D8B] font-bold">🧠 MRI Scanning:</span>
                    <span className={`font-extrabold px-2.5 py-0.5 rounded border ${mriBadge.badgeClass}`}>{mriBadge.label}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-[#607D8B] font-bold">🩻 CT Scan:</span>
                    <span className={`font-extrabold px-2.5 py-0.5 rounded border ${ctBadge.badgeClass}`}>{ctBadge.label}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#607D8B] font-bold">🚑 Emergency Service:</span>
                    <span className={`font-extrabold px-2.5 py-0.5 rounded border ${emergencyBadge.badgeClass}`}>{emergencyBadge.label}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <a
                  href={`tel:${viewingFacilityModal.emergency_number || viewingFacilityModal.phone || '108'}`}
                  className="flex-1 py-2.5 bg-[#00695C] hover:bg-[#004D40] text-white font-extrabold rounded-xl text-xs text-center shadow flex items-center justify-center space-x-1"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Facility</span>
                </a>

                <button
                  onClick={() => {
                    openGoogleMapsDirections(viewingFacilityModal);
                    setViewingFacilityModal(null);
                  }}
                  className="flex-1 py-2.5 bg-white hover:bg-slate-50 text-[#00695C] font-extrabold rounded-xl text-xs border border-[#00695C] flex items-center justify-center space-x-1"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Get Directions</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Location Setup Modal right after Login or on Change Location click */}
      <LocationSetupModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onGrantGps={requestDeviceGps}
        onSelectLocation={(loc) => setManualLocation(loc)}
        gpsStatusMessage={gpsStatusMessage}
      />

      {/* Mobile Responsive Bottom Navigation Bar */}
      <BottomNav activeView={activeView} setActiveView={setActiveView} />

      {/* Floating AI Assistant Widget */}
      <AiChatbotWidget onExecuteAction={handleExecuteAiAction} />
    </div>
  );
};

export const CitizenApp: React.FC = () => (
  <LocationProvider>
    <LanguageProvider>
      <CitizenAppContent />
    </LanguageProvider>
  </LocationProvider>
);

export default CitizenApp;
