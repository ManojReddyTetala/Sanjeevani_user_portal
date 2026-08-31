import React from 'react';
import { ShieldCheck, LogOut, Sun, Moon, Globe, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageCode } from '../types';

interface NavbarProps {
  currentSession: { id: number; name: string; patient_id?: number } | null;
  onLogout: () => void;
  onOpenProfile: () => void;
  onOpenEmergency: () => void;
  onOpenHealthTrack?: () => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSession,
  onLogout,
  onOpenProfile,
  onOpenEmergency,
  onOpenHealthTrack,
  highContrast,
  setHighContrast
}) => {
  const { language, setLanguage } = useLanguage();

  return (
    <header className="bg-[#00695C] text-white sticky top-0 z-40 shadow-md">
      {/* Subtle Indian Tricolour Accent Line */}
      <div className="tricolour-strip w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Header */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/10 rounded-xl text-white font-black flex items-center space-x-1.5 border border-white/20">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
            <span className="text-sm tracking-wider font-extrabold">SANJEEVANI</span>
          </div>
          <div>
            <h1 className="font-black text-base tracking-tight text-white leading-tight flex items-center space-x-2">
              <span>Sanjeevani Healthcare</span>
              <span className="text-[11px] font-medium text-teal-100 bg-white/15 px-2 py-0.5 rounded border border-white/20">
                Citizen Portal
              </span>
              <span className="text-[10px] font-extrabold text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-400/30 uppercase tracking-wider flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>DEMO MODE</span>
              </span>
            </h1>
            <span className="text-[10px] text-teal-100 font-semibold block tracking-wide">
              National Health Stack • Official Public Service
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Health Track Direct Button */}
          {onOpenHealthTrack && (
            <button
              onClick={onOpenHealthTrack}
              className="px-3 py-1.5 bg-[#E0F2F1] hover:bg-white text-[#00695C] rounded-xl text-xs font-black shadow border border-white/40 flex items-center space-x-1 transition-colors"
              title="View Live Care Journey"
            >
              <span>🩺 HEALTH TRACK</span>
            </button>
          )}

          {/* Emergency Direct Button */}
          <button
            onClick={onOpenEmergency}
            className="px-3 py-1.5 bg-[#C62828] hover:bg-red-800 text-white rounded-xl text-xs font-black shadow-md border border-red-400/40 flex items-center space-x-1 animate-pulse"
            title="Emergency Trauma Assistance"
          >
            <span>🚑 EMERGENCY 108</span>
          </button>
          {/* High Contrast Toggle */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/15"
            title="High Contrast Mode"
          >
            {highContrast ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Multilingual Selector */}
          <div className="relative flex items-center bg-white/10 rounded-lg px-2.5 py-1 border border-white/20">
            <Globe className="w-3.5 h-3.5 text-teal-200 mr-1.5" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              <option value="en" className="bg-[#00695C] text-white">English</option>
              <option value="hi" className="bg-[#00695C] text-white">हिन्दी</option>
              <option value="bn" className="bg-[#00695C] text-white">বাংলা</option>
              <option value="ta" className="bg-[#00695C] text-white">தமிழ்</option>
              <option value="te" className="bg-[#00695C] text-white">తెలుగు</option>
              <option value="mr" className="bg-[#00695C] text-white">मराठी</option>
              <option value="gu" className="bg-[#00695C] text-white">ગુજરાતી</option>
              <option value="kn" className="bg-[#00695C] text-white">ಕನ್ನಡ</option>
            </select>
          </div>

          {/* Authenticated User Session Badge & Logout */}
          {currentSession ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={onOpenProfile}
                className="text-xs font-extrabold text-white bg-white/15 hover:bg-white/25 border border-white/30 px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 shadow-sm"
                title="View & Edit Profile"
              >
                <User className="w-3.5 h-3.5 text-teal-200" />
                <span>{currentSession.name}</span>
              </button>

              <button
                onClick={onLogout}
                className="px-3 py-1.5 bg-white/10 hover:bg-red-700/80 text-white rounded-lg text-xs font-extrabold border border-white/20 transition-colors flex items-center space-x-1"
                title="Log Out of Session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">LOG OUT</span>
              </button>
            </div>
          ) : (
            <span className="text-xs font-bold text-teal-100 font-mono">Not Authenticated</span>
          )}
        </div>
      </div>
    </header>
  );
};
