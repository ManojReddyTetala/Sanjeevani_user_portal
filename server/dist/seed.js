"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = seedDatabase;
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("./db");
function hashPassword(password, salt) {
    return crypto_1.default.scryptSync(password, salt, 64).toString('hex');
}
function seedDatabase() {
    const db = (0, db_1.getDatabase)();
    console.log('Seeding SQLite database sih_healthcare.sqlite with multi-region Indian healthcare facilities...');
    // 1. Seed 15 Multi-Region Healthcare Facilities (FAC-001 to FAC-015)
    const hospitals = [
        // Delhi NCR Region
        {
            id: 1,
            name: 'All India Institute of Medical Sciences (AIIMS Delhi) — DEMO',
            city: 'New Delhi',
            state: 'Delhi',
            address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi - 110029',
            latitude: 28.5672,
            longitude: 77.21,
            phone: '+91-11-26588500',
            emergency_number: '102 / 108',
            facility_type: 'Tertiary Care Super-Speciality Hospital',
            created_at: new Date().toISOString()
        },
        {
            id: 2,
            name: 'Safdarjung Hospital & Medical College — DEMO',
            city: 'New Delhi',
            state: 'Delhi',
            address: 'Ring Road, Opposite AIIMS, New Delhi - 110029',
            latitude: 28.5689,
            longitude: 77.2065,
            phone: '+91-11-26707444',
            emergency_number: '102 / 108',
            facility_type: 'Government Multi-Speciality Trauma Center',
            created_at: new Date().toISOString()
        },
        {
            id: 3,
            name: 'Max Super Speciality Hospital, Saket — DEMO',
            city: 'New Delhi',
            state: 'Delhi',
            address: '1, 2 Press Enclave Marg, Saket Institutional Area, New Delhi - 110017',
            latitude: 28.5284,
            longitude: 77.2118,
            phone: '+91-11-26515050',
            emergency_number: '+91-11-40554055',
            facility_type: 'Private Super-Speciality Medical Hub',
            created_at: new Date().toISOString()
        },
        {
            id: 4,
            name: 'Community Health Centre (CHC) Ballabhgarh — DEMO',
            city: 'Faridabad',
            state: 'Haryana',
            address: 'Main Highway Road, Ballabhgarh, Faridabad - 121004',
            latitude: 28.3412,
            longitude: 77.3245,
            phone: '+91-129-2241002',
            emergency_number: '102 / 108',
            facility_type: 'Primary Health Centre (PHC / CHC)',
            created_at: new Date().toISOString()
        },
        // Andhra Pradesh - Kakinada Region
        {
            id: 5,
            name: 'Government General Hospital (GGH Kakinada) — DEMO',
            city: 'Kakinada',
            state: 'Andhra Pradesh',
            address: 'Nagamallithota Junction, Kakinada - 533001',
            latitude: 16.9891,
            longitude: 82.2475,
            phone: '+91-884-2361284',
            emergency_number: '108',
            facility_type: 'Government Teaching Super-Speciality Hospital',
            created_at: new Date().toISOString()
        },
        {
            id: 6,
            name: 'Apollo Speciality Hospitals, Kakinada — DEMO',
            city: 'Kakinada',
            state: 'Andhra Pradesh',
            address: '13-1-3, Main Road, Kakinada - 533001',
            latitude: 16.9582,
            longitude: 82.2384,
            phone: '+91-884-2300000',
            emergency_number: '1066 / 108',
            facility_type: 'Private Super-Speciality Hospital',
            created_at: new Date().toISOString()
        },
        {
            id: 7,
            name: 'Primary Health Centre (PHC) Peddapuram — DEMO',
            city: 'Peddapuram',
            state: 'Andhra Pradesh',
            address: 'Main Road, Peddapuram, Kakinada District - 533437',
            latitude: 17.0789,
            longitude: 82.1384,
            phone: '+91-884-2370102',
            emergency_number: '108',
            facility_type: 'Primary Health Centre (PHC)',
            created_at: new Date().toISOString()
        },
        // Telangana - Hyderabad Region
        {
            id: 8,
            name: 'Nizam’s Institute of Medical Sciences (NIMS Hyderabad) — DEMO',
            city: 'Hyderabad',
            state: 'Telangana',
            address: 'Punjagutta, Hyderabad - 500082',
            latitude: 17.4239,
            longitude: 78.4526,
            phone: '+91-40-23489000',
            emergency_number: '108',
            facility_type: 'Autonomous Super-Speciality Medical Institute',
            created_at: new Date().toISOString()
        },
        {
            id: 9,
            name: 'Yashoda Hospitals, Secunderabad — DEMO',
            city: 'Hyderabad',
            state: 'Telangana',
            address: 'Alexander Road, Secunderabad - 500003',
            latitude: 17.4399,
            longitude: 78.4983,
            phone: '+91-40-45674567',
            emergency_number: '+91-40-105710',
            facility_type: 'Private Tertiary Multi-Speciality Hospital',
            created_at: new Date().toISOString()
        },
        {
            id: 10,
            name: 'Reddy Diagnostic & Imaging Centre — DEMO',
            city: 'New Delhi',
            state: 'Delhi',
            address: 'Plot 14, Hauz Khas Enclave, New Delhi - 110016',
            latitude: 28.5492,
            longitude: 77.2021,
            phone: '+91-11-26860000',
            emergency_number: '102 / 108',
            facility_type: 'Diagnostic & Imaging Centre',
            created_at: new Date().toISOString()
        }
    ];
    const insertHosp = db.prepare(`
    INSERT OR REPLACE INTO hospitals (id, name, city, state, address, latitude, longitude, phone, emergency_number, facility_type, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
    hospitals.forEach((h) => insertHosp.run(h.id, h.name, h.city, h.state, h.address, h.latitude, h.longitude, h.phone, h.emergency_number, h.facility_type, h.created_at));
    // 2. Seed Facility Resources & Capacity Statuses (Extended for PHC Operations)
    const resources = [
        { hospital_id: 1, icu_beds: 12, general_beds: 45, occupied_beds: 35, general_ward_beds: 45, oxygen_cylinders: 60, ambulances: 5, doctors_on_duty: 8, nurses_on_duty: 16, icu_facility_status: 'AVAILABLE', opd_queue_count: 24, opd_queue_status: 'MODERATE', status: 'AVAILABLE' },
        { hospital_id: 2, icu_beds: 8, general_beds: 30, occupied_beds: 22, general_ward_beds: 30, oxygen_cylinders: 40, ambulances: 4, doctors_on_duty: 6, nurses_on_duty: 12, icu_facility_status: 'AVAILABLE', opd_queue_count: 18, opd_queue_status: 'MODERATE', status: 'AVAILABLE' },
        { hospital_id: 3, icu_beds: 2, general_beds: 10, occupied_beds: 8, general_ward_beds: 10, oxygen_cylinders: 25, ambulances: 2, doctors_on_duty: 4, nurses_on_duty: 8, icu_facility_status: 'LIMITED', opd_queue_count: 12, opd_queue_status: 'SHORT', status: 'LIMITED' },
        { hospital_id: 4, icu_beds: 0, general_beds: 5, occupied_beds: 4, general_ward_beds: 5, oxygen_cylinders: 10, ambulances: 1, doctors_on_duty: 2, nurses_on_duty: 4, icu_facility_status: 'UNAVAILABLE', opd_queue_count: 35, opd_queue_status: 'LONG', status: 'UNAVAILABLE' },
        { hospital_id: 5, icu_beds: 15, general_beds: 50, occupied_beds: 38, general_ward_beds: 50, oxygen_cylinders: 50, ambulances: 4, doctors_on_duty: 7, nurses_on_duty: 14, icu_facility_status: 'AVAILABLE', opd_queue_count: 28, opd_queue_status: 'MODERATE', status: 'AVAILABLE' },
        { hospital_id: 6, icu_beds: 4, general_beds: 15, occupied_beds: 11, general_ward_beds: 15, oxygen_cylinders: 30, ambulances: 2, doctors_on_duty: 5, nurses_on_duty: 10, icu_facility_status: 'LIMITED', opd_queue_count: 15, opd_queue_status: 'SHORT', status: 'LIMITED' },
        { hospital_id: 7, icu_beds: 0, general_beds: 12, occupied_beds: 4, general_ward_beds: 12, oxygen_cylinders: 5, ambulances: 1, doctors_on_duty: 3, nurses_on_duty: 5, icu_facility_status: 'LIMITED', opd_queue_count: 8, opd_queue_status: 'SHORT', status: 'AVAILABLE' },
        { hospital_id: 8, icu_beds: 18, general_beds: 60, occupied_beds: 46, general_ward_beds: 60, oxygen_cylinders: 75, ambulances: 6, doctors_on_duty: 10, nurses_on_duty: 20, icu_facility_status: 'AVAILABLE', opd_queue_count: 42, opd_queue_status: 'LONG', status: 'AVAILABLE' },
        { hospital_id: 9, icu_beds: 3, general_beds: 20, occupied_beds: 16, general_ward_beds: 20, oxygen_cylinders: 35, ambulances: 3, doctors_on_duty: 5, nurses_on_duty: 8, icu_facility_status: 'LIMITED', opd_queue_count: 14, opd_queue_status: 'SHORT', status: 'LIMITED' },
        { hospital_id: 10, icu_beds: 0, general_beds: 0, occupied_beds: 0, general_ward_beds: 0, oxygen_cylinders: 0, ambulances: 1, doctors_on_duty: 3, nurses_on_duty: 2, icu_facility_status: 'UNAVAILABLE', opd_queue_count: 6, opd_queue_status: 'SHORT', status: 'AVAILABLE' }
    ];
    const insertRes = db.prepare(`
    INSERT OR REPLACE INTO hospital_resources (hospital_id, icu_beds, general_beds, occupied_beds, general_ward_beds, oxygen_cylinders, ambulances, doctors_on_duty, nurses_on_duty, icu_facility_status, opd_queue_count, opd_queue_status, status, last_updated)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
    resources.forEach((r) => insertRes.run(r.hospital_id, r.icu_beds, r.general_beds, r.occupied_beds, r.general_ward_beds, r.oxygen_cylinders, r.ambulances, r.doctors_on_duty, r.nurses_on_duty, r.icu_facility_status, r.opd_queue_count, r.opd_queue_status, r.status, new Date().toISOString()));
    // 3. Seed 8 Doctors (DOC-001 to DOC-008)
    const doctors = [
        { id: 10, hospital_id: 1, name: 'Dr. Manoj Reddy', specialty: 'Cardiology', department: 'Cardiology & Intensive Care', registration_no: 'MCI-DEL-2012-4421', phone: '+91-9871100221', is_on_duty: 1 },
        { id: 11, hospital_id: 2, name: 'Dr. Surya', specialty: 'General Medicine', department: 'Internal Medicine', registration_no: 'MCI-DEL-2015-8890', phone: '+91-9871100222', is_on_duty: 1 },
        { id: 12, hospital_id: 3, name: 'Dr. Sameeruddin', specialty: 'Orthopedics', department: 'Orthopedics & Joint Surgery', registration_no: 'MCI-DEL-2010-1123', phone: '+91-9871100223', is_on_duty: 1 },
        { id: 13, hospital_id: 4, name: 'Dr. Sunita Rani', specialty: 'Pediatrics', department: 'Maternal & Child Care', registration_no: 'MCI-HR-2018-9901', phone: '+91-9871100224', is_on_duty: 1 },
        { id: 14, hospital_id: 5, name: 'Dr. Ramesh Verma', specialty: 'Neurology', department: 'Neurology & Stroke Unit', registration_no: 'APMC-2009-3344', phone: '+91-9848011223', is_on_duty: 1 },
        { id: 15, hospital_id: 6, name: 'Dr. Ananya Rao', specialty: 'Gynecology', department: 'Obstetrics & Gynecology', registration_no: 'APMC-2014-7711', phone: '+91-9848011224', is_on_duty: 1 },
        { id: 16, hospital_id: 8, name: 'Dr. Vikram Malhotra', specialty: 'General Surgery', department: 'Surgical Gastroenterology', registration_no: 'TSMC-2011-5544', phone: '+91-9849011225', is_on_duty: 1 },
        { id: 17, hospital_id: 9, name: 'Dr. Priya Sharma', specialty: 'ENT', department: 'Otorhinolaryngology', registration_no: 'TSMC-2016-2211', phone: '+91-9849011226', is_on_duty: 1 }
    ];
    const insertDoc = db.prepare(`
    INSERT OR REPLACE INTO doctors (id, hospital_id, name, specialty, department, registration_no, phone, is_on_duty, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `);
    doctors.forEach((d) => insertDoc.run(d.id, d.hospital_id, d.name, d.specialty, d.department, d.registration_no, d.phone, d.is_on_duty, new Date().toISOString()));
    // 4. Seed Patients (PAT-001 to PAT-003)
    const patients = [
        {
            id: 1,
            uid: 'UID-IND-9842-7104',
            name: 'Manoj',
            age: 28,
            gender: 'Male',
            blood_group: 'O+',
            phone: '+91-9876543210',
            emergency_contact: 'Suresh Kumar (+91-9876500000)',
            language: 'en',
            qr_token: 'QR-PAT-9842-7104-PERMANENT',
            created_at: new Date().toISOString()
        },
        {
            id: 2,
            uid: 'UID-IND-1102-4458',
            name: 'Rajesh Kumar',
            age: 45,
            gender: 'Male',
            blood_group: 'O+',
            phone: '+91-9811223344',
            emergency_contact: 'Sunita Devi (+91-9811223355)',
            language: 'hi',
            qr_token: 'QR-PAT-1102-4458-PERMANENT',
            created_at: new Date().toISOString()
        },
        {
            id: 3,
            uid: 'UID-IND-1002-3401',
            name: 'Ananya',
            age: 26,
            gender: 'Female',
            blood_group: 'B+',
            phone: '+91-9844332211',
            emergency_contact: 'Ramesh Verma (+91-9844332200)',
            language: 'en',
            qr_token: 'QR-PAT-1002-3401-PERMANENT',
            created_at: new Date().toISOString()
        }
    ];
    const insertPat = db.prepare(`
    INSERT OR REPLACE INTO patients (id, uid, name, age, gender, blood_group, phone, emergency_contact, language, qr_token, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
    patients.forEach((p) => insertPat.run(p.id, p.uid, p.name, p.age, p.gender, p.blood_group, p.phone, p.emergency_contact, p.language, p.qr_token, p.created_at));
    // 5. Seed Users
    const defaultSalt = crypto_1.default.randomBytes(16).toString('hex');
    const hashedPass = hashPassword('password123', defaultSalt);
    const users = [
        { id: 1, email: 'manoj@patient.org', role: 'PATIENT', name: 'Manoj', patient_id: 1 },
        { id: 2, email: 'phc@admin.gov.in', role: 'PHC_MASTER', name: 'PHC Master Administrator' },
        { id: 3, email: 'admin@aiims.edu', role: 'HOSPITAL_ADMIN', name: 'AIIMS Facility Admin', hospital_id: 1 },
        { id: 4, email: 'manoj@aiims.edu', role: 'DOCTOR', name: 'Dr. Manoj Reddy', doctor_id: 10, hospital_id: 1 },
        { id: 5, email: 'surya@hospital.org', role: 'DOCTOR', name: 'Dr. Surya', doctor_id: 11, hospital_id: 2 },
        { id: 6, email: 'sameer@maxhealth.in', role: 'DOCTOR', name: 'Dr. Sameeruddin', doctor_id: 12, hospital_id: 3 },
        { id: 7, email: 'sunita@chcballabhgarh.in', role: 'DOCTOR', name: 'Dr. Sunita Rani', doctor_id: 13, hospital_id: 4 }
    ];
    const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (id, email, password_hash, salt, role, name, patient_id, doctor_id, hospital_id, token, token_expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
    users.forEach((u) => insertUser.run(u.id, u.email, hashedPass, defaultSalt, u.role, u.name, u.patient_id || null, u.doctor_id || null, u.hospital_id || null, null, null));
    // 6. Seed Diagnostic Services
    const diagnostics = [
        { hospital_id: 1, service_name: 'MRI Scan 3T', category: 'Radiology', status: 'AVAILABLE', wait_time_mins: 15 },
        { hospital_id: 1, service_name: 'CT Scan 128 Slice', category: 'Radiology', status: 'AVAILABLE', wait_time_mins: 10 },
        { hospital_id: 2, service_name: 'Digital X-Ray & Ultrasound', category: 'Radiology', status: 'AVAILABLE', wait_time_mins: 20 },
        { hospital_id: 3, service_name: 'Pathology & Cardiac Biomarkers', category: 'Pathology', status: 'AVAILABLE', wait_time_mins: 5 },
        { hospital_id: 5, service_name: 'MRI 1.5T & CT Diagnostics', category: 'Radiology', status: 'AVAILABLE', wait_time_mins: 12 },
        { hospital_id: 4, service_name: '🩸 Routine Blood Test (CBC & ESR)', category: 'Pathology', status: 'AVAILABLE', wait_time_mins: 10 },
        { hospital_id: 4, service_name: '🩻 Digital X-Ray Chest', category: 'Radiology', status: 'LIMITED', wait_time_mins: 25 },
        { hospital_id: 4, service_name: '🫀 12-Lead ECG Screening', category: 'Cardiology', status: 'AVAILABLE', wait_time_mins: 5 },
        { hospital_id: 4, service_name: '🧪 Sputum & AFB Smear Test', category: 'Microbiology', status: 'AVAILABLE', wait_time_mins: 30 },
        { hospital_id: 7, service_name: '🩸 Complete Blood Count (CBC)', category: 'Pathology', status: 'AVAILABLE', wait_time_mins: 10 },
        { hospital_id: 7, service_name: '🩻 Diagnostic X-Ray', category: 'Radiology', status: 'AVAILABLE', wait_time_mins: 15 },
        { hospital_id: 7, service_name: '🫀 12-Lead ECG Test', category: 'Cardiology', status: 'AVAILABLE', wait_time_mins: 5 },
        { hospital_id: 7, service_name: '🧪 Urine Routine & Microscopy', category: 'Pathology', status: 'AVAILABLE', wait_time_mins: 10 },
        { hospital_id: 7, service_name: '🩸 Blood Glucose (RBS / FBS)', category: 'Biochemistry', status: 'AVAILABLE', wait_time_mins: 5 }
    ];
    const insertDiag = db.prepare(`
    INSERT OR REPLACE INTO diagnostic_services (hospital_id, service_name, category, status, wait_time_mins, last_updated)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
    diagnostics.forEach((d) => insertDiag.run(d.hospital_id, d.service_name, d.category, d.status, d.wait_time_mins, new Date().toISOString()));
    // 6b. Seed Essential PHC Medicines & Supplies
    const medicines = [
        { hospital_id: 7, name: 'Paracetamol 500mg Tablets', category: 'Analgesics / Antipyretic', status: 'AVAILABLE', stock_level: 'Adequate' },
        { hospital_id: 7, name: 'Amoxicillin 500mg Capsules', category: 'Antibiotics', status: 'AVAILABLE', stock_level: 'Adequate' },
        { hospital_id: 7, name: 'ORS (Oral Rehydration Salts)', category: 'Electrolytes / Dehydration', status: 'AVAILABLE', stock_level: 'Adequate' },
        { hospital_id: 7, name: 'Human Insulin Regular 40 IU/ml', category: 'Diabetes / Endocrine', status: 'LIMITED', stock_level: 'Low Stock' },
        { hospital_id: 7, name: 'Cetirizine 10mg Tablets', category: 'Antihistamines', status: 'AVAILABLE', stock_level: 'Adequate' },
        { hospital_id: 7, name: 'Metformin 500mg Tablets', category: 'Oral Hypoglycemic', status: 'AVAILABLE', stock_level: 'Adequate' },
        { hospital_id: 7, name: 'Iron & Folic Acid (IFA) Tablets', category: 'Maternal Health', status: 'AVAILABLE', stock_level: 'Adequate' },
        { hospital_id: 7, name: 'Azithromycin 500mg Tablets', category: 'Antibiotics', status: 'UNAVAILABLE', stock_level: 'Out of Stock' },
        { hospital_id: 7, name: 'Amlodipine 5mg Tablets', category: 'Hypertension / Cardiac', status: 'AVAILABLE', stock_level: 'Adequate' },
        { hospital_id: 7, name: 'Salbutamol Nebulizer Solution', category: 'Respiratory / Asthma', status: 'LIMITED', stock_level: 'Low Stock' },
        { hospital_id: 4, name: 'Paracetamol 500mg Tablets', category: 'Analgesics / Antipyretic', status: 'AVAILABLE', stock_level: 'Adequate' },
        { hospital_id: 4, name: 'Amoxicillin 500mg Capsules', category: 'Antibiotics', status: 'LIMITED', stock_level: 'Low Stock' },
        { hospital_id: 4, name: 'ORS (Oral Rehydration Salts)', category: 'Electrolytes / Dehydration', status: 'AVAILABLE', stock_level: 'Adequate' },
        { hospital_id: 4, name: 'Human Insulin Regular 40 IU/ml', category: 'Diabetes / Endocrine', status: 'UNAVAILABLE', stock_level: 'Out of Stock' }
    ];
    const insertMed = db.prepare(`
    INSERT OR REPLACE INTO phc_medicines (hospital_id, name, category, status, stock_level, last_updated)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
    medicines.forEach((m) => insertMed.run(m.hospital_id, m.name, m.category, m.status, m.stock_level, new Date().toISOString()));
    // 6c. Seed PHC Staff & Nurses on Duty
    const staff = [
        { hospital_id: 7, name: 'Dr. Sunita Rani', role_title: 'General Physician', specialty: 'General Medicine', is_on_duty: 1, phone: '+91-9871100224', shift: 'Morning' },
        { hospital_id: 7, name: 'Dr. K. Venkatesh', role_title: 'Specialist Doctor', specialty: 'Pediatrics', is_on_duty: 0, phone: '+91-9848011230', shift: 'Evening' },
        { hospital_id: 7, name: 'Sister Lakshmi Devi', role_title: 'Staff Nurse', specialty: 'Maternal & Child Care', is_on_duty: 1, phone: '+91-9848011231', shift: 'Morning' },
        { hospital_id: 7, name: 'Sister Anita Roy', role_title: 'Staff Nurse', specialty: 'Emergency & Triage', is_on_duty: 1, phone: '+91-9848011232', shift: 'Morning' },
        { hospital_id: 7, name: 'P. Raju', role_title: 'Lab Technician', specialty: 'Pathology & Diagnostics', is_on_duty: 1, phone: '+91-9848011233', shift: 'Morning' },
        { hospital_id: 7, name: 'M. Sridhar', role_title: 'Pharmacist', specialty: 'Medicine Dispensary', is_on_duty: 1, phone: '+91-9848011234', shift: 'Morning' },
        { hospital_id: 4, name: 'Dr. Sunita Rani', role_title: 'General Physician', specialty: 'General Medicine', is_on_duty: 1, phone: '+91-9871100224', shift: 'Morning' },
        { hospital_id: 4, name: 'Sister Geeta Sharma', role_title: 'Staff Nurse', specialty: 'General Ward', is_on_duty: 1, phone: '+91-9871100235', shift: 'Morning' }
    ];
    const insertStaff = db.prepare(`
    INSERT OR REPLACE INTO phc_staff (hospital_id, name, role_title, specialty, is_on_duty, phone, shift, last_updated)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
    staff.forEach((s) => insertStaff.run(s.hospital_id, s.name, s.role_title, s.specialty, s.is_on_duty, s.phone, s.shift, new Date().toISOString()));
    // 7. Seed Medical Records (Complete Sample Medical History for Manoj - DEMO)
    const initialRecords = [
        {
            patient_id: 1,
            doctor_id: 10,
            hospital_id: 1,
            hospital_name: 'AIIMS Delhi — DEMO',
            record_type: 'Consultation',
            title: '🩺 Cardiology Consultation Report — DEMO',
            diagnosis: 'Acute Allergic Rhinitis & Mild Sinusitis',
            notes: '[DEMO / SAMPLE RECORD — NOT A REAL MEDICAL RECORD] Patient presented with mild exertional discomfort and sinus headache. Recorded Vitals: BP 120/80 mmHg, HR 72 bpm, Temp 98.6°F, SpO2 98%, Weight 68kg, BMI 22.4.',
            prescription_json: JSON.stringify([
                { medicine: 'Aspirin 75mg', dosage: '1 tablet daily', duration: '30 days' },
                { medicine: 'Cetirizine 10mg', dosage: '1 tablet PRN', duration: '14 days' }
            ]),
            created_at: '2026-08-28T10:30:00.000Z',
            created_by: 'Dr. Manoj Reddy',
            version: 1
        },
        {
            patient_id: 1,
            doctor_id: 12,
            hospital_id: 3,
            hospital_name: 'Max Super Specialty Hospital — DEMO',
            record_type: 'Radiology Report',
            title: '🧠 MRI Brain 3T Radiology Report — DEMO',
            diagnosis: 'Unremarkable Brain Parenchyma',
            notes: '[DEMO / SAMPLE RECORD — NOT A REAL MEDICAL RECORD] 3T MRI Brain scan without contrast. Findings: Normal ventricles and cerebral sulci. No acute ischemic stroke or mass effect.',
            prescription_json: JSON.stringify([]),
            created_at: '2026-08-25T14:15:00.000Z',
            created_by: 'Dr. Sameeruddin',
            version: 1
        },
        {
            patient_id: 1,
            doctor_id: 13,
            hospital_id: 4,
            hospital_name: 'District General Hospital — DEMO',
            record_type: 'Radiology Report',
            title: '🩻 CT Head Radiology Report — DEMO',
            diagnosis: 'Mild Maxillary Sinus Mucosal Thickening',
            notes: '[DEMO / SAMPLE RECORD — NOT A REAL MEDICAL RECORD] Non-contrast CT Head scan. Findings: Bilateral maxillary sinuses show minimal mucosal thickening. Intracranial structures within normal limits.',
            prescription_json: JSON.stringify([]),
            created_at: '2026-08-23T11:00:00.000Z',
            created_by: 'Dr. Sunita Rani',
            version: 1
        },
        {
            patient_id: 1,
            doctor_id: 10,
            hospital_id: 10,
            hospital_name: 'Reddy Diagnostic & Imaging Centre — DEMO',
            record_type: 'Laboratory Report',
            title: '🧪 Comprehensive Pathology Panel — DEMO',
            diagnosis: 'Normal Hematology & Metabolic Panel',
            notes: '[DEMO / SAMPLE RECORD — NOT A REAL MEDICAL RECORD] Hemoglobin: 14.2 g/dL (Ref: 13.0-17.0), Fasting Glucose: 92 mg/dL (Ref: 70-100), Serum Creatinine: 0.9 mg/dL (Ref: 0.7-1.3), Total Cholesterol: 175 mg/dL (Ref: <200).',
            prescription_json: JSON.stringify([]),
            created_at: '2026-08-22T09:00:00.000Z',
            created_by: 'Dr. Manoj Reddy',
            version: 1
        },
        {
            patient_id: 1,
            doctor_id: 10,
            hospital_id: 1,
            hospital_name: 'AIIMS Delhi — DEMO',
            record_type: 'Prescription',
            title: '💊 Outpatient Clinical Prescription — DEMO',
            diagnosis: 'Allergic Airway Hyper-responsiveness',
            notes: '[DEMO / SAMPLE RECORD — NOT A REAL MEDICAL RECORD] Prescribed oral antihistamines and nasal spray.',
            prescription_json: JSON.stringify([
                { medicine: 'Tab Cetirizine 10mg', dosage: '1-0-1', duration: '5 days' },
                { medicine: 'Fluticasone Nasal Spray', dosage: '2 puffs/day', duration: '14 days' },
                { medicine: 'Tab Paracetamol 500mg', dosage: 'SOS for fever/pain', duration: '3 days' }
            ]),
            created_at: '2026-08-20T16:20:00.000Z',
            created_by: 'Dr. Manoj Reddy',
            version: 1
        },
        {
            patient_id: 1,
            doctor_id: 11,
            hospital_id: 7,
            hospital_name: 'Primary Health Centre (PHC) — DEMO',
            record_type: 'Follow-up',
            title: '🩺 Primary Health Care Follow-up — DEMO',
            diagnosis: 'Routine Clinical Follow-up',
            notes: '[DEMO / SAMPLE RECORD — NOT A REAL MEDICAL RECORD] Routine follow-up at local PHC. Inter-facility referral REF-2026-9842 initiated for super-specialty cardiac evaluation.',
            prescription_json: JSON.stringify([]),
            created_at: '2026-08-18T10:00:00.000Z',
            created_by: 'Dr. Surya',
            version: 1
        },
        {
            patient_id: 3,
            doctor_id: 11,
            hospital_id: 2,
            hospital_name: 'Safdarjung Hospital — DEMO',
            record_type: 'Outpatient Consultation',
            title: 'Seasonal Allergic Rhinitis Review — DEMO',
            diagnosis: 'Allergic Rhinitis',
            notes: '[DEMO / SAMPLE RECORD] Patient reported sneezing and nasal congestion during seasonal transition.',
            prescription_json: JSON.stringify([{ medicine: 'Cetirizine 10mg', dosage: '1 tablet PRN', duration: '14 days' }]),
            created_at: '2026-08-27T10:00:00.000Z',
            created_by: 'Dr. Surya',
            version: 1
        }
    ];
    const insertRec = db.prepare(`
    INSERT OR REPLACE INTO medical_records (patient_id, doctor_id, hospital_id, hospital_name, record_type, title, diagnosis, notes, prescription_json, created_at, created_by, version)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
    initialRecords.forEach((r) => insertRec.run(r.patient_id, r.doctor_id, r.hospital_id, r.hospital_name, r.record_type, r.title, r.diagnosis, r.notes, r.prescription_json, r.created_at, r.created_by, r.version));
    // 8. Seed Referrals
    db.prepare(`
    INSERT OR REPLACE INTO referrals (id, referral_code, patient_id, referring_doctor_id, destination_hospital_id, required_specialty, required_facility, status, clinical_notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(1, 'REF-2026-9842', 1, 11, 1, 'Cardiology', 'Super-Specialty Cardiac Evaluation', 'ACCEPTED', '[DEMO / SAMPLE] Referral from Village PHC to AIIMS Delhi for cardiac evaluation.', '2026-08-18T10:30:00.000Z', '2026-08-19T09:00:00.000Z');
    db.prepare(`
    INSERT OR REPLACE INTO referrals (id, referral_code, patient_id, referring_doctor_id, destination_hospital_id, required_specialty, required_facility, status, clinical_notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(2, 'REF-2026-9843', 1, 12, 3, 'Orthopedics', 'MRI Lumbar Evaluation', 'SENT', '[DEMO / SAMPLE] Routine referral for spinal evaluation.', '2026-08-24T12:00:00.000Z', '2026-08-24T12:00:00.000Z');
    // 9. Seed Health Tracks & Care Tasks for Manoj (patient_id: 1)
    db.prepare(`
    INSERT OR REPLACE INTO health_tracks (id, patient_id, title, description, status, progress_percent, completed_steps, total_steps, created_at, updated_at, completed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(1, 1, 'Specialist Cardiology Evaluation', 'Comprehensive cardiac assessment pathway following PHC referral.', 'IN_PROGRESS', 57, 4, 7, '2026-08-18T10:00:00.000Z', new Date().toISOString(), null);
    db.prepare(`
    INSERT OR REPLACE INTO health_tracks (id, patient_id, title, description, status, progress_percent, completed_steps, total_steps, created_at, updated_at, completed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(2, 1, 'Routine Diabetes & Lipid Screening', 'Annual metabolic risk factor evaluation.', 'COMPLETED', 100, 3, 3, '2026-08-10T09:00:00.000Z', '2026-08-15T16:00:00.000Z', '2026-08-15T16:00:00.000Z');
    const insertTask = db.prepare(`
    INSERT OR REPLACE INTO health_track_tasks (id, health_track_id, type, title, description, status, priority, required, due_date, facility_name, doctor_name, referral_id, record_id, dependencies_json, completed_at, created_at, updated_at, instructions)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
    const track1Tasks = [
        [1, 1, 'CONSULTATION', '1. PHC Initial Consultation', 'Primary consultation at Village PHC.', 'COMPLETED', 'ROUTINE', 1, null, 'Village PHC — DEMO', 'Dr. Surya', null, 6, null, '2026-08-20T10:00:00.000Z', '2026-08-18T10:00:00.000Z', '2026-08-20T10:00:00.000Z', 'Initial clinical evaluation completed.'],
        [2, 1, 'REFERRAL', '2. Inter-Facility Referral Created', 'Digital transfer referral generated for AIIMS Delhi.', 'COMPLETED', 'ROUTINE', 1, null, 'AIIMS Delhi — DEMO', 'Dr. Surya', 1, null, null, '2026-08-21T09:00:00.000Z', '2026-08-18T10:30:00.000Z', '2026-08-21T09:00:00.000Z', 'Specialist referral accepted by AIIMS Cardiology.'],
        [3, 1, 'PROCEDURE', '3. Hospital Desk Registration', 'Patient intake and electronic registration at AIIMS Cardiology.', 'COMPLETED', 'ROUTINE', 1, null, 'AIIMS Delhi — DEMO', null, 1, null, null, '2026-08-22T08:30:00.000Z', '2026-08-21T09:00:00.000Z', '2026-08-22T08:30:00.000Z', 'Electronic patient intake completed.'],
        [4, 1, 'LAB_TEST', '4. Blood Tests (CBC & Cardiac Biomarkers)', 'Laboratory evaluation including Trop-I and CBC.', 'COMPLETED', 'ROUTINE', 1, null, 'AIIMS Pathology Laboratory — DEMO', 'Dr. Manoj Reddy', null, 2, null, '2026-08-23T11:00:00.000Z', '2026-08-22T08:30:00.000Z', '2026-08-23T11:00:00.000Z', 'Laboratory samples analyzed and report published.'],
        [5, 1, 'MRI', '5. MRI Scan 3T Examination', 'Urgent 3T Cardiac MRI scan required prior to specialist review.', 'ACTION_REQUIRED', 'URGENT', 1, '2026-09-05', 'AIIMS Radiology Department — DEMO', 'Dr. Manoj Reddy', null, 1, null, null, '2026-08-23T11:00:00.000Z', new Date().toISOString(), 'Fast for 4 hours prior to MRI scan. Bring prior ECG & lab reports.'],
        [6, 1, 'REPORT_REVIEW', '6. MRI Scan Report Review', 'Attending radiologist review of 3T MRI scan images.', 'UPCOMING', 'ROUTINE', 1, '2026-09-07', 'AIIMS Radiology Department — DEMO', 'Dr. Manoj Reddy', null, null, JSON.stringify(['5. MRI Scan 3T Examination']), null, '2026-08-23T11:00:00.000Z', new Date().toISOString(), 'Awaiting MRI 3T scan completion.'],
        [7, 1, 'SPECIALIST_CONSULTATION', '7. Cardiology Specialist Consultation', 'Final cardiology evaluation and treatment plan with Dr. Manoj Reddy.', 'UPCOMING', 'ROUTINE', 1, '2026-09-10', 'AIIMS Cardiology Department — DEMO', 'Dr. Manoj Reddy', 1, null, JSON.stringify(['6. MRI Scan Report Review']), null, '2026-08-23T11:00:00.000Z', new Date().toISOString(), 'Awaiting completion of MRI scan report review.']
    ];
    track1Tasks.forEach((t) => insertTask.run(...t));
    const track2Tasks = [
        [8, 2, 'CONSULTATION', 'General Physician Screening', 'Routine screening for HbA1c and lipid profile.', 'COMPLETED', 'ROUTINE', 1, null, 'Safdarjung Hospital — DEMO', 'Dr. Surya', null, 4, null, '2026-08-12T10:00:00.000Z', '2026-08-10T09:00:00.000Z', '2026-08-12T10:00:00.000Z', 'Screening requested.'],
        [9, 2, 'LAB_TEST', 'Fasting Blood Sugar & HbA1c', 'Glycemic control testing.', 'COMPLETED', 'ROUTINE', 1, null, 'Max Pathology Lab — DEMO', null, null, 4, null, '2026-08-14T09:00:00.000Z', '2026-08-12T10:00:00.000Z', '2026-08-14T09:00:00.000Z', 'HbA1c test completed.'],
        [10, 2, 'TREATMENT', 'Dietary Consultation & Prescription', 'Medication and lifestyle guidance.', 'COMPLETED', 'ROUTINE', 1, null, 'Safdarjung Hospital — DEMO', 'Dr. Surya', null, 4, null, '2026-08-15T16:00:00.000Z', '2026-08-14T09:00:00.000Z', '2026-08-15T16:00:00.000Z', 'Treatment plan finalized. Track completed.']
    ];
    track2Tasks.forEach((t) => insertTask.run(...t));
    // 10. Seed Hospital Equipment
    const equipment = [
        { hospital_id: 1, name: 'Digital X-Ray System (500mA)', category: 'Radiology', status: 'OPERATIONAL', notes: 'Calibrated 3 days ago' },
        { hospital_id: 1, name: '12-Lead ECG Machine (CardioMax)', category: 'Cardiology', status: 'OPERATIONAL', notes: 'Active in OPD Room 4' },
        { hospital_id: 1, name: 'CT Scanner 128-Slice', category: 'Radiology', status: 'OPERATIONAL', notes: 'Trauma Wing' },
        { hospital_id: 1, name: '3T MRI Scanner (Siemens Magnetom)', category: 'Radiology', status: 'OPERATIONAL', notes: 'Neuro & Cardiac Unit' },
        { hospital_id: 1, name: 'ICU Ventilator (Dräger Evita)', category: 'Critical Care', status: 'OPERATIONAL', notes: 'ICU Bed 04' },
        { hospital_id: 1, name: 'Automated External Defibrillator (AED)', category: 'Emergency', status: 'OPERATIONAL', notes: 'Triage Station' },
        { hospital_id: 5, name: 'Digital X-Ray Unit', category: 'Radiology', status: 'OPERATIONAL', notes: 'Radiology Bay 1' },
        { hospital_id: 5, name: '12-Lead ECG System', category: 'Cardiology', status: 'OPERATIONAL', notes: 'Emergency Bay' },
        { hospital_id: 5, name: 'CT Scan Machine', category: 'Radiology', status: 'LIMITED', notes: 'Operating on backup detector' },
        { hospital_id: 5, name: '1.5T MRI Scanner', category: 'Radiology', status: 'DOWN', notes: 'Coolant refill scheduled today' },
        { hospital_id: 7, name: 'Primary Digital X-Ray (100mA)', category: 'Radiology', status: 'OPERATIONAL', notes: 'PHC Peddapuram Diagnostic Room' },
        { hospital_id: 7, name: '12-Lead Portable ECG', category: 'Cardiology', status: 'OPERATIONAL', notes: 'Triage Room' },
        { hospital_id: 7, name: 'Blood Chemistry Analyzer', category: 'Pathology', status: 'OPERATIONAL', notes: 'PHC Lab' }
    ];
    const insertEquip = db.prepare(`
    INSERT OR REPLACE INTO hospital_equipment (hospital_id, name, category, status, last_inspected, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
    equipment.forEach((e) => insertEquip.run(e.hospital_id, e.name, e.category, e.status, new Date().toISOString(), e.notes));
    // 11. Seed Medical Supplies & Consumables
    const supplies = [
        { hospital_id: 1, name: 'Oxygen Cylinders (Type D 46.7L)', category: 'Respiratory', quantity: 60, unit: 'cylinders', status: 'AVAILABLE', stock_level: 'Adequate' },
        { hospital_id: 1, name: 'IV Normal Saline 500ml', category: 'Infusion', quantity: 340, unit: 'bottles', status: 'AVAILABLE', stock_level: 'Adequate' },
        { hospital_id: 1, name: 'Sterile Surgical Gloves (7.0 & 7.5)', category: 'Consumables', quantity: 850, unit: 'pairs', status: 'AVAILABLE', stock_level: 'Adequate' },
        { hospital_id: 1, name: 'N95 / FFP2 Protective Masks', category: 'PPE', quantity: 1200, unit: 'units', status: 'AVAILABLE', stock_level: 'Adequate' },
        { hospital_id: 1, name: 'Disposable Syringes 5ml with Needle', category: 'Consumables', quantity: 2400, unit: 'units', status: 'AVAILABLE', stock_level: 'Adequate' },
        { hospital_id: 1, name: 'Suture Packs (Vicryl 3-0 / Silk 2-0)', category: 'Surgical', quantity: 180, unit: 'packs', status: 'LIMITED', stock_level: 'Low Stock' },
        { hospital_id: 7, name: 'Oxygen Cylinders (B Type)', category: 'Respiratory', quantity: 5, unit: 'cylinders', status: 'AVAILABLE', stock_level: 'Adequate' },
        { hospital_id: 7, name: 'IV Infusion Sets & Cannula 20G/22G', category: 'Infusion', quantity: 65, unit: 'sets', status: 'AVAILABLE', stock_level: 'Adequate' },
        { hospital_id: 7, name: 'Sterile Dressing Bandages & Gauze', category: 'Consumables', quantity: 120, unit: 'packs', status: 'AVAILABLE', stock_level: 'Adequate' },
        { hospital_id: 7, name: 'Rapid Diagnostic Kits (Malaria/Dengue)', category: 'Testing', quantity: 15, unit: 'kits', status: 'LIMITED', stock_level: 'Low Stock' }
    ];
    const insertSupply = db.prepare(`
    INSERT OR REPLACE INTO medical_supplies (hospital_id, name, category, quantity, unit, status, stock_level, last_updated)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
    supplies.forEach((s) => insertSupply.run(s.hospital_id, s.name, s.category, s.quantity, s.unit, s.status, s.stock_level, new Date().toISOString()));
    // 12. Seed Nurse Tasks
    const nurseTasks = [
        { hospital_id: 1, patient_id: 1, patient_name: 'Rahul Kumar', bed_number: 'ICU Bed #02', title: 'Hourly Vital Signs & Continuous SpO2 Monitoring', priority: 'CRITICAL', status: 'IN_PROGRESS', assigned_nurse: 'Sister Lakshmi Devi', shift: 'Morning', due_time: '11:45 AM' },
        { hospital_id: 1, patient_id: 2, patient_name: 'Priya Sharma', bed_number: 'Ward Bed #07', title: 'Administer IV Ceftriaxone 1g & Vitals Check', priority: 'URGENT', status: 'PENDING', assigned_nurse: 'Sister Anita Roy', shift: 'Morning', due_time: '12:00 PM' },
        { hospital_id: 1, patient_id: 3, patient_name: 'Ananya Rao', bed_number: 'Room #204', title: 'Post-operative Dressing Change & Pain Score', priority: 'ROUTINE', status: 'COMPLETED', assigned_nurse: 'Sister Lakshmi Devi', shift: 'Morning', due_time: '10:30 AM' },
        { hospital_id: 1, patient_id: 1, patient_name: 'Manoj', bed_number: 'OPD Observation #01', title: 'ECG Repeat Screening & Blood Glucose Verification', priority: 'URGENT', status: 'PENDING', assigned_nurse: 'Sister Lakshmi Devi', shift: 'Morning', due_time: '01:00 PM' }
    ];
    const insertNurseTask = db.prepare(`
    INSERT OR REPLACE INTO nurse_tasks (hospital_id, patient_id, patient_name, bed_number, title, priority, status, assigned_nurse, shift, due_time, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
    nurseTasks.forEach((nt) => insertNurseTask.run(nt.hospital_id, nt.patient_id, nt.patient_name, nt.bed_number, nt.title, nt.priority, nt.status, nt.assigned_nurse, nt.shift, nt.due_time, new Date().toISOString()));
    // 13. Seed Diagnostic Work Orders
    const diagOrders = [
        { hospital_id: 1, patient_id: 1, patient_name: 'Rahul Kumar', doctor_id: 1, doctor_name: 'Dr. Anil Kumar', test_id: 1, test_name: '12-Lead Electrocardiogram (ECG)', priority: 'CRITICAL', status: 'COMPLETED', result_summary: 'ST segment elevation in Leads V1-V4 (Suspected Acute Anteroseptal MI)', report_url: '/reports/ecg_rahul_101.pdf' },
        { hospital_id: 1, patient_id: 2, patient_name: 'Priya Sharma', doctor_id: 1, doctor_name: 'Dr. Anil Kumar', test_id: 4, test_name: 'Complete Blood Count (CBC) with ESR', priority: 'PRIORITY', status: 'PROCESSING', result_summary: 'Processing in hematology lab auto-analyzer', report_url: '' },
        { hospital_id: 1, patient_id: 3, patient_name: 'Ananya Rao', doctor_id: 3, doctor_name: 'Dr. Rajesh Sharma', test_id: 6, test_name: 'Chest X-Ray Digital AP View', priority: 'ROUTINE', status: 'ORDERED', result_summary: 'Scheduled for 11:30 AM in Radiology Suite A', report_url: '' }
    ];
    const insertDiagOrder = db.prepare(`
    INSERT OR REPLACE INTO diagnostic_orders (hospital_id, patient_id, patient_name, doctor_id, doctor_name, test_id, test_name, priority, status, result_summary, report_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
    diagOrders.forEach((d) => insertDiagOrder.run(d.hospital_id, d.patient_id, d.patient_name, d.doctor_id, d.doctor_name, d.test_id, d.test_name, d.priority, d.status, d.result_summary, d.report_url, new Date().toISOString()));
    // 14. Seed Bed Units Matrix
    const bedUnits = [
        { hospital_id: 1, ward_name: 'ICU Ward A', bed_number: 'ICU-01', bed_type: 'ICU', status: 'OCCUPIED', patient_id: 1, patient_name: 'Rahul Kumar' },
        { hospital_id: 1, ward_name: 'ICU Ward A', bed_number: 'ICU-02', bed_type: 'ICU', status: 'RESERVED_EMERGENCY', patient_id: null, patient_name: 'Incoming Ambulance AMB-07' },
        { hospital_id: 1, ward_name: 'ICU Ward A', bed_number: 'ICU-03', bed_type: 'ICU', status: 'AVAILABLE', patient_id: null, patient_name: null },
        { hospital_id: 1, ward_name: 'ICU Ward A', bed_number: 'ICU-04', bed_type: 'ICU', status: 'OCCUPIED', patient_id: 2, patient_name: 'Priya Sharma' },
        { hospital_id: 1, ward_name: 'General Ward Male', bed_number: 'GW-01', bed_type: 'GENERAL', status: 'AVAILABLE', patient_id: null, patient_name: null },
        { hospital_id: 1, ward_name: 'General Ward Male', bed_number: 'GW-02', bed_type: 'GENERAL', status: 'AVAILABLE', patient_id: null, patient_name: null },
        { hospital_id: 1, ward_name: 'General Ward Male', bed_number: 'GW-03', bed_type: 'GENERAL', status: 'OCCUPIED', patient_id: 3, patient_name: 'Ananya Rao' },
        { hospital_id: 1, ward_name: 'General Ward Male', bed_number: 'GW-04', bed_type: 'GENERAL', status: 'AVAILABLE', patient_id: null, patient_name: null },
        { hospital_id: 1, ward_name: 'General Ward Male', bed_number: 'GW-05', bed_type: 'GENERAL', status: 'AVAILABLE', patient_id: null, patient_name: null },
        { hospital_id: 1, ward_name: 'General Ward Male', bed_number: 'GW-06', bed_type: 'GENERAL', status: 'MAINTENANCE', patient_id: null, patient_name: null }
    ];
    const insertBedUnit = db.prepare(`
    INSERT OR REPLACE INTO bed_units (hospital_id, ward_name, bed_number, bed_type, status, patient_id, patient_name, last_updated)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
    bedUnits.forEach((b) => insertBedUnit.run(b.hospital_id, b.ward_name, b.bed_number, b.bed_type, b.status, b.patient_id, b.patient_name, new Date().toISOString()));
    // 15. Seed Patient Consent Grants
    db.prepare(`
    INSERT OR REPLACE INTO patient_consent_grants (patient_id, health_id, doctor_id, doctor_name, hospital_name, scopes_json, duration_minutes, granted_at, expires_at, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(1, 'UID-IND-9842-7104', 1, 'Dr. Anil Kumar (Chief Cardiologist)', 'AIIMS Delhi', JSON.stringify(['REPORTS', 'PRESCRIPTIONS', 'FULL_HISTORY']), 30, new Date().toISOString(), new Date(Date.now() + 30 * 60000).toISOString(), 'ACTIVE');
    // 16. Seed Access Audit Logs
    const accessLogs = [
        { patient_id: 1, health_id: 'UID-IND-9842-7104', accessor_name: 'Dr. Anil Kumar', accessor_role: 'Cardiologist', facility_name: 'AIIMS Delhi', action: 'VIEW_RECORD', resource_accessed: 'Longitudinal EHR & 12-Lead ECG Report', timestamp: new Date(Date.now() - 10 * 60000).toISOString() },
        { patient_id: 1, health_id: 'UID-IND-9842-7104', accessor_name: 'Sister Lakshmi Devi', accessor_role: 'ICU Nurse', facility_name: 'AIIMS Delhi', action: 'ADMINISTER_MEDICATION', resource_accessed: 'IV Ceftriaxone & Vitals Flowsheet', timestamp: new Date(Date.now() - 30 * 60000).toISOString() },
        { patient_id: 1, health_id: 'UID-IND-9842-7104', accessor_name: 'Pathology Lab Desk', accessor_role: 'Lab Tech', facility_name: 'AIIMS Central Lab', action: 'UPLOAD_REPORT', resource_accessed: 'Comprehensive Blood Panel Result', timestamp: new Date(Date.now() - 120 * 60000).toISOString() }
    ];
    const insertAccessLog = db.prepare(`
    INSERT OR REPLACE INTO access_audit_logs (patient_id, health_id, accessor_name, accessor_role, facility_name, action, resource_accessed, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
    accessLogs.forEach((a) => insertAccessLog.run(a.patient_id, a.health_id, a.accessor_name, a.accessor_role, a.facility_name, a.action, a.resource_accessed, a.timestamp));
    // 17. Seed Audit Log
    db.prepare(`
    INSERT OR REPLACE INTO audit_logs (id, actor_id, actor_role, actor_name, action, resource_type, resource_id, result, ip_address, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(1, 2, 'PHC_MASTER', 'PHC Master Administrator', 'SYSTEM_SEED', 'Database', 'sih_healthcare.sqlite', 'SUCCESS', '127.0.0.1', new Date().toISOString());
    console.log('SQLite database seed completed successfully with complete hospital ecosystem!');
}
