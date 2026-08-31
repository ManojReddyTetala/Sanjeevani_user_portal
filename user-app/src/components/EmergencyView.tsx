import React, { useState } from 'react';
import {
  AlertTriangle,
  Phone,
  Navigation,
  MapPin,
  Share2,
  FileText,
  ShieldAlert,
  Heart,
  Stethoscope,
  Building2,
  Bed,
  Truck,
  CheckCircle2,
  Info,
  ChevronRight,
  User,
  Copy
} from 'lucide-react';
import { Hospital, Patient, MedicalRecord } from '../types';
import { InteractiveHealthcareMap } from './InteractiveHealthcareMap';

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
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | string | null>(hospitals[0]?.id || null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [symptomWarning, setSymptomWarning] = useState<string | null>(null);

  // Filter emergency-capable facilities & sort by distance
  const emergencyFacilities = hospitals
    .filter((h) => {
      const type = (h.facility_type || '').toLowerCase();
      const name = h.name.toLowerCase();
      return (
        type.includes('hospital') ||
        type.includes('trauma') ||
        type.includes('super') ||
        name.includes('aiims') ||
        name.includes('ggh') ||
        name.includes('emergency') ||
        h.emergency_number
      );
    })
    .sort((a, b) => (a.distance_km ?? 99) - (b.distance_km ?? 99));

  const selectedFacility = emergencyFacilities.find((h) => h.id === selectedFacilityId) || emergencyFacilities[0] || hospitals[0];

  // Extract recorded allergy/medication info from patient records
  const recordedMedications: string[] = [];
  records.forEach((r) => {
    if (r.prescription_data && Array.isArray(r.prescription_data)) {
      r.prescription_data.forEach((m: any) => {
        if (m.medicine && !recordedMedications.includes(m.medicine)) {
          recordedMedications.push(m.medicine);
        }
      });
    }
  });

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

  const handleShareHealthSummary = () => {
    const summaryText = `📋 EMERGENCY HEALTH SUMMARY — ${patient.name}
UID: ${patient.uid}
Age/Gender: ${patient.age} YRS • ${patient.gender}
Blood Group: ${patient.blood_group}
Emergency Contact: ${patient.emergency_contact}
Known Medications: ${recordedMedications.length > 0 ? recordedMedications.join(', ') : 'None recorded'}
Active GPS Location: ${location.label} (https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude})
[DEMO / SAMPLE RECORD — FOR PUBLIC EMERGENCY DISPATCH]`;

    navigator.clipboard.writeText(summaryText);
    setShowShareModal(true);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border-2 border-[#C62828] shadow-md relative overflow-hidden space-y-3">
        <div className="bg-[#C62828] h-2 absolute top-0 left-0 right-0" />
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-100 text-[#C62828] rounded-2xl font-black">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#263238] flex items-center space-x-2">
                <span>🚑 EMERGENCY ASSISTANCE</span>
              </h2>
              <p className="text-xs text-[#607D8B] font-semibold">
                Critical trauma response & emergency healthcare discovery
              </p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 px-3.5 py-1.5 rounded-full text-xs font-black text-[#C62828] flex items-center space-x-1.5">
            <MapPin className="w-4 h-4 text-[#C62828]" />
            <span>📍 Active GPS: {location.label} (±12 m)</span>
          </div>
        </div>

        {/* Serious Symptom Notice Banner */}
        <div className="bg-amber-50 border border-amber-300 p-3.5 rounded-2xl text-xs text-[#263238] flex items-start space-x-2.5">
          <ShieldAlert className="w-5 h-5 text-[#F57C00] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-extrabold text-[#F57C00] block text-[11px] uppercase tracking-wider">
              ⚠️ CRITICAL MEDICAL SYMPTOM SAFETY DIRECTIVE
            </span>
            <p className="text-[11px] leading-relaxed text-[#263238]">
              If experiencing chest pain, severe breathing difficulty, stroke symptoms, loss of consciousness, or major trauma, call emergency services immediately or go to the nearest emergency facility. Do not rely on online consultation for acute emergencies.
            </p>
          </div>
        </div>
      </div>

      {/* 6 Primary Quick Action Touch Targets (Mobile & Desktop Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Action 1: Call Emergency Hotline */}
        <a
          href="tel:108"
          className="bg-[#C62828] hover:bg-red-800 text-white p-5 rounded-3xl shadow-lg transition-all text-left space-y-2 flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-white/20 rounded-2xl">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-black uppercase bg-white/20 px-2 py-0.5 rounded tracking-wider">
              102 / 108 NATIONAL
            </span>
          </div>
          <div>
            <h3 className="font-black text-lg text-white">📞 CALL EMERGENCY SERVICES</h3>
            <p className="text-xs text-red-100 font-medium mt-0.5">
              Direct device telephone dial for 108 / 102 trauma ambulance dispatch.
            </p>
          </div>
        </a>

        {/* Action 2: Find Nearest Emergency Facility */}
        <button
          onClick={() => {
            if (emergencyFacilities[0]) {
              setSelectedFacilityId(emergencyFacilities[0].id);
              onNavigateToHospital(emergencyFacilities[0].id);
            }
          }}
          className="bg-white hover:bg-slate-50 border-2 border-[#00695C] p-5 rounded-3xl shadow-sm transition-all text-left space-y-2 flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-[#E0F2F1] text-[#00695C] rounded-2xl">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase bg-emerald-50 text-[#2E7D32] border border-emerald-300 px-2 py-0.5 rounded">
              {emergencyFacilities.length} Nearby
            </span>
          </div>
          <div>
            <h3 className="font-black text-lg text-[#263238] group-hover:text-[#00695C] transition-colors">
              🏥 FIND NEAREST EMERGENCY
            </h3>
            <p className="text-xs text-[#607D8B] font-medium mt-0.5">
              Sort trauma hospitals & PHCs by active GPS distance.
            </p>
          </div>
        </button>

        {/* Action 3: One-Tap Directions */}
        <button
          onClick={() => {
            if (selectedFacility) onOpenDirections(selectedFacility);
          }}
          className="bg-[#00695C] hover:bg-[#004D40] text-white p-5 rounded-3xl shadow-lg transition-all text-left space-y-2 flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-white/20 rounded-2xl">
              <Navigation className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-black uppercase bg-white/20 px-2 py-0.5 rounded tracking-wider">
              GOOGLE MAPS
            </span>
          </div>
          <div>
            <h3 className="font-black text-lg text-white">🚨 GET ONE-TAP DIRECTIONS</h3>
            <p className="text-xs text-emerald-100 font-medium mt-0.5">
              Direct navigation route to {selectedFacility?.name || 'Nearest Hospital'}.
            </p>
          </div>
        </button>

        {/* Action 4: Share GPS Location */}
        <button
          onClick={handleShareLocation}
          className="bg-white hover:bg-slate-50 border border-slate-200 p-5 rounded-3xl shadow-sm transition-all text-left space-y-2 flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-50 text-[#1565C0] rounded-2xl">
              <MapPin className="w-6 h-6" />
            </div>
            {shareCopied && (
              <span className="text-[10px] font-black uppercase bg-emerald-50 text-[#2E7D32] px-2 py-0.5 rounded">
                COPIED!
              </span>
            )}
          </div>
          <div>
            <h3 className="font-black text-lg text-[#263238] group-hover:text-[#1565C0] transition-colors">
              📍 SHARE MY LOCATION
            </h3>
            <p className="text-xs text-[#607D8B] font-medium mt-0.5">
              Share your active GPS coordinates ({location.label}) with responders.
            </p>
          </div>
        </button>

        {/* Action 5: Share Emergency Health Summary */}
        <button
          onClick={handleShareHealthSummary}
          className="bg-white hover:bg-slate-50 border border-slate-200 p-5 rounded-3xl shadow-sm transition-all text-left space-y-2 flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h3 className="font-black text-lg text-[#263238] group-hover:text-purple-700 transition-colors">
              📤 SHARE HEALTH SUMMARY
            </h3>
            <p className="text-xs text-[#607D8B] font-medium mt-0.5">
              Share blood group, health ID & critical medical info.
            </p>
          </div>
        </button>

        {/* Action 6: Call Emergency Contact */}
        <a
          href={`tel:${patient.emergency_contact || '+919876543210'}`}
          className="bg-white hover:bg-slate-50 border border-slate-200 p-5 rounded-3xl shadow-sm transition-all text-left space-y-2 flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-amber-50 text-[#F57C00] rounded-2xl">
              <User className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h3 className="font-black text-lg text-[#263238] group-hover:text-[#F57C00] transition-colors">
              📞 CALL EMERGENCY CONTACT
            </h3>
            <p className="text-xs text-[#607D8B] font-medium mt-0.5">
              {patient.emergency_contact || 'No emergency contact set'}
            </p>
          </div>
        </a>
      </div>

      {/* Main Layout: Emergency Facilities List + Dedicated Map Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sorted Emergency Facilities (col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-black text-lg text-[#263238]">Nearby Emergency Facilities</h3>
              <p className="text-xs text-[#607D8B]">Sorted by active GPS distance from {location.label}</p>
            </div>
            <span className="text-xs font-extrabold text-[#00695C] bg-[#E0F2F1] px-3 py-1 rounded-full border border-[#00695C]/20">
              {emergencyFacilities.length} Facilities
            </span>
          </div>

          <div className="space-y-4">
            {emergencyFacilities.map((h) => {
              const isSelected = h.id === selectedFacilityId;
              const dist = h.distance_km ?? 0;

              let statusBadgeClass = 'bg-emerald-50 text-[#2E7D32] border-emerald-300';
              let statusLabel = '🟢 Emergency Available';

              if (h.status === 'LIMITED') {
                statusBadgeClass = 'bg-amber-50 text-[#F9A825] border-amber-300';
                statusLabel = '🟡 Emergency Limited — DEMO';
              } else if (h.status === 'UNAVAILABLE') {
                statusBadgeClass = 'bg-red-50 text-[#C62828] border-red-300';
                statusLabel = '🔴 Trauma Full — DEMO';
              }

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
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-extrabold uppercase bg-[#E0F2F1] text-[#00695C] px-2 py-0.5 rounded border border-[#00695C]/20">
                          {h.facility_type}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${statusBadgeClass}`}>
                          {statusLabel}
                        </span>
                      </div>
                      <h4 className="font-black text-[#263238] text-base mt-1.5">🏥 {h.name}</h4>
                      <p className="text-xs text-[#607D8B]">{h.address || h.city}</p>
                    </div>

                    <div className="text-right shrink-0 ml-2">
                      <span className="px-3 py-1 text-xs font-black rounded-full bg-emerald-50 text-[#2E7D32] border border-emerald-300 block">
                        📍 {dist.toFixed(1)} km
                      </span>
                    </div>
                  </div>

                  {/* Resource Breakdown Grid */}
                  <div className="bg-[#F7FAF9] p-3 rounded-2xl border border-slate-200 text-xs grid grid-cols-2 gap-2">
                    <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-[#607D8B] font-bold text-[11px]">ICU Beds:</span>
                      <span className="font-extrabold text-[#00695C]">{h.icu_beds ?? 0} Beds</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-[#607D8B] font-bold text-[11px]">Ambulance:</span>
                      <span className="font-extrabold text-[#00695C]">{h.ambulances ?? 1} Units</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDirections(h);
                      }}
                      className="flex-1 py-2.5 bg-[#00695C] hover:bg-[#004D40] text-white rounded-xl text-xs font-extrabold shadow flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>GET DIRECTIONS</span>
                    </button>

                    <a
                      href={`tel:${h.emergency_number || h.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="px-4 py-2.5 bg-white hover:bg-slate-50 text-[#00695C] border border-[#00695C] rounded-xl text-xs font-extrabold flex items-center space-x-1 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>CALL</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Dedicated Interactive Map Canvas (col-span-5) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
          <InteractiveHealthcareMap
            userLat={location.latitude}
            userLng={location.longitude}
            userLabel={location.label}
            hospitals={emergencyFacilities}
            selectedHospitalId={selectedFacilityId}
            onSelectHospital={(h) => setSelectedFacilityId(h.id)}
            onOpenDirections={onOpenDirections}
          />

          {/* Compact Patient Emergency Information Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-black text-[#263238] uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 text-[#C62828]" />
                <span>Patient Health Information</span>
              </span>
              <span className="text-[10px] font-bold text-[#00695C] bg-[#E0F2F1] px-2 py-0.5 rounded">
                DEMO PROFILE
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

              <div className="py-1 space-y-1">
                <span className="text-[#607D8B] font-bold block">Recorded Medications:</span>
                <p className="text-[11px] font-mono text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  {recordedMedications.length > 0 ? recordedMedications.join(', ') : 'No medications recorded in EHR.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Summary Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-lg text-[#263238] flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-[#00695C]" />
                <span>Emergency Summary Copied!</span>
              </h3>
              <button onClick={() => setShowShareModal(false)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
                ✕
              </button>
            </div>

            <p className="text-xs text-[#607D8B] leading-relaxed">
              The emergency health summary for <span className="font-bold text-[#00695C]">{patient.name}</span> has been copied to your clipboard. You can now paste and send it to emergency responders or contacts.
            </p>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full py-3 bg-[#00695C] text-white text-xs font-black rounded-xl shadow hover:bg-[#004D40] transition-colors"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
