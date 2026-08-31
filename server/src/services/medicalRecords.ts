import { getDatabase } from '../db';

export interface QRTokenVerificationResult {
  valid: boolean;
  patient?: any;
  records?: any[];
  referrals?: any[];
  access_token?: string;
  error?: string;
}

export function verifyQRTokenAndFetchRecords(qrToken: string): QRTokenVerificationResult {
  const db = getDatabase();

  // 1. Verify token in patients table
  const patient = db.prepare('SELECT * FROM patients WHERE qr_token = ? OR uid = ?').get(qrToken, qrToken) as any;

  if (!patient) {
    return { valid: false, error: 'Invalid or expired QR Token.' };
  }

  // 2. Fetch associated medical records
  const records = db.prepare('SELECT * FROM medical_records WHERE patient_id = ? ORDER BY created_at DESC').all(patient.id) as any[];

  // 3. Fetch associated referrals
  const referrals = db.prepare('SELECT * FROM referrals WHERE patient_id = ? ORDER BY created_at DESC').all(patient.id) as any[];

  return {
    valid: true,
    patient,
    records,
    referrals,
    access_token: `ACCESS-SECURE-PAT-${patient.id}-${Date.now()}`
  };
}
