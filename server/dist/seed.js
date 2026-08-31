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
    // 2. Seed Facility Resources & Capacity Statuses
    const resources = [
        { hospital_id: 1, icu_beds: 12, general_beds: 45, oxygen_cylinders: 60, ambulances: 5, doctors_on_duty: 8, status: 'AVAILABLE' },
        { hospital_id: 2, icu_beds: 8, general_beds: 30, oxygen_cylinders: 40, ambulances: 4, doctors_on_duty: 6, status: 'AVAILABLE' },
        { hospital_id: 3, icu_beds: 2, general_beds: 10, oxygen_cylinders: 25, ambulances: 2, doctors_on_duty: 4, status: 'LIMITED' },
        { hospital_id: 4, icu_beds: 0, general_beds: 5, oxygen_cylinders: 10, ambulances: 1, doctors_on_duty: 2, status: 'UNAVAILABLE' },
        { hospital_id: 5, icu_beds: 15, general_beds: 50, oxygen_cylinders: 50, ambulances: 4, doctors_on_duty: 7, status: 'AVAILABLE' },
        { hospital_id: 6, icu_beds: 4, general_beds: 15, oxygen_cylinders: 30, ambulances: 2, doctors_on_duty: 5, status: 'LIMITED' },
        { hospital_id: 7, icu_beds: 0, general_beds: 8, oxygen_cylinders: 5, ambulances: 1, doctors_on_duty: 2, status: 'AVAILABLE' },
        { hospital_id: 8, icu_beds: 18, general_beds: 60, oxygen_cylinders: 75, ambulances: 6, doctors_on_duty: 10, status: 'AVAILABLE' },
        { hospital_id: 9, icu_beds: 3, general_beds: 20, oxygen_cylinders: 35, ambulances: 3, doctors_on_duty: 5, status: 'LIMITED' },
        { hospital_id: 10, icu_beds: 0, general_beds: 0, oxygen_cylinders: 0, ambulances: 1, doctors_on_duty: 3, status: 'AVAILABLE' }
    ];
    const insertRes = db.prepare(`
    INSERT OR REPLACE INTO hospital_resources (hospital_id, icu_beds, general_beds, oxygen_cylinders, ambulances, doctors_on_duty, status, last_updated)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
    resources.forEach((r) => insertRes.run(r.hospital_id, r.icu_beds, r.general_beds, r.oxygen_cylinders, r.ambulances, r.doctors_on_duty, r.status, new Date().toISOString()));
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
        { hospital_id: 7, service_name: 'Advanced Cardiac Cath Lab & MRI', category: 'Cardiology & Radiology', status: 'AVAILABLE', wait_time_mins: 10 },
        { hospital_id: 10, service_name: 'Whole Body MRI & PET-CT', category: 'Nuclear Radiology', status: 'AVAILABLE', wait_time_mins: 15 }
    ];
    const insertDiag = db.prepare(`
    INSERT OR REPLACE INTO diagnostic_services (hospital_id, service_name, category, status, wait_time_mins, last_updated)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
    diagnostics.forEach((d) => insertDiag.run(d.hospital_id, d.service_name, d.category, d.status, d.wait_time_mins, new Date().toISOString()));
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
    // 10. Seed Audit Log
    db.prepare(`
    INSERT OR REPLACE INTO audit_logs (id, actor_id, actor_role, actor_name, action, resource_type, resource_id, result, ip_address, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(1, 2, 'PHC_MASTER', 'PHC Master Administrator', 'SYSTEM_SEED', 'Database', 'sih_healthcare.sqlite', 'SUCCESS', '127.0.0.1', new Date().toISOString());
    console.log('SQLite database seed completed successfully!');
}
