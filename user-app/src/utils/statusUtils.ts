import { Hospital } from '../types';

export interface DistanceBadge {
  color: 'green' | 'yellow' | 'blue' | 'red';
  label: string;
  badgeClass: string;
  icon: string;
}

export interface AvailabilityBadge {
  color: 'green' | 'yellow' | 'blue' | 'red' | 'grey';
  label: string;
  badgeClass: string;
  icon: string;
  detail?: string;
}

// --- 1. DISTANCE COLOUR INDICATION ---
export function getDistanceBadge(distKm?: number): DistanceBadge {
  const dist = distKm ?? 0;
  if (dist <= 5) {
    return {
      color: 'green',
      label: `🟢 ${dist.toFixed(1)} km away`,
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold',
      icon: '🟢'
    };
  } else if (dist <= 10) {
    return {
      color: 'yellow',
      label: `🟡 ${dist.toFixed(1)} km away`,
      badgeClass: 'bg-amber-50 text-amber-900 border-amber-300 font-extrabold',
      icon: '🟡'
    };
  } else if (dist <= 25) {
    return {
      color: 'blue',
      label: `🔵 ${dist.toFixed(1)} km away`,
      badgeClass: 'bg-blue-50 text-blue-900 border-blue-300 font-extrabold',
      icon: '🔵'
    };
  } else {
    return {
      color: 'red',
      label: `🔴 ${dist.toFixed(1)} km away`,
      badgeClass: 'bg-red-50 text-red-900 border-red-300 font-extrabold',
      icon: '🔴'
    };
  }
}

// --- 2. BED AVAILABILITY ---
export function getBedAvailabilityBadge(h: Hospital): AvailabilityBadge {
  const hasNumericalCapacity = h.icu_beds !== undefined && h.icu_beds !== null;

  if (!hasNumericalCapacity) {
    return {
      color: 'grey',
      label: '⚪ LIVE DATA UNAVAILABLE',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-300 font-extrabold',
      icon: '⚪',
      detail: 'Real-world source provides facility metadata; live capacity numbers unavailable.'
    };
  }

  const icu = h.icu_beds ?? 0;
  const gen = h.general_beds ?? 0;

  if (icu > 3 || gen >= 20) {
    return {
      color: 'green',
      label: '🟢 AVAILABLE',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold',
      icon: '🟢',
      detail: `ICU: ${icu} | General: ${gen}`
    };
  } else if (icu > 0 || gen > 0) {
    return {
      color: 'yellow',
      label: '🟡 LIMITED',
      badgeClass: 'bg-amber-50 text-amber-900 border-amber-300 font-extrabold',
      icon: '🟡',
      detail: `ICU: ${icu} | General: ${gen}`
    };
  } else {
    return {
      color: 'red',
      label: '🔴 UNAVAILABLE',
      badgeClass: 'bg-red-50 text-red-900 border-red-300 font-extrabold',
      icon: '🔴',
      detail: '0 Beds Available'
    };
  }
}

// --- 3. ICU AVAILABILITY BADGE ---
export function getIcuBadge(h: Hospital): AvailabilityBadge {
  if (h.icu_beds === undefined || h.icu_beds === null) {
    return {
      color: 'grey',
      label: '⚪ DATA UNAVAILABLE',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-300 font-bold',
      icon: '⚪'
    };
  }
  const icu = h.icu_beds;
  if (icu >= 5) {
    return {
      color: 'green',
      label: `🟢 ${icu} ICU BEDS AVAILABLE`,
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold',
      icon: '🟢'
    };
  } else if (icu > 0) {
    return {
      color: 'yellow',
      label: `🟡 ${icu} ICU BEDS (LIMITED)`,
      badgeClass: 'bg-amber-50 text-amber-900 border-amber-300 font-bold',
      icon: '🟡'
    };
  } else {
    return {
      color: 'red',
      label: '🔴 ICU FULL',
      badgeClass: 'bg-red-50 text-red-900 border-red-300 font-bold',
      icon: '🔴'
    };
  }
}

