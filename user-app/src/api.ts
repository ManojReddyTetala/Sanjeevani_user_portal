import { Hospital, Patient, MedicalRecord, Referral, ReferralStatus } from './types';
import { getStoredSession } from './services/auth';
import { setOfflineCache, getOfflineCache, queueOfflineMutation } from './services/offlineCache';

const API_BASE = '/api';

const getAuthHeaders = (): Record<string, string> => {
  const session = getStoredSession();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (session?.token) {
    headers['Authorization'] = `Bearer ${session.token}`;
  }
  return headers;
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorData: any = {};
    try {
      errorData = await res.json();
    } catch (e) {}
    const msg = errorData.error?.message || errorData.error || `HTTP ${res.status}: ${res.statusText}`;
    throw new Error(msg);
  }
  return res.json();
}

export async function loginUser(credentials: any): Promise<any> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return handleResponse(res);
}

export async function registerUser(userData: any): Promise<any> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return handleResponse(res);
}

export async function fetchCurrentUserProfile(): Promise<any> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

export async function fetchSearchSuggestions(q: string, lat?: number, lng?: number): Promise<{ suggestions: any[] }> {
  if (!q.trim()) return { suggestions: [] };
  const query = new URLSearchParams({
    q,
    lat: (lat || 28.5672).toString(),
    lng: (lng || 77.2100).toString()
  });
  const res = await fetch(`${API_BASE}/search/suggestions?${query.toString()}`);
  return handleResponse(res);
}

export async function sendAiChatMessage(message: string, language: string = 'en', lat?: number, lng?: number): Promise<any> {
  const res = await fetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, language, lat: lat || 28.5672, lng: lng || 77.2100 })
  });
  return handleResponse(res);
}

export async function fetchNearbyHospitals(
  lat: number,
  lng: number,
  radiusKm: number = 50,
  statusFilter: string = '',
  searchFilter: string = '',
  sortBy: string = 'distance'
): Promise<{ count: number; hospitals: Hospital[]; is_cached?: boolean; is_stale?: boolean }> {
  const cacheKey = `hospitals_${lat}_${lng}_${radiusKm}_${statusFilter}_${searchFilter}_${sortBy}`;
  try {
    const query = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radiusKm.toString(),
      status: statusFilter,
      search: searchFilter,
      sort: sortBy
    });
    const res = await fetch(`${API_BASE}/hospitals/nearby?${query.toString()}`);
    const data = await handleResponse<{ count: number; hospitals: Hospital[] }>(res);

    setOfflineCache(cacheKey, data);
    return data;
  } catch (error) {
    console.warn('API error, falling back to local offline cache:', error);
    const cached = getOfflineCache<{ count: number; hospitals: Hospital[] }>(cacheKey);
    if (cached) {
      return { ...cached.data, is_cached: true, is_stale: cached.is_stale };
    }
    throw error;
  }
}

export async function fetchHospitalDetails(id: number): Promise<Hospital> {
  const cacheKey = `hospital_${id}`;
  try {
    const res = await fetch(`${API_BASE}/hospitals/${id}`);
    const data = await handleResponse<Hospital>(res);
    setOfflineCache(cacheKey, data);
    return data;
  } catch (e) {
    const cached = getOfflineCache<Hospital>(cacheKey);
    if (cached) return cached.data;
    throw e;
  }
}

export async function searchSpecialists(problem: string, lat: number, lng: number, radiusKm: number = 50): Promise<any> {
  const res = await fetch(`${API_BASE}/specialists/search?problem=${encodeURIComponent(problem)}&lat=${lat}&lng=${lng}&radius=${radiusKm}`);
  return handleResponse(res);
}

export async function searchDiagnostics(test: string, lat: number, lng: number, radiusKm: number = 50): Promise<any> {
  const res = await fetch(`${API_BASE}/diagnostics/search?test=${encodeURIComponent(test)}&lat=${lat}&lng=${lng}&radius=${radiusKm}`);
  return handleResponse(res);
}

export async function fetchPatientByUid(uid: string): Promise<Patient> {
  const cacheKey = `patient_${uid}`;
  try {
    const res = await fetch(`${API_BASE}/patients/${encodeURIComponent(uid)}`, {
      headers: getAuthHeaders()
    });
    const data = await handleResponse<Patient>(res);
    setOfflineCache(cacheKey, data);
    return data;
  } catch (e) {
    const cached = getOfflineCache<Patient>(cacheKey);
    if (cached) return cached.data;
    throw e;
  }
}

export async function registerPatient(patientData: Partial<Patient>): Promise<Patient> {
  const res = await fetch(`${API_BASE}/patients`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(patientData)
  });
  return handleResponse(res);
}

export async function fetchPatientRecords(uid: string): Promise<{ records: MedicalRecord[] }> {
  const cacheKey = `records_${uid}`;
  try {
    const res = await fetch(`${API_BASE}/patients/${encodeURIComponent(uid)}/records`, {
      headers: getAuthHeaders()
    });
    const data = await handleResponse<{ records: MedicalRecord[] }>(res);
    setOfflineCache(cacheKey, data);
    return data;
  } catch (e) {
    const cached = getOfflineCache<{ records: MedicalRecord[] }>(cacheKey);
    if (cached) return cached.data;
    throw e;
  }
}

export async function fetchPhcReferrals(): Promise<Referral[]> {
  const res = await fetch(`${API_BASE}/referrals`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

export async function translateReport(original_text: string, target_language: string): Promise<any> {
  const res = await fetch(`${API_BASE}/reports/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ original_text, target_language })
  });
  return handleResponse(res);
}

export async function generateHealthSummary(patient_id: number): Promise<any> {
  const res = await fetch(`${API_BASE}/summary/generate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ patient_id })
  });
  return handleResponse(res);
}
