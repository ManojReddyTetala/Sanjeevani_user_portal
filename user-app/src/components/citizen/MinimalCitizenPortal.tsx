import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  AlertTriangle,
  Building2,
  Stethoscope,
  FileText,
  Mic,
  Volume2,
  VolumeX,
  Phone,
  Navigation,
  MapPin,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Eye,
  User,
  Heart,
  Pill,
  Activity,
  ArrowLeft,
  Search,
  Sparkles,
  QrCode,
  Globe,
  Wifi,
  WifiOff,
  LogOut,
  X,
  Send,
  Truck
} from 'lucide-react';
import { Patient, Hospital, MedicalRecord, EmergencyRequest } from '../../types';
import { useLanguage, SUPPORTED_LANGUAGES } from '../../context/LanguageContext';

interface MinimalCitizenPortalProps {
  patient: Patient;
  hospitals: Hospital[];
  records: MedicalRecord[];
  onSwitchToHospitalOs?: () => void;
  onSwitchToPhcPortal?: () => void;
  onLogout?: () => void;
}

export const MinimalCitizenPortal: React.FC<MinimalCitizenPortalProps> = ({
  patient,
  hospitals,
  records,
  onSwitchToHospitalOs,
  onSwitchToPhcPortal,
  onLogout
}) => {
  const { language, setLanguage, t } = useLanguage();

  // Bottom Navigation State: 'home' | 'health' | 'me'
  const [activeNav, setActiveNav] = useState<'home' | 'health' | 'me'>('home');

  // Subview Modals
  const [activeModal, setActiveModal] = useState<'none' | 'emergency_confirm' | 'find_hospital' | 'find_doctor' | 'voice_talk' | 'hospital_detail' | 'qr_view'>('none');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(hospitals[0] || null);

  // Active Emergency State
  const [activeEmergency, setActiveEmergency] = useState<EmergencyRequest | null>(null);
  const [emergencySending, setEmergencySending] = useState(false);

  // Voice Interaction State
  const [voiceQuery, setVoiceQuery] = useState('');
  const [voiceResponse, setVoiceResponse] = useState('');
  const [isListening, setIsListening] = useState(false);

  // Doctor / Symptom Search State
  const [symptomInput, setSymptomInput] = useState('');
  const [matchedSpecialty, setMatchedSpecialty] = useState<string | null>(null);

  // Accessibility States
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isVoiceNarration, setIsVoiceNarration] = useState(true);

  // Health Sub-tab
  const [healthSubTab, setHealthSubTab] = useState<'records' | 'prescriptions' | 'reports' | 'qr'>('records');

  // Location Mock
  const userLocation = { label: 'Peddapuram, Andhra Pradesh', latitude: 17.0214, longitude: 82.1384 };

  const speakText = (text: string) => {
    if (isVoiceNarration && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.0;
      window.speechSynthesis.speak(u);
    }
  };

  // Subscribe to SSE for live emergency updates
  useEffect(() => {
    const fetchActive = () => {
      fetch(`/api/emergency/requests?patient_id=${patient.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setActiveEmergency(data[0]);
          }
        })
        .catch(() => {});
    };

    fetchActive();

    const es = new EventSource('/api/events');
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (
          (data.type === 'EmergencyRequestCreated' || data.type === 'EmergencyRequestUpdated' || data.type === 'EmergencyTelemetryUpdated') &&
          data.data?.patient_id === patient.id
        ) {
          setActiveEmergency(data.data);
          if (data.data.status === 'AMBULANCE_DISPATCHED') {
            speakText(`Ambulance is on the way. Estimated arrival in ${data.data.eta_minutes || 4} minutes.`);
          }
        }
      } catch (e) {}
    };

    return () => {
      es.close();
    };
  }, [patient.id, isVoiceNarration]);

  // 1. Submit Emergency Request
  const handleSendEmergency = async () => {
    setEmergencySending(true);
    try {
      const res = await fetch('/api/emergency/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patient.id,
          patient_name: patient.name,
          patient_age: patient.age || 42,
          patient_blood_group: patient.blood_group || 'B+',
          patient_phone: patient.phone || '+91-9876543210',
          health_id: patient.uid,
          facility_id: 1,
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          distance_km: 3.4,
          priority: 'CRITICAL',
          description: 'Emergency medical assistance requested via 1-Tap Emergency Trigger'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setActiveEmergency(data);
        setActiveModal('none');
        speakText('Emergency request sent. Your GPS location has been transmitted to the nearest Primary Health Centre.');
      }
    } catch (e) {
      alert('Unable to send emergency. Please call 108 directly.');
    } finally {
      setEmergencySending(false);
    }
  };

  // 2. Natural Symptom Matcher
  const handleSymptomSearch = (text: string) => {
    setSymptomInput(text);
    const q = text.toLowerCase();
    if (q.includes('chest') || q.includes('heart') || q.includes('breath') || q.includes('pain in left arm')) {
      setMatchedSpecialty('Cardiology & Heart Care');
    } else if (q.includes('fever') || q.includes('vomit') || q.includes('stomach') || q.includes('weak')) {
      setMatchedSpecialty('General Medicine');
    } else if (q.includes('bone') || q.includes('fracture') || q.includes('joint') || q.includes('knee')) {
      setMatchedSpecialty('Orthopedics');
    } else if (q.includes('eye') || q.includes('vision') || q.includes('blur')) {
      setMatchedSpecialty('Ophthalmology (Eye Care)');
    } else if (q.includes('child') || q.includes('baby') || q.includes('kid')) {
      setMatchedSpecialty('Pediatrics (Child Health)');
    } else {
      setMatchedSpecialty('General Medical Officer');
    }
  };

  // 3. Voice NLP Handler
  const handleVoiceQuery = async (customQuery?: string) => {
    const q = customQuery || voiceQuery;
    if (!q.trim()) return;

    setVoiceQuery(q);
    const lower = q.toLowerCase();

    if (lower.includes('emergency') || lower.includes('help') || lower.includes('danger')) {
      setActiveModal('emergency_confirm');
      speakText('Opening emergency trigger. Are you in danger?');
    } else if (lower.includes('hospital') || lower.includes('where to go')) {
      setActiveModal('find_hospital');
      speakText('Showing nearby hospitals sorted by distance.');
    } else if (lower.includes('doctor') || lower.includes('chest') || lower.includes('pain') || lower.includes('fever')) {
      setActiveModal('find_doctor');
      handleSymptomSearch(q);
      speakText('Finding suitable doctors and specialists for your condition.');
    } else if (lower.includes('report') || lower.includes('record') || lower.includes('medicine') || lower.includes('health')) {
      setActiveNav('health');
      setActiveModal('none');
      speakText('Navigating to your unified health records and prescriptions.');
    } else {
      setVoiceResponse(`I understood: "${q}". You can ask to find a hospital, search for a doctor, view records, or trigger an emergency.`);
      speakText(`I understood: ${q}. How can I assist your health needs today?`);
    }
  };

  return (
    <div className={`min-h-screen ${isHighContrast ? 'bg-black text-yellow-300' : 'bg-[#F7FAF9] text-[#263238]'} font-sans flex flex-col justify-between max-w-lg mx-auto w-full shadow-2xl relative border-x border-slate-200`}>
      {/* Top Health Connect Header */}
      <header className="bg-white px-5 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 bg-[#00695C] text-white rounded-xl flex items-center justify-center text-lg font-black shadow">
            🏥
          </div>
          <div>
            <h1 className="font-black text-base tracking-tight text-[#263238]">
              HEALTH CONNECT
            </h1>
            <span className="text-[10px] text-[#607D8B] font-bold flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-emerald-600" />
              <span>{userLocation.label}</span>
            </span>
          </div>
        </div>

        {/* Top-Right Profile & Settings Trigger */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setActiveNav('me')}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-[#E0F2F1] text-slate-700 hover:text-[#00695C] flex items-center justify-center border border-slate-300 transition-colors"
            aria-label="Open Profile & Settings"
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* MAIN BODY ROUTER */}
      <main className="flex-1 p-5 space-y-5 pb-28 overflow-y-auto">
        {/* ==================================================== */}
        {/* VIEW 1: HOME (THE 4 PRIMARY ACTIONS + VOICE TALK)    */}
        {/* ==================================================== */}
        {activeNav === 'home' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Friendly Minimal Greeting */}
            <div className="px-1">
              <h2 className="text-xl font-black text-[#263238]">
                Good morning, {patient.name.split(' ')[0]} 👋
              </h2>
              <p className="text-xs text-[#607D8B] font-semibold mt-0.5">
                How can we help you today?
              </p>
            </div>

            {/* LIVE ACTIVE EMERGENCY CARD (If Emergency in Progress) */}
            {activeEmergency && activeEmergency.status !== 'RESOLVED' ? (
              <div className="bg-gradient-to-br from-red-600 to-red-700 text-white p-5 rounded-3xl shadow-xl space-y-4 border-2 border-red-500 animate-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-red-400 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-white animate-ping" />
                    <h3 className="font-black text-sm uppercase tracking-wider text-white">
                      🚑 HELP IS COMING • ON THE WAY
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 bg-white text-red-700 font-black text-[11px] rounded-full">
                    ETA: {activeEmergency.eta_minutes || 4} MIN
                  </span>
                </div>

                {/* Corridor Map Graphic */}
                <div className="relative h-16 w-full bg-red-950/60 rounded-2xl border border-red-400/40 flex items-center justify-between px-6">
                  <div className="absolute left-6 right-6 h-1 bg-red-400/40 rounded-full" />
                  <div className="relative z-10 flex flex-col items-center">
                    <span className="text-lg">🏥</span>
                    <span className="text-[9px] font-bold text-red-200">PHC</span>
                  </div>
                  <div className="relative z-10 flex flex-col items-center animate-bounce">
                    <span className="text-xl">🚑</span>
                    <span className="text-[9px] font-black bg-white text-red-700 px-1.5 rounded">
                      {activeEmergency.ambulance_code || 'AMB-07'}
                    </span>
                  </div>
                  <div className="relative z-10 flex flex-col items-center">
                    <span className="text-lg">👤</span>
                    <span className="text-[9px] font-bold text-red-200">You</span>
                  </div>
                </div>

                {/* 5-Stage Vertical Timeline */}
                <div className="bg-red-950/80 p-3 rounded-2xl border border-red-400/30 text-xs font-bold space-y-1.5">
                  <div className="flex items-center space-x-2 text-emerald-300">
                    <span>✓</span>
                    <span>1. Emergency Request Sent & GPS Transmitted</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-300">
                    <span>✓</span>
                    <span>2. PHC Received & Triage Completed</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-300">
                    <span>✓</span>
                    <span>3. Ambulance Assigned ({activeEmergency.assigned_driver || 'Driver Ramesh'})</span>
                  </div>
                  <div className="flex items-center space-x-2 text-amber-300 animate-pulse">
                    <span>●</span>
                    <span>4. Ambulance En Route (ETA {activeEmergency.eta_minutes || 4} min)</span>
                  </div>
                  <div className="flex items-center space-x-2 text-red-300 opacity-60">
                    <span>○</span>
                    <span>5. Arrival & Treatment</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 pt-1">
                  <a
                    href="tel:+919876543110"
                    className="flex-1 py-3 bg-white text-red-700 hover:bg-red-50 font-black text-xs rounded-2xl shadow flex items-center justify-center space-x-1.5 transition-transform active:scale-95"
                  >
                    <Phone className="w-4 h-4 text-red-700" />
                    <span>CALL AMBULANCE</span>
                  </a>
                  <a
                    href="tel:108"
                    className="px-4 py-3 bg-red-950/80 hover:bg-red-950 text-white font-black text-xs rounded-2xl border border-red-400 flex items-center justify-center space-x-1"
                  >
                    <Phone className="w-4 h-4 text-red-400" />
                    <span>DIAL 108</span>
                  </a>
                </div>
              </div>
            ) : (
              /* ACTION 1: 🚨 THE DOMINANT EMERGENCY BUTTON */
              <button
                type="button"
                onClick={() => {
                  setActiveModal('emergency_confirm');
                  speakText('Emergency button pressed. Are you in danger?');
                }}
                className="w-full bg-[#C62828] hover:bg-[#B71C1C] text-white p-6 sm:p-7 rounded-3xl shadow-xl border-2 border-red-600 transition-transform active:scale-[0.98] flex items-center justify-between text-left group"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-white animate-ping" />
                    <span className="text-xs font-black tracking-widest uppercase text-red-100">
                      HIGH PRIORITY
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    🚨 EMERGENCY
                  </h3>
                  <p className="text-xs text-red-100 font-bold">
                    1-Tap SOS • Instant Ambulance & Nearest PHC Alert
                  </p>
                </div>

                <div className="w-14 h-14 rounded-2xl bg-white text-[#C62828] flex items-center justify-center text-3xl font-black shadow-md group-hover:scale-105 transition-transform">
                  🆘
                </div>
              </button>
            )}

            {/* 2-COLUMN ACTION GRID: FIND HOSPITAL & FIND DOCTOR */}
            <div className="grid grid-cols-2 gap-3.5">
              {/* ACTION 2: 🏥 FIND HOSPITAL */}
              <button
                type="button"
                onClick={() => {
                  setActiveModal('find_hospital');
                  speakText('Finding nearby hospitals sorted by distance.');
                }}
                className="p-5 bg-white hover:bg-slate-50 text-slate-800 rounded-3xl border-2 border-slate-200 hover:border-teal-400 shadow-sm transition-all text-left flex flex-col justify-between h-36 active:scale-95 group"
              >
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#00695C] flex items-center justify-center text-2xl font-black border border-teal-200 group-hover:scale-105 transition-transform">
                  🏥
                </div>
                <div>
                  <h4 className="font-black text-base text-[#263238]">FIND HOSPITAL</h4>
                  <span className="text-[11px] text-slate-500 font-bold">📍 Within 50 km</span>
                </div>
              </button>

              {/* ACTION 3: 👨‍⚕️ FIND DOCTOR */}
              <button
                type="button"
                onClick={() => {
                  setActiveModal('find_doctor');
                  speakText('What symptom or doctor are you looking for?');
                }}
                className="p-5 bg-white hover:bg-slate-50 text-slate-800 rounded-3xl border-2 border-slate-200 hover:border-teal-400 shadow-sm transition-all text-left flex flex-col justify-between h-36 active:scale-95 group"
              >
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center text-2xl font-black border border-blue-200 group-hover:scale-105 transition-transform">
                  👨‍⚕️
                </div>
                <div>
                  <h4 className="font-black text-base text-[#263238]">FIND DOCTOR</h4>
                  <span className="text-[11px] text-slate-500 font-bold">Search by symptom</span>
                </div>
              </button>
            </div>

            {/* ACTION 4: 📋 MY HEALTH */}
            <button
              type="button"
              onClick={() => {
                setActiveNav('health');
                speakText('Opening your medical records, prescriptions, and health QR card.');
              }}
              className="w-full p-5 bg-white hover:bg-slate-50 text-slate-800 rounded-3xl border-2 border-slate-200 hover:border-teal-400 shadow-sm transition-all text-left flex items-center justify-between active:scale-95 group"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center text-2xl font-black border border-purple-200 group-hover:scale-105 transition-transform">
                  📋
                </div>
                <div>
                  <h4 className="font-black text-base text-[#263238]">MY HEALTH</h4>
                  <p className="text-xs text-slate-500 font-bold">
                    Central EHR • Prescriptions • Reports • QR Card
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#00695C] transition-colors" />
            </button>

            {/* PERSISTENT PROMINENT "🗣️ TALK" VOICE CONTROL */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveModal('voice_talk');
                  speakText('How can I help you? You can speak your symptom or request in your language.');
                }}
                className="w-full py-4 bg-gradient-to-r from-teal-700 via-[#00695C] to-teal-800 text-white font-black text-sm rounded-3xl shadow-lg transition-transform active:scale-95 flex items-center justify-center space-x-2.5 border-2 border-teal-500/60"
              >
                <div className="p-1.5 bg-white/20 rounded-full animate-pulse">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <span>🗣️ TAP TO TALK (VOICE ASSISTANT)</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* VIEW 2: HEALTH (EHR, PRESCRIPTIONS, REPORTS, QR)     */}
        {/* ==================================================== */}
        {activeNav === 'health' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xl font-black text-[#263238]">📋 My Health Journey</h2>
              <span className="text-xs text-[#00695C] font-black bg-[#E0F2F1] px-2.5 py-1 rounded-full">
                UID: {patient.uid}
              </span>
            </div>

            {/* Sub-Tabs: Records | Prescriptions | Reports | Health QR */}
            <div className="flex items-center space-x-1.5 bg-slate-200 p-1.5 rounded-2xl text-xs font-black">
              {[
                { id: 'records', label: '📜 Records' },
                { id: 'prescriptions', label: '💊 Medicines' },
                { id: 'reports', label: '🧪 Reports' },
                { id: 'qr', label: '🪪 QR Card' }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setHealthSubTab(t.id as any)}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    healthSubTab === t.id ? 'bg-[#00695C] text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* 1. Records View */}
            {healthSubTab === 'records' && (
              <div className="space-y-3">
                {records.map((rec) => (
                  <div key={rec.id} className="bg-white p-4 rounded-3xl border-2 border-slate-200 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-teal-50 text-[#00695C] font-black text-[10px] rounded-md border border-teal-200">
                        {rec.record_type}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">
                        {new Date(rec.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-black text-sm text-[#263238]">{rec.title}</h4>
                    <span className="text-xs text-slate-500 font-bold block">{rec.hospital_name}</span>
                    {rec.diagnosis && (
                      <p className="text-xs text-slate-700 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        Diagnosis: {rec.diagnosis}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 2. Prescriptions View */}
            {healthSubTab === 'prescriptions' && (
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-3xl border-2 border-slate-200 space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-slate-900">Current Active Medications</span>
                    <span className="text-xs text-emerald-700 font-black">● Verified</span>
                  </div>
                  <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-200 text-xs space-y-1">
                    <span className="font-black text-blue-950 block">💊 Tab Sorbitrate 5mg</span>
                    <span className="text-slate-600">Dosage: Sublingual stat dose • Prescribed by Dr. Anil Kumar</span>
                  </div>
                  <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-200 text-xs space-y-1">
                    <span className="font-black text-blue-950 block">💊 Tab Aspirin 300mg (Soluble)</span>
                    <span className="text-slate-600">Dosage: Chewable stat dose • Antiplatelet therapy</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Reports View */}
            {healthSubTab === 'reports' && (
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-3xl border-2 border-slate-200 space-y-2 shadow-sm">
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-black rounded-md">
                    LAB REPORT
                  </span>
                  <h4 className="font-black text-sm text-[#263238]">12-Lead Electrocardiogram (ECG)</h4>
                  <p className="text-xs text-slate-600">ST Elevation detected in Leads V1-V4. Urgent cath lab recommended.</p>
                </div>
              </div>
            )}

            {/* 4. Health QR Card */}
            {healthSubTab === 'qr' && (
              <div className="bg-white p-6 rounded-3xl border-2 border-[#00695C] text-center space-y-4 shadow-md">
                <div className="space-y-1">
                  <h3 className="font-black text-lg text-[#263238]">{patient.name}</h3>
                  <p className="text-xs font-mono text-[#00695C] font-bold">{patient.uid}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block">
                  <QRCodeSVG
                    value={`https://sanjeevani.gov.in/patient/${patient.uid}`}
                    size={160}
                    level="H"
                    includeMargin
                  />
                </div>

                <p className="text-xs text-slate-500 font-semibold max-w-xs mx-auto">
                  Show this permanent QR code to hospital triage desks or doctors for instant authorized medical history lookup.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* VIEW 3: ME (PROFILE, LANGUAGE, ACCESSIBILITY, SETTINGS) */}
        {/* ==================================================== */}
        {activeNav === 'me' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="px-1">
              <h2 className="text-xl font-black text-[#263238]">👤 My Profile & Settings</h2>
              <p className="text-xs text-slate-500 font-semibold">Accessibility, Language, and Clinical Portal Access</p>
            </div>

            {/* Patient Profile Details Card */}
            <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 space-y-3 shadow-sm text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-bold">Full Name</span>
                <span className="font-black text-slate-900 text-sm">{patient.name}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-bold">National Patient UID</span>
                <span className="font-mono font-black text-[#00695C]">{patient.uid}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-bold">Phone Number</span>
                <span className="font-bold text-slate-900">{patient.phone || '+91-9876543210'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">Blood Group</span>
                <span className="font-black text-red-600">{patient.blood_group || 'B+'}</span>
              </div>
            </div>

            {/* Language Selector */}
            <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 space-y-3 shadow-sm">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-[#00695C]" />
                <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider">
                  Select Language (भाषा)
                </h4>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs font-black">
                {[
                  { code: 'en', label: 'English' },
                  { code: 'hi', label: 'हिन्दी' },
                  { code: 'te', label: 'తెలుగు' },
                  { code: 'ta', label: 'தமிழ்' },
                  { code: 'bn', label: 'বাংলা' },
                  { code: 'mr', label: 'मराठी' }
                ].map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setLanguage(lang.code as any);
                      speakText(`Language changed to ${lang.label}`);
                    }}
                    className={`py-2 rounded-xl border transition-all ${
                      language === lang.code
                        ? 'bg-[#00695C] text-white border-[#00695C] shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Accessibility Toggles */}
            <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 space-y-3 shadow-sm text-xs font-bold text-slate-800">
              <div className="flex items-center justify-between">
                <span>🔊 Voice Narration & Speech</span>
                <button
                  type="button"
                  onClick={() => setIsVoiceNarration(!isVoiceNarration)}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs ${
                    isVoiceNarration ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isVoiceNarration ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span>👁️ High Contrast Mode</span>
                <button
                  type="button"
                  onClick={() => setIsHighContrast(!isHighContrast)}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs ${
                    isHighContrast ? 'bg-yellow-400 text-black' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isHighContrast ? 'ACTIVE' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Staff / Clinical Portals Switcher */}
            <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 space-y-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                Healthcare Provider Portals (Clinical Staff Mode)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onSwitchToHospitalOs}
                  className="p-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-black text-left flex flex-col justify-between h-20 shadow"
                >
                  <span>🏥 Hospital OS</span>
                  <span className="text-[10px] opacity-80">Command Center ➔</span>
                </button>

                <button
                  type="button"
                  onClick={onSwitchToPhcPortal}
                  className="p-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-black text-left flex flex-col justify-between h-20 shadow"
                >
                  <span>🏥 PHC Portal</span>
                  <span className="text-[10px] opacity-80">Accessibility Layer ➔</span>
                </button>
              </div>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={onLogout}
              className="w-full py-3.5 bg-slate-200 hover:bg-red-50 text-slate-800 hover:text-red-700 font-black text-xs rounded-2xl transition-colors flex items-center justify-center space-x-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of Session</span>
            </button>
          </div>
        )}
      </main>

      {/* ==================================================== */}
      {/* 3-ITEM BOTTOM NAVIGATION BAR                         */}
      {/* ==================================================== */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-lg w-full bg-white/95 backdrop-blur-md border-t-2 border-slate-200 p-2.5 flex items-center justify-around z-40 shadow-2xl">
        <button
          type="button"
          onClick={() => {
            setActiveNav('home');
            speakText('Navigated to Home');
          }}
          className={`flex-1 py-2 rounded-2xl text-xs font-black flex flex-col items-center space-y-0.5 transition-all ${
            activeNav === 'home' ? 'text-[#00695C] bg-[#E0F2F1]/80 scale-105' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span className="text-xl">🏠</span>
          <span>HOME</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveNav('health');
            speakText('Navigated to Health Records');
          }}
          className={`flex-1 py-2 rounded-2xl text-xs font-black flex flex-col items-center space-y-0.5 transition-all ${
            activeNav === 'health' ? 'text-[#00695C] bg-[#E0F2F1]/80 scale-105' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span className="text-xl">📋</span>
          <span>HEALTH</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveNav('me');
            speakText('Navigated to Profile');
          }}
          className={`flex-1 py-2 rounded-2xl text-xs font-black flex flex-col items-center space-y-0.5 transition-all ${
            activeNav === 'me' ? 'text-[#00695C] bg-[#E0F2F1]/80 scale-105' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span className="text-xl">👤</span>
          <span>ME</span>
        </button>
      </nav>

      {/* ==================================================== */}
      {/* MODAL 1: 🚨 EMERGENCY 1-TAP CONFIRMATION MODAL       */}
      {/* ==================================================== */}
      {activeModal === 'emergency_confirm' && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 border-2 border-red-600 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-red-100 text-[#C62828] flex items-center justify-center text-4xl mx-auto shadow-inner">
              🚨
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-xl text-[#263238]">Are you in danger?</h3>
              <p className="text-xs text-slate-500 font-semibold">
                Pressing YES will immediately transmit your Live GPS coordinates to the nearest PHC and dispatch an ambulance.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700">
              📍 Detected GPS: {userLocation.latitude}, {userLocation.longitude}
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleSendEmergency}
                disabled={emergencySending}
                className="w-full py-4 bg-[#C62828] hover:bg-[#B71C1C] text-white font-black text-sm rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center space-x-2"
              >
                <span>{emergencySending ? 'Transmitting GPS...' : 'YES — SEND HELP NOW'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModal('none')}
                className="w-full py-3 bg-slate-100 text-slate-700 font-black text-xs rounded-2xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: 🏥 FIND HOSPITAL (MINIMAL 50KM LIST)        */}
      {/* ==================================================== */}
      {activeModal === 'find_hospital' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border-2 border-teal-500 shadow-2xl animate-in zoom-in-95 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🏥</span>
                <div>
                  <h3 className="font-black text-base text-slate-900">Nearby Hospitals (Within 50 km)</h3>
                  <p className="text-xs text-slate-500">Sorted from nearest to farthest</p>
                </div>
              </div>
              <button type="button" onClick={() => setActiveModal('none')} className="p-2 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hospitals Minimal List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {hospitals.map((hosp) => (
                <div
                  key={hosp.id}
                  className="p-4 bg-slate-50 hover:bg-[#E0F2F1]/40 rounded-2xl border border-slate-200 space-y-2.5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-sm text-slate-900">{hosp.name}</h4>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 font-black text-[10px] rounded-full border border-emerald-300">
                      🟢 ✓ AVAILABLE
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-slate-500 font-bold">
                    <span>📍 {hosp.distance_km || 2.5} km away</span>
                    <span>•</span>
                    <span>🛏️ {hosp.general_beds || 45} Beds</span>
                    <span>•</span>
                    <span>🩺 ICU 🟢</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${hosp.latitude},${hosp.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-black text-[#00695C] hover:underline flex items-center space-x-1"
                    >
                      <span>🗺️ GO THERE</span>
                    </a>
                    <a
                      href={`tel:${hosp.phone || '108'}`}
                      className="px-3 py-1.5 bg-[#00695C] text-white font-black text-xs rounded-xl shadow-sm"
                    >
                      📞 CALL
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: 👨‍⚕️ FIND DOCTOR (NATURAL SYMPTOM SEARCH)   */}
      {/* ==================================================== */}
      {activeModal === 'find_doctor' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border-2 border-blue-500 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">👨‍⚕️</span>
                <div>
                  <h3 className="font-black text-base text-slate-900">What do you need help with?</h3>
                  <p className="text-xs text-slate-500">Type or speak your symptom in plain words</p>
                </div>
              </div>
              <button type="button" onClick={() => setActiveModal('none')} className="p-2 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Symptom Chips */}
            <div className="flex flex-wrap gap-1.5">
              {['Severe chest pain', 'High fever & vomiting', 'Knee joint pain', 'Eye problem'].map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => handleSymptomSearch(sym)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl text-xs font-bold transition-colors"
                >
                  {sym}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <input
                type="text"
                placeholder="E.g. My chest hurts, dizziness..."
                value={symptomInput}
                onChange={(e) => handleSymptomSearch(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-800"
              />
            </div>

            {matchedSpecialty && (
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-2 text-xs">
                <span className="text-[10px] font-black text-blue-900 uppercase tracking-wider block">
                  AI Specialist Recommendation:
                </span>
                <h4 className="font-black text-sm text-blue-950">🩺 {matchedSpecialty}</h4>
                <p className="text-slate-600 font-medium">
                  We found 3 nearby facilities with registered {matchedSpecialty} doctors available today.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal('find_hospital');
                    speakText(`Showing hospitals with ${matchedSpecialty} specialists available.`);
                  }}
                  className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-black rounded-xl shadow-sm"
                >
                  VIEW AVAILABLE HOSPITALS
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 4: 🗣️ VOICE ASSISTANT MODAL (SPEAK NATURALLY)   */}
      {/* ==================================================== */}
      {activeModal === 'voice_talk' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 border-2 border-teal-500 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-black text-base text-slate-900">🗣️ Speak in Your Language</h3>
              <button type="button" onClick={() => setActiveModal('none')}>✕</button>
            </div>

            <div className="w-20 h-20 rounded-full bg-[#00695C] text-white flex items-center justify-center text-4xl mx-auto shadow-lg animate-pulse">
              <Mic className="w-9 h-9" />
            </div>

            <p className="text-xs text-slate-600 font-bold">
              "How can I help you? You can say: 'I need a hospital', 'Find a cardiologist', or 'Emergency'."
            </p>

            {/* Preset Spoken Phrases */}
            <div className="grid grid-cols-2 gap-2 text-xs font-bold text-left">
              {[
                { label: '🚨 Emergency Help', query: 'Emergency' },
                { label: '🏥 Find Hospital', query: 'I need a hospital' },
                { label: '👨‍⚕️ Find Cardiologist', query: 'Find a cardiologist' },
                { label: '📋 Show My Report', query: 'Show my report' }
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleVoiceQuery(p.query)}
                  className="p-2.5 bg-slate-50 hover:bg-[#E0F2F1] rounded-xl border border-slate-200 text-slate-800 font-bold text-xs transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {voiceResponse && (
              <div className="p-3 bg-teal-50 rounded-2xl border border-teal-200 text-xs font-bold text-[#00695C]">
                {voiceResponse}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