// --- 4. STAFF / DOCTORS ON DUTY BADGE ---
export function getStaffBadge(h: Hospital): AvailabilityBadge {
  if (h.doctors_on_duty === undefined || h.doctors_on_duty === null) {
    return {
      color: 'grey',
      label: '⚪ STAFF INFO UNAVAILABLE',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-300 font-bold',
      icon: '⚪'
    };
  }
  const docs = h.doctors_on_duty;
  if (docs >= 10) {
    return {
      color: 'green',
      label: `🟢 ${docs} DOCTORS ON DUTY`,
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold',
      icon: '🟢'
    };
  } else if (docs > 0) {
    return {
      color: 'yellow',
      label: `🟡 ${docs} DOCTORS (LIMITED)`,
      badgeClass: 'bg-amber-50 text-amber-900 border-amber-300 font-bold',
      icon: '🟡'
    };
  } else {
    return {
      color: 'red',
      label: '🔴 NO DOCTOR ON DUTY',
      badgeClass: 'bg-red-50 text-red-900 border-red-300 font-bold',
      icon: '🔴'
    };
  }
}

// --- 5. DIAGNOSTIC / SCANNING EQUIPMENT BADGE ---
export function getDiagnosticBadge(serviceName: string, h: Hospital): AvailabilityBadge {
  const isDiagnosticFacility =
    h.facility_type?.toLowerCase().includes('diagnostic') ||
    h.name?.toLowerCase().includes('aiims') ||
    h.name?.toLowerCase().includes('ggh') ||
    h.name?.toLowerCase().includes('apollo') ||
    h.name?.toLowerCase().includes('max');

  if (isDiagnosticFacility) {
    return {
      color: 'blue',
      label: `🔵 ${serviceName} AVAILABLE`,
      badgeClass: 'bg-blue-50 text-blue-900 border-blue-300 font-bold',
      icon: '🔵',
      detail: `${serviceName} operational at facility`
    };
  }
  return {
    color: 'grey',
    label: `⚪ ${serviceName} UNCONFIRMED`,
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300 font-bold',
    icon: '⚪',
    detail: 'Diagnostic availability unconfirmed'
  };
}

// --- 6. EMERGENCY SERVICE BADGE ---
export function getEmergencyBadge(h: Hospital): AvailabilityBadge {
  if (h.emergency_number || h.name?.toLowerCase().includes('hospital') || h.name?.toLowerCase().includes('aiims') || h.name?.toLowerCase().includes('ggh')) {
    return {
      color: 'green',
      label: '🟢 24/7 EMERGENCY AVAILABLE',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold',
      icon: '🟢'
    };
  }
  return {
    color: 'grey',
    label: '⚪ EMERGENCY UNCONFIRMED',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300 font-bold',
    icon: '⚪'
  };
}

// --- 7. OVERALL FACILITY STATUS ---
export function getOverallFacilityStatus(h: Hospital): AvailabilityBadge {
  const bedBadge = getBedAvailabilityBadge(h);
  if (bedBadge.color === 'green') {
    return {
      color: 'green',
      label: '🟢 OPERATIONAL',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold',
      icon: '🟢'
    };
  } else if (bedBadge.color === 'yellow') {
    return {
      color: 'yellow',
      label: '🟡 LIMITED CAPACITY',
      badgeClass: 'bg-amber-50 text-amber-900 border-amber-300 font-extrabold',
      icon: '🟡'
    };
  } else if (bedBadge.color === 'red') {
    return {
      color: 'red',
      label: '🔴 HIGH CAPACITY / FULL',
      badgeClass: 'bg-red-50 text-red-900 border-red-300 font-extrabold',
      icon: '🔴'
    };
  } else {
    return {
      color: 'blue',
      label: '🔵 FACILITY ACTIVE',
      badgeClass: 'bg-blue-50 text-blue-900 border-blue-300 font-extrabold',
      icon: '🔵'
    };
  }
}
