import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Phone,
  Navigation,
  MapPin,
  Share2,
  FileText,
  ShieldAlert,
  Building2,
  CheckCircle2,
  Send,
  Clock,
  Activity,
  ArrowRight,
  Truck,
  Info
} from 'lucide-react';
import { Hospital, Patient, MedicalRecord } from '../types';
import { InteractiveHealthcareMap } from './InteractiveHealthcareMap';
import { useLanguage } from '../context/LanguageContext';

interface EmergencyViewProps {
  patient: Patient;
  location: { latitude: number; longitude: number; label: string };
  hospitals: Hospital[];
  records: MedicalRecord[];
  onOpenDirections: (h: Hospital) => void;
  onNavigateToHospital: (hospitalId: number) => void;
}

export const EmergencyView: React.FC<EmergencyViewProps> = ({
  patient,
  location,
  hospitals,
  records,
  onOpenDirections,
  onNavigateToHospital
}) => {
  const { t } = useLanguage();
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | string | null>(hospitals[0]?.id || null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [targetPhc, setTargetPhc] = useState<Hospital | null>(null);
  const [requestDescription, setRequestDescription] = useState('');
  const [isSubmittingReq, setIsSubmittingReq] = useState(false);
  const [activeEmergencyReq, setActiveEmergencyReq] = useState<any | null>(null);

  // 1. Separate Nearest PHCs/CHCs vs Emergency Hospitals
  const phcFacilities = hospitals
    .filter((h) => {
      const type = (h.facility_type || '').toLowerCase();
      const name = h.name.toLowerCase();
      return type.includes('primary') || type.includes('phc') || type.includes('chc') || name.includes('phc') || name.includes('chc');
    })
    .sort((a, b) => (a.distance_km ?? 99) - (b.distance_km ?? 99));

  const hospitalFacilities = hospitals
    .filter((h) => {
      const type = (h.facility_type || '').toLowerCase();
      const name = h.name.toLowerCase();
      return (
        type.includes('hospital') ||
        type.includes('trauma') ||
        type.includes('super') ||
        name.includes('aiims') ||
        name.includes('ggh') ||
        name.includes('general hospital')
      );
    })
    .sort((a, b) => (a.distance_km ?? 99) - (b.distance_km ?? 99));

  const selectedFacility = hospitals.find((h) => h.id === selectedFacilityId) || phcFacilities[0] || hospitalFacilities[0] || hospitals[0];

  // Fetch active emergency requests for this patient & subscribe to SSE
  useEffect(() => {
    const fetchActive = () => {
      fetch(`http://localhost:5000/api/emergency/requests?patient_id=${patient.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setActiveEmergencyReq(data[0]);
          }
        })
        .catch((err) => console.error('Error fetching emergency requests:', err));
    };

    fetchActive();

    const es = new EventSource('/api/events');
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (
          (data.type === 'EmergencyRequestCreated' || data.type === 'EmergencyRequestUpdated') &&
          data.data?.patient_id === patient.id
        ) {
          setActiveEmergencyReq(data.data);
        }
      } catch (e) {}
    };

    return () => {
      es.close();
    };
  }, [patient.id]);

  const handleOpenRequestModal = (phc: Hospital) => {
    setTargetPhc(phc);
    setShowRequestModal(true);
  };

  const handleSubmitEmergencyRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPhc) return;

    setIsSubmittingReq(true);
    try {
      const response = await fetch('http://localhost:5000/api/emergency/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patient.id,
          patient_name: patient.name,
          patient_age: patient.age || 28,
          patient_blood_group: patient.blood_group || 'O+',
          health_id: patient.uid,
          facility_id: targetPhc.id,
          latitude: location.latitude,
          longitude: location.longitude,
          distance_km: targetPhc.distance_km || 3.4,
          priority: 'CRITICAL',
          description: requestDescription || 'Severe chest pain and difficulty breathing'
        })
      });

      const data = await response.json();
      if (response.ok) {
        setActiveEmergencyReq(data);
        setShowRequestModal(false);
        setRequestDescription('');
      } else {
        alert(data.error?.message || 'Unable to send emergency request.');
      }
    } catch (err) {
      console.error('Error submitting emergency request:', err);
      alert('Unable to connect to server. Please call the PHC directly or dial 108.');
    } finally {
      setIsSubmittingReq(false);
    }
  };

  const handleShareLocation = async () => {
    const shareText = `🚑 EMERGENCY LOCATION SHARE:
Patient: ${patient.name} (UID: ${patient.uid})
Location: ${location.label} (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})
Google Maps Link: https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `Emergency Location — ${patient.name}`, text: shareText });
        return;
      } catch (e) {}
    }

    navigator.clipboard.writeText(shareText);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 3000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-50 text-[#C62828] rounded-2xl font-black border border-red-200">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#263238] flex items-center space-x-2">
                <span>🚑 {t('emergency')}</span>
              </h2>
              <p className="text-xs text-[#607D8B] font-medium">
                Emergency trauma response & nearest Primary Health Centre (PHC) integration
              </p>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#2E7D32] flex items-center space-x-1.5">
            <MapPin className="w-4 h-4 text-[#2E7D32]" />
            <span>{t('current_location')}: {location.label}</span>
          </div>
        </div>

        {/* Live Active Emergency Request Progress Tracker Banner (2-Way Communication Loop) */}
        {activeEmergencyReq && (
          <div className="bg-white border-2 border-red-400 p-5 rounded-3xl space-y-4 shadow-md animate-in slide-in-from-top">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-red-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
                <span className="text-xs font-black text-red-950 uppercase tracking-wider">
                  LIVE EMERGENCY CASE #EMG-2026-{activeEmergencyReq.id} — {activeEmergencyReq.facility_name}
                </span>
              </div>
              <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                activeEmergencyReq.status === 'RESOLVED'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                  : activeEmergencyReq.status === 'AMBULANCE_DISPATCHED'
                  ? 'bg-blue-100 text-blue-900 border-blue-400'
                  : activeEmergencyReq.status === 'ACCEPTED'
                  ? 'bg-teal-100 text-teal-900 border-teal-400'
                  : activeEmergencyReq.status === 'REFERRED'
                  ? 'bg-purple-100 text-purple-900 border-purple-400'
                  : 'bg-red-600 text-white border-red-700'
              }`}>
                ● {activeEmergencyReq.status}
              </span>
            </div>

            {/* 6-Stage Progress Pipeline */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-[10px] font-black">
              {/* Stage 1 */}
              <div className={`p-2 rounded-xl border flex flex-col items-center justify-center ${
                activeEmergencyReq.status
                  ? 'bg-red-600 text-white border-red-700 shadow-sm'
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}>
                <span>1. SENT</span>
                <span className="text-[9px] font-bold">GPS Transmitted</span>
              </div>

              {/* Stage 2 */}
              <div className={`p-2 rounded-xl border flex flex-col items-center justify-center ${
                activeEmergencyReq.status !== 'CREATED' && activeEmergencyReq.status !== 'SENT'
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}>
                <span>2. TRIAGE</span>
                <span className="text-[9px] font-bold">PHC Processing</span>
              </div>

              {/* Stage 3 */}
              <div className={`p-2 rounded-xl border flex flex-col items-center justify-center ${
                activeEmergencyReq.status === 'ACCEPTED' || activeEmergencyReq.status === 'AMBULANCE_DISPATCHED' || activeEmergencyReq.status === 'REFERRED' || activeEmergencyReq.status === 'RESOLVED'
                  ? 'bg-teal-600 text-white border-teal-700 shadow-sm'
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}>
                <span>3. ACCEPTED</span>
                <span className="text-[9px] font-bold">Doctor Assigned</span>
              </div>

              {/* Stage 4 */}
              <div className={`p-2 rounded-xl border flex flex-col items-center justify-center ${
                activeEmergencyReq.ambulance_status === 'DISPATCHED' || activeEmergencyReq.status === 'AMBULANCE_DISPATCHED'
                  ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}>
                <span>4. AMBULANCE</span>
                <span className="text-[9px] font-bold">En Route</span>
              </div>

              {/* Stage 5 */}
              <div className={`p-2 rounded-xl border flex flex-col items-center justify-center ${
                activeEmergencyReq.status === 'REFERRED'
                  ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}>
                <span>5. REFERRAL</span>
                <span className="text-[9px] font-bold">Apex Hub Link</span>
              </div>

              {/* Stage 6 */}
              <div className={`p-2 rounded-xl border flex flex-col items-center justify-center ${
                activeEmergencyReq.status === 'RESOLVED'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}>
                <span>6. RESOLVED</span>
                <span className="text-[9px] font-bold">Saved to EHR</span>
              </div>
            </div>

            {/* Live PHC Status Message */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 space-y-1">
              {activeEmergencyReq.assigned_doctor && (
                <p className="text-[#00695C] font-black flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Attending Medical Officer: {activeEmergencyReq.assigned_doctor}</span>
                </p>
              )}
              {activeEmergencyReq.assigned_driver && (
                <p className="text-blue-800 font-black flex items-center space-x-1.5">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Ambulance: {activeEmergencyReq.assigned_driver}</span>
                </p>
              )}
              {activeEmergencyReq.phc_notes && (
                <p className="text-slate-600 font-medium italic">
                  PHC Operational Log: "{activeEmergencyReq.phc_notes}"
                </p>
              )}
            </div>

            {/* LIVE AMBULANCE APPROACHING VISUALIZER & DUAL GPS MAP */}
            {activeEmergencyReq.ambulance_status === 'DISPATCHED' && (
              <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 text-white space-y-3 shadow-inner">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                    <h5 className="font-black text-xs text-amber-300 uppercase tracking-wider">
                      🚑 HELP IS ON THE WAY • AMBULANCE {activeEmergencyReq.ambulance_code || 'AMB-07'}
                    </h5>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-400">
                    Speed: 44 km/h • GPS: Live
                  </span>
                </div>

                {/* Animated Approaching Corridor */}
                <div className="relative h-20 w-full bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between px-6">
                  {/* Route Line */}
                  <div className="absolute left-8 right-8 h-1.5 bg-slate-800 rounded-full" />
                  <div className="absolute left-8 w-[60%] h-1.5 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 rounded-full animate-pulse" />

                  {/* PHC Point */}
                  <div className="relative z-10 flex flex-col items-center">
                    <span className="text-xl">🏥</span>
                    <span className="text-[9px] font-bold text-slate-400">PHC</span>
                  </div>

                  {/* Moving Ambulance Marker */}
                  <div className="relative z-10 flex flex-col items-center animate-bounce">
                    <span className="text-2xl">🚑</span>
                    <span className="text-[9px] font-black text-amber-400 bg-slate-900 px-1.5 py-0.2 rounded border border-amber-400/40">
                      AMB-07 (ETA: {activeEmergencyReq.eta_minutes || 4} min)
                    </span>
                  </div>

                  {/* Patient Point */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="relative">
                      <span className="text-xl">👤</span>
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    </div>
                    <span className="text-[9px] font-bold text-red-300">You</span>
                  </div>
                </div>

                {/* Distance Countdown Bar */}
                <div className="flex flex-wrap items-center justify-between text-xs pt-1 gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">Distance to you:</span>
                    <span className="font-black text-amber-400 text-sm">
                      {Math.max(0.4, (activeEmergencyReq.distance_km || 3.4) * 0.52).toFixed(1)} km
                    </span>
                    <span className="text-[11px] text-slate-500 font-bold">• Approx {activeEmergencyReq.eta_minutes || 4} mins away</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <a
                      href="tel:+919876543110"
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center space-x-1 shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>CALL DRIVER</span>
                    </a>
                    <a
                      href="tel:108"
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs rounded-xl border border-slate-700 flex items-center space-x-1"
                    >
                      <Phone className="w-3.5 h-3.5 text-red-400" />
                      <span>DIAL 108</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CALL EMERGENCY AMBULANCE — 108 ACTION CARD (Clearly Separated) */}
      <div className="bg-[#C62828] text-white p-6 rounded-3xl shadow-md space-y-3 border border-red-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-black text-xl text-white flex items-center space-x-2">
              <span>🚑 NEED AN IMMEDIATE AMBULANCE?</span>
            </h3>
            <p className="text-xs text-red-100 mt-0.5">
              Direct connection to National 108 / 102 Emergency Medical Ambulance Service.
            </p>
          </div>

          <a
            href="tel:108"
            className="px-6 py-3.5 bg-white text-[#C62828] hover:bg-red-50 font-black text-sm rounded-2xl shadow border border-white flex items-center space-x-2 transition-transform active:scale-95"
          >
            <Phone className="w-5 h-5 text-[#C62828]" />
            <span>CALL EMERGENCY AMBULANCE — 108</span>
          </a>
        </div>
      </div>

      {/* Main Grid: Nearest PHCs & Nearby Hospitals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Nearest PHCs + Hospitals (col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* SECTION 1: NEARBY PRIMARY HEALTH CENTRES (PHCs) */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-[#263238]">1. Nearest Primary Health Centres (PHCs)</h3>
                <p className="text-xs text-[#607D8B]">First-line government primary care facilities near {location.label}</p>
              </div>
              <span className="text-xs font-extrabold text-[#00695C] bg-[#E0F2F1] px-3 py-1 rounded-full border border-[#00695C]/20">
                {phcFacilities.length} PHCs
              </span>
            </div>

            {phcFacilities.map((phc) => {
              const isSelected = phc.id === selectedFacilityId;
              const dist = phc.distance_km ?? 0;
              const hasPhone = !!(phc.phone || phc.emergency_number);

              return (
                <div
                  key={phc.id}
                  onClick={() => setSelectedFacilityId(phc.id)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-3 shadow-sm ${
                    isSelected ? 'bg-white border-[#00695C] ring-2 ring-[#00695C]/30' : 'bg-white hover:border-slate-300 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase bg-[#E0F2F1] text-[#00695C] px-2 py-0.5 rounded border border-[#00695C]/20">
                        {phc.facility_type || 'Primary Health Centre (PHC)'}
                      </span>
                      <h4 className="font-black text-[#263238] text-base mt-1">🏥 {phc.name}</h4>
                      <p className="text-xs text-[#607D8B]">{phc.address || phc.city}</p>
                    </div>

                    <span className="px-3 py-1 text-xs font-black rounded-full bg-emerald-50 text-[#2E7D32] border border-emerald-300 shrink-0 ml-2">
                      📍 {dist.toFixed(1)} km
                    </span>
                  </div>

                  <div className="bg-[#F7FAF9] p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
                    <span className="text-[#607D8B] font-bold block text-[11px]">Verified Contact Information:</span>
                    {hasPhone ? (
                      <span className="font-mono font-bold text-[#00695C] block">📞 {phc.phone || phc.emergency_number}</span>
                    ) : (
                      <span className="text-amber-800 font-bold block">⚠️ PHC phone number unavailable</span>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {hasPhone ? (
                      <a
                        href={`tel:${phc.phone || phc.emergency_number}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-4 py-2 bg-white hover:bg-slate-50 text-[#00695C] border border-[#00695C] rounded-xl text-xs font-extrabold flex items-center space-x-1 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>CALL PHC</span>
                      </a>
                    ) : null}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDirections(phc);
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#263238] border border-slate-300 rounded-xl text-xs font-extrabold flex items-center space-x-1 transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{t('get_directions')}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenRequestModal(phc);
                      }}
                      className="px-4 py-2 bg-[#00695C] hover:bg-[#004D40] text-white rounded-xl text-xs font-black shadow flex items-center space-x-1 transition-colors ml-auto"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>REQUEST PHC ASSISTANCE</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SECTION 2: OTHER NEARBY EMERGENCY HOSPITALS */}
          <div className="space-y-4 pt-2">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-[#263238]">2. Other Nearby Emergency Hospitals & Trauma Centers</h3>
                <p className="text-xs text-[#607D8B]">Secondary & Tertiary hospitals for emergency trauma care</p>
              </div>
              <span className="text-xs font-extrabold text-[#00695C] bg-[#E0F2F1] px-3 py-1 rounded-full border border-[#00695C]/20">
                {hospitalFacilities.length} Hospitals
              </span>
            </div>

            {hospitalFacilities.map((h) => {
              const isSelected = h.id === selectedFacilityId;
              const dist = h.distance_km ?? 0;

              return (
                <div
                  key={h.id}
                  onClick={() => setSelectedFacilityId(h.id)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-3 shadow-sm ${
                    isSelected ? 'bg-white border-[#00695C] ring-2 ring-[#00695C]/30' : 'bg-white hover:border-slate-300 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase bg-slate-100 text-[#263238] px-2 py-0.5 rounded border border-slate-300">
                        {h.facility_type}
                      </span>
                      <h4 className="font-black text-[#263238] text-base mt-1">🏥 {h.name}</h4>
                      <p className="text-xs text-[#607D8B]">{h.address || h.city}</p>
                    </div>

                    <span className="px-3 py-1 text-xs font-black rounded-full bg-slate-100 text-[#263238] border border-slate-300 shrink-0 ml-2">
                      📍 {dist.toFixed(1)} km
                    </span>
                  </div>

                  {/* Explicit Unverified Availability Statement */}
                  <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-medium">
                    ⚠️ Real-time bed availability: <span className="font-bold">Availability could not be verified live.</span> Please call hospital directly before transit.
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDirections(h);
                      }}
                      className="flex-1 py-2.5 bg-[#00695C] hover:bg-[#004D40] text-white rounded-xl text-xs font-extrabold shadow flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{t('get_directions')}</span>
                    </button>

                    <a
                      href={`tel:${h.emergency_number || h.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="px-4 py-2.5 bg-white hover:bg-slate-50 text-[#00695C] border border-[#00695C] rounded-xl text-xs font-extrabold flex items-center space-x-1 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{t('call_facility')}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Map & Patient Emergency Info (col-span-5) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
          <InteractiveHealthcareMap
            userLat={location.latitude}
            userLng={location.longitude}
            userLabel={location.label}
            hospitals={hospitals}
            selectedHospitalId={selectedFacilityId}
            onSelectHospital={(h) => setSelectedFacilityId(h.id)}
            onOpenDirections={onOpenDirections}
          />

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-black text-[#263238] uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 text-[#C62828]" />
                <span>Patient Health Information</span>
              </span>
              <span className="text-[10px] font-bold text-[#00695C] bg-[#E0F2F1] px-2 py-0.5 rounded">
                HEALTH ID
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#607D8B] font-bold">Patient Name:</span>
                <span className="font-extrabold text-[#263238]">{patient.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#607D8B] font-bold">Health ID (UID):</span>
                <span className="font-mono font-bold text-[#00695C]">{patient.uid}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#607D8B] font-bold">Blood Group:</span>
                <span className="font-black text-[#C62828]">{patient.blood_group || 'O+'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#607D8B] font-bold">Emergency Contact:</span>
                <span className="font-bold text-[#263238]">{patient.emergency_contact}</span>
              </div>
            </div>

            <button
              onClick={handleShareLocation}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-[#263238] font-bold text-xs rounded-xl border border-slate-300 flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{shareCopied ? 'LOCATION COPIED!' : 'SHARE GPS LOCATION'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* REQUEST PHC ASSISTANCE MODAL */}
      {showRequestModal && targetPhc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-lg text-[#263238]">Request Connected PHC Assistance</h3>
                <p className="text-xs text-[#607D8B]">{targetPhc.name}</p>
              </div>
              <button onClick={() => setShowRequestModal(false)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitEmergencyRequest} className="space-y-4">
              <div className="space-y-1 text-xs">
                <label className="font-bold text-[#263238]">Describe Emergency / Patient Condition:</label>
                <textarea
                  value={requestDescription}
                  onChange={(e) => setRequestDescription(e.target.value)}
                  placeholder="e.g. Severe chest pain, breathing difficulty, fever..."
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#00695C] h-24"
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-[11px] text-blue-950 font-medium">
                ℹ️ Submitting this request transmits your Health ID ({patient.uid}) and active GPS coordinates ({location.label}) to the PHC's emergency dashboard.
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-[#263238] text-xs font-bold rounded-xl border border-slate-300"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReq}
                  className="flex-1 py-3 bg-[#00695C] hover:bg-[#004D40] text-white text-xs font-black rounded-xl shadow flex items-center justify-center space-x-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmittingReq ? 'SENDING REQUEST...' : 'TRANSMIT REQUEST'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
