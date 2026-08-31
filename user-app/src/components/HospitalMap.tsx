import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Hospital } from '../types';

interface HospitalMapProps {
  userLocation: { latitude: number; longitude: number; label: string };
  radiusKm: number;
  hospitals: Hospital[];
  onSelectHospital: (h: Hospital) => void;
}

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const orangeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export const HospitalMap: React.FC<HospitalMapProps> = ({
  userLocation,
  radiusKm,
  hospitals,
  onSelectHospital
}) => {
  return (
    <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
          GPS Radius Map Visualization ({radiusKm} km Scope)
        </span>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          {hospitals.length} Healthcare Facilities Matched
        </span>
      </div>

      <MapContainer
        center={[userLocation.latitude, userLocation.longitude]}
        zoom={10}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
          <Popup>
            <div className="text-xs font-bold font-sans">
              <span className="text-blue-700 block uppercase">User Center</span>
              <span>{userLocation.label}</span>
            </div>
          </Popup>
        </Marker>

        <Circle
          center={[userLocation.latitude, userLocation.longitude]}
          radius={radiusKm * 1000}
          pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.08, weight: 2 }}
        />

        {hospitals.map((h) => {
          const icon = h.status === 'AVAILABLE' ? greenIcon : h.status === 'LIMITED' ? orangeIcon : redIcon;
          return (
            <Marker
              key={h.id}
              position={[h.latitude, h.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectHospital(h)
              }}
            >
              <Popup>
                <div className="text-xs font-sans space-y-1">
                  <span className="font-extrabold text-slate-900 block">{h.name}</span>
                  <span className="text-slate-600 block">{h.city} • {h.distance_km} km</span>
                  <span className="font-bold text-emerald-700 block">
                    ICU Beds: {h.icu_beds} | Beds: {h.general_beds}
                  </span>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
