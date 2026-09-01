import React from 'react';
import { ShieldCheck, LogOut, Sun, Moon, Globe, User, QrCode, AlertTriangle, WifiOff, Wifi } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';
import { LanguageCode } from '../types';

interface NavbarProps {
  currentSession: { id: number; name: string; patient_id?: number } | null;
  onLogout: () => void;
  onOpenProfile: () => void;
  onOpenEmergency: () => void;
  onOpenHealthTrack?: () => void;
  onOpenQrPortal?: () => void;
  onOpenPhcPortal?: () => void;
  onOpenHospitalPortal?: () => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  isOffline?: boolean;
  setIsOffline?: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSession,
  onLogout,
  onOpenProfile,
  onOpenEmergency,
  onOpenHealthTrack,
  onOpenQrPortal,
  onOpenPhcPortal,
  onOpenHospitalPortal,
  highContrast,
  setHighContrast,
  isOffline = false,
  setIsOffline
}) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="bg-[#00695C] text-white sticky top-0 z-40 shadow-md">
      {/* Subtle Indian Tricolour Accent Line */}
      <div className="tricolour-strip w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Header */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/10 rounded-xl text-white font-black flex items-center space-x-1.5 border border-white/20">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
            <span className="text-sm tracking-wider font-extrabold uppercase">SANJEEVANI</span>
          </div>
          <div>
            <h1 className="font-black text-base tracking-tight text-white leading-tight flex items-center space-x-2">
              <span>{t('app_title')}</span>
            </h1>
            <span className="text-[10px] text-teal-100 font-semibold block tracking-wide">
              National Health Stack • Official Public Service
            </span>
          </div>
        </div>

        {/* Action & System Controls */}
        <div className="flex items-center space-x-2">
          {/* Hospital Operating System Switcher */}
          {onOpenHospitalPortal && (
            <button
              onClick={onOpenHospitalPortal}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl text-xs font-black shadow flex items-center space-x-1.5 transition-all"
              title="Open Role-Based Hospital Operating System"
            >
              <span>🏥</span>
              <span className="hidden md:inline">HOSPITAL OS</span>
            </button>
          )}

          {/* PHC Portal Direct Switcher Button */}
          {onOpenPhcPortal && (
            <button
              onClick={onOpenPhcPortal}
              className="px-3 py-1.5 bg-[#E0F2F1] hover:bg-white text-[#00695C] rounded-xl text-xs font-black shadow-sm flex items-center space-x-1.5 transition-all"
              title="Open Accessible PHC Staff Operations Portal"
            >
              <span>🏥</span>
              <span className="hidden md:inline">PHC PORTAL</span>
            </button>
          )}

          {/* Small System Connection Status Indicator */}
          {setIsOffline && (
            <button
              onClick={() => setIsOffline(!isOffline)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold flex items-center space-x-1.5 transition-colors border ${
                isOffline
                  ? 'bg-amber-100 text-amber-950 border-amber-300'
                  : 'bg-emerald-950/40 text-emerald-300 border-emerald-400/30'
              }`}
              title={isOffline ? 'Offline Mode Active — Click to switch to Online' : 'System Connected — Click to simulate Offline'}
            >
              <span className={`w-2 h-2 rounded-full ${isOffline ? 'bg-amber-500 animate-pulse' : 'bg-emerald-400 animate-pulse'}`} />
              <span className="hidden sm:inline font-mono">{isOffline ? `● ${t('offline_mode')}` : `● ${t('online_mode')}`}</span>
            </button>
          )}

          {/* Emergency Direct Button */}
          <button
            onClick={onOpenEmergency}
            className="px-3 py-1.5 bg-[#C62828] hover:bg-red-800 text-white rounded-xl text-xs font-black shadow-md border border-red-400/40 flex items-center space-x-1"
            title="Emergency Trauma Assistance"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{t('emergency')}</span>
          </button>

          {/* High Contrast Toggle */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/15"
            title="High Contrast Mode"
          >
            {highContrast ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Multilingual Selector (31+ Official & Tribal Languages) */}
          <div className="relative flex items-center bg-white/10 rounded-lg px-2 py-1 border border-white/20">
            <Globe className="w-3.5 h-3.5 text-teal-200 mr-1.5" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer max-w-[120px] sm:max-w-none"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-[#00695C] text-white">
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          {/* Authenticated User Session Badge & Logout */}
          {!isOffline && (
            currentSession ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onOpenProfile}
                  className="text-xs font-extrabold text-white bg-white/15 hover:bg-white/25 border border-white/30 px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 shadow-sm hidden sm:flex"
                  title="View & Edit Profile"
                >
                  <User className="w-3.5 h-3.5 text-teal-200" />
                  <span>{currentSession.name}</span>
                </button>

                <button
                  onClick={onLogout}
                  className="px-2.5 py-1.5 bg-white/10 hover:bg-red-700/80 text-white rounded-lg text-xs font-extrabold border border-white/20 transition-colors flex items-center space-x-1"
                  title="Log Out of Session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : null
          )}
        </div>
      </div>
    </header>
  );
};
