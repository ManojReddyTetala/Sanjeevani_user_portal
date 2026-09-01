import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  AlertTriangle,
  Siren,
  Phone,
  MapPin,
  Clock,
  User,
  HeartPulse,
  Activity,
  Truck,
  CheckCircle2,
  Share2,
  Stethoscope,
  Building2,
  Pill,
  Save,
  Send,
  FileText,
  XCircle,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Navigation,
  Compass,
  Gauge,
  Crosshair,
  RefreshCw
} from 'lucide-react';
import { EmergencyRequest, HospitalResource, PhcStaffMember, PhcMedicine, DiagnosticService, MedicalRecord } from '../../types';

interface PhcEmergencyControlRoomProps {
  facilityId: number;
  facilityName: string;
  resources: HospitalResource;
  staff: PhcStaffMember[];
  medicines: PhcMedicine[];
  diagnostics: DiagnosticService[];
  onBack: () => void;
  onRefreshData?: () => void;
}

export const PhcEmergencyControlRoom: React.FC<PhcEmergencyControlRoomProps> = ({
  facilityId,
  facilityName,
  resources,
  staff,
  medicines,
  diagnostics,
  onBack,
  onRefreshData
}) => {
  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>([
    {
      id: 101,
      patient_id: 1,
      patient_name: 'Rahul Kumar',
      patient_age: 42,
      patient_blood_group: 'B+',
      patient_phone: '+91-9876543210',
      health_id: 'UID-IND-9842-7104',
      facility_id: facilityId,
      facility_name: facilityName,
      facility_type: 'Primary Health Centre (PHC)',
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
      assigned_doctor: 'Dr. Sunita Rani (Medical Officer)',
      assigned_driver: 'Ramesh (Driver) • 108 Emergency Unit',
      eta_minutes: 4,
      created_at: new Date(Date.now() - 6 * 60000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 60000).toISOString()
    },
    {
      id: 102,
      patient_id: 2,
      patient_name: 'Ananya Sharma',
      patient_age: 29,
      patient_blood_group: 'A+',
      patient_phone: '+91-9876500112',
      health_id: 'UID-IND-8812-4401',
      facility_id: facilityId,
      facility_name: facilityName,
      facility_type: 'Primary Health Centre (PHC)',
      latitude: 17.0351,
      longitude: 82.1492,
      patient_accuracy_m: 8.0,
      patient_last_updated: new Date().toISOString(),
      distance_km: 5.1,
      priority: 'URGENT',
      description: 'High-grade fever with persistent vomiting and acute dehydration.',
      status: 'ACCEPTED',
      ambulance_status: 'NOT_DISPATCHED',
      assigned_doctor: 'Dr. Sunita Rani (Medical Officer)',
      created_at: new Date(Date.now() - 15 * 60000).toISOString(),
      updated_at: new Date(Date.now() - 12 * 60000).toISOString()
    }
  ]);

  const [selectedEmergencyId, setSelectedEmergencyId] = useState<number>(101);
  const [isLoading, setIsLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [mapFocus, setMapFocus] = useState<'all' | 'patient' | 'ambulance' | 'phc'>('all');

  // Modals
  const [showPatientRecordsModal, setShowPatientRecordsModal] = useState(false);
  const [patientRecords, setPatientRecords] = useState<MedicalRecord[]>([]);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);

  // Referral Modal State
  const [destHospitalId, setDestHospitalId] = useState(1);
  const [refSpecialty, setRefSpecialty] = useState('Cardiology & Cardiac Interventional Unit');
  const [refNotes, setRefNotes] = useState('Acute coronary syndrome / suspected STEMI. Initial stabilization provided at PHC; immediate cath lab evaluation required.');

  // Resolve Modal State
  const [resolveNotes, setResolveNotes] = useState('Patient vitals stabilized. Oxygen therapy and sublingual medication administered. Normal sinus rhythm restored.');
  const [resolveDiagnosis, setResolveDiagnosis] = useState('Acute Cardiac Anginal Episode (Stabilized)');

  const selectedEmergency = emergencies.find((e) => e.id === selectedEmergencyId) || emergencies[0];

  // PHC Reference Location
  const phcLat = 17.0250;
  const phcLng = 82.1350;

  // Live Real-Time Telemetry Simulation Interval
  useEffect(() => {
    fetchEmergencyRequests();

    const es = new EventSource('/api/events');
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (
          data.type === 'EmergencyRequestCreated' ||
          data.type === 'EmergencyRequestUpdated' ||
          data.type === 'EmergencyTelemetryUpdated'
        ) {
          fetchEmergencyRequests();
        }
      } catch (e) {}
    };

    // Simulated live movement tick when ambulance is en route
    const timer = setInterval(() => {
      setEmergencies((prev) =>
        prev.map((emg) => {
          if (
            emg.status === 'AMBULANCE_DISPATCHED' &&
            emg.ambulance_lifecycle_state === 'EN_ROUTE_TO_PATIENT' &&
            emg.ambulance_lat &&
            emg.ambulance_lng &&
            emg.latitude &&
            emg.longitude
          ) {
            // Smoothly move ambulance closer to patient coordinates
            const deltaLat = (emg.latitude - emg.ambulance_lat) * 0.08;
            const deltaLng = (emg.longitude - emg.ambulance_lng) * 0.08;
            const nextLat = emg.ambulance_lat + deltaLat;
            const nextLng = emg.ambulance_lng + deltaLng;
            const nextDist = Math.max(0.2, (emg.distance_km || 3.4) * 0.94);
            const nextEta = Math.max(1, Math.round(nextDist * 1.8));

            return {
              ...emg,
              ambulance_lat: nextLat,
              ambulance_lng: nextLng,
              ambulance_speed_kmh: Math.round(38 + Math.random() * 8),
              ambulance_heading: 78,
              ambulance_last_updated: new Date().toISOString(),
              eta_minutes: nextEta
            };
          }
          return emg;
        })
      );
    }, 2500);

    return () => {
      es.close();
      clearInterval(timer);
    };
  }, [facilityId]);

  const fetchEmergencyRequests = async () => {
    try {
      const res = await fetch(`/api/emergency/requests?facility_id=${facilityId}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setEmergencies(data);
          if (!selectedEmergencyId && data[0]) {
            setSelectedEmergencyId(data[0].id);
          }
        }
      }
    } catch (e) {
      console.warn('Using offline emergency stream:', e);
    }
  };

  // 1. Accept Case
  const handleAcceptCase = async () => {
    if (!selectedEmergency) return;
    setIsLoading(true);
    setActionSuccessMsg('');

    try {
      const res = await fetch(`/api/emergency/requests/${selectedEmergency.id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor_name: 'Dr. Sunita Rani (PHC Medical Officer)',
          phc_notes: 'Case accepted and emergency triage activated by PHC Medical Officer.'
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setEmergencies(emergencies.map((e) => (e.id === updated.id ? updated : e)));
        setActionSuccessMsg('✓ Emergency case ACCEPTED. Patient has been notified in real time!');
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (e) {
      alert('Failed to accept case.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Dispatch Ambulance AMB-07
  const handleDispatchAmbulance = async () => {
    if (!selectedEmergency) return;
    setIsLoading(true);
    setActionSuccessMsg('');

    try {
      const res = await fetch(`/api/emergency/requests/${selectedEmergency.id}/dispatch-ambulance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ambulance_code: 'AMB-07',
          driver_name: 'Ramesh (Driver) • 108 Emergency Unit',
          eta_minutes: 4,
          phc_notes: 'Ambulance AMB-07 dispatched with oxygen & AED onboard. Real-time dual GPS tracking active.'
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setEmergencies(emergencies.map((e) => (e.id === updated.id ? updated : e)));
        setActionSuccessMsg('🚑 Ambulance AMB-07 DISPATCHED! Real-time GPS stream activated on both portals.');
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (e) {
      alert('Failed to dispatch ambulance.');
    } finally {
      setIsLoading(false);
    }
  };

  // Advance Ambulance Lifecycle State Machine
  const handleTransitionAmbulanceState = async (nextState: string) => {
    if (!selectedEmergency) return;
    setIsLoading(true);

    try {
      const res = await fetch(`/api/emergency/requests/${selectedEmergency.id}/ambulance-state`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lifecycle_state: nextState,
          phc_notes: `Ambulance AMB-07 status transitioned to: ${nextState}`
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setEmergencies(emergencies.map((e) => (e.id === updated.id ? updated : e)));
        setActionSuccessMsg(`🚑 Ambulance state updated to: ${nextState}`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (e) {
      alert('Failed to update ambulance state.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Refer to Tertiary Hospital
  const handleSendReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmergency) return;
    setIsLoading(true);
    setActionSuccessMsg('');

    const destHospitals: Record<number, string> = {
      1: 'AIIMS Delhi — Apex Trauma & Cardiac Hub',
      2: 'Safdarjung Hospital — Multi-Speciality Trauma Center',
      3: 'Max Super Speciality Hospital, Saket',
      5: 'Government General Hospital (GGH Kakinada)',
      8: 'NIMS Hyderabad'
    };

    try {
      const res = await fetch(`/api/emergency/requests/${selectedEmergency.id}/refer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination_hospital_id: destHospitalId,
          destination_hospital_name: destHospitals[destHospitalId] || 'Apex Medical Center',
          required_specialty: refSpecialty,
          required_facility: destHospitals[destHospitalId],
          clinical_notes: refNotes
        })
      });

      if (res.ok) {
        const data = await res.json();
        setEmergencies(emergencies.map((e) => (e.id === data.emergency.id ? data.emergency : e)));
        setShowReferralModal(false);
        setActionSuccessMsg(`📋 Digital Referral Transmitted! Code: ${data.referral_code}`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (e) {
      alert('Failed to send referral.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Resolve & Save to EHR
  const handleResolveEmergency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmergency) return;
    setIsLoading(true);
    setActionSuccessMsg('');

    try {
      const res = await fetch(`/api/emergency/requests/${selectedEmergency.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolution_notes: resolveNotes,
          record_title: '🚨 Emergency Triage & Primary Care Encounter',
          diagnosis: resolveDiagnosis,
          prescription_items: [
            { medicine: 'Tab Sorbitrate 5mg', dosage: 'Sublingual stat', duration: '1 day' },
            { medicine: 'Tab Aspirin 300mg', dosage: 'Stat chewable', duration: '1 day' },
            { medicine: 'Oxygen Therapy @ 4L/min', dosage: '30 minutes continuous', duration: 'Stat' }
          ]
        })
      });

      if (res.ok) {
        const data = await res.json();
        setEmergencies(emergencies.map((e) => (e.id === data.emergency.id ? data.emergency : e)));
        setShowResolveModal(false);
        setActionSuccessMsg('✓ Emergency case RESOLVED and automatically recorded into Patient Central EHR!');
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (e) {
      alert('Failed to resolve emergency.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Patient EHR Records
  const handleFetchPatientRecords = async (uid: string) => {
    try {
      const res = await fetch(`/api/patients/${encodeURIComponent(uid)}/records`);
      if (res.ok) {
        const data = await res.json();
        setPatientRecords(data.records || []);
      } else {
        setPatientRecords([
          {
            id: 101,
            patient_id: selectedEmergency?.patient_id || 1,
            hospital_name: 'AIIMS Delhi',
            record_type: 'Cardiology Report',
            title: 'Cardiology Outpatient Review',
            diagnosis: 'Mild Hypertension • Regular Sinus Rhythm',
            notes: 'Patient advised low salt diet and regular monitoring. BP recorded 130/85 mmHg.',
            prescription_data: [{ medicine: 'Amlodipine 5mg', dosage: '1 tablet morning', duration: '30 days' }],
            created_at: '2026-08-20T10:00:00.000Z',
            created_by: 'Dr. Manoj Reddy'
          }
        ]);
      }
      setShowPatientRecordsModal(true);
    } catch (e) {
      setShowPatientRecordsModal(true);
    }
  };

  // Check PHC Capability matching
  const hasDoctor = staff.some((s) => s.is_on_duty === 1 && s.role_title.includes('Doctor'));
  const hasBed = (resources.general_beds || 12) - (resources.occupied_beds || 0) > 0;
  const hasAmbulance = (resources.ambulances || 1) > 0;
  const hasMedicines = medicines.some((m) => m.status === 'AVAILABLE');
  const hasDiagnostics = diagnostics.some((d) => d.status === 'AVAILABLE');
  const isCardiologySpecialist = staff.some((s) => s.is_on_duty === 1 && s.specialty?.toLowerCase().includes('cardio'));

  const activeEmergenciesCount = emergencies.filter((e) => e.status !== 'RESOLVED' && e.status !== 'CANCELLED').length;

  // Dynamic Telemetry Distances
  const patientToPhcDist = (selectedEmergency?.distance_km || 3.4).toFixed(1);
  const ambToPatientDist = (Math.max(0.4, (selectedEmergency?.distance_km || 3.4) * 0.52)).toFixed(1);
  const ambToHospitalDist = (parseFloat(patientToPhcDist) + 1.8).toFixed(1);
  const ambEta = selectedEmergency?.eta_minutes || 4;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between bg-white border-2 border-red-200 p-4 rounded-3xl shadow-sm gap-3">
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
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-[#263238]">🚨 Emergency Response Control Room</h2>
              <span className="px-2.5 py-0.5 bg-red-600 text-white rounded-full text-xs font-black animate-pulse">
                DUAL GPS TRACKING ACTIVE
              </span>
            </div>
            <p className="text-xs text-[#607D8B] font-semibold">{facilityName}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3.5 py-1.5 bg-red-50 text-red-900 border-2 border-red-300 rounded-2xl text-xs font-black flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            <span>{activeEmergenciesCount} ACTIVE EMERGENCIES</span>
          </span>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="bg-[#E0F2F1] border-2 border-[#00695C] p-4 rounded-2xl flex items-center space-x-3 text-xs font-black text-[#00695C] shadow-md animate-in slide-in-from-top">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Main Two-Column Layout: Emergency Intake Stream (Left) + Command Workspace (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Incoming Emergencies List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-black text-sm text-[#263238] uppercase tracking-wider">
              Emergency Stream ({emergencies.length})
            </h3>
            <span className="text-[11px] text-slate-500 font-bold">Auto-Triage Active</span>
          </div>

          <div className="space-y-2.5">
            {emergencies.map((emg) => {
              const isSelected = emg.id === selectedEmergency?.id;
              const isCritical = emg.priority === 'CRITICAL';
              const isResolved = emg.status === 'RESOLVED';

              return (
                <button
                  key={emg.id}
                  type="button"
                  onClick={() => setSelectedEmergencyId(emg.id)}
                  className={`w-full text-left p-4 rounded-3xl border-2 transition-all shadow-sm space-y-2.5 ${
                    isSelected
                      ? 'border-red-500 bg-red-50/40 ring-2 ring-red-400'
                      : isResolved
                      ? 'border-emerald-200 bg-emerald-50/30 hover:border-emerald-400'
                      : 'border-slate-200 bg-white hover:border-red-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${
                      isResolved
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : isCritical
                        ? 'bg-red-600 text-white border-red-700'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}>
                      {isResolved ? '🟢 ✓ RESOLVED' : isCritical ? '🔴 CRITICAL' : '🟠 URGENT'}
                    </span>

                    <span className="text-[11px] text-slate-500 font-bold flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(emg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-sm text-[#263238]">{emg.patient_name}</h4>
                    <span className="text-xs text-slate-600 font-bold">
                      Age: {emg.patient_age || 42} • Blood: <strong className="text-red-700">{emg.patient_blood_group || 'B+'}</strong>
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-medium line-clamp-2 leading-tight">
                    "{emg.description}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-1 border-t border-slate-200/60">
                    <span className="flex items-center space-x-1 text-[#00695C]">
                      <MapPin className="w-3 h-3" />
                      <span>📍 {emg.distance_km || 3.4} km from PHC</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">EMG-{emg.id}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Tactical Command Workspace with Live Map & Telemetry (8 cols) */}
        {selectedEmergency ? (
          <div className="lg:col-span-8 bg-white border-2 border-red-200 p-6 sm:p-8 rounded-3xl shadow-md space-y-6">
            {/* Top Workspace Header with Status Badge */}
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-red-600 text-white rounded-xl text-xs font-black">
                    🚨 EMERGENCY CASE #EMG-2026-{selectedEmergency.id}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">
                    Reported {new Date(selectedEmergency.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <h3 className="font-black text-2xl text-[#263238] mt-1">
                  {selectedEmergency.patient_name}
                </h3>
                <p className="text-xs text-slate-500 font-semibold">
                  UID: <span className="font-mono text-[#00695C] font-bold">{selectedEmergency.health_id || 'UID-IND-9842-7104'}</span> • Age: <strong>{selectedEmergency.patient_age || 42}</strong> • Blood Group: <strong className="text-red-700">{selectedEmergency.patient_blood_group || 'B+'}</strong>
                </p>
              </div>

              {/* Status Badge */}
              <div className={`px-4 py-2 rounded-2xl border-2 font-black text-xs flex items-center space-x-2 ${
                selectedEmergency.status === 'RESOLVED'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-400'
                  : selectedEmergency.status === 'AMBULANCE_DISPATCHED'
                  ? 'bg-blue-50 text-blue-900 border-blue-400'
                  : selectedEmergency.status === 'ACCEPTED'
                  ? 'bg-teal-50 text-teal-900 border-teal-400'
                  : selectedEmergency.status === 'REFERRED'
                  ? 'bg-purple-50 text-purple-900 border-purple-400'
                  : 'bg-red-50 text-red-900 border-red-400'
              }`}>
                {selectedEmergency.status === 'RESOLVED' ? (
                  <><span>🟢 ✓</span><span>CASE RESOLVED & RECORDED</span></>
                ) : selectedEmergency.status === 'AMBULANCE_DISPATCHED' ? (
                  <><span>🚑 ⏳</span><span>AMBULANCE {selectedEmergency.ambulance_code || 'AMB-07'} EN ROUTE</span></>
                ) : selectedEmergency.status === 'ACCEPTED' ? (
                  <><span>🟢 ✓</span><span>ACCEPTED BY PHC</span></>
                ) : selectedEmergency.status === 'REFERRED' ? (
                  <><span>📋 ➔</span><span>REFERRED TO MEDICAL HUB</span></>
                ) : (
                  <><span>🔴 ✕</span><span>CRITICAL / INTAKE PENDING</span></>
                )}
              </div>
            </div>

            {/* 1. LIVE PATIENT LOCATION & GPS ACCURACY CARD */}
            <div className="bg-slate-50 border-2 border-slate-200 p-5 rounded-3xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-base">📍</span>
                  <h4 className="font-black text-sm text-[#263238]">LIVE PATIENT LOCATION</h4>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 bg-red-600 text-white rounded-full text-[10px] font-black flex items-center space-x-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    <span>LIVE GPS</span>
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    Accuracy: ±{selectedEmergency.patient_accuracy_m || 6.5} m
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Coordinates</span>
                  <span className="font-mono font-black text-slate-800">
                    {selectedEmergency.latitude?.toFixed(4) || '17.0214'}, {selectedEmergency.longitude?.toFixed(4) || '82.1384'}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Distance from PHC</span>
                  <span className="font-black text-[#00695C]">{patientToPhcDist} km</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Est. Travel Time</span>
                  <span className="font-black text-slate-800">7 mins</span>
                </div>
              </div>
            </div>

            {/* 2. 🗺️ LIVE EMERGENCY DUAL-TRACKING MAP */}
            <div className="bg-slate-900 rounded-3xl p-5 border-2 border-slate-800 text-white space-y-4 shadow-inner relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-emerald-400 animate-spin" />
                  <h4 className="font-black text-sm uppercase tracking-wider text-emerald-300">
                    Tactical Live Emergency Map (Dual-Entity GPS)
                  </h4>
                </div>

                {/* Map Focus Controls */}
                <div className="flex items-center space-x-1.5 bg-slate-800 p-1 rounded-xl text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setMapFocus('all')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${mapFocus === 'all' ? 'bg-[#00695C] text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    OVERVIEW
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapFocus('patient')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${mapFocus === 'patient' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    👤 PATIENT
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapFocus('ambulance')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${mapFocus === 'ambulance' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    🚑 AMBULANCE
                  </button>
                </div>
              </div>

              {/* Map Canvas Graphic */}
              <div className="relative h-60 w-full bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

                {/* SVG Connecting Polyline Routes */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {/* Route: PHC to Ambulance */}
                  <line x1="20%" y1="30%" x2="50%" y2="55%" stroke="#0ea5e9" strokeWidth="3" strokeDasharray="6" opacity="0.7" />
                  {/* Route: Ambulance to Patient */}
                  <line x1="50%" y1="55%" x2="80%" y2="70%" stroke="#f59e0b" strokeWidth="4" strokeDasharray="4" className="animate-pulse" />
                </svg>

                {/* 1. PHC Node */}
                <div className="absolute left-[20%] top-[30%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center space-y-1">
                  <div className="w-11 h-11 rounded-2xl bg-[#00695C] border-2 border-emerald-300 flex items-center justify-center text-xl shadow-lg shadow-emerald-950">
                    🏥
                  </div>
                  <span className="text-[10px] font-black bg-slate-900/90 px-2 py-0.5 rounded-md border border-emerald-500/40 text-emerald-300">
                    PHC Peddapuram
                  </span>
                </div>

                {/* 2. Ambulance Node (Moving / En Route) */}
                <div className="absolute left-[50%] top-[55%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center space-y-1 z-10 transition-all duration-1000">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 border-2 border-amber-200 flex items-center justify-center text-2xl shadow-lg shadow-amber-950 animate-bounce">
                      🚑
                    </div>
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-white animate-ping" />
                  </div>
                  <span className="text-[10px] font-black bg-slate-900/90 px-2 py-0.5 rounded-md border border-amber-500/50 text-amber-300">
                    AMB-07 (En Route • {ambEta} min)
                  </span>
                </div>

                {/* 3. Patient Node */}
                <div className="absolute left-[80%] top-[70%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center space-y-1">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-2xl bg-red-600 border-2 border-rose-300 flex items-center justify-center text-xl shadow-lg shadow-red-950">
                      👤
                    </div>
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-400 animate-ping" />
                  </div>
                  <span className="text-[10px] font-black bg-slate-900/90 px-2 py-0.5 rounded-md border border-red-500/50 text-red-300">
                    Rahul Kumar (Patient)
                  </span>
                </div>

                {/* Distance Overlay Badges on Map */}
                <div className="absolute top-2 left-2 bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-xl text-[10px] font-bold space-y-0.5">
                  <div className="text-amber-400 flex items-center space-x-1">
                    <span>🚑 ➔ 👤 Distance:</span>
                    <span className="font-black text-white">{ambToPatientDist} km</span>
                  </div>
                  <div className="text-emerald-400 flex items-center space-x-1">
                    <span>👤 ➔ 🏥 PHC:</span>
                    <span className="font-black text-white">{patientToPhcDist} km</span>
                  </div>
                </div>
              </div>

              {/* 3-Way Distance & Telemetry Matrix Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">📍 Patient ➔ PHC</span>
                    <span className="text-sm font-black text-white">{patientToPhcDist} km</span>
                  </div>
                  <span className="text-xs text-slate-400 font-bold">Direct</span>
                </div>

                <div className="bg-amber-950/40 p-3 rounded-2xl border border-amber-500/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-amber-300 uppercase font-bold block">🚑 Ambulance ➔ Patient</span>
                    <span className="text-sm font-black text-amber-400">{ambToPatientDist} km</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-black text-[10px]">
                    ETA {ambEta} MIN
                  </span>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">🚑 Ambulance ➔ Hospital</span>
                    <span className="text-sm font-black text-white">{ambToHospitalDist} km</span>
                  </div>
                  <span className="text-xs text-slate-400 font-bold">Via Hub</span>
                </div>
              </div>
            </div>

            {/* 3. 🚑 AMBULANCE TELEMETRY & LIFECYCLE STATE MACHINE */}
            {selectedEmergency.ambulance_status === 'DISPATCHED' && (
              <div className="bg-amber-50/70 border-2 border-amber-300 p-5 rounded-3xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🚑</span>
                    <div>
                      <h4 className="font-black text-sm text-amber-950">AMBULANCE STATUS: {selectedEmergency.ambulance_code || 'AMB-07'}</h4>
                      <p className="text-[11px] text-amber-800 font-medium">
                        Driver: <strong>{selectedEmergency.assigned_driver || 'Ramesh (Driver)'}</strong> • Live GPS Telemetry
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-black uppercase">
                    {selectedEmergency.ambulance_lifecycle_state || 'EN_ROUTE_TO_PATIENT'}
                  </span>
                </div>

                {/* Telemetry Gauge Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold text-amber-950">
                  <div className="bg-white p-2.5 rounded-2xl border border-amber-200">
                    <span className="text-[10px] text-slate-400 uppercase block">Vehicle Speed</span>
                    <span className="text-sm font-black">{selectedEmergency.ambulance_speed_kmh || 44} km/h</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-2xl border border-amber-200">
                    <span className="text-[10px] text-slate-400 uppercase block">Heading</span>
                    <span className="text-sm font-black">{selectedEmergency.ambulance_heading || 78}° ENE</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-2xl border border-amber-200">
                    <span className="text-[10px] text-slate-400 uppercase block">GPS Accuracy</span>
                    <span className="text-sm font-black">±{selectedEmergency.ambulance_accuracy_m || 4.2} m</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-2xl border border-amber-200">
                    <span className="text-[10px] text-slate-400 uppercase block">Distance to Patient</span>
                    <span className="text-sm font-black text-amber-700">{ambToPatientDist} km</span>
                  </div>
                </div>

                {/* Operator Lifecycle Transition Controls */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    Advance Ambulance Lifecycle:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleTransitionAmbulanceState('ARRIVED_AT_PATIENT')}
                      className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-xl text-xs font-black transition-colors"
                    >
                      ✓ Mark Arrived at Patient
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTransitionAmbulanceState('PATIENT_PICKED_UP')}
                      className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-xl text-xs font-black transition-colors"
                    >
                      ✓ Patient Onboard / Pickup
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTransitionAmbulanceState('EN_ROUTE_TO_HOSPITAL')}
                      className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-xl text-xs font-black transition-colors"
                    >
                      ➔ En Route to Hospital
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTransitionAmbulanceState('ARRIVED')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-colors"
                    >
                      ✓ Arrived at Facility
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Reported Problem Card */}
            <div className="bg-red-50/60 border-2 border-red-200 p-4 rounded-2xl space-y-1.5">
              <span className="text-[10px] font-black text-red-900 uppercase tracking-wider block">
                🚨 Reported Emergency Complaint (Voice / Text)
              </span>
              <p className="text-sm font-black text-[#263238] leading-relaxed">
                "{selectedEmergency.description}"
              </p>
            </div>

            {/* Automated Resource & Capability Matcher */}
            <div className="bg-slate-50 border-2 border-slate-200 p-5 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="font-black text-sm text-[#263238] flex items-center space-x-2">
                  <span>⚡ Automated PHC Capability & Resource Matcher</span>
                </h4>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Live Resource Engine</span>
              </div>

              {/* Resource Matrix Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-700">👨‍⚕️ Doctor</span>
                  <span className={`px-2 py-0.5 rounded-md font-black text-[11px] ${
                    hasDoctor ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'
                  }`}>
                    {hasDoctor ? '🟢 ✓ YES' : '🔴 ✕ NO'}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-700">🛏️ Bed</span>
                  <span className={`px-2 py-0.5 rounded-md font-black text-[11px] ${
                    hasBed ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'
                  }`}>
                    {hasBed ? '🟢 ✓ YES' : '🔴 ✕ NO'}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-700">🚑 Ambulance</span>
                  <span className={`px-2 py-0.5 rounded-md font-black text-[11px] ${
                    hasAmbulance ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'
                  }`}>
                    {hasAmbulance ? '🟢 ✓ READY' : '🔴 ✕ BUSY'}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-700">💊 Medicines</span>
                  <span className={`px-2 py-0.5 rounded-md font-black text-[11px] ${
                    hasMedicines ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {hasMedicines ? '🟢 ✓ STOCKED' : '🟠 ! LIMITED'}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-700">🧪 ECG/Labs</span>
                  <span className={`px-2 py-0.5 rounded-md font-black text-[11px] ${
                    hasDiagnostics ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {hasDiagnostics ? '🟢 ✓ AVAIL' : '🟠 ! LIMITED'}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-700">🩺 Cardiologist</span>
                  <span className={`px-2 py-0.5 rounded-md font-black text-[11px] ${
                    isCardiologySpecialist ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'
                  }`}>
                    {isCardiologySpecialist ? '🟢 ✓ ON DUTY' : '🔴 ✕ NO'}
                  </span>
                </div>
              </div>

              {/* Automated Decision Recommendation Banner */}
              <div className="bg-amber-50 border-2 border-amber-300 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-0.5">
                  <span className="font-black text-amber-950 block">
                    ⚠️ DECISION ADVISORY: PHC CAN PROVIDE INITIAL STABILIZATION CARE
                  </span>
                  <span className="text-amber-900 font-medium">
                    Required Cardiologist specialist not at PHC. Secondary / Tertiary referral recommended after stabilization.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReferralModal(true)}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-sm self-start sm:self-auto"
                >
                  PREPARE REFERRAL
                </button>
              </div>
            </div>

            {/* Action Command Bar with Calling Triggers */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2.5">
              {/* 1. Accept Case */}
              {selectedEmergency.status === 'CREATED' && (
                <button
                  type="button"
                  onClick={handleAcceptCase}
                  disabled={isLoading}
                  className="flex-1 py-3.5 px-4 bg-[#00695C] hover:bg-[#004D40] text-white font-black text-xs rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>🟢 ACCEPT CASE</span>
                </button>
              )}

              {/* 2. Dispatch Ambulance */}
              {selectedEmergency.ambulance_status !== 'DISPATCHED' && selectedEmergency.status !== 'RESOLVED' && (
                <button
                  type="button"
                  onClick={handleDispatchAmbulance}
                  disabled={isLoading}
                  className="flex-1 py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <Truck className="w-4 h-4" />
                  <span>🚑 DISPATCH AMBULANCE AMB-07</span>
                </button>
              )}

              {/* 3. Call Patient */}
              <a
                href={`tel:${selectedEmergency.patient_phone || '+919876543210'}`}
                className="py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs rounded-2xl border border-slate-300 transition-all flex items-center justify-center space-x-1.5"
              >
                <Phone className="w-4 h-4 text-[#00695C]" />
                <span>📞 CALL PATIENT</span>
              </a>

              {/* 4. Call Ambulance Driver */}
              {selectedEmergency.ambulance_status === 'DISPATCHED' && (
                <a
                  href="tel:+919876543110"
                  className="py-3.5 px-4 bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs rounded-2xl border border-amber-300 transition-all flex items-center justify-center space-x-1.5"
                >
                  <Phone className="w-4 h-4 text-amber-700" />
                  <span>📞 CALL AMBULANCE</span>
                </a>
              )}

              {/* 5. Refer to Tertiary Hospital */}
              {selectedEmergency.status !== 'RESOLVED' && (
                <button
                  type="button"
                  onClick={() => setShowReferralModal(true)}
                  disabled={isLoading}
                  className="flex-1 py-3.5 px-4 bg-purple-700 hover:bg-purple-800 text-white font-black text-xs rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <Share2 className="w-4 h-4" />
                  <span>📋 REFER TO HOSPITAL</span>
                </button>
              )}

              {/* 6. Resolve & Save to EHR */}
              {selectedEmergency.status !== 'RESOLVED' && (
                <button
                  type="button"
                  onClick={() => setShowResolveModal(true)}
                  disabled={isLoading}
                  className="py-3.5 px-5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>✓ RESOLVE & RECORD TO EHR</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 bg-white border-2 border-slate-200 p-12 rounded-3xl text-center text-slate-500 font-bold space-y-2">
            <span className="text-4xl block">🛡️</span>
            <h3 className="text-base text-slate-800 font-black">No Emergency Selected</h3>
            <p className="text-xs">Select an incoming emergency from the stream on the left to begin triage.</p>
          </div>
        )}
      </div>

      {/* MODAL 1: Patient Longitudinal Medical EHR History */}
      {showPatientRecordsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 border-2 border-[#00695C] shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🩺</span>
                <div>
                  <h3 className="font-black text-lg text-[#263238]">Authorized Central Medical Record</h3>
                  <p className="text-xs text-slate-500">{selectedEmergency?.patient_name} • {selectedEmergency?.health_id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPatientRecordsModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {patientRecords.map((rec) => (
                <div key={rec.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-800 text-sm">{rec.title}</h4>
                    <span className="text-slate-500 font-bold">{new Date(rec.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className="font-bold text-[#00695C] block">{rec.hospital_name}</span>
                  {rec.diagnosis && (
                    <p className="text-slate-700 font-semibold bg-white p-2 rounded-xl border border-slate-200">
                      Diagnosis: <strong>{rec.diagnosis}</strong>
                    </p>
                  )}
                  {rec.notes && <p className="text-slate-600">{rec.notes}</p>}
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPatientRecordsModal(false)}
                className="px-5 py-2.5 bg-[#00695C] text-white font-black text-xs rounded-xl"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Inter-Facility Digital Referral Creator */}
      {showReferralModal && selectedEmergency && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 border-2 border-purple-600 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📋</span>
                <div>
                  <h3 className="font-black text-lg text-purple-950">Inter-Facility Digital Referral</h3>
                  <p className="text-xs text-slate-500">Transfers patient with full authorized medical package</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReferralModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendReferral} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-black text-slate-700">Target Specialist Hospital</label>
                <select
                  value={destHospitalId}
                  onChange={(e) => setDestHospitalId(parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-bold text-slate-800 focus:outline-none"
                >
                  <option value={1}>🏥 AIIMS Delhi — Super-Specialty Apex (8.2 km • Cardiology 🟢 • ICU 🟢)</option>
                  <option value={2}>🏥 Safdarjung Hospital — Multi-Specialty Trauma Center (9.5 km • Trauma 🟢)</option>
                  <option value={3}>🏥 Max Super Speciality Saket — Tertiary Hub (14.2 km • Cath Lab 🟢)</option>
                  <option value={5}>🏥 Government General Hospital (GGH Kakinada) — Teaching Hub</option>
                  <option value={8}>🏥 NIMS Hyderabad — Autonomous Super-Speciality</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-black text-slate-700">Required Specialty & Unit</label>
                <input
                  type="text"
                  value={refSpecialty}
                  onChange={(e) => setRefSpecialty(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-bold text-slate-800 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-black text-slate-700">Clinical Transfer Summary & Findings</label>
                <textarea
                  value={refNotes}
                  onChange={(e) => setRefNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-bold text-slate-800 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowReferralModal(false)}
                  className="px-4 py-2.5 bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-black rounded-xl shadow-md"
                >
                  {isLoading ? 'Transmitting...' : '✓ TRANSMIT DIGITAL REFERRAL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Emergency Resolve & Auto-Save to EHR */}
      {showResolveModal && selectedEmergency && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 border-2 border-emerald-600 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">✓</span>
                <div>
                  <h3 className="font-black text-lg text-emerald-950">Resolve Case & Save to Patient Central EHR</h3>
                  <p className="text-xs text-slate-500">Automatically creates permanent clinical encounter in EHR</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowResolveModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResolveEmergency} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-black text-slate-700">Clinical Diagnosis</label>
                <input
                  type="text"
                  value={resolveDiagnosis}
                  onChange={(e) => setResolveDiagnosis(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-bold text-slate-800 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-black text-slate-700">Encounter & Treatment Notes</label>
                <textarea
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-bold text-slate-800 focus:outline-none"
                  required
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs font-bold">
                💡 Stat medications given (Sorbitrate 5mg, Aspirin 300mg, O2) will be permanently saved to the patient's unified EHR timeline.
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2.5 bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl shadow-md"
                >
                  {isLoading ? 'Saving...' : '✓ CONFIRM RESOLUTION & EHR LOG'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
