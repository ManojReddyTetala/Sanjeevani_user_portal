"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyQRTokenAndFetchRecords = verifyQRTokenAndFetchRecords;
const db_1 = require("../db");
function verifyQRTokenAndFetchRecords(qrToken) {
    const db = (0, db_1.getDatabase)();
    // 1. Verify token in patients table
    const patient = db.prepare('SELECT * FROM patients WHERE qr_token = ? OR uid = ?').get(qrToken, qrToken);
    if (!patient) {
        return { valid: false, error: 'Invalid or expired QR Token.' };
    }
    // 2. Fetch associated medical records
    const records = db.prepare('SELECT * FROM medical_records WHERE patient_id = ? ORDER BY created_at DESC').all(patient.id);
    // 3. Fetch associated referrals
    const referrals = db.prepare('SELECT * FROM referrals WHERE patient_id = ? ORDER BY created_at DESC').all(patient.id);
    return {
        valid: true,
        patient,
        records,
        referrals,
        access_token: `ACCESS-SECURE-PAT-${patient.id}-${Date.now()}`
    };
}
