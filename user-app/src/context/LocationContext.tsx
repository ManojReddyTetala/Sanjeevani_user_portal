import React, { createContext, useContext, useState } from 'react';

export interface LocationState {
  latitude: number;
  longitude: number;
  label: string;
  accuracy?: number;
  isGps: boolean;
  city?: string;
  state?: string;
}

export type PermissionStatus = 'prompt' | 'granted' | 'denied' | 'manual';

export const PRESET_LOCATIONS: LocationState[] = [
  { latitude: 28.5672, longitude: 77.2100, label: 'AIIMS Delhi / NCR Region', isGps: false },
  { latitude: 16.9891, longitude: 82.2475, label: 'Kakinada, Andhra Pradesh', isGps: false },
  { latitude: 17.4239, longitude: 78.4526, label: 'Hyderabad, Telangana', isGps: false },
  { latitude: 12.9634, longitude: 77.5758, label: 'Bengaluru, Karnataka', isGps: false },
  { latitude: 19.0024, longitude: 72.8423, label: 'Mumbai, Maharashtra', isGps: false }
];

interface LocationContextType {
  location: LocationState;
  setLocation: (loc: LocationState) => void;
  permissionStatus: PermissionStatus;
  isGpsActive: boolean;
  gpsStatusMessage: string;
  requestDeviceGps: () => void;
  setManualLocation: (loc: LocationState) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Dynamic location initialized without hardcoded default city
  const [location, setLocation] = useState<LocationState>({
    latitude: 16.9891,
    longitude: 82.2475,
    label: 'Location Pending Selection',
    isGps: false
  });
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('prompt');
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [gpsStatusMessage, setGpsStatusMessage] = useState('');

  const requestDeviceGps = () => {
    setGpsStatusMessage('Requesting actual GPS hardware location from device...');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = Math.round(pos.coords.latitude * 10000) / 10000;
          const lng = Math.round(pos.coords.longitude * 10000) / 10000;
          const accuracy = Math.round(pos.coords.accuracy);

          let locationLabel = `Live GPS (${lat}°, ${lng}°)`;

          // Reverse Geocode coordinates to obtain actual locality name
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
              headers: { 'User-Agent': 'SIH-Healthcare-App/1.0' }
            });
            const geo = await res.json();
            if (geo && geo.display_name) {
              const parts = geo.display_name.split(',');
              const mainLocality = parts.slice(0, 3).join(',').trim();
              locationLabel = `${mainLocality} (±${accuracy}m)`;
            }
          } catch (e) {
            console.warn('Reverse geocoding error:', e);
          }

          const newLoc: LocationState = {
            latitude: lat,
            longitude: lng,
            label: locationLabel,
            accuracy,
            isGps: true
          };

          setLocation(newLoc);
          setIsGpsActive(true);
          setPermissionStatus('granted');
          setGpsStatusMessage(`GPS Fix active (Accurate within ${accuracy}m).`);
        },
        (err) => {
          setIsGpsActive(false);
          setPermissionStatus('denied');
          setGpsStatusMessage(`Location permission was denied: ${err.message}.`);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setIsGpsActive(false);
      setPermissionStatus('denied');
      setGpsStatusMessage('Geolocation hardware unsupported on this browser.');
    }
  };

  const setManualLocation = (loc: LocationState) => {
    setLocation({ ...loc, isGps: false });
    setIsGpsActive(false);
    setPermissionStatus('manual');
    setGpsStatusMessage(`Manual location selected: ${loc.label}`);
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation,
        permissionStatus,
        isGpsActive,
        gpsStatusMessage,
        requestDeviceGps,
        setManualLocation
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationService = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationService must be used within a LocationProvider');
  }
  return context;
};
