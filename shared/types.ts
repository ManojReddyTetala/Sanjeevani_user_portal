export type RoleName = 'PHC_MASTER' | 'HOSPITAL_ADMIN' | 'DOCTOR' | 'PATIENT' | 'NURSE' | 'DIAGNOSTIC_STAFF' | 'SUPPLY_STAFF' | 'AMBULANCE_STAFF';
export type HospitalRole = 'ADMIN' | 'DOCTOR' | 'NURSE' | 'DIAGNOSTIC' | 'SUPPLY' | 'AMBULANCE' | 'REFERRAL' | 'EMERGENCY';
export type LanguageCode =
  | 'en' | 'hi' | 'bn' | 'ta' | 'te' | 'mr' | 'gu' | 'kn' | 'ml' | 'pa' | 'or' | 'as'
  | 'ur' | 'mai' | 'sat' | 'brx' | 'doi' | 'ks' | 'kok' | 'mni' | 'ne' | 'sa' | 'sd'
  | 'gon' | 'bhi' | 'grt' | 'kha' | 'lus' | 'hoc' | 'unr' | 'kru';

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
  occupied_beds?: number;
  general_ward_beds?: number;
  oxygen_cylinders: number;
  ambulances: number;
  doctors_on_duty: number;
  nurses_on_duty?: number;
  icu_facility_status?: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE';
  opd_queue_count?: number;
  opd_queue_status?: 'SHORT' | 'MODERATE' | 'LONG';
  status: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE';
  last_updated: string;
}

export interface PhcMedicine {
  id: number;
  hospital_id: number;
  name: string;
  category: string;
  status: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE';
  stock_level: string;
  last_updated: string;
}

export interface PhcStaffMember {
  id: number;
  hospital_id: number;
  name: string;
  role_title: string;
  specialty?: string;
  is_on_duty: number;
  phone?: string;
  shift?: string;
  last_updated?: string;
}

export interface PhcOverviewData {
  facility: Hospital;
  resources: HospitalResource;
  staff: PhcStaffMember[];
  doctors: Doctor[];
  medicines: PhcMedicine[];
  diagnostics: DiagnosticService[];
  recentReferrals: Referral[];
  timestamp?: string;
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

export interface EmergencyRequest {
  id: number;
  patient_id: number;
  patient_name: string;
  patient_age?: number;
  patient_blood_group?: string;
  patient_phone?: string;
  health_id?: string;
  facility_id: number;
  facility_name: string;
  facility_type: string;
  latitude: number;
  longitude: number;
  patient_accuracy_m?: number;
  patient_last_updated?: string;
  distance_km?: number;
  priority?: 'CRITICAL' | 'URGENT' | 'ROUTINE';
  description?: string;
  status: 'CREATED' | 'SENT' | 'RECEIVED' | 'ACKNOWLEDGED' | 'ACCEPTED' | 'AMBULANCE_DISPATCHED' | 'REFERRED' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';
  ambulance_status?: 'NOT_DISPATCHED' | 'DISPATCHED' | 'ARRIVED' | 'COMPLETED';
  ambulance_code?: string;
  ambulance_lat?: number;
  ambulance_lng?: number;
  ambulance_speed_kmh?: number;
  ambulance_heading?: number;
  ambulance_accuracy_m?: number;
  ambulance_lifecycle_state?: 'AVAILABLE' | 'ASSIGNED' | 'DISPATCHED' | 'EN_ROUTE_TO_PATIENT' | 'ARRIVED_AT_PATIENT' | 'PATIENT_PICKED_UP' | 'EN_ROUTE_TO_HOSPITAL' | 'ARRIVED' | 'RESOLVED';
  ambulance_last_updated?: string;
  assigned_doctor?: string;
  assigned_driver?: string;
  eta_minutes?: number;
  created_at: string;
  updated_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  phc_notes?: string;
  resolution_notes?: string;
  referral_id?: number;
}

export interface EquipmentItem {
  id: number;
  hospital_id: number;
  name: string;
  category: string;
  status: 'OPERATIONAL' | 'LIMITED' | 'DOWN';
  last_inspected?: string;
  notes?: string;
}

export interface MedicalSupply {
  id: number;
  hospital_id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  status: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE';
  stock_level: string;
  last_updated: string;
}

export interface NurseTask {
  id: number;
  hospital_id: number;
  patient_id?: number;
  patient_name?: string;
  bed_number?: string;
  title: string;
  priority: 'CRITICAL' | 'URGENT' | 'ROUTINE';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  assigned_nurse?: string;
  shift: string;
  due_time?: string;
}

export interface SpecialistAvailability {
  id: number;
  hospital_id: number;
  specialty: string;
  available_count: number;
  total_count: number;
  status: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE';
  on_call_doctor?: string;
}

export interface DiagnosticOrder {
  id: number;
  hospital_id: number;
  patient_id: number;
  patient_name: string;
  doctor_id?: number;
  doctor_name?: string;
  test_id?: number;
  test_name: string;
  priority: 'CRITICAL' | 'PRIORITY' | 'ROUTINE';
  status: 'ORDERED' | 'SAMPLE_COLLECTED' | 'PROCESSING' | 'COMPLETED';
  result_summary?: string;
  report_url?: string;
  created_at: string;
  completed_at?: string;
}

export interface BedUnit {
  id: number;
  hospital_id: number;
  ward_name: string;
  bed_number: string;
  bed_type: 'GENERAL' | 'ICU' | 'OXYGEN' | 'EMERGENCY';
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED_EMERGENCY' | 'MAINTENANCE';
  patient_id?: number;
  patient_name?: string;
  reserved_emergency_id?: number;
  last_updated: string;
}

export interface PatientConsentGrant {
  id: number;
  patient_id: number;
  health_id: string;
  doctor_id?: number;
  doctor_name: string;
  hospital_name: string;
  scopes_json: string;
  duration_minutes: number;
  granted_at: string;
  expires_at: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
}

export interface AccessAuditLog {
  id: number;
  patient_id: number;
  health_id: string;
  accessor_name: string;
  accessor_role: string;
  facility_name: string;
  action: string;
  resource_accessed: string;
  timestamp: string;
}

export interface Escalation {
  id: number;
  hospital_id: number;
  patient_id?: number;
  patient_name: string;
  room_number: string;
  nurse_name: string;
  doctor_id?: number;
  doctor_name?: string;
  priority: 'CRITICAL' | 'URGENT';
  reason: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  created_at: string;
  resolved_at?: string;
}

export interface HospitalCapabilityCheckResult {
  hospital_id: number;
  hospital_name: string;
  can_handle: boolean;
  score: number;
  breakdown: {
    specialist_available: boolean;
    icu_available: boolean;
    bed_available: boolean;
    equipment_available: boolean;
    ambulance_available: boolean;
    medicines_available: boolean;
  };
  recommendation: string;
  matching_hospitals?: Array<{
    id: number;
    name: string;
    distance_km: number;
    match_score: number;
    has_specialist: boolean;
    has_icu: boolean;
  }>;
}
