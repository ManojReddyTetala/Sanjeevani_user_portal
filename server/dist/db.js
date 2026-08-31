"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabase = getDatabase;
// @ts-ignore
const node_sqlite_1 = require("node:sqlite");
const path_1 = __importDefault(require("path"));
const sqliteFilePath = path_1.default.join(__dirname, '..', 'sih_healthcare.sqlite');
let dbInstance = null;
function getDatabase() {
    if (!dbInstance) {
        dbInstance = new node_sqlite_1.DatabaseSync(sqliteFilePath);
        initTables(dbInstance);
    }
    return dbInstance;
}
function initTables(db) {
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
    const safeAlter = (table, column, def) => {
        try {
            db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${def}`);
        }
        catch (e) { }
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
