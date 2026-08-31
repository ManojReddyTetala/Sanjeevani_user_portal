// @ts-ignore
import { DatabaseSync } from 'node:sqlite';
import path from 'path';

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
  role: 'PHC_MASTER' | 'HOSPITAL_ADMIN' | 'DOCTOR' | 'PATIENT';
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
  created_at?: string;
}

export interface DiagnosticService {
  id: number;
  hospital_id: number;
  service_name: string;
  category: string;
  status: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE';
  wait_time_mins: number;
  last_updated: string;
}

export interface PrescriptionItem {
  medicine: string;
  dosage: string;
  duration: string;
}

export interface MedicalRecord {
  id: number;
  patient_id: number;
  doctor_id?: number;
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
}

export interface HealthTrack {
  id: number;
  patient_id: number;
  title: string;
  description?: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  progress_percent: number;
  completed_steps: number;
  total_steps: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  tasks?: HealthTrackTask[];
}

export interface HealthTrackTask {
  id: number;
  health_track_id: number;
  type: string;
  title: string;
  description?: string;
  status: 'COMPLETED' | 'ACTION_REQUIRED' | 'IN_PROGRESS' | 'UPCOMING' | 'BLOCKED' | 'FAILED';
  priority: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
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

export interface Referral {
  id: number;
  referral_code: string;
  patient_id: number;
  referring_doctor_id: number;
  receiving_doctor_id?: number;
  destination_hospital_id: number;
  required_specialty: string;
  required_facility: string;
  status: 'SENT' | 'RECEIVED' | 'ACCEPTED' | 'REJECTED' | 'PATIENT_ARRIVED' | 'TREATMENT_CONTINUED' | 'CANCELLED';
  clinical_notes: string;
  created_at: string;
  updated_at: string;
  status_history?: { status: string; updated_by: string; timestamp: string }[];
}

const sqliteFilePath = path.join(__dirname, '..', 'sih_healthcare.sqlite');
let dbInstance: any = null;

export function getDatabase(): any {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(sqliteFilePath);
    initTables(dbInstance);
  }
  return dbInstance;
}

function initTables(db: any) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      patient_id INTEGER,
      doctor_id INTEGER,
      hospital_id INTEGER,
      token TEXT,
      token_expires_at TEXT
    );

    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uid TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      gender TEXT NOT NULL,
      blood_group TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT,
      emergency_contact TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'en',
      qr_token TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS hospitals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      address TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      phone TEXT NOT NULL,
      emergency_number TEXT NOT NULL,
      facility_type TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS hospital_resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hospital_id INTEGER UNIQUE NOT NULL,
      icu_beds INTEGER NOT NULL,
      general_beds INTEGER NOT NULL,
      oxygen_cylinders INTEGER NOT NULL,
      ambulances INTEGER NOT NULL,
      doctors_on_duty INTEGER NOT NULL,
      status TEXT NOT NULL,
      last_updated TEXT NOT NULL,
      FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hospital_id INTEGER NOT NULL,
      user_id INTEGER,
      name TEXT NOT NULL,
      specialty TEXT NOT NULL,
      department TEXT,
      registration_no TEXT NOT NULL,
      phone TEXT NOT NULL,
      is_on_duty INTEGER NOT NULL DEFAULT 1,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT,
      FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
    );

    CREATE TABLE IF NOT EXISTS diagnostic_services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hospital_id INTEGER NOT NULL,
      service_name TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL,
      wait_time_mins INTEGER NOT NULL,
      last_updated TEXT NOT NULL,
      FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
    );

    CREATE TABLE IF NOT EXISTS medical_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      doctor_id INTEGER,
      hospital_id INTEGER,
      hospital_name TEXT NOT NULL,
      record_type TEXT NOT NULL,
      title TEXT NOT NULL,
      diagnosis TEXT,
      notes TEXT,
      prescription_json TEXT,
      created_at TEXT NOT NULL,
      created_by TEXT,
      version INTEGER DEFAULT 1,
      updated_at TEXT,
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    );

    CREATE TABLE IF NOT EXISTS referrals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      referral_code TEXT UNIQUE NOT NULL,
      patient_id INTEGER NOT NULL,
      referring_doctor_id INTEGER NOT NULL,
      receiving_doctor_id INTEGER,
      destination_hospital_id INTEGER NOT NULL,
      required_specialty TEXT NOT NULL,
      required_facility TEXT NOT NULL,
      status TEXT NOT NULL,
      clinical_notes TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      status_history_json TEXT,
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (destination_hospital_id) REFERENCES hospitals(id)
    );

    CREATE TABLE IF NOT EXISTS health_tracks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'IN_PROGRESS',
      progress_percent INTEGER NOT NULL DEFAULT 0,
      completed_steps INTEGER NOT NULL DEFAULT 0,
      total_steps INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      completed_at TEXT,
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    );

    CREATE TABLE IF NOT EXISTS health_track_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      health_track_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'UPCOMING',
      priority TEXT NOT NULL DEFAULT 'ROUTINE',
      required INTEGER NOT NULL DEFAULT 1,
      due_date TEXT,
      facility_id INTEGER,
      facility_name TEXT,
      doctor_id INTEGER,
      doctor_name TEXT,
      referral_id INTEGER,
      record_id INTEGER,
      dependencies_json TEXT,
      completed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      instructions TEXT,
      FOREIGN KEY (health_track_id) REFERENCES health_tracks(id)
    );

    CREATE TABLE IF NOT EXISTS task_dependencies (
      task_id INTEGER NOT NULL,
      depends_on_task_id INTEGER NOT NULL,
      PRIMARY KEY (task_id, depends_on_task_id)
    );

    CREATE TABLE IF NOT EXISTS health_track_audits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      track_id INTEGER NOT NULL,
      task_id INTEGER,
      user_name TEXT NOT NULL,
      role TEXT NOT NULL,
      action TEXT NOT NULL,
      old_value TEXT,
      new_value TEXT,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor_id INTEGER NOT NULL,
      actor_role TEXT NOT NULL,
      actor_name TEXT NOT NULL,
      action TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id TEXT NOT NULL,
      previous_value TEXT,
      new_value TEXT,
      result TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );
  `);

  // Safe migrations for pre-existing tables
  const safeAlter = (table: string, column: string, def: string) => {
    try {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${def}`);
    } catch (e) {}
  };

  safeAlter('users', 'phone', 'TEXT');
  safeAlter('users', 'address', 'TEXT');
  safeAlter('users', 'city', 'TEXT');
  safeAlter('users', 'state', 'TEXT');
  safeAlter('users', 'is_active', 'INTEGER NOT NULL DEFAULT 1');

  safeAlter('patients', 'address', 'TEXT');

  safeAlter('hospitals', 'is_active', 'INTEGER NOT NULL DEFAULT 1');

  safeAlter('doctors', 'department', 'TEXT');
  safeAlter('doctors', 'is_active', 'INTEGER NOT NULL DEFAULT 1');

  safeAlter('audit_logs', 'previous_value', 'TEXT');
  safeAlter('audit_logs', 'new_value', 'TEXT');
}
