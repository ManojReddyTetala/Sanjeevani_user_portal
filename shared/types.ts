export type RoleName = 'PHC_MASTER' | 'HOSPITAL_ADMIN' | 'DOCTOR' | 'PATIENT';
export type LanguageCode = 'en' | 'hi' | 'bn' | 'ta' | 'te' | 'mr' | 'gu' | 'kn';

export interface AuditLog {
  id: number;
  actor_id: number;
  actor_role: string;
  actor_name: string;
  action: string;
  resource_type: string;
  resource_id: string;
  previous_value?: string;
  new_value?: string;
  result: 'SUCCESS' | 'DENIED' | 'ERROR';
  ip_address: string;
  timestamp: string;
}

export interface User {
  id: number;
  email: string;
  password_hash: string;
  salt: string;
  role: RoleName;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  is_active?: number;
  patient_id?: number;
  doctor_id?: number;
  hospital_id?: number;
  token?: string;
  token_expires_at?: string;
}

export interface Patient {
  id: number;
  uid: string;
  name: string;
  age: number;
  gender: string;
  blood_group: string;
  phone: string;
  address?: string;
  emergency_contact: string;
  language: string;
  qr_token: string;
  created_at: string;
}

export interface Hospital {
  id: number;
  name: string;
  city: string;
  state: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  emergency_number: string;
  facility_type: string;
  is_active?: number;
  created_at?: string;
  icu_beds?: number;
  general_beds?: number;
  oxygen_cylinders?: number;
  ambulances?: number;
  doctors_on_duty?: number;
  status?: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE';
  distance_km?: number;
  freshness?: 'LIVE' | 'RECENT' | 'STALE';
}

export interface HospitalMember {
  id: number;
  hospital_id: number;
  user_id: number;
  role_in_hospital: 'ADMIN' | 'DOCTOR' | 'STAFF';
  created_at: string;
}

export interface HospitalResource {
  id: number;
  hospital_id: number;
  icu_beds: number;
  general_beds: number;
  oxygen_cylinders: number;
  ambulances: number;
  doctors_on_duty: number;
  status: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE';
  last_updated: string;
}

export interface Doctor {
  id: number;
  hospital_id: number;
  user_id?: number;
  name: string;
  specialty: string;
  department?: string;
  registration_no: string;
  phone: string;
  is_on_duty: number;
  is_active?: number;
  hospital_name?: string;
  hospital_city?: string;
  created_at?: string;
}

export interface DiagnosticService {
  id: number;
  hospital_id: number;
  service_name: string;
  category: string;
  status: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE';
  wait_time_mins: number;
  hospital_name?: string;
  last_updated: string;
}

export interface PrescriptionItem {
  medicine: string;
  dosage: string;
  duration: string;
}

export interface MedicalRecordRevision {
  revision_number: number;
  updated_by: string;
  updated_at: string;
  notes: string;
}

export interface MedicalRecord {
  id: number;
  patient_id: number;
  doctor_id?: number;
  doctor_name?: string;
  doctor_specialty?: string;
  hospital_id?: number;
  hospital_name: string;
  record_type: string;
  title: string;
  diagnosis?: string;
  notes?: string;
  prescription_data?: PrescriptionItem[];
  created_at: string;
  created_by?: string;
  version?: number;
  updated_at?: string;
  revision_history?: MedicalRecordRevision[];
}

export type ReferralStatus =
  | 'SENT'
  | 'RECEIVED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'PATIENT_ARRIVED'
  | 'TREATMENT_CONTINUED'
  | 'CANCELLED';

export interface Referral {
  id: number;
  referral_code: string;
  patient_id: number;
  referring_doctor_id: number;
  receiving_doctor_id?: number;
  destination_hospital_id: number;
  required_specialty: string;
  required_facility: string;
  status: ReferralStatus;
  clinical_notes: string;
  created_at: string;
  updated_at: string;
  status_history?: { status: string; updated_by: string; timestamp: string }[];
  patient_name?: string;
  patient_uid?: string;
  patient_age?: number;
  blood_group?: string;
  referring_doctor_name?: string;
  referring_doctor_specialty?: string;
  referring_hospital_name?: string;
  destination_hospital_name?: string;
}

export interface AIAction {
  type: 'navigate' | 'set_filter' | 'set_radius' | 'NAVIGATE';
  target?: string;
  view?: string;
  key?: string;
  value?: string | number;
}

export type HealthTrackStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
export type TaskStatus = 'COMPLETED' | 'ACTION_REQUIRED' | 'IN_PROGRESS' | 'UPCOMING' | 'BLOCKED' | 'FAILED';
export type TaskPriority = 'ROUTINE' | 'URGENT' | 'EMERGENCY';

export interface HealthTrackTask {
  id: number;
  health_track_id: number;
  type: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  required: number;
  due_date?: string;
  facility_id?: number;
  facility_name?: string;
  doctor_id?: number;
  doctor_name?: string;
  referral_id?: number;
  record_id?: number;
  dependencies?: string[];
  dependencies_json?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  instructions?: string;
}

export interface HealthTrack {
  id: number;
  patient_id: number;
  title: string;
  description?: string;
  status: HealthTrackStatus;
  progress_percent: number;
  completed_steps: number;
  total_steps: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  tasks?: HealthTrackTask[];
}
