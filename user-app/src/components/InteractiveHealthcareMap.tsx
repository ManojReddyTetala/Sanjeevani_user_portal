import React, { useState } from 'react';
import { MapPin, Navigation, Phone, Globe, Info } from 'lucide-react';
import { Hospital } from '../types';
import { getDistanceBadge, getBedAvailabilityBadge, getOverallFacilityStatus } from '../utils/statusUtils';

interface InteractiveHealthcareMapProps {
  userLat: number;
  userLng: number;
  userLabel: string;
  accuracy?: number;
  hospitals: Hospital[];
  selectedHospitalId?: number | string | null;
  onSelectHospital?: (hospital: Hospital) => void;
  onOpenDirections: (hospital: Hospital) => void;
}

export const InteractiveHealthcareMap: React.FC<InteractiveHealthcareMapProps> = ({
  userLat,
  userLng,
  userLabel,
  accuracy = 15,
  hospitals,
  selectedHospitalId,
  onSelectHospital,
  onOpenDirections
}) => {
  const [activeMarkerId, setActiveMarkerId] = useState<number | string | null>(selectedHospitalId || (hospitals[0]?.id ?? null));

  const activeHospital = hospitals.find((h) => String(h.id) === String(activeMarkerId)) || hospitals[0];

  const openDirectGoogleMap = () => {
    const directUrl = `https://www.google.com/maps?q=${userLat},${userLng}`;
    window.open(directUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-lg flex flex-col h-[520px]">
      {/* Map Header Status Bar */}
      <div className="bg-[#00695C] px-5 py-3 text-white flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping" />
          <span className="font-extrabold text-white">📍 Interactive Healthcare Map</span>
          <span className="text-teal-100 font-mono text-[11px]">({userLat.toFixed(4)}°, {userLng.toFixed(4)}°)</span>
        </div>

        <button
          onClick={openDirectGoogleMap}
          className="px-3 py-1 bg-white/15 hover:bg-white/25 text-white rounded-lg text-xs font-bold shadow-sm flex items-center space-x-1.5 border border-white/20 transition-colors"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Open Full Map</span>
        </button>
      </div>

      {/* Interactive Map Canvas Grid */}
      <div className="flex-1 relative bg-slate-100 p-4 flex flex-col justify-between overflow-hidden">
        {/* Real Live Google Map iFrame Embed */}
        <iframe
          title="Google Map Live View"
          width="100%"
          height="100%"
          style={{ border: 0, position: 'absolute', inset: 0, opacity: 0.9 }}
          loading="lazy"
          allowFullScreen
          src={`https://maps.google.com/maps?q=${userLat},${userLng}&z=14&output=embed`}
        />

        {/* Floating User Location Badge Banner */}
        <div className="relative z-10 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-[#00695C]/30 shadow-md max-w-sm space-y-0.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-[#00695C] animate-bounce" />
              <span className="font-black text-[#263238] text-xs">📍 YOU ARE HERE</span>
            </div>
            <span className="text-[10px] font-mono text-[#00695C] bg-[#E0F2F1] px-2 py-0.5 rounded border border-[#00695C]/20 font-bold">
              GPS Active
            </span>
          </div>
          <p className="text-[11px] text-[#607D8B] pl-6 font-medium truncate">{userLabel}</p>
        </div>

        {/* Facilities Marker Selector Bar */}
        <div className="relative z-10 py-1">
          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-thin">
            {hospitals.map((h) => {
              const isSelected = String(h.id) === String(activeMarkerId);
              const distBadge = getDistanceBadge(h.distance_km);
              const statusBadge = getOverallFacilityStatus(h);

              return (
                <button
                  key={h.id}
                  onClick={() => {
                    setActiveMarkerId(h.id);
                    if (onSelectHospital) onSelectHospital(h);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold shrink-0 transition-all flex items-center space-x-1.5 border shadow ${
                    isSelected
                      ? 'bg-[#00695C] text-white border-[#00695C] scale-105 ring-2 ring-[#00695C]/30'
                      : 'bg-white hover:bg-slate-50 text-[#263238] border-slate-300'
                  }`}
                >
                  <span>{statusBadge.icon}</span>
                  <span>{h.name.split(' ')[0]}</span>
                  <span className="text-[10px] opacity-80">({distBadge.label.split(' ')[1]} km)</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Facility Details Card Overlay */}
        {activeHospital && (() => {
          const distBadge = getDistanceBadge(activeHospital.distance_km);
          const bedBadge = getBedAvailabilityBadge(activeHospital);
          const statusBadge = getOverallFacilityStatus(activeHospital);

          return (
            <div className="relative z-10 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-[#00695C] bg-[#E0F2F1] px-2 py-0.5 rounded border border-[#00695C]/20">
                      {activeHospital.facility_type || 'Healthcare Facility'}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${statusBadge.badgeClass}`}>
                      {statusBadge.label}
                    </span>
                  </div>
                  <h4 className="font-black text-[#263238] text-base mt-1">{activeHospital.name}</h4>
                  <p className="text-xs text-[#607D8B]">{activeHospital.address || activeHospital.city}</p>
                </div>

                <div className="flex flex-col items-end space-y-1 ml-2">
                  <span className={`px-2.5 py-0.5 text-xs rounded-full border ${distBadge.badgeClass}`}>
                    {distBadge.label}
                  </span>
                  <span className={`px-2.5 py-0.5 text-[10px] rounded-full border ${bedBadge.badgeClass}`}>
                    {bedBadge.label}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-1">
                <button
                  onClick={() => onOpenDirections(activeHospital)}
                  className="flex-1 py-2 bg-[#00695C] hover:bg-[#004D40] text-white rounded-xl text-xs font-extrabold shadow flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Directions</span>
                </button>

                {activeHospital.phone && (
                  <a
                    href={`tel:${activeHospital.phone}`}
                    className="flex-1 py-2 bg-white hover:bg-slate-50 text-[#00695C] border border-[#00695C] rounded-xl text-xs font-extrabold shadow-sm flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Facility</span>
                  </a>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
