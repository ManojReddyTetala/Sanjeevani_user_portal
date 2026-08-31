import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Search, ShieldCheck, ArrowRight, Loader2, AlertCircle, Building2 } from 'lucide-react';
import { LocationState, PRESET_LOCATIONS } from '../context/LocationContext';

interface LocationPermissionScreenProps {
  onGrantGps: () => void;
  onSelectManual: (loc: LocationState) => void;
  gpsStatusMessage: string;
  permissionStatus?: string;
}

export const LocationPermissionScreen: React.FC<LocationPermissionScreenProps> = ({
  onGrantGps,
  onSelectManual,
  gpsStatusMessage,
  permissionStatus
}) => {
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [resolving, setResolving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Live Autocomplete as user types
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/location/autocomplete?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.warn('Autocomplete fetch error:', e);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSuggestionItem = async (item: any) => {
    setResolving(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/location/resolve?q=${encodeURIComponent(item.description || item.main_text)}`);
      const data = await res.json();
      if (res.ok && data.latitude && data.longitude) {
        onSelectManual({
          latitude: data.latitude,
          longitude: data.longitude,
          label: `Selected: ${data.formatted_address || item.description}`,
          isGps: false
        });
      } else {
        setErrorMsg('Could not fetch coordinates for selected location.');
      }
    } catch (e) {
      setErrorMsg('Failed to select location.');
    } finally {
      setResolving(false);
    }
  };

  const handleResolveTextSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setResolving(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/location/resolve?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (res.ok && data.latitude && data.longitude) {
        onSelectManual({
          latitude: data.latitude,
          longitude: data.longitude,
          label: `Selected: ${data.formatted_address || data.query}`,
          isGps: false
        });
      } else {
        setErrorMsg('Location not found. Try entering a city, pincode, or landmark.');
      }
    } catch (err) {
      setErrorMsg('Failed to resolve location search. Please try again.');
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAF9] text-[#263238] flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      {/* Top Brand Header */}
      <div className="max-w-lg w-full flex items-center justify-between py-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#00695C] p-2 rounded-xl text-white shadow flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-black text-lg text-[#263238] tracking-tight flex items-center space-x-1.5">
              <span>Sanjeevani Healthcare</span>
              <span className="text-[10px] font-bold text-[#00695C] bg-[#E0F2F1] px-2 py-0.5 rounded border border-[#00695C]/20">
                Citizen Portal
              </span>
            </h1>
            <p className="text-[11px] text-[#607D8B] font-medium">National Health Stack • Official Public Service</p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-[#00695C] bg-[#E0F2F1] px-2.5 py-1 rounded-full border border-[#00695C]/30 uppercase tracking-wider">
          STEP 2 / 2
        </span>
      </div>

      {/* Main Location Selection Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-xl space-y-6 text-center relative overflow-hidden">
        {/* Tricolour Accent Line at Top of Card */}
        <div className="tricolour-strip absolute top-0 left-0 right-0" />

        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#E0F2F1] text-[#00695C] rounded-2xl border border-[#00695C]/20 shadow-sm mt-2">
          <MapPin className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-bold text-[#00695C] bg-[#E0F2F1] px-3 py-1 rounded-full border border-[#00695C]/30 uppercase tracking-wider">
            LOCATION SELECTION REQUIRED
          </span>
          <h2 className="text-2xl font-black text-[#263238] mt-3">Where should we search for healthcare facilities?</h2>
          <p className="text-xs text-[#607D8B] mt-2 leading-relaxed">
            Establishing your location allows the portal to calculate accurate distance, ambulance availability, and nearby emergency trauma centers.
          </p>
        </div>

        {permissionStatus === 'denied' && (
          <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl text-left space-y-1">
            <div className="flex items-center space-x-2 text-[#F57C00] font-bold text-xs">
              <AlertCircle className="w-4 h-4" />
              <span>Location Access Denied</span>
            </div>
            <p className="text-[11px] text-[#263238]">
              You can grant browser GPS permission or select your region manually below.
            </p>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-2xl text-xs text-[#C62828] text-center font-bold">
            ⚠️ {errorMsg}
          </div>
        )}

        {!showSearchInput ? (
          <div className="space-y-4 pt-2">
            {/* Primary Action Button 1: Device GPS */}
            <button
              onClick={onGrantGps}
              className="w-full py-4 bg-[#00695C] hover:bg-[#004D40] text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2.5 active:scale-98 group"
            >
              <Navigation className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
              <span>📍 USE MY CURRENT GPS LOCATION</span>
            </button>

            {/* Primary Action Button 2: Manual Search */}
            <button
              onClick={() => setShowSearchInput(true)}
              className="w-full py-4 bg-white hover:bg-slate-50 text-[#263238] font-black text-sm rounded-2xl shadow-sm border border-slate-300 transition-all flex items-center justify-center space-x-2.5 active:scale-98 group"
            >
              <Search className="w-5 h-5 text-[#00695C] group-hover:scale-110 transition-transform" />
              <span>🔎 SEARCH OR CHOOSE CITY / REGION</span>
            </button>

            {/* Regional Presets Quick Buttons */}
            <div className="pt-3 space-y-2 text-left border-t border-slate-100">
              <span className="text-[10px] font-bold text-[#607D8B] uppercase tracking-wider block">
                Quick Regional Demo Locations:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_LOCATIONS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      onSelectManual({
                        latitude: preset.latitude,
                        longitude: preset.longitude,
                        label: preset.label,
                        isGps: false
                      })
                    }
                    className="p-2.5 bg-slate-50 hover:bg-[#E0F2F1] text-[#263238] hover:text-[#00695C] rounded-xl text-xs font-extrabold border border-slate-200 text-left transition-colors flex items-center justify-between"
                  >
                    <span className="truncate">{preset.label.split(',')[0]}</span>
                    <Building2 className="w-3.5 h-3.5 text-[#00695C] shrink-0 ml-1" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleResolveTextSearch} className="space-y-4 pt-2 text-left relative">
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-[#263238]">
                Type Any City, Town, Village, Pincode or Address:
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-[#607D8B] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Kakinada, Delhi, Ballabhgarh, Hyderabad, 533001..."
                  autoFocus
                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#00695C] rounded-xl py-3 pl-10 pr-24 text-xs font-bold text-[#263238] placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={resolving || !searchQuery.trim()}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3.5 bg-[#00695C] hover:bg-[#004D40] text-white text-xs font-bold rounded-lg shadow disabled:opacity-50 flex items-center space-x-1"
                >
                  {resolving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Resolve</span>}
                </button>
              </div>
            </div>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestionItem(s)}
                    className="w-full p-3 text-left hover:bg-[#E0F2F1] text-[#263238] transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-[#00695C] shrink-0" />
                      <span className="font-bold">{s.description || s.main_text}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowSearchInput(false)}
              className="text-xs font-bold text-[#00695C] hover:underline"
            >
              ← Back to GPS / Preset Options
            </button>
          </form>
        )}
      </div>

      <p className="text-[11px] text-[#607D8B] mt-6 font-medium text-center max-w-sm">
        🔒 Location data is used strictly client-side to calculate distance to facilities.
      </p>
    </div>
  );
};
