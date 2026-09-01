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
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface BottomNavProps {
  activeView: string;
  setActiveView: (view: 'home' | 'hospitals' | 'doctors' | 'diagnostics' | 'identity' | 'records' | 'referrals' | 'profile' | 'statistics' | 'emergency' | 'health_track') => void;
  isOffline?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView, isOffline = false }) => {
  const { t } = useLanguage();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainNavItems = isOffline
    ? [
        { id: 'emergency', label: t('emergency'), icon: AlertTriangle },
        { id: 'identity', label: t('health_id'), icon: QrCode }
      ]
    : [
        { id: 'home', label: t('home'), icon: Home },
        { id: 'health_track', label: t('health_track'), icon: Activity },
        { id: 'hospitals', label: t('find_hospitals'), icon: Building2 },
        { id: 'records', label: t('health_records'), icon: FileText },
        { id: 'more', label: '☰', icon: MoreHorizontal }
      ];

  const moreMenuItems = [
    { id: 'emergency', label: t('emergency'), desc: 'Trauma hotline & nearest emergency', icon: AlertTriangle, color: 'text-red-600 bg-red-50 border-red-200' },
    { id: 'doctors', label: t('find_doctor'), desc: 'Browse specialties & duty doctors', icon: Stethoscope, color: 'text-teal-700 bg-teal-50 border-teal-200' },
    { id: 'diagnostics', label: t('find_test'), desc: 'MRI, CT scan & lab services', icon: FileText, color: 'text-blue-700 bg-blue-50 border-blue-200' },
    { id: 'identity', label: t('health_id'), desc: 'Permanent Health Token & QR Code', icon: QrCode, color: 'text-purple-700 bg-purple-50 border-purple-200' },
    { id: 'referrals', label: t('referrals'), desc: 'Track PHC & hospital transfer status', icon: Send, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { id: 'statistics', label: t('statistics'), desc: 'EHR records analysis & vitals data', icon: Activity, color: 'text-[#00695C] bg-[#E0F2F1] border-[#00695C]/20' },
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
      {/* Mobile Bottom Sheet Drawer for "More" (Only in Online Mode) */}
      {!isOffline && showMoreMenu && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
          <div
            className="bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-full duration-300 relative"
          >
            {/* Top Indicator Strip */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-2" />

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#00695C]" />
                <h3 className="font-black text-base text-[#263238]">{t('app_title')}</h3>
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
                        <div className="font-black text-xs text-[#263238]">{item.label}</div>
                        <div className="text-[10px] text-slate-500 font-medium">{item.desc}</div>
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

      {/* Main Fixed Bottom Bar Navigation */}
      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t shadow-2xl transition-colors ${
          isOffline ? 'bg-amber-900 border-amber-800 text-white' : 'bg-white border-slate-200 text-slate-700'
        }`}
      >
        <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id || (item.id === 'more' && showMoreMenu);

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex-1 py-1 px-1 flex flex-col items-center justify-center space-y-0.5 rounded-2xl transition-all ${
                  isActive
                    ? isOffline
                      ? 'text-amber-300 font-black scale-105'
                      : 'text-[#00695C] font-black scale-105'
                    : isOffline
                    ? 'text-amber-100/70 hover:text-white'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? (isOffline ? 'text-amber-300' : 'text-[#00695C]') : ''}`} />
                <span className="text-[10px] tracking-tight truncate max-w-[64px] font-extrabold">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
