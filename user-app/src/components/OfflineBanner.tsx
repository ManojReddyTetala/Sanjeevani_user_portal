import React from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

interface OfflineBannerProps {
  isOffline?: boolean;
  setIsOffline?: (val: boolean) => void;
  lastSyncedTime?: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOffline = false,
  setIsOffline = () => {},
  lastSyncedTime = 'LIVE'
}) => {
  return (
    <div className={`px-4 py-2 text-xs font-bold transition-all flex items-center justify-between shadow-inner ${
      isOffline ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
    }`}>
      <div className="flex items-center space-x-2">
        {isOffline ? <WifiOff className="w-4 h-4 text-slate-950 animate-pulse" /> : <Wifi className="w-4 h-4 text-emerald-400" />}
        <span>
          {isOffline
            ? 'OFFLINE MODE ACTIVE • Displaying cached health records & offline hospital availability.'
            : 'ONLINE SYSTEM MODE • Real-time bed availability & API discovery connected.'}
        </span>
      </div>

      <div className="flex items-center space-x-3">
        <span className="text-[11px] font-mono">Last Synced: {lastSyncedTime}</span>
        <button
          onClick={() => setIsOffline(!isOffline)}
          className="px-2 py-0.5 bg-slate-900 text-white rounded text-[11px] font-bold hover:bg-slate-800 flex items-center space-x-1"
        >
          <RefreshCw className="w-3 h-3 text-emerald-400" />
          <span>Toggle {isOffline ? 'Online' : 'Offline'}</span>
        </button>
      </div>
    </div>
  );
};
