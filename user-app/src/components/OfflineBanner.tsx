import React from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface OfflineBannerProps {
  isOffline?: boolean;
  setIsOffline?: (val: boolean) => void;
  lastSyncedTime?: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOffline = false,
  setIsOffline = () => {},
  lastSyncedTime
}) => {
  const { t } = useLanguage();

  return (
    <div className={`px-4 py-2.5 text-xs font-extrabold transition-all flex flex-wrap items-center justify-between gap-2 shadow-inner border-b ${
      isOffline ? 'bg-amber-400 text-slate-950 border-amber-500' : 'bg-slate-900 text-slate-200 border-slate-800'
    }`}>
      <div className="flex items-center space-x-2">
        {isOffline ? (
          <div className="flex items-center space-x-1.5 bg-amber-900 text-white px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider animate-pulse">
            <WifiOff className="w-3.5 h-3.5" />
            <span>{t('offline_mode_status')}</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('online_mode_status')}</span>
          </div>
        )}

        <span>
          {isOffline ? t('offline_active_banner') : t('realtime_sync_banner')}
        </span>
      </div>

      <div className="flex items-center space-x-3">
        <span className="text-[11px] font-mono opacity-80 hidden sm:inline">
          {t('last_synced')}: {lastSyncedTime || t('live')}
        </span>
        <button
          onClick={() => setIsOffline(!isOffline)}
          className={`px-3 py-1 rounded-xl text-[11px] font-black transition-all shadow-sm flex items-center space-x-1 ${
            isOffline
              ? 'bg-slate-900 text-white hover:bg-black'
              : 'bg-[#00695C] text-white hover:bg-[#004D40]'
          }`}
        >
          <RefreshCw className="w-3 h-3 text-emerald-400" />
          <span>{isOffline ? t('simulate_online') : t('simulate_offline')}</span>
        </button>
      </div>
    </div>
  );
};
