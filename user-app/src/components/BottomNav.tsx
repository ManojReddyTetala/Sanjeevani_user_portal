import React, { useState } from 'react';
import {
  Home,
  Building2,
  Stethoscope,
  FileText,
  User,
  AlertTriangle,
  Activity,
  QrCode,
  Send,
  MoreHorizontal,
  X,
  Search,
  ChevronRight,
  ShieldCheck,
  MapPin
} from 'lucide-react';

interface BottomNavProps {
  activeView: string;
  setActiveView: (view: 'home' | 'hospitals' | 'doctors' | 'diagnostics' | 'identity' | 'records' | 'referrals' | 'profile' | 'statistics' | 'emergency' | 'health_track') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainNavItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'health_track', label: 'Track', icon: Activity },
    { id: 'hospitals', label: 'Healthcare', icon: Building2 },
    { id: 'records', label: 'Records', icon: FileText },
    { id: 'more', label: 'More', icon: MoreHorizontal }
  ];

  const moreMenuItems = [
    { id: 'emergency', label: 'Emergency 108 Assistance', desc: 'Trauma hotline & nearest emergency', icon: AlertTriangle, color: 'text-red-600 bg-red-50 border-red-200' },
    { id: 'doctors', label: 'Find Doctor & Specialists', desc: 'Browse specialties & duty doctors', icon: Stethoscope, color: 'text-teal-700 bg-teal-50 border-teal-200' },
    { id: 'diagnostics', label: 'Diagnostic Facilities', desc: 'MRI, CT scan & lab services', icon: FileText, color: 'text-blue-700 bg-blue-50 border-blue-200' },
    { id: 'identity', label: 'My Health ID & QR', desc: 'Permanent Health Token & QR Code', icon: QrCode, color: 'text-purple-700 bg-purple-50 border-purple-200' },
    { id: 'referrals', label: 'My Inter-Facility Referrals', desc: 'Track PHC & hospital transfer status', icon: Send, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { id: 'statistics', label: 'Health Statistics', desc: 'EHR records analysis & vitals data', icon: Activity, color: 'text-[#00695C] bg-[#E0F2F1] border-[#00695C]/20' },
    { id: 'profile', label: 'User Profile & Settings', desc: 'Authenticated patient account session', icon: User, color: 'text-slate-700 bg-slate-100 border-slate-200' }
  ];

  const handleNavClick = (id: string) => {
    if (id === 'more') {
      setShowMoreMenu(!showMoreMenu);
    } else {
      setShowMoreMenu(false);
      setActiveView(id as any);
    }
  };

  return (
    <>
      {/* Mobile Bottom Sheet Drawer for "More" */}
      {showMoreMenu && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
          <div
            className="bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-full duration-300 relative"
          >
            {/* Top Indicator Strip */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-2" />

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#00695C]" />
                <h3 className="font-black text-base text-[#263238]">Sanjeevani Citizen Services</h3>
              </div>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1.5 bg-slate-100 text-slate-500 hover:text-slate-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5 pt-1">
              {moreMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setShowMoreMenu(false);
                      setActiveView(item.id as any);
                    }}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between text-left transition-all active:scale-98 ${
                      activeView === item.id
                        ? 'border-[#00695C] bg-[#E0F2F1]/60 font-bold'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2.5 rounded-xl border ${item.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-extrabold text-xs text-[#263238] block">{item.label}</span>
                        <span className="text-[11px] text-[#607D8B] font-medium">{item.desc}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main 5-Item Thumb-Friendly Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl px-2 py-1 flex items-center justify-around h-16">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id || (item.id === 'more' && showMoreMenu);

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 py-1 rounded-2xl transition-all ${
                isActive
                  ? 'text-[#00695C] bg-[#E0F2F1] font-extrabold shadow-xs'
                  : 'text-[#607D8B] hover:text-[#263238] font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#00695C]' : 'text-[#607D8B]'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight font-extrabold">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
