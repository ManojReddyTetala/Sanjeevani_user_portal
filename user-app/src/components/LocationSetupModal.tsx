import React, { useState } from 'react';
import { MapPin, Search, ChevronRight, X, ShieldCheck } from 'lucide-react';
import { PRESET_LOCATIONS, LocationState } from '../context/LocationContext';

interface LocationSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGrantGps: () => void;
  onSelectLocation: (loc: LocationState) => void;
  gpsStatusMessage?: string;
}

export const LocationSetupModal: React.FC<LocationSetupModalProps> = ({
  isOpen,
  onClose,
  onGrantGps,
  onSelectLocation,
  gpsStatusMessage
}) => {
  const [manualQuery, setManualQuery] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  if (!isOpen) return null;

  const handleManualSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = manualQuery.trim();
    if (!query) return;

    setIsResolving(true);
    try {
      const res = await fetch(`/api/location/resolve?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (res.ok && data.latitude && data.longitude) {
        onSelectLocation({
          latitude: data.latitude,
          longitude: data.longitude,
          label: data.formatted_address || data.query,
          isGps: false
        });
        onClose();
      } else {
        alert('Location not found. Try searching a city, pincode, or landmark.');
      }
    } catch (err) {
      alert('Failed to resolve location. Please try again.');
    } finally {
      setIsResolving(false);
    }
  };

  const handleQueryChange = async (val: string) => {
    setManualQuery(val);
    if (val.trim().length > 2) {
      try {
        const res = await fetch(`/api/location/autocomplete?q=${encodeURIComponent(val.trim())}`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } catch (e) {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto">
        {/* Tricolour Header Accent Line */}
        <div className="tricolour-strip absolute top-0 left-0 right-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 pt-1">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#E0F2F1] text-[#00695C] rounded-xl flex items-center justify-center border border-[#00695C]/20">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-xl text-[#263238]">Location Setup</h3>
              <p className="text-xs text-[#607D8B]">Where should we search for healthcare facilities?</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2 Primary Large Touch Target Options (min-h: 44px) */}
        <div className="space-y-4">
          {/* Option 1: Use Current GPS Location */}
          <button
            onClick={() => {
              onGrantGps();
              onClose();
            }}
            className="w-full min-h-[56px] p-4 bg-[#00695C] hover:bg-[#004D40] text-white rounded-2xl flex items-center justify-between shadow-md transition-all active:scale-[0.98]"
          >
            <div className="flex items-center space-x-3 text-left">
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <span className="font-black text-sm block">📍 USE MY CURRENT LOCATION</span>
                <span className="text-[11px] text-teal-100 font-medium">Use real device GPS hardware location</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white shrink-0" />
          </button>

          {/* Option 2: Search Location Manually */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#263238] block">
              🔎 SELECT LOCATION MANUALLY
            </label>
            <form onSubmit={handleManualSearchSubmit} className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-[#607D8B] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={manualQuery}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  placeholder="Search city, village, locality, landmark, or PIN code..."
                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#00695C] rounded-xl py-3 pl-10 pr-24 text-xs font-bold text-[#263238] placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isResolving || !manualQuery.trim()}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#00695C] hover:bg-[#004D40] text-white text-xs font-bold rounded-lg shadow disabled:opacity-50"
                >
                  {isResolving ? 'Resolving...' : 'Search'}
                </button>
              </div>

              {/* Autocomplete Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        onSelectLocation({
                          latitude: s.latitude,
                          longitude: s.longitude,
                          label: s.formatted_address || s.name,
                          isGps: false
                        });
                        onClose();
                      }}
                      className="w-full p-3 text-left hover:bg-[#E0F2F1] text-[#263238] hover:text-[#00695C] font-semibold flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <MapPin className="w-4 h-4 text-[#00695C] shrink-0" />
                        <span className="truncate">{s.formatted_address || s.name}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Quick Presets Section */}
        <div className="pt-3 border-t border-slate-200 space-y-2">
          <span className="text-[10px] font-bold uppercase text-[#607D8B] tracking-wider block text-center">
            Or Choose a Regional City Preset:
          </span>
          <div className="flex flex-wrap gap-2 justify-center">
            {PRESET_LOCATIONS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onSelectLocation(preset);
                  onClose();
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-[#E0F2F1] text-[#263238] hover:text-[#00695C] rounded-xl text-xs font-extrabold border border-slate-200 transition-colors"
              >
                {preset.label.split(',')[0]}
              </button>
            ))}
          </div>
        </div>

        {gpsStatusMessage && (
          <p className="text-[11px] text-[#607D8B] text-center font-mono">
            {gpsStatusMessage}
          </p>
        )}
      </div>
    </div>
  );
};
