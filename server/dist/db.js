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

    CREATE TABLE IF NOT EXISTS emergency_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      patient_name TEXT NOT NULL,
      health_id TEXT,
      facility_id INTEGER NOT NULL,
      facility_name TEXT NOT NULL,
      facility_type TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'CREATED',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      acknowledged_at TEXT,
      resolved_at TEXT,
      phc_notes TEXT,
      referral_id INTEGER,
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (facility_id) REFERENCES hospitals(id)
    );
    CREATE TABLE IF NOT EXISTS phc_medicines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hospital_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'AVAILABLE',
      stock_level TEXT DEFAULT 'Adequate',
      last_updated TEXT NOT NULL,
      FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
    );

    CREATE TABLE IF NOT EXISTS phc_staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hospital_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      role_title TEXT NOT NULL,
      specialty TEXT,
      is_on_duty INTEGER NOT NULL DEFAULT 1,
      phone TEXT,
      shift TEXT DEFAULT 'Morning',
      last_updated TEXT,
      FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
    );

    CREATE TABLE IF NOT EXISTS hospital_equipment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hospital_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'OPERATIONAL',
      last_inspected TEXT,
      notes TEXT,
      FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
    );

    CREATE TABLE IF NOT EXISTS medical_supplies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hospital_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 100,
      unit TEXT NOT NULL DEFAULT 'units',
      status TEXT NOT NULL DEFAULT 'AVAILABLE',
      stock_level TEXT DEFAULT 'Adequate',
      last_updated TEXT NOT NULL,
      FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
    );

    CREATE TABLE IF NOT EXISTS nurse_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hospital_id INTEGER NOT NULL,
      patient_id INTEGER,
      patient_name TEXT,
      bed_number TEXT,
      title TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'ROUTINE',
      status TEXT NOT NULL DEFAULT 'PENDING',
      assigned_nurse TEXT,
      shift TEXT DEFAULT 'Morning',
      due_time TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
    );
      CREATE TABLE IF NOT EXISTS diagnostic_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hospital_id INTEGER NOT NULL,
        patient_id INTEGER NOT NULL,
        patient_name TEXT NOT NULL,
        doctor_id INTEGER,
        doctor_name TEXT,
        test_id INTEGER,
        test_name TEXT NOT NULL,
        priority TEXT NOT NULL DEFAULT 'ROUTINE',
        status TEXT NOT NULL DEFAULT 'ORDERED',
        result_summary TEXT,
        report_url TEXT,
        created_at TEXT NOT NULL,
        completed_at TEXT,
        FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
        FOREIGN KEY (patient_id) REFERENCES patients(id)
      );

      CREATE TABLE IF NOT EXISTS bed_units (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hospital_id INTEGER NOT NULL,
        ward_name TEXT NOT NULL,
        bed_number TEXT NOT NULL,
        bed_type TEXT NOT NULL DEFAULT 'GENERAL',
        status TEXT NOT NULL DEFAULT 'AVAILABLE',
        patient_id INTEGER,
        patient_name TEXT,
        reserved_emergency_id INTEGER,
        last_updated TEXT NOT NULL,
        FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
      );

      CREATE TABLE IF NOT EXISTS patient_consent_grants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        health_id TEXT NOT NULL,
        doctor_id INTEGER,
        doctor_name TEXT NOT NULL,
        hospital_name TEXT NOT NULL,
        scopes_json TEXT NOT NULL,
        duration_minutes INTEGER NOT NULL DEFAULT 30,
        granted_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        FOREIGN KEY (patient_id) REFERENCES patients(id)
      );

      CREATE TABLE IF NOT EXISTS access_audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        health_id TEXT NOT NULL,
        accessor_name TEXT NOT NULL,
        accessor_role TEXT NOT NULL,
        facility_name TEXT NOT NULL,
        action TEXT NOT NULL,
        resource_accessed TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (patient_id) REFERENCES patients(id)
      );

      CREATE TABLE IF NOT EXISTS escalations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hospital_id INTEGER NOT NULL,
        patient_id INTEGER,
        patient_name TEXT NOT NULL,
        room_number TEXT NOT NULL,
        nurse_name TEXT NOT NULL,
        doctor_id INTEGER,
        doctor_name TEXT,
        priority TEXT NOT NULL DEFAULT 'CRITICAL',
        reason TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        created_at TEXT NOT NULL,
        resolved_at TEXT,
        FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
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
    safeAlter('hospital_resources', 'occupied_beds', 'INTEGER NOT NULL DEFAULT 0');
    safeAlter('hospital_resources', 'general_ward_beds', 'INTEGER NOT NULL DEFAULT 20');
    safeAlter('hospital_resources', 'nurses_on_duty', 'INTEGER NOT NULL DEFAULT 4');
    safeAlter('hospital_resources', 'icu_facility_status', 'TEXT NOT NULL DEFAULT "AVAILABLE"');
    safeAlter('hospital_resources', 'opd_queue_count', 'INTEGER NOT NULL DEFAULT 8');
    safeAlter('hospital_resources', 'opd_queue_status', 'TEXT NOT NULL DEFAULT "SHORT"');
    safeAlter('doctors', 'department', 'TEXT');
    safeAlter('doctors', 'is_active', 'INTEGER NOT NULL DEFAULT 1');
    safeAlter('emergency_requests', 'patient_age', 'INTEGER DEFAULT 28');
    safeAlter('emergency_requests', 'patient_blood_group', 'TEXT DEFAULT "O+"');
    safeAlter('emergency_requests', 'patient_phone', 'TEXT DEFAULT "+91-9876543210"');
    safeAlter('emergency_requests', 'distance_km', 'REAL DEFAULT 3.4');
    safeAlter('emergency_requests', 'priority', 'TEXT DEFAULT "CRITICAL"');
    safeAlter('emergency_requests', 'ambulance_status', 'TEXT DEFAULT "NOT_DISPATCHED"');
    safeAlter('emergency_requests', 'ambulance_code', 'TEXT DEFAULT "AMB-07"');
    safeAlter('emergency_requests', 'ambulance_lat', 'REAL DEFAULT 17.0198');
    safeAlter('emergency_requests', 'ambulance_lng', 'REAL DEFAULT 82.1292');
    safeAlter('emergency_requests', 'ambulance_speed_kmh', 'REAL DEFAULT 42.0');
    safeAlter('emergency_requests', 'ambulance_heading', 'INTEGER DEFAULT 78');
    safeAlter('emergency_requests', 'ambulance_accuracy_m', 'REAL DEFAULT 4.5');
    safeAlter('emergency_requests', 'ambulance_lifecycle_state', 'TEXT DEFAULT "AVAILABLE"');
    safeAlter('emergency_requests', 'patient_accuracy_m', 'REAL DEFAULT 6.0');
    safeAlter('emergency_requests', 'patient_last_updated', 'TEXT');
    safeAlter('emergency_requests', 'ambulance_last_updated', 'TEXT');
    safeAlter('emergency_requests', 'assigned_doctor', 'TEXT');
    safeAlter('emergency_requests', 'assigned_driver', 'TEXT');
    safeAlter('emergency_requests', 'eta_minutes', 'INTEGER');
    safeAlter('emergency_requests', 'resolution_notes', 'TEXT');
    safeAlter('audit_logs', 'previous_value', 'TEXT');
    safeAlter('audit_logs', 'new_value', 'TEXT');
}
