export interface UserSession {
  id: number;
  email: string;
  name: string;
  role: 'patient' | 'doctor' | 'admin';
  token: string;
  patient_id?: number;
  doctor_id?: number;
  hospital_id?: number;
  expires_at?: string;
}

const AUTH_KEY = 'sih_user_session';

export const getStoredSession = (): UserSession | null => {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const session: UserSession = JSON.parse(raw);

    if (session.expires_at && new Date(session.expires_at).getTime() < Date.now()) {
      clearStoredSession();
      return null;
    }

    return session;
  } catch (e) {
    return null;
  }
};

export const setStoredSession = (session: UserSession) => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
};

export const clearStoredSession = () => {
  localStorage.removeItem(AUTH_KEY);
};
