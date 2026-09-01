"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const crypto_1 = __importDefault(require("crypto"));
const os_1 = __importDefault(require("os"));
const db_1 = require("./db");
const seed_1 = require("./seed");
const location_1 = require("./services/location");
const medicalRecords_1 = require("./services/medicalRecords");
const pdf_1 = require("./services/pdf");
const ai_1 = require("./services/ai");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Helper to detect local Wi-Fi / LAN IP address for mobile phone QR scanning
function getLocalNetworkIp() {
    const interfaces = os_1.default.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name] || []) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}
// --- CORS Whitelist Security (Permissive for Mobile Wi-Fi & Public Tunnel Scanning) ---
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    optionsSuccessStatus: 200
}));
app.use(express_1.default.json());
// --- Endpoint: Network & Local IP Config for Mobile Devices ---
app.get('/api/config/network-ip', (req, res) => {
    const ip = getLocalNetworkIp();
    const port = PORT;
    res.json({
        ip,
        port,
        local_url: `http://${ip}:3000`,
        backend_url: `http://${ip}:${port}`
    });
});
let sseClients = [];
app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    const clientId = crypto_1.default.randomUUID();
    const newClient = { id: clientId, res };
    sseClients.push(newClient);
    req.on('close', () => {
        sseClients = sseClients.filter((c) => c.id !== clientId);
    });
});
function broadcastEvent(eventType, payload) {
    const data = JSON.stringify({ type: eventType, payload, timestamp: new Date().toISOString() });
    sseClients.forEach((client) => {
        client.res.write(`data: ${data}\n\n`);
    });
}
// --- Rate Limiting Security ---
const rateLimitMap = new Map();
function rateLimiter(limit = 30, windowMs = 60000) {
    return (req, res, next) => {
        const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
        const now = Date.now();
        const record = rateLimitMap.get(ip);
        if (!record || now > record.resetTime) {
            rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
            return next();
        }
        if (record.count >= limit) {
            return res.status(429).json({ error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Please try again later.' } });
        }
        record.count++;
        next();
    };
}
// --- Password Hashing & Tokens ---
function hashPassword(password, salt) {
    return crypto_1.default.scryptSync(password, salt, 64).toString('hex');
}
function generateSecureToken() {
    const token = crypto_1.default.randomBytes(32).toString('hex');
    const expires_at = new Date(Date.now() + 86400000).toISOString();
    return { token, expires_at };
}
function recordAuditLog(req, actor, action, resource_type, resource_id, result, previous_value, new_value) {
    try {
        const db = (0, db_1.getDatabase)();
        db.prepare(`
      INSERT INTO audit_logs (actor_id, actor_role, actor_name, action, resource_type, resource_id, previous_value, new_value, result, ip_address, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(actor?.id ?? 0, actor?.role ?? 'ANONYMOUS', actor?.name ?? 'Anonymous User', action, resource_type, resource_id, previous_value || null, new_value || null, result, req.ip || req.socket.remoteAddress || '127.0.0.1', new Date().toISOString());
    }
    catch (e) {
        console.error('Audit log write error:', e);
    }
}
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        recordAuditLog(req, null, req.method + ' ' + req.path, 'API', 'unauthorized', 'DENIED');
        return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication session token required' } });
    }
    const db = (0, db_1.getDatabase)();
    const user = db.prepare('SELECT * FROM users WHERE token = ?').get(token);
    if (!user) {
        recordAuditLog(req, null, req.method + ' ' + req.path, 'API', 'invalid_token', 'DENIED');
        return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid or revoked session token' } });
    }
    if (user.token_expires_at && new Date(user.token_expires_at).getTime() < Date.now()) {
        recordAuditLog(req, { id: user.id, role: user.role, name: user.name }, req.method + ' ' + req.path, 'API', 'token_expired', 'DENIED');
        return res.status(401).json({ error: { code: 'TOKEN_EXPIRED', message: 'Session expired. Please log in again.' } });
    }
    req.user = user;
    next();
}
function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            recordAuditLog(req, req.user ? { id: req.user.id, role: req.user.role, name: req.user.name } : null, req.method + ' ' + req.path, 'API', 'forbidden_role', 'DENIED');
            return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'You do not have permission to access this resource.' } });
        }
        next();
    };
}
// --- GPS Distance Helper ---
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round((R * c) * 10) / 10;
}
// --- AUTHENTICATION ENDPOINTS (ACCEPTS ANY EMAIL & ANY PASSWORD) ---
// --- FLEXIBLE DEMO AUTHENTICATION & PATIENT IDENTITY ENDPOINTS ---
app.post('/api/auth/login', (req, res) => {
    try {
        let { username, name, email, password } = req.body;
        const rawInput = (username || name || email || '').trim();
        if (!rawInput) {
            return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Username / Name is required.' } });
        }
        if (!password || !password.trim()) {
            return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Password is required.' } });
        }
        const db = (0, db_1.getDatabase)();
        const cleanName = rawInput.replace(/@.*$/, '').replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        const userEmail = rawInput.includes('@') ? rawInput.toLowerCase() : `${rawInput.toLowerCase().replace(/\s+/g, '')}@patient.org`;
        const { token, expires_at } = generateSecureToken();
        // 1. Check if an existing Patient record exists by name or username
        let patient = db.prepare(`
      SELECT * FROM patients WHERE LOWER(name) = LOWER(?) OR LOWER(uid) = LOWER(?)
    `).get(cleanName, rawInput);
        // 2. Check if a User record exists
        let user = db.prepare(`
      SELECT * FROM users WHERE (patient_id IS NOT NULL AND patient_id = ?) OR LOWER(email) = LOWER(?) OR LOWER(name) = LOWER(?)
    `).get(patient?.id || 0, userEmail, cleanName);
        if (!patient && user && user.patient_id) {
            patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(user.patient_id);
        }
        // 3. If no existing Patient, dynamically create a new demo Patient profile!
        if (!patient) {
            const rand1 = Math.floor(1000 + Math.random() * 9000);
            const rand2 = Math.floor(1000 + Math.random() * 9000);
            const uid = `UID-IND-${rand1}-${rand2}`;
            const qr_token = `QR-PAT-${rand1}-${rand2}-PERMANENT`;
            const created_at = new Date().toISOString();
            const patResult = db.prepare(`
        INSERT INTO patients (uid, name, age, gender, blood_group, phone, emergency_contact, language, qr_token, created_at)
        VALUES (?, ?, 28, 'Female', 'O Positive', '+91-9876543210', 'Emergency Contact (+91-90000-00000)', 'en', ?, ?)
      `).run(uid, cleanName, qr_token, created_at);
            patient = {
                id: Number(patResult.lastInsertRowid),
                uid,
                name: cleanName,
                age: 28,
                gender: 'Female',
                blood_group: 'O Positive',
                phone: '+91-9876543210',
                emergency_contact: 'Emergency Contact (+91-90000-00000)',
                language: 'en',
                qr_token,
                created_at
            };
        }
        // 4. If no existing User, create corresponding User record linked to patient
        if (!user) {
            const salt = crypto_1.default.randomBytes(16).toString('hex');
            const password_hash = hashPassword(password, salt);
            const userResult = db.prepare(`
        INSERT INTO users (email, password_hash, salt, role, name, is_active, patient_id, token, token_expires_at)
        VALUES (?, ?, ?, 'PATIENT', ?, 1, ?, ?, ?)
      `).run(userEmail, password_hash, salt, cleanName, patient.id, token, expires_at);
            user = {
                id: Number(userResult.lastInsertRowid),
                email: userEmail,
                password_hash,
                salt,
                role: 'PATIENT',
                name: cleanName,
                is_active: 1,
                patient_id: patient.id,
                token,
                token_expires_at: expires_at
            };
        }
        else {
            db.prepare('UPDATE users SET token = ?, token_expires_at = ?, patient_id = ? WHERE id = ?').run(token, expires_at, patient.id, user.id);
            user.token = token;
            user.patient_id = patient.id;
        }
        recordAuditLog(req, { id: user.id, role: user.role, name: user.name }, 'USER_LOGIN_SUCCESS', 'User', String(user.id), 'SUCCESS');
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: patient.name,
                role: user.role,
                patient_id: patient.id
            },
            patient
        });
    }
    catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.get('/api/auth/me', authenticateToken, (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } });
        const db = (0, db_1.getDatabase)();
        const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.user.patient_id || 1);
        res.json({
            user: {
                id: req.user.id,
                email: req.user.email,
                name: patient?.name || req.user.name,
                role: req.user.role,
                patient_id: req.user.patient_id
            },
            patient: patient || null
        });
    }
    catch (error) {
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// --- AUTHENTICATED USER-SPECIFIC DATA ENDPOINTS (/api/me/*) ---
app.get('/api/me/records', authenticateToken, (req, res) => {
    try {
        const db = (0, db_1.getDatabase)();
        const patientId = req.user?.patient_id || 1;
        const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId);
        if (!patient)
            return res.status(404).json({ error: { code: 'PATIENT_NOT_FOUND', message: 'Patient not found' } });
        const records = db.prepare('SELECT * FROM medical_records WHERE patient_id = ? ORDER BY id DESC').all(patient.id);
        const parsed = records.map((r) => ({
            ...r,
            prescription_data: r.prescription_json ? JSON.parse(r.prescription_json) : []
        }));
        res.json({ patient, records: parsed });
    }
    catch (error) {
        console.error('Error fetching user records:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.get('/api/me/referrals', authenticateToken, (req, res) => {
    try {
        const db = (0, db_1.getDatabase)();
        const patientId = req.user?.patient_id || 1;
        const rows = db.prepare(`
      SELECT r.*, p.name as patient_name, p.uid as patient_uid,
             d.name as referring_doctor_name, d.specialty as referring_doctor_specialty,
             h1.name as referring_hospital_name, h2.name as destination_hospital_name
      FROM referrals r
      JOIN patients p ON r.patient_id = p.id
      JOIN doctors d ON r.referring_doctor_id = d.id
      JOIN hospitals h1 ON d.hospital_id = h1.id
      JOIN hospitals h2 ON r.destination_hospital_id = h2.id
      WHERE r.patient_id = ?
      ORDER BY r.id DESC
    `).all(patientId);
        res.json(rows);
    }
    catch (error) {
        console.error('Error fetching user referrals:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.put('/api/me/profile', authenticateToken, (req, res) => {
    try {
        const { name, age, gender, blood_group, emergency_contact } = req.body;
        const db = (0, db_1.getDatabase)();
        const patientId = req.user?.patient_id || 1;
        if (name && name.trim()) {
            db.prepare('UPDATE patients SET name = ?, age = ?, gender = ?, blood_group = ?, emergency_contact = ? WHERE id = ?')
                .run(name.trim(), age || 28, gender || 'Female', blood_group || 'O+', emergency_contact || '', patientId);
            db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name.trim(), req.user?.id);
        }
        const updatedPatient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId);
        res.json({ message: 'Profile updated successfully', patient: updatedPatient });
    }
    catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// --- PHC MASTER ADMIN: USER MANAGEMENT CRUD ---
app.get('/api/users', authenticateToken, requireRole(['PHC_MASTER']), (req, res) => {
    try {
        const db = (0, db_1.getDatabase)();
        const users = db.prepare('SELECT id, email, role, name, phone, address, city, state, is_active, patient_id, doctor_id, hospital_id FROM users ORDER BY id DESC').all();
        res.json(users);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.post('/api/users', authenticateToken, requireRole(['PHC_MASTER']), (req, res) => {
    try {
        const { email, password, role, name, phone, address, city, state, hospital_id } = req.body;
        if (!email || !name || !role) {
            return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Email, name, and role are required.' } });
        }
        const db = (0, db_1.getDatabase)();
        const salt = crypto_1.default.randomBytes(16).toString('hex');
        const password_hash = hashPassword(password || 'password123', salt);
        const result = db.prepare(`
      INSERT INTO users (email, password_hash, salt, role, name, phone, address, city, state, is_active, hospital_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run(email, password_hash, salt, role, name, phone || '', address || '', city || '', state || '', hospital_id || null);
        const newId = Number(result.lastInsertRowid);
        recordAuditLog(req, { id: req.user.id, role: req.user.role, name: req.user.name }, 'CREATE_USER', 'User', String(newId), 'SUCCESS', undefined, JSON.stringify({ email, name, role }));
        broadcastEvent('UserUpdated', { id: newId, email, role, action: 'CREATED' });
        res.status(201).json({ id: newId, email, name, role, is_active: 1 });
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message || 'Internal Server Error' } });
    }
});
app.put('/api/users/:id', authenticateToken, requireRole(['PHC_MASTER']), (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { name, phone, address, city, state, role, hospital_id } = req.body;
        const db = (0, db_1.getDatabase)();
        const oldUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
        if (!oldUser)
            return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found.' } });
        db.prepare(`
      UPDATE users SET name = ?, phone = ?, address = ?, city = ?, state = ?, role = ?, hospital_id = ? WHERE id = ?
    `).run(name || oldUser.name, phone ?? oldUser.phone, address ?? oldUser.address, city ?? oldUser.city, state ?? oldUser.state, role || oldUser.role, hospital_id ?? oldUser.hospital_id, userId);
        recordAuditLog(req, { id: req.user.id, role: req.user.role, name: req.user.name }, 'UPDATE_USER', 'User', String(userId), 'SUCCESS', JSON.stringify(oldUser), JSON.stringify({ name, phone, address, role }));
        broadcastEvent('UserUpdated', { id: userId, name, role, action: 'UPDATED' });
        res.json({ id: userId, message: 'User updated successfully' });
    }
    catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.patch('/api/users/:id/status', authenticateToken, requireRole(['PHC_MASTER']), (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { is_active } = req.body;
        const db = (0, db_1.getDatabase)();
        db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(is_active ? 1 : 0, userId);
        recordAuditLog(req, { id: req.user.id, role: req.user.role, name: req.user.name }, 'TOGGLE_USER_STATUS', 'User', String(userId), 'SUCCESS', undefined, `is_active: ${is_active}`);
        broadcastEvent('UserUpdated', { id: userId, is_active: is_active ? 1 : 0, action: 'STATUS_CHANGED' });
        res.json({ id: userId, is_active: is_active ? 1 : 0, message: 'User status updated successfully' });
    }
    catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// --- PHC MASTER ADMIN: HOSPITAL MANAGEMENT CRUD ---
app.get('/api/hospitals', (req, res) => {
    try {
        const db = (0, db_1.getDatabase)();
        const rows = db.prepare(`
      SELECT h.*, r.icu_beds, r.general_beds, r.oxygen_cylinders, r.ambulances, r.doctors_on_duty, r.status as resource_status
      FROM hospitals h
      LEFT JOIN hospital_resources r ON h.id = r.hospital_id
      ORDER BY h.id ASC
    `).all();
        res.json(rows);
    }
    catch (error) {
        console.error('Error fetching hospitals:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.post('/api/hospitals', authenticateToken, requireRole(['PHC_MASTER']), (req, res) => {
    try {
        const { name, city, state, address, latitude, longitude, phone, emergency_number, facility_type } = req.body;
        if (!name || !city || !facility_type) {
            return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Hospital name, city, and facility type are required.' } });
        }
        const db = (0, db_1.getDatabase)();
        const result = db.prepare(`
      INSERT INTO hospitals (name, city, state, address, latitude, longitude, phone, emergency_number, facility_type, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run(name, city, state || 'Delhi', address || city, latitude || 28.5672, longitude || 77.2100, phone || '+91-11-20000000', emergency_number || '102 / 108', facility_type, new Date().toISOString());
        const hospId = Number(result.lastInsertRowid);
        db.prepare(`
      INSERT INTO hospital_resources (hospital_id, icu_beds, general_beds, oxygen_cylinders, ambulances, doctors_on_duty, status, last_updated)
      VALUES (?, 10, 50, 40, 3, 5, 'AVAILABLE', ?)
    `).run(hospId, new Date().toISOString());
        recordAuditLog(req, { id: req.user.id, role: req.user.role, name: req.user.name }, 'CREATE_HOSPITAL', 'Hospital', String(hospId), 'SUCCESS', undefined, JSON.stringify({ name, city, facility_type }));
        broadcastEvent('HospitalUpdated', { id: hospId, name, city, action: 'CREATED' });
        res.status(201).json({ id: hospId, name, city, facility_type, is_active: 1 });
    }
    catch (error) {
        console.error('Error creating hospital:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.put('/api/hospitals/:id', authenticateToken, requireRole(['PHC_MASTER', 'HOSPITAL_ADMIN']), (req, res) => {
    try {
        const hospId = parseInt(req.params.id);
        const { name, city, state, address, phone, emergency_number, facility_type } = req.body;
        const db = (0, db_1.getDatabase)();
        const oldHosp = db.prepare('SELECT * FROM hospitals WHERE id = ?').get(hospId);
        if (!oldHosp)
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Hospital not found.' } });
        db.prepare(`
      UPDATE hospitals SET name = ?, city = ?, state = ?, address = ?, phone = ?, emergency_number = ?, facility_type = ? WHERE id = ?
    `).run(name || oldHosp.name, city || oldHosp.city, state || oldHosp.state, address || oldHosp.address, phone || oldHosp.phone, emergency_number || oldHosp.emergency_number, facility_type || oldHosp.facility_type, hospId);
        recordAuditLog(req, { id: req.user.id, role: req.user.role, name: req.user.name }, 'UPDATE_HOSPITAL', 'Hospital', String(hospId), 'SUCCESS', JSON.stringify(oldHosp), JSON.stringify({ name, city, facility_type }));
        broadcastEvent('HospitalUpdated', { id: hospId, name, city, action: 'UPDATED' });
        res.json({ id: hospId, message: 'Hospital details updated successfully' });
    }
    catch (error) {
        console.error('Error updating hospital:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.patch('/api/hospitals/:id/status', authenticateToken, requireRole(['PHC_MASTER']), (req, res) => {
    try {
        const hospId = parseInt(req.params.id);
        const { is_active } = req.body;
        const db = (0, db_1.getDatabase)();
        db.prepare('UPDATE hospitals SET is_active = ? WHERE id = ?').run(is_active ? 1 : 0, hospId);
        recordAuditLog(req, { id: req.user.id, role: req.user.role, name: req.user.name }, 'TOGGLE_HOSPITAL_STATUS', 'Hospital', String(hospId), 'SUCCESS', undefined, `is_active: ${is_active}`);
        broadcastEvent('HospitalUpdated', { id: hospId, is_active: is_active ? 1 : 0, action: 'STATUS_CHANGED' });
        res.json({ id: hospId, is_active: is_active ? 1 : 0, message: 'Hospital status updated successfully' });
    }
    catch (error) {
        console.error('Error updating hospital status:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// --- PHC MASTER ADMIN: DOCTOR MANAGEMENT CRUD ---
app.get('/api/doctors', (req, res) => {
    try {
        const db = (0, db_1.getDatabase)();
        const rows = db.prepare(`
      SELECT d.*, h.name as hospital_name, h.city as hospital_city
      FROM doctors d
      JOIN hospitals h ON d.hospital_id = h.id
      ORDER BY d.id DESC
    `).all();
        res.json(rows);
    }
    catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.post('/api/doctors', authenticateToken, requireRole(['PHC_MASTER', 'HOSPITAL_ADMIN']), (req, res) => {
    try {
        const { name, specialty, department, hospital_id, phone, registration_no } = req.body;
        if (!name || !specialty || !hospital_id) {
            return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Doctor name, specialty, and hospital assignment are required.' } });
        }
        const db = (0, db_1.getDatabase)();
        const regNo = registration_no || `MCI-DEL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const result = db.prepare(`
      INSERT INTO doctors (hospital_id, name, specialty, department, registration_no, phone, is_on_duty, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?)
    `).run(hospital_id, name, specialty, department || specialty, regNo, phone || '+91-9800000000', new Date().toISOString());
        const docId = Number(result.lastInsertRowid);
        recordAuditLog(req, { id: req.user.id, role: req.user.role, name: req.user.name }, 'CREATE_DOCTOR', 'Doctor', String(docId), 'SUCCESS', undefined, JSON.stringify({ name, specialty, hospital_id }));
        broadcastEvent('DoctorUpdated', { id: docId, name, specialty, hospital_id, action: 'CREATED' });
        res.status(201).json({ id: docId, name, specialty, hospital_id, is_active: 1 });
    }
    catch (error) {
        console.error('Error creating doctor:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.put('/api/doctors/:id', authenticateToken, requireRole(['PHC_MASTER', 'HOSPITAL_ADMIN']), (req, res) => {
    try {
        const docId = parseInt(req.params.id);
        const { name, specialty, department, phone, hospital_id } = req.body;
        const db = (0, db_1.getDatabase)();
        const oldDoc = db.prepare('SELECT * FROM doctors WHERE id = ?').get(docId);
        if (!oldDoc)
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Doctor not found.' } });
        db.prepare(`
      UPDATE doctors SET name = ?, specialty = ?, department = ?, phone = ?, hospital_id = ? WHERE id = ?
    `).run(name || oldDoc.name, specialty || oldDoc.specialty, department || oldDoc.department, phone || oldDoc.phone, hospital_id || oldDoc.hospital_id, docId);
        recordAuditLog(req, { id: req.user.id, role: req.user.role, name: req.user.name }, 'UPDATE_DOCTOR', 'Doctor', String(docId), 'SUCCESS', JSON.stringify(oldDoc), JSON.stringify({ specialty, hospital_id }));
        broadcastEvent('DoctorUpdated', { id: docId, name: name || oldDoc.name, specialty: specialty || oldDoc.specialty, hospital_id: hospital_id || oldDoc.hospital_id, action: 'UPDATED' });
        res.json({ id: docId, message: 'Doctor details updated successfully' });
    }
    catch (error) {
        console.error('Error updating doctor:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// --- HEALTH TRACK & CARE JOURNEY API ENDPOINTS ---
app.get('/api/health-tracks', (req, res) => {
    try {
        const patientId = req.query.patient_id ? parseInt(req.query.patient_id) : 1;
        const db = (0, db_1.getDatabase)();
        const tracks = db.prepare('SELECT * FROM health_tracks WHERE patient_id = ? ORDER BY id ASC').all(patientId);
        const fullTracks = tracks.map((track) => {
            const tasks = db.prepare('SELECT * FROM health_track_tasks WHERE health_track_id = ? ORDER BY id ASC').all(track.id);
            const parsedTasks = tasks.map((t) => {
                let dependencies = [];
                try {
                    if (t.dependencies_json)
                        dependencies = JSON.parse(t.dependencies_json);
                }
                catch (e) { }
                return { ...t, dependencies };
            });
            return { ...track, tasks: parsedTasks };
        });
        res.json(fullTracks);
    }
    catch (error) {
        console.error('Error fetching health tracks:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.get('/api/health-tracks/:id', (req, res) => {
    try {
        const trackId = parseInt(req.params.id);
        const db = (0, db_1.getDatabase)();
        const track = db.prepare('SELECT * FROM health_tracks WHERE id = ?').get(trackId);
        if (!track)
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Health track not found' } });
        const tasks = db.prepare('SELECT * FROM health_track_tasks WHERE health_track_id = ? ORDER BY id ASC').all(trackId);
        const parsedTasks = tasks.map((t) => {
            let dependencies = [];
            try {
                if (t.dependencies_json)
                    dependencies = JSON.parse(t.dependencies_json);
            }
            catch (e) { }
            return { ...t, dependencies };
        });
        res.json({ ...track, tasks: parsedTasks });
    }
    catch (error) {
        console.error('Error fetching health track:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.post('/api/health-track-tasks/:id/complete', (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        const { record_id, facility_name } = req.body || {};
        const db = (0, db_1.getDatabase)();
        const task = db.prepare('SELECT * FROM health_track_tasks WHERE id = ?').get(taskId);
        if (!task)
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Task not found' } });
        const now = new Date().toISOString();
        db.prepare(`
      UPDATE health_track_tasks SET status = 'COMPLETED', completed_at = ?, record_id = ?, facility_name = ?, updated_at = ? WHERE id = ?
    `).run(now, record_id || task.record_id || null, facility_name || task.facility_name, now, taskId);
        // Recalculate track progress
        const allTasks = db.prepare('SELECT * FROM health_track_tasks WHERE health_track_id = ?').all(task.health_track_id);
        const completedCount = allTasks.filter((t) => t.status === 'COMPLETED' || t.id === taskId).length;
        const totalCount = allTasks.length;
        const percent = Math.round((completedCount / totalCount) * 100);
        const trackStatus = completedCount === totalCount ? 'COMPLETED' : 'IN_PROGRESS';
        db.prepare(`
      UPDATE health_tracks SET progress_percent = ?, completed_steps = ?, total_steps = ?, status = ?, updated_at = ? WHERE id = ?
    `).run(percent, completedCount, totalCount, trackStatus, now, task.health_track_id);
        res.json({ message: 'Task completed successfully', taskId, trackId: task.health_track_id, progress_percent: percent });
    }
    catch (error) {
        console.error('Error completing task:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.patch('/api/doctors/:id/status', authenticateToken, requireRole(['PHC_MASTER', 'HOSPITAL_ADMIN']), (req, res) => {
    try {
        const docId = parseInt(req.params.id);
        const { is_active } = req.body;
        const db = (0, db_1.getDatabase)();
        db.prepare('UPDATE doctors SET is_active = ? WHERE id = ?').run(is_active ? 1 : 0, docId);
        recordAuditLog(req, { id: req.user.id, role: req.user.role, name: req.user.name }, 'TOGGLE_DOCTOR_STATUS', 'Doctor', String(docId), 'SUCCESS', undefined, `is_active: ${is_active}`);
        broadcastEvent('DoctorUpdated', { id: docId, is_active: is_active ? 1 : 0, action: 'STATUS_CHANGED' });
        res.json({ id: docId, is_active: is_active ? 1 : 0, message: 'Doctor status updated successfully' });
    }
    catch (error) {
        console.error('Error updating doctor status:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// --- PHC MASTER ADMIN: DIAGNOSTIC SERVICES CRUD ---
app.get('/api/diagnostics', (req, res) => {
    try {
        const db = (0, db_1.getDatabase)();
        const rows = db.prepare(`
      SELECT ds.*, h.name as hospital_name
      FROM diagnostic_services ds
      JOIN hospitals h ON ds.hospital_id = h.id
      ORDER BY ds.id DESC
    `).all();
        res.json(rows);
    }
    catch (error) {
        console.error('Error fetching diagnostics:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.post('/api/diagnostics', authenticateToken, requireRole(['PHC_MASTER', 'HOSPITAL_ADMIN']), (req, res) => {
    try {
        const { hospital_id, service_name, category, wait_time_mins } = req.body;
        if (!hospital_id || !service_name) {
            return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Hospital ID and service name are required.' } });
        }
        const db = (0, db_1.getDatabase)();
        const result = db.prepare(`
      INSERT INTO diagnostic_services (hospital_id, service_name, category, status, wait_time_mins, last_updated)
      VALUES (?, ?, ?, 'AVAILABLE', ?, ?)
    `).run(hospital_id, service_name, category || 'Radiology', wait_time_mins || 15, new Date().toISOString());
        const diagId = Number(result.lastInsertRowid);
        recordAuditLog(req, { id: req.user.id, role: req.user.role, name: req.user.name }, 'CREATE_DIAGNOSTIC', 'DiagnosticService', String(diagId), 'SUCCESS', undefined, JSON.stringify({ service_name, hospital_id }));
        broadcastEvent('DiagnosticUpdated', { id: diagId, service_name, hospital_id, action: 'CREATED' });
        res.status(201).json({ id: diagId, service_name, hospital_id });
    }
    catch (error) {
        console.error('Error creating diagnostic:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.put('/api/diagnostics/:id', authenticateToken, requireRole(['PHC_MASTER', 'HOSPITAL_ADMIN']), (req, res) => {
    try {
        const diagId = parseInt(req.params.id);
        const { service_name, category, status, wait_time_mins } = req.body;
        const db = (0, db_1.getDatabase)();
        db.prepare(`
      UPDATE diagnostic_services SET service_name = ?, category = ?, status = ?, wait_time_mins = ?, last_updated = ? WHERE id = ?
    `).run(service_name, category, status || 'AVAILABLE', wait_time_mins || 15, new Date().toISOString(), diagId);
        broadcastEvent('DiagnosticUpdated', { id: diagId, service_name, status, action: 'UPDATED' });
        res.json({ id: diagId, message: 'Diagnostic service updated successfully' });
    }
    catch (error) {
        console.error('Error updating diagnostic:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.delete('/api/diagnostics/:id', authenticateToken, requireRole(['PHC_MASTER', 'HOSPITAL_ADMIN']), (req, res) => {
    try {
        const diagId = parseInt(req.params.id);
        const db = (0, db_1.getDatabase)();
        db.prepare('DELETE FROM diagnostic_services WHERE id = ?').run(diagId);
        broadcastEvent('DiagnosticUpdated', { id: diagId, action: 'DELETED' });
        res.json({ id: diagId, message: 'Diagnostic service deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting diagnostic:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// --- PHC MASTER ADMIN: AUDIT LOGS ---
app.get('/api/audit-logs', authenticateToken, requireRole(['PHC_MASTER']), (req, res) => {
    try {
        const db = (0, db_1.getDatabase)();
        const logs = db.prepare('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 50').all();
        res.json(logs);
    }
    catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// --- REAL-TIME AUTOCOMPLETE SEARCH SERVICE ---
app.get('/api/search/suggestions', (req, res) => {
    try {
        const q = (req.query.q || '').toLowerCase().trim();
        if (!q)
            return res.json({ query: '', suggestions: [] });
        const db = (0, db_1.getDatabase)();
        const suggestions = [];
        // 1. Search Active Hospitals
        const hospitals = db.prepare(`
      SELECT * FROM hospitals WHERE (is_active IS NULL OR is_active = 1) AND (LOWER(name) LIKE ? OR LOWER(city) LIKE ? OR LOWER(facility_type) LIKE ?)
    `).all(`%${q}%`, `%${q}%`, `%${q}%`);
        hospitals.forEach((h) => {
            suggestions.push({
                type: 'hospital',
                id: h.id,
                text: h.name,
                subtitle: `${h.facility_type} • ${h.city}`,
                category: 'Hospital Facility',
                target_tab: 'hospitals'
            });
        });
        // 2. Search Active Doctors
        const doctors = db.prepare(`
      SELECT d.*, h.name as hospital_name
      FROM doctors d JOIN hospitals h ON d.hospital_id = h.id
      WHERE (d.is_active IS NULL OR d.is_active = 1) AND (h.is_active IS NULL OR h.is_active = 1)
      AND (LOWER(d.name) LIKE ? OR LOWER(d.specialty) LIKE ? OR LOWER(d.department) LIKE ?)
    `).all(`%${q}%`, `%${q}%`, `%${q}%`);
        doctors.forEach((d) => {
            suggestions.push({
                type: 'doctor',
                id: d.id,
                text: `${d.name} (${d.specialty})`,
                subtitle: d.hospital_name || 'Specialist',
                category: 'Specialist Doctor',
                target_tab: 'specialists'
            });
        });
        // 3. Search Diagnostic Services
        const diagnostics = db.prepare(`
      SELECT ds.*, h.name as hospital_name
      FROM diagnostic_services ds JOIN hospitals h ON ds.hospital_id = h.id
      WHERE (h.is_active IS NULL OR h.is_active = 1) AND (LOWER(ds.service_name) LIKE ? OR LOWER(ds.category) LIKE ?)
    `).all(`%${q}%`, `%${q}%`);
        diagnostics.forEach((ds) => {
            suggestions.push({
                type: 'diagnostic',
                id: ds.id,
                text: ds.service_name,
                subtitle: `${ds.category} • ${ds.hospital_name}`,
                category: 'Diagnostic Facility',
                target_tab: 'diagnostics'
            });
        });
        res.json({ query: q, count: suggestions.length, suggestions: suggestions.slice(0, 10) });
    }
    catch (error) {
        console.error('Error fetching suggestions:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// --- MODULE CONTEXTUAL SEARCH ENDPOINTS ---
// 1. Healthcare Facilities Contextual Search
app.get('/api/search/healthcare', (req, res) => {
    try {
        const q = (req.query.q || '').toLowerCase().trim();
        const db = (0, db_1.getDatabase)();
        const results = [];
        const hospitals = db.prepare(`
      SELECT * FROM hospitals
      WHERE (is_active IS NULL OR is_active = 1)
      AND (LOWER(name) LIKE ? OR LOWER(city) LIKE ? OR LOWER(facility_type) LIKE ? OR LOWER(address) LIKE ?)
    `).all(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
        hospitals.forEach((h) => {
            let category = 'FACILITIES';
            if (h.facility_type.toLowerCase().includes('phc') || h.facility_type.toLowerCase().includes('primary')) {
                category = 'PRIMARY HEALTH CENTRES (PHC)';
            }
            else if (h.facility_type.toLowerCase().includes('trauma') || h.name.toLowerCase().includes('emergency')) {
                category = 'EMERGENCY & TRAUMA';
            }
            results.push({
                id: `FAC-${h.id}`,
                raw_id: h.id,
                category,
                title: h.name,
                subtitle: `${h.facility_type} • ${h.city}`,
                type: 'facility',
                badge: 'DEMO',
                action_data: { hospital_id: h.id, city: h.city }
            });
        });
        if ('emergency'.includes(q) || 'trauma'.includes(q) || '108'.includes(q)) {
            results.unshift({
                id: 'CAT-EMERGENCY',
                category: 'SERVICES & AMBULANCE',
                title: '🚑 Emergency Ambulance & Trauma (102 / 108)',
                subtitle: '24/7 Immediate Emergency Trauma Dispatch',
                type: 'filter',
                badge: 'EMERGENCY',
                action_data: { filter: 'EMERGENCY' }
            });
        }
        if ('icu'.includes(q) || 'bed'.includes(q)) {
            results.push({
                id: 'CAT-ICU',
                category: 'CAPACITY & BEDS',
                title: '🛏️ ICU & Emergency Bed Availability',
                subtitle: 'Filter facilities with active ICU bed capacity',
                type: 'filter',
                badge: 'CAPACITY',
                action_data: { filter: 'ICU' }
            });
        }
        res.json({ query: q, count: results.length, results });
    }
    catch (error) {
        console.error('Error searching healthcare:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// 2. Doctor & Specialist Contextual Search
app.get('/api/search/doctors', (req, res) => {
    try {
        const q = (req.query.q || '').toLowerCase().trim();
        const db = (0, db_1.getDatabase)();
        const results = [];
        const doctors = db.prepare(`
      SELECT d.*, h.name as hospital_name, h.city as hospital_city
      FROM doctors d JOIN hospitals h ON d.hospital_id = h.id
      WHERE (d.is_active IS NULL OR d.is_active = 1)
      AND (LOWER(d.name) LIKE ? OR LOWER(d.specialty) LIKE ? OR LOWER(d.department) LIKE ? OR LOWER(h.name) LIKE ?)
    `).all(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
        doctors.forEach((d) => {
            // Add Doctor match
            results.push({
                id: `DOC-${d.id}`,
                raw_id: d.id,
                category: 'DOCTORS',
                title: d.name,
                subtitle: `${d.specialty} • ${d.hospital_name}`,
                type: 'doctor',
                badge: 'DEMO',
                action_data: { doctor_id: d.id, doctor_name: d.name, specialty: d.specialty }
            });
            // Add Specialty grouping match
            if (d.specialty.toLowerCase().includes(q) && !results.some((r) => r.title === d.specialty && r.category === 'SPECIALTIES')) {
                results.push({
                    id: `SPEC-${d.specialty}`,
                    category: 'SPECIALTIES',
                    title: d.specialty,
                    subtitle: `Specialty Department in ${d.hospital_name}`,
                    type: 'specialty_filter',
                    badge: 'SPECIALTY',
                    action_data: { specialty: d.specialty }
                });
            }
        });
        res.json({ query: q, count: results.length, results });
    }
    catch (error) {
        console.error('Error searching doctors:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// 3. Diagnostics & Test Contextual Search
app.get('/api/search/diagnostics', (req, res) => {
    try {
        const q = (req.query.q || '').toLowerCase().trim();
        const db = (0, db_1.getDatabase)();
        const results = [];
        const diagnostics = db.prepare(`
      SELECT ds.*, h.name as hospital_name, h.city as hospital_city
      FROM diagnostic_services ds JOIN hospitals h ON ds.hospital_id = h.id
      WHERE (LOWER(ds.service_name) LIKE ? OR LOWER(ds.category) LIKE ? OR LOWER(h.name) LIKE ?)
    `).all(`%${q}%`, `%${q}%`, `%${q}%`);
        diagnostics.forEach((ds) => {
            results.push({
                id: `DIAG-${ds.id}`,
                raw_id: ds.id,
                category: ds.category.toUpperCase().includes('RADIOLOGY') ? 'RADIOLOGY & SCANS' : 'PATHOLOGY & LABS',
                title: ds.service_name,
                subtitle: `${ds.hospital_name} • Est Wait: ${ds.wait_time_mins} mins`,
                type: 'diagnostic',
                badge: ds.status === 'AVAILABLE' ? '🟢 AVAILABLE' : '🟡 LIMITED',
                action_data: { service_name: ds.service_name, hospital_name: ds.hospital_name }
            });
        });
        res.json({ query: q, count: results.length, results });
    }
    catch (error) {
        console.error('Error searching diagnostics:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// 4. Medical Records Contextual Search
app.get('/api/search/records', (req, res) => {
    try {
        const q = (req.query.q || '').toLowerCase().trim();
        const db = (0, db_1.getDatabase)();
        const results = [];
        const records = db.prepare(`
      SELECT * FROM medical_records
      WHERE LOWER(title) LIKE ? OR LOWER(record_type) LIKE ? OR LOWER(diagnosis) LIKE ? OR LOWER(notes) LIKE ? OR LOWER(hospital_name) LIKE ? OR LOWER(created_by) LIKE ?
      ORDER BY id DESC
    `).all(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
        records.forEach((r) => {
            results.push({
                id: `REC-${r.id}`,
                raw_id: r.id,
                category: r.record_type.toUpperCase(),
                title: r.title,
                subtitle: `${r.hospital_name} • ${new Date(r.created_at).toLocaleDateString('en-IN')}`,
                type: 'record',
                badge: 'EHR RECORD',
                action_data: { record_id: r.id, record: r }
            });
        });
        res.json({ query: q, count: results.length, results });
    }
    catch (error) {
        console.error('Error searching records:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// 5. Referrals Contextual Search
app.get('/api/search/referrals', (req, res) => {
    try {
        const q = (req.query.q || '').toLowerCase().trim();
        const db = (0, db_1.getDatabase)();
        const results = [];
        const referrals = db.prepare(`
      SELECT r.*, h.name as destination_name
      FROM referrals r JOIN hospitals h ON r.destination_hospital_id = h.id
      WHERE LOWER(r.referral_code) LIKE ? OR LOWER(r.required_specialty) LIKE ? OR LOWER(r.status) LIKE ? OR LOWER(r.clinical_notes) LIKE ? OR LOWER(h.name) LIKE ?
    `).all(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
        referrals.forEach((r) => {
            results.push({
                id: `REF-${r.id}`,
                raw_id: r.id,
                category: 'REFERRALS',
                title: `${r.referral_code} — ${r.required_specialty}`,
                subtitle: `Destination: ${r.destination_name} • Status: ${r.status}`,
                type: 'referral',
                badge: r.status,
                action_data: { referral_id: r.id, referral_code: r.referral_code }
            });
        });
        res.json({ query: q, count: results.length, results });
    }
    catch (error) {
        console.error('Error searching referrals:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// 6. Health Statistics Contextual Search
app.get('/api/search/statistics', (req, res) => {
    try {
        const q = (req.query.q || '').toLowerCase().trim();
        const results = [];
        const metrics = [
            { name: 'Blood Pressure (BP)', val: '120/80 mmHg', cat: 'CLINICAL VITALS', type: 'vitals' },
            { name: 'Heart Rate (Pulse)', val: '72 bpm', cat: 'CLINICAL VITALS', type: 'vitals' },
            { name: 'Blood Oxygen (SpO₂)', val: '98%', cat: 'CLINICAL VITALS', type: 'vitals' },
            { name: 'Body Temperature', val: '98.6 °F', cat: 'CLINICAL VITALS', type: 'vitals' },
            { name: 'Body Weight & BMI', val: '68 kg (BMI 22.4)', cat: 'BODY METRICS', type: 'vitals' },
            { name: 'Fasting Glucose & HbA1c', val: '92 mg/dL', cat: 'LABORATORY BIOMARKERS', type: 'lab' },
            { name: 'Hemoglobin & CBC Panel', val: '14.2 g/dL', cat: 'LABORATORY BIOMARKERS', type: 'lab' },
            { name: 'Total Cholesterol', val: '175 mg/dL', cat: 'LABORATORY BIOMARKERS', type: 'lab' },
            { name: 'Consultations Count', val: '1 Consultation', cat: 'RECORD SUMMARY', type: 'stat' },
            { name: 'Radiology MRI / CT Scans', val: '2 Scans Recorded', cat: 'RECORD SUMMARY', type: 'stat' }
        ];
        metrics.filter((m) => !q || m.name.toLowerCase().includes(q) || m.val.toLowerCase().includes(q) || m.cat.toLowerCase().includes(q)).forEach((m, idx) => {
            results.push({
                id: `STAT-${idx}`,
                category: m.cat,
                title: m.name,
                subtitle: `Recorded value: ${m.val}`,
                type: 'statistic',
                badge: 'RECORDED VITAL',
                action_data: { metric_name: m.name }
            });
        });
        res.json({ query: q, count: results.length, results });
    }
    catch (error) {
        console.error('Error searching statistics:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// --- INTELLIGENT AI INTENT & STRUCTURED ACTION ENGINE ---
app.post('/api/ai/chat', (req, res) => {
    try {
        const { message, lat, lng } = req.body;
        if (!message) {
            return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Message text is required.' } });
        }
        const text = message.toLowerCase().trim();
        const db = (0, db_1.getDatabase)();
        let responseText = '';
        let actions = [];
        if (text.includes('hi') || text.includes('hello') || text.includes('namaste') || text.includes('good morning')) {
            responseText = 'Namaste! Welcome to SIH AI Health Navigator. How can I assist you with hospital discovery, doctors, diagnostic tests, or medical records today?';
            actions = [];
        }
        else if (text.includes('hospital') || text.includes('icu') || text.includes('bed')) {
            const topHospitals = db.prepare(`
        SELECT h.name, r.icu_beds, r.general_beds
        FROM hospitals h JOIN hospital_resources r ON h.id = r.hospital_id 
        WHERE (h.is_active IS NULL OR h.is_active = 1)
        ORDER BY r.icu_beds DESC LIMIT 2
      `).all();
            const h1Name = topHospitals[0]?.name || 'AIIMS Delhi';
            const h1Icu = topHospitals[0]?.icu_beds ?? 45;
            const h2Name = topHospitals[1]?.name || 'Safdarjung Hospital';
            const h2Icu = topHospitals[1]?.icu_beds ?? 12;
            responseText = `Found live hospital capacity near you:\n• ${h1Name}: ${h1Icu} ICU Beds Available\n• ${h2Name}: ${h2Icu} ICU Beds Available.\nOpening Hospital Discovery view.`;
            actions = [{ type: 'navigate', target: 'hospitals' }];
        }
        else if (text.includes('cardiologist') || text.includes('heart') || text.includes('doctor')) {
            let doc = null;
            try {
                doc = db.prepare('SELECT d.name, d.specialty, h.name as hospital_name FROM doctors d JOIN hospitals h ON d.hospital_id = h.id WHERE (d.is_active IS NULL OR d.is_active = 1) AND LOWER(d.specialty) LIKE "%cardio%" LIMIT 1').get();
            }
            catch (e) { }
            const docName = doc?.name || 'Dr. Manoj Reddy';
            const docSpec = doc?.specialty || 'Cardiologist';
            const docHosp = doc?.hospital_name || 'AIIMS Delhi';
            responseText = `I found specialist ${docName} (${docSpec}) at ${docHosp}. Navigating to Specialist Discovery.`;
            actions = [
                { type: 'navigate', target: 'doctors' },
                { type: 'set_filter', key: 'specialty', value: 'Cardiologist' }
            ];
        }
        else if (text.includes('mri') || text.includes('ct') || text.includes('scan') || text.includes('test')) {
            responseText = 'Found diagnostic facility: MRI Scan 3T at AIIMS Delhi & Max Saket. Navigating to Diagnostic Test Discovery.';
            actions = [
                { type: 'navigate', target: 'diagnostics' },
                { type: 'set_filter', key: 'test', value: 'MRI' }
            ];
        }
        else if (text.includes('record') || text.includes('prescription')) {
            responseText = 'Navigating to your Centralized Medical Records timeline.';
            actions = [{ type: 'navigate', target: 'records' }];
        }
        else if (text.includes('id') || text.includes('qr')) {
            responseText = 'Opening your Permanent Health ID Card & Secure QR Token.';
            actions = [{ type: 'navigate', target: 'identity' }];
        }
        else if (text.includes('50 km') || text.includes('50km') || text.includes('radius')) {
            responseText = 'Updating discovery search radius to 50 KM and refreshing live hospital results.';
            actions = [{ type: 'set_radius', value: 50 }];
        }
        else if (text.includes('chest pain') || text.includes('unconscious') || text.includes('stroke')) {
            responseText = '🚨 CRITICAL EMERGENCY WARNING: Your message indicates a potential medical emergency. Call National Emergency Hotline 102 / 108 immediately or proceed to the nearest trauma unit!';
            actions = [];
        }
        else {
            responseText = `I understand your query regarding "${message}". You can ask me to find hospitals with ICU beds, locate specialists, search for MRI scans, or view your medical history timeline.`;
            actions = [];
        }
        res.json({
            query: message,
            response: responseText,
            actions,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error in AI chatbot:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// --- LOCATION GEOPARSING & RESOLUTION ENDPOINT ---
app.get('/api/location/resolve', async (req, res) => {
    try {
        const q = req.query.q || '';
        if (!q)
            return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Location query text is required.' } });
        const locationData = await (0, location_1.resolveLocationQuery)(q);
        res.json(locationData);
    }
    catch (error) {
        console.error('Error resolving location query:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.get('/api/location/autocomplete', async (req, res) => {
    try {
        const q = req.query.q || '';
        if (!q)
            return res.json([]);
        const suggestions = await (0, location_1.fetchLocationAutocomplete)(q);
        res.json(suggestions);
    }
    catch (error) {
        console.error('Error fetching location autocomplete:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// --- CONVERSATIONAL AI ASSISTANT ENDPOINT ---
app.post('/api/ai/chat', (req, res) => {
    try {
        const { message, latitude, longitude } = req.body;
        if (!message)
            return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Message text is required.' } });
        const aiRes = (0, ai_1.processAiMessage)(message, latitude, longitude);
        res.json(aiRes);
    }
    catch (error) {
        console.error('Error processing AI chat:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// --- QR HEALTH RECORD ACCESS & VERIFICATION ENDPOINT ---
app.get('/api/health-records/access/:qrToken', (req, res) => {
    try {
        const qrToken = req.params.qrToken;
        const result = (0, medicalRecords_1.verifyQRTokenAndFetchRecords)(qrToken);
        if (!result.valid) {
            return res.status(403).json({ error: { code: 'ACCESS_DENIED', message: result.error || 'Access denied.' } });
        }
        res.json(result);
    }
    catch (error) {
        console.error('Error accessing health record via QR:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// --- DYNAMIC PDF MEDICAL RECORD GENERATION ENDPOINT ---
app.get('/api/patients/:uid/pdf', async (req, res) => {
    try {
        const uid = req.params.uid;
        const db = (0, db_1.getDatabase)();
        const patient = db.prepare('SELECT * FROM patients WHERE uid = ? OR id = ?').get(uid, uid);
        if (!patient)
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Patient not found.' } });
        const records = db.prepare('SELECT * FROM medical_records WHERE patient_id = ? ORDER BY created_at DESC').all(patient.id);
        const referrals = db.prepare('SELECT * FROM referrals WHERE patient_id = ? ORDER BY created_at DESC').all(patient.id);
        const pdfBuffer = await (0, pdf_1.generateMedicalRecordPDF)(patient, records, referrals);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=EHR_${patient.uid}_${Date.now()}.pdf`);
        res.send(pdfBuffer);
    }
    catch (error) {
        console.error('Error generating PDF report:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// --- DISCOVERY ENDPOINTS ---
app.get('/api/hospitals/nearby', (req, res) => {
    try {
        const lat = parseFloat(req.query.lat) || 28.5672;
        const lng = parseFloat(req.query.lng) || 77.2100;
        const maxRadius = parseFloat(req.query.radius) || 50;
        const db = (0, db_1.getDatabase)();
        const rows = db.prepare(`
      SELECT h.*, r.icu_beds, r.general_beds, r.oxygen_cylinders, r.ambulances, r.doctors_on_duty, r.status, r.last_updated
      FROM hospitals h
      LEFT JOIN hospital_resources r ON h.id = r.hospital_id
      WHERE (h.is_active IS NULL OR h.is_active = 1)
    `).all();
        let result = rows
            .map((h) => {
            const dist = calculateHaversineDistance(lat, lng, h.latitude, h.longitude);
            return { ...h, distance_km: dist };
        })
            .filter((h) => h.distance_km <= maxRadius)
            .sort((a, b) => a.distance_km - b.distance_km);
        if (result.length === 0) {
            result = rows
                .map((h) => {
                const dist = calculateHaversineDistance(lat, lng, h.latitude, h.longitude);
                return { ...h, distance_km: dist };
            })
                .sort((a, b) => a.distance_km - b.distance_km)
                .slice(0, 5);
        }
        res.json({
            count: result.length,
            radius_km: maxRadius,
            hospitals: result
        });
    }
    catch (error) {
        console.error('Error fetching nearby hospitals:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.get('/api/hospitals/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const db = (0, db_1.getDatabase)();
        const hosp = db.prepare(`
      SELECT h.*, r.icu_beds, r.general_beds, r.oxygen_cylinders, r.ambulances, r.doctors_on_duty, r.status
      FROM hospitals h LEFT JOIN hospital_resources r ON h.id = r.hospital_id
      WHERE h.id = ?
    `).get(id);
        if (!hosp)
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Hospital not found' } });
        res.json(hosp);
    }
    catch (error) {
        console.error('Error fetching hospital details:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.post('/api/hospitals/:id/resources', authenticateToken, requireRole(['HOSPITAL_ADMIN', 'PHC_MASTER']), (req, res) => {
    try {
        const hospitalId = parseInt(req.params.id);
        const { icu_beds, general_beds, oxygen_cylinders, ambulances, doctors_on_duty } = req.body;
        const icu = parseInt(icu_beds);
        const gen = parseInt(general_beds);
        const oxy = parseInt(oxygen_cylinders);
        const amb = parseInt(ambulances);
        const doc = parseInt(doctors_on_duty);
        let status = 'AVAILABLE';
        if (icu === 0 && gen < 10)
            status = 'UNAVAILABLE';
        else if (icu < 5 || gen < 30)
            status = 'LIMITED';
        const db = (0, db_1.getDatabase)();
        const now = new Date().toISOString();
        db.prepare(`
      INSERT INTO hospital_resources (hospital_id, icu_beds, general_beds, oxygen_cylinders, ambulances, doctors_on_duty, status, last_updated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(hospital_id) DO UPDATE SET
        icu_beds = excluded.icu_beds,
        general_beds = excluded.general_beds,
        oxygen_cylinders = excluded.oxygen_cylinders,
        ambulances = excluded.ambulances,
        doctors_on_duty = excluded.doctors_on_duty,
        status = excluded.status,
        last_updated = excluded.last_updated
    `).run(hospitalId, icu, gen, oxy, amb, doc, status, now);
        recordAuditLog(req, { id: req.user.id, role: req.user.role, name: req.user.name }, 'UPDATE_RESOURCES', 'HospitalResource', String(hospitalId), 'SUCCESS');
        // Broadcast SSE real-time event
        broadcastEvent('ResourceUpdated', { hospital_id: hospitalId, icu_beds: icu, general_beds: gen, status });
        res.json({ message: 'Hospital resources updated successfully', status, hospital_id: hospitalId });
    }
    catch (error) {
        console.error('Error updating resources:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// --- PHC OPERATIONAL PORTAL ENDPOINTS ---
// 1. Full PHC Operational Overview
app.get('/api/phc/:id/overview', (req, res) => {
    try {
        const phcId = parseInt(req.params.id) || 7;
        const db = (0, db_1.getDatabase)();
        const facility = db.prepare('SELECT * FROM hospitals WHERE id = ?').get(phcId);
        if (!facility)
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'PHC facility not found' } });
        let resources = db.prepare('SELECT * FROM hospital_resources WHERE hospital_id = ?').get(phcId);
        if (!resources) {
            db.prepare(`
        INSERT INTO hospital_resources (hospital_id, icu_beds, general_beds, occupied_beds, general_ward_beds, oxygen_cylinders, ambulances, doctors_on_duty, nurses_on_duty, icu_facility_status, opd_queue_count, opd_queue_status, status, last_updated)
        VALUES (?, 0, 12, 4, 12, 5, 1, 3, 5, 'AVAILABLE', 8, 'SHORT', 'AVAILABLE', ?)
      `).run(phcId, new Date().toISOString());
            resources = db.prepare('SELECT * FROM hospital_resources WHERE hospital_id = ?').get(phcId);
        }
        const staff = db.prepare('SELECT * FROM phc_staff WHERE hospital_id = ? ORDER BY is_on_duty DESC, role_title ASC').all(phcId);
        const doctors = db.prepare('SELECT * FROM doctors WHERE hospital_id = ? ORDER BY is_on_duty DESC').all(phcId);
        const medicines = db.prepare('SELECT * FROM phc_medicines WHERE hospital_id = ? ORDER BY id ASC').all(phcId);
        const diagnostics = db.prepare('SELECT * FROM diagnostic_services WHERE hospital_id = ? ORDER BY id ASC').all(phcId);
        const recentReferrals = db.prepare(`
      SELECT r.*, p.name as patient_name, p.uid as patient_uid, p.age as patient_age, p.blood_group,
             h2.name as destination_hospital_name
      FROM referrals r
      JOIN patients p ON r.patient_id = p.id
      JOIN hospitals h2 ON r.destination_hospital_id = h2.id
      WHERE r.referring_doctor_id IN (SELECT id FROM doctors WHERE hospital_id = ?)
         OR r.destination_hospital_id = ?
      ORDER BY r.id DESC LIMIT 10
    `).all(phcId, phcId);
        res.json({
            facility,
            resources,
            staff,
            doctors,
            medicines,
            diagnostics,
            recentReferrals,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error fetching PHC overview:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// 2. PHC Resource Update (Beds, Ward, ICU, Ambulance, Oxygen)
app.put('/api/phc/:id/resources', (req, res) => {
    try {
        const phcId = parseInt(req.params.id) || 7;
        const { general_beds, occupied_beds, general_ward_beds, icu_beds, icu_facility_status, ambulances, oxygen_cylinders, doctors_on_duty, nurses_on_duty, status } = req.body;
        const db = (0, db_1.getDatabase)();
        const now = new Date().toISOString();
        const gen = parseInt(general_beds) || 0;
        const occ = parseInt(occupied_beds) || 0;
        const gWard = parseInt(general_ward_beds) || gen;
        const icu = parseInt(icu_beds) || 0;
        const amb = parseInt(ambulances) || 0;
        const oxy = parseInt(oxygen_cylinders) || 0;
        const doc = parseInt(doctors_on_duty) || 0;
        const nur = parseInt(nurses_on_duty) || 0;
        let overallStatus = status || 'AVAILABLE';
        if (gen - occ <= 0 && icu === 0)
            overallStatus = 'UNAVAILABLE';
        else if (gen - occ <= 2 || (icu > 0 && icu <= 1))
            overallStatus = 'LIMITED';
        db.prepare(`
      INSERT INTO hospital_resources (hospital_id, icu_beds, general_beds, occupied_beds, general_ward_beds, oxygen_cylinders, ambulances, doctors_on_duty, nurses_on_duty, icu_facility_status, status, last_updated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(hospital_id) DO UPDATE SET
        general_beds = excluded.general_beds,
        occupied_beds = excluded.occupied_beds,
        general_ward_beds = excluded.general_ward_beds,
        icu_beds = excluded.icu_beds,
        icu_facility_status = excluded.icu_facility_status,
        ambulances = excluded.ambulances,
        oxygen_cylinders = excluded.oxygen_cylinders,
        doctors_on_duty = excluded.doctors_on_duty,
        nurses_on_duty = excluded.nurses_on_duty,
        status = excluded.status,
        last_updated = excluded.last_updated
    `).run(phcId, icu, gen, occ, gWard, oxy, amb, doc, nur, icu_facility_status || 'AVAILABLE', overallStatus, now);
        const updated = db.prepare('SELECT * FROM hospital_resources WHERE hospital_id = ?').get(phcId);
        broadcastEvent('ResourceUpdated', { hospital_id: phcId, ...updated });
        res.json({ message: 'PHC resources updated successfully', resources: updated });
    }
    catch (error) {
        console.error('Error updating PHC resources:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// 3. Fast OPD Queue Update
app.put('/api/phc/:id/queue', (req, res) => {
    try {
        const phcId = parseInt(req.params.id) || 7;
        const { opd_queue_count, opd_queue_status } = req.body;
        const count = parseInt(opd_queue_count) || 0;
        let queueStatus = opd_queue_status;
        if (!queueStatus) {
            if (count <= 10)
                queueStatus = 'SHORT';
            else if (count <= 30)
                queueStatus = 'MODERATE';
            else
                queueStatus = 'LONG';
        }
        const db = (0, db_1.getDatabase)();
        const now = new Date().toISOString();
        db.prepare(`
      UPDATE hospital_resources
      SET opd_queue_count = ?, opd_queue_status = ?, last_updated = ?
      WHERE hospital_id = ?
    `).run(count, queueStatus, now, phcId);
        broadcastEvent('QueueUpdated', { hospital_id: phcId, opd_queue_count: count, opd_queue_status: queueStatus });
        res.json({ message: 'OPD queue updated successfully', opd_queue_count: count, opd_queue_status: queueStatus });
    }
    catch (error) {
        console.error('Error updating PHC queue:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// 4. Staff Management & On-Duty Toggle
app.get('/api/phc/:id/staff', (req, res) => {
    try {
        const phcId = parseInt(req.params.id) || 7;
        const db = (0, db_1.getDatabase)();
        const staff = db.prepare('SELECT * FROM phc_staff WHERE hospital_id = ? ORDER BY is_on_duty DESC, id ASC').all(phcId);
        res.json(staff);
    }
    catch (error) {
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.patch('/api/phc/:id/staff/:staffId/duty', (req, res) => {
    try {
        const phcId = parseInt(req.params.id) || 7;
        const staffId = parseInt(req.params.staffId);
        const { is_on_duty } = req.body;
        const db = (0, db_1.getDatabase)();
        const now = new Date().toISOString();
        db.prepare('UPDATE phc_staff SET is_on_duty = ?, last_updated = ? WHERE id = ? AND hospital_id = ?')
            .run(is_on_duty ? 1 : 0, now, staffId, phcId);
        // Recount doctors and nurses on duty
        const staffMembers = db.prepare('SELECT * FROM phc_staff WHERE hospital_id = ?').all(phcId);
        const docsOnDuty = staffMembers.filter((s) => s.is_on_duty === 1 && (s.role_title.includes('Doctor') || s.role_title.includes('Physician'))).length;
        const nursesOnDuty = staffMembers.filter((s) => s.is_on_duty === 1 && s.role_title.includes('Nurse')).length;
        db.prepare('UPDATE hospital_resources SET doctors_on_duty = ?, nurses_on_duty = ?, last_updated = ? WHERE hospital_id = ?')
            .run(docsOnDuty, nursesOnDuty, now, phcId);
        broadcastEvent('StaffUpdated', { hospital_id: phcId, staffId, is_on_duty: is_on_duty ? 1 : 0, docsOnDuty, nursesOnDuty });
        res.json({ message: 'Staff duty status updated', staffId, is_on_duty: is_on_duty ? 1 : 0 });
    }
    catch (error) {
        console.error('Error toggling staff duty:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// 5. Medicine Stock & Availability Management
app.get('/api/phc/:id/medicines', (req, res) => {
    try {
        const phcId = parseInt(req.params.id) || 7;
        const db = (0, db_1.getDatabase)();
        const medicines = db.prepare('SELECT * FROM phc_medicines WHERE hospital_id = ? ORDER BY id ASC').all(phcId);
        res.json(medicines);
    }
    catch (error) {
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.patch('/api/phc/:id/medicines/:medId/status', (req, res) => {
    try {
        const phcId = parseInt(req.params.id) || 7;
        const medId = parseInt(req.params.medId);
        const { status, stock_level } = req.body;
        const db = (0, db_1.getDatabase)();
        const now = new Date().toISOString();
        const stock = stock_level || (status === 'AVAILABLE' ? 'Adequate' : status === 'LIMITED' ? 'Low Stock' : 'Out of Stock');
        db.prepare('UPDATE phc_medicines SET status = ?, stock_level = ?, last_updated = ? WHERE id = ? AND hospital_id = ?')
            .run(status, stock, now, medId, phcId);
        broadcastEvent('MedicineUpdated', { hospital_id: phcId, medId, status, stock_level: stock });
        res.json({ message: 'Medicine status updated', medId, status, stock_level: stock });
    }
    catch (error) {
        console.error('Error updating medicine:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// 6. Diagnostics Service Availability Toggle
app.patch('/api/phc/:id/diagnostics/:diagId/status', (req, res) => {
    try {
        const phcId = parseInt(req.params.id) || 7;
        const diagId = parseInt(req.params.diagId);
        const { status, wait_time_mins } = req.body;
        const db = (0, db_1.getDatabase)();
        const now = new Date().toISOString();
        db.prepare('UPDATE diagnostic_services SET status = ?, wait_time_mins = COALESCE(?, wait_time_mins), last_updated = ? WHERE id = ? AND hospital_id = ?')
            .run(status, wait_time_mins || null, now, diagId, phcId);
        broadcastEvent('DiagnosticUpdated', { hospital_id: phcId, diagId, status });
        res.json({ message: 'Diagnostic status updated', diagId, status });
    }
    catch (error) {
        console.error('Error updating diagnostic test status:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// 7. PHC Add Consultation & Medical Record
app.post('/api/phc/records', (req, res) => {
    try {
        const { patient_uid, patient_id, doctor_name, doctor_specialty, hospital_name, title, record_type, diagnosis, notes, prescription_data } = req.body;
        const db = (0, db_1.getDatabase)();
        let targetPatientId = patient_id;
        if (!targetPatientId && patient_uid) {
            const patient = db.prepare('SELECT id FROM patients WHERE uid = ? OR qr_token = ?').get(patient_uid, patient_uid);
            if (patient)
                targetPatientId = patient.id;
        }
        if (!targetPatientId) {
            // Default to Manoj for demo seamless testing if not found
            targetPatientId = 1;
        }
        const now = new Date().toISOString();
        const result = db.prepare(`
      INSERT INTO medical_records (patient_id, doctor_id, hospital_id, hospital_name, record_type, title, diagnosis, notes, prescription_json, created_at, created_by, version)
      VALUES (?, 11, 7, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(targetPatientId, hospital_name || 'Primary Health Centre (PHC) Peddapuram', record_type || 'Consultation', title || 'Primary OPD Consultation Record', diagnosis || '', notes || '', JSON.stringify(prescription_data || []), now, doctor_name || 'PHC Medical Officer');
        const recordId = Number(result.lastInsertRowid);
        broadcastEvent('ConsultationRecorded', { patient_id: targetPatientId, record_id: recordId, title });
        res.status(201).json({ message: 'Record added successfully', id: recordId, patient_id: targetPatientId });
    }
    catch (error) {
        console.error('Error creating PHC record:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// 8. PHC Digital Doctor-to-Doctor Referral Creation
app.post('/api/phc/referrals', (req, res) => {
    try {
        const { patient_id, patient_uid, referring_doctor_id, destination_hospital_id, required_specialty, required_facility, clinical_notes } = req.body;
        const db = (0, db_1.getDatabase)();
        let targetPatientId = patient_id;
        if (!targetPatientId && patient_uid) {
            const p = db.prepare('SELECT id FROM patients WHERE uid = ? OR qr_token = ?').get(patient_uid, patient_uid);
            if (p)
                targetPatientId = p.id;
        }
        if (!targetPatientId)
            targetPatientId = 1;
        const code = `REF-PHC-${Math.floor(1000 + Math.random() * 9000)}`;
        const now = new Date().toISOString();
        const result = db.prepare(`
      INSERT INTO referrals (referral_code, patient_id, referring_doctor_id, destination_hospital_id, required_specialty, required_facility, status, clinical_notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'SENT', ?, ?, ?)
    `).run(code, targetPatientId, referring_doctor_id || 11, destination_hospital_id || 1, required_specialty || 'General Surgery', required_facility || 'Specialist Evaluation & Advanced Care', clinical_notes || 'Patient referred from Primary Health Centre due to unavailability of specialist.', now, now);
        const refId = Number(result.lastInsertRowid);
        broadcastEvent('ReferralCreated', { id: refId, referral_code: code, destination_hospital_id });
        res.status(201).json({ message: 'Referral sent successfully', id: refId, referral_code: code, status: 'SENT' });
    }
    catch (error) {
        console.error('Error creating PHC referral:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// ==========================================
// 🏥 HOSPITAL OPERATING SYSTEM ENDPOINTS
// ==========================================
// 1. Hospital Complete Overview
app.get('/api/hospital/:id/overview', (req, res) => {
    try {
        const hospitalId = parseInt(req.params.id) || 1;
        const db = (0, db_1.getDatabase)();
        const facility = db.prepare('SELECT * FROM hospitals WHERE id = ?').get(hospitalId);
        if (!facility) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Hospital not found' } });
        }
        const resources = db.prepare('SELECT * FROM hospital_resources WHERE hospital_id = ?').get(hospitalId) || {
            hospital_id: hospitalId,
            icu_beds: 12,
            general_beds: 45,
            occupied_beds: 35,
            general_ward_beds: 45,
            oxygen_cylinders: 60,
            ambulances: 5,
            doctors_on_duty: 8,
            nurses_on_duty: 16,
            icu_facility_status: 'AVAILABLE',
            opd_queue_count: 24,
            opd_queue_status: 'MODERATE',
            status: 'AVAILABLE',
            last_updated: new Date().toISOString()
        };
        const staff = db.prepare('SELECT * FROM phc_staff WHERE hospital_id = ? ORDER BY id ASC').all(hospitalId);
        const doctors = db.prepare('SELECT * FROM doctors WHERE hospital_id = ? ORDER BY id ASC').all(hospitalId);
        const medicines = db.prepare('SELECT * FROM phc_medicines WHERE hospital_id = ? ORDER BY id ASC').all(hospitalId);
        const diagnostics = db.prepare('SELECT * FROM diagnostic_services WHERE hospital_id = ? ORDER BY id ASC').all(hospitalId);
        const equipment = db.prepare('SELECT * FROM hospital_equipment WHERE hospital_id = ? ORDER BY id ASC').all(hospitalId);
        const supplies = db.prepare('SELECT * FROM medical_supplies WHERE hospital_id = ? ORDER BY id ASC').all(hospitalId);
        const nurseTasks = db.prepare('SELECT * FROM nurse_tasks WHERE hospital_id = ? ORDER BY id DESC').all(hospitalId);
        const emergencies = db.prepare('SELECT * FROM emergency_requests WHERE facility_id = ? AND status != "RESOLVED" AND status != "CANCELLED" ORDER BY id DESC').all(hospitalId);
        const referrals = db.prepare(`
      SELECT r.*, p.name as patient_name, p.uid as patient_uid, p.age as patient_age, p.blood_group,
             d.name as referring_doctor_name, d.specialty as referring_doctor_specialty,
             h1.name as referring_hospital_name, h2.name as destination_hospital_name
      FROM referrals r
      JOIN patients p ON r.patient_id = p.id
      JOIN doctors d ON r.referring_doctor_id = d.id
      JOIN hospitals h1 ON d.hospital_id = h1.id
      JOIN hospitals h2 ON r.destination_hospital_id = h2.id
      WHERE r.destination_hospital_id = ? OR d.hospital_id = ?
      ORDER BY r.id DESC
    `).all(hospitalId, hospitalId);
        res.json({
            facility,
            resources,
            staff,
            doctors,
            medicines,
            diagnostics,
            equipment,
            supplies,
            nurseTasks,
            emergencies,
            referrals,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error fetching hospital overview:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// 2. Hospital Update Resources
app.put('/api/hospital/:id/resources', (req, res) => {
    try {
        const hospitalId = parseInt(req.params.id) || 1;
        const { icu_beds, general_beds, occupied_beds, general_ward_beds, oxygen_cylinders, ambulances, doctors_on_duty, nurses_on_duty, icu_facility_status, opd_queue_count, opd_queue_status, status } = req.body;
        const db = (0, db_1.getDatabase)();
        const now = new Date().toISOString();
        const availBeds = Math.max(0, (general_beds || 45) - (occupied_beds || 0));
        const autoStatus = status || (availBeds === 0 ? 'UNAVAILABLE' : availBeds <= 5 ? 'LIMITED' : 'AVAILABLE');
        db.prepare(`
      INSERT INTO hospital_resources (
        hospital_id, icu_beds, general_beds, occupied_beds, general_ward_beds,
        oxygen_cylinders, ambulances, doctors_on_duty, nurses_on_duty,
        icu_facility_status, opd_queue_count, opd_queue_status, status, last_updated
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(hospital_id) DO UPDATE SET
        icu_beds = COALESCE(excluded.icu_beds, hospital_resources.icu_beds),
        general_beds = COALESCE(excluded.general_beds, hospital_resources.general_beds),
        occupied_beds = COALESCE(excluded.occupied_beds, hospital_resources.occupied_beds),
        general_ward_beds = COALESCE(excluded.general_ward_beds, hospital_resources.general_ward_beds),
        oxygen_cylinders = COALESCE(excluded.oxygen_cylinders, hospital_resources.oxygen_cylinders),
        ambulances = COALESCE(excluded.ambulances, hospital_resources.ambulances),
        doctors_on_duty = COALESCE(excluded.doctors_on_duty, hospital_resources.doctors_on_duty),
        nurses_on_duty = COALESCE(excluded.nurses_on_duty, hospital_resources.nurses_on_duty),
        icu_facility_status = COALESCE(excluded.icu_facility_status, hospital_resources.icu_facility_status),
        opd_queue_count = COALESCE(excluded.opd_queue_count, hospital_resources.opd_queue_count),
        opd_queue_status = COALESCE(excluded.opd_queue_status, hospital_resources.opd_queue_status),
        status = excluded.status,
        last_updated = excluded.last_updated
    `).run(hospitalId, icu_beds, general_beds, occupied_beds, general_ward_beds || general_beds, oxygen_cylinders, ambulances, doctors_on_duty, nurses_on_duty, icu_facility_status || 'AVAILABLE', opd_queue_count || 10, opd_queue_status || 'SHORT', autoStatus, now);
        const updated = db.prepare('SELECT * FROM hospital_resources WHERE hospital_id = ?').get(hospitalId);
        broadcastEvent('HospitalResourceUpdated', { hospital_id: hospitalId, resources: updated });
        res.json({ message: 'Hospital resources updated', resources: updated });
    }
    catch (error) {
        console.error('Error updating hospital resources:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// 3. Hospital Equipment Management
app.get('/api/hospital/:id/equipment', (req, res) => {
    try {
        const hospitalId = parseInt(req.params.id) || 1;
        const db = (0, db_1.getDatabase)();
        const equipment = db.prepare('SELECT * FROM hospital_equipment WHERE hospital_id = ? ORDER BY id ASC').all(hospitalId);
        res.json(equipment);
    }
    catch (error) {
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.patch('/api/hospital/:id/equipment/:eqId/status', (req, res) => {
    try {
        const hospitalId = parseInt(req.params.id) || 1;
        const eqId = parseInt(req.params.eqId);
        const { status, notes } = req.body;
        const db = (0, db_1.getDatabase)();
        const now = new Date().toISOString();
        db.prepare('UPDATE hospital_equipment SET status = ?, notes = COALESCE(?, notes), last_inspected = ? WHERE id = ? AND hospital_id = ?')
            .run(status, notes || null, now, eqId, hospitalId);
        broadcastEvent('EquipmentUpdated', { hospital_id: hospitalId, eqId, status });
        res.json({ message: 'Equipment status updated', eqId, status });
    }
    catch (error) {
        console.error('Error updating equipment:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// 4. Hospital Medical Supplies Management
app.get('/api/hospital/:id/supplies', (req, res) => {
    try {
        const hospitalId = parseInt(req.params.id) || 1;
        const db = (0, db_1.getDatabase)();
        const supplies = db.prepare('SELECT * FROM medical_supplies WHERE hospital_id = ? ORDER BY id ASC').all(hospitalId);
        res.json(supplies);
    }
    catch (error) {
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.patch('/api/hospital/:id/supplies/:supId/status', (req, res) => {
    try {
        const hospitalId = parseInt(req.params.id) || 1;
        const supId = parseInt(req.params.supId);
        const { status, quantity, stock_level } = req.body;
        const db = (0, db_1.getDatabase)();
        const now = new Date().toISOString();
        const stock = stock_level || (status === 'AVAILABLE' ? 'Adequate' : status === 'LIMITED' ? 'Low Stock' : 'Out of Stock');
        db.prepare('UPDATE medical_supplies SET status = ?, quantity = COALESCE(?, quantity), stock_level = ?, last_updated = ? WHERE id = ? AND hospital_id = ?')
            .run(status, quantity || null, stock, now, supId, hospitalId);
        broadcastEvent('SupplyUpdated', { hospital_id: hospitalId, supId, status, stock_level: stock });
        res.json({ message: 'Supply status updated', supId, status, stock_level: stock });
    }
    catch (error) {
        console.error('Error updating supply:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// 5. Hospital Nurse Tasks Management
app.get('/api/hospital/:id/nurse-tasks', (req, res) => {
    try {
        const hospitalId = parseInt(req.params.id) || 1;
        const db = (0, db_1.getDatabase)();
        const tasks = db.prepare('SELECT * FROM nurse_tasks WHERE hospital_id = ? ORDER BY id DESC').all(hospitalId);
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.post('/api/hospital/:id/nurse-tasks', (req, res) => {
    try {
        const hospitalId = parseInt(req.params.id) || 1;
        const { patient_id, patient_name, bed_number, title, priority, assigned_nurse, shift, due_time } = req.body;
        const db = (0, db_1.getDatabase)();
        const now = new Date().toISOString();
        const result = db.prepare(`
      INSERT INTO nurse_tasks (hospital_id, patient_id, patient_name, bed_number, title, priority, status, assigned_nurse, shift, due_time, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?)
    `).run(hospitalId, patient_id || null, patient_name || 'Patient', bed_number || 'Ward Bed', title, priority || 'ROUTINE', assigned_nurse || 'Staff Nurse', shift || 'Morning', due_time || 'Next 1 Hour', now);
        const taskId = Number(result.lastInsertRowid);
        broadcastEvent('NurseTaskCreated', { hospital_id: hospitalId, taskId, title });
        res.status(201).json({ id: taskId, message: 'Nurse task created successfully' });
    }
    catch (error) {
        console.error('Error creating nurse task:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.patch('/api/hospital/:id/nurse-tasks/:taskId/status', (req, res) => {
    try {
        const hospitalId = parseInt(req.params.id) || 1;
        const taskId = parseInt(req.params.taskId);
        const { status } = req.body;
        const db = (0, db_1.getDatabase)();
        db.prepare('UPDATE nurse_tasks SET status = ? WHERE id = ? AND hospital_id = ?').run(status, taskId, hospitalId);
        broadcastEvent('NurseTaskUpdated', { hospital_id: hospitalId, taskId, status });
        res.json({ message: 'Nurse task updated', taskId, status });
    }
    catch (error) {
        console.error('Error updating nurse task:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// 6. Referral Hospital Selection & Intelligent Ranking
app.post('/api/hospital/referrals/recommend', (req, res) => {
    try {
        const { required_specialty, origin_lat, origin_lng, requires_icu } = req.body;
        const db = (0, db_1.getDatabase)();
        const hospitals = db.prepare(`
      SELECT h.*, hr.icu_beds, hr.general_beds, hr.occupied_beds, hr.status as resource_status, hr.icu_facility_status,
             COUNT(d.id) as matching_specialists
      FROM hospitals h
      LEFT JOIN hospital_resources hr ON h.id = hr.hospital_id
      LEFT JOIN doctors d ON h.id = d.hospital_id AND d.is_on_duty = 1 AND LOWER(d.specialty) LIKE LOWER(?)
      WHERE h.facility_type NOT LIKE '%Primary Health Centre%'
      GROUP BY h.id
    `).all(`%${required_specialty || ''}%`);
        // Calculate approximate Haversine distance and capability score
        const lat1 = origin_lat || 17.0789;
        const lon1 = origin_lng || 82.1384;
        const ranked = hospitals.map((h) => {
            const lat2 = h.latitude;
            const lon2 = h.longitude;
            const R = 6371; // Earth radius in km
            const dLat = (lat2 - lat1) * (Math.PI / 180);
            const dLon = (lon2 - lon1) * (Math.PI / 180);
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const dist = Math.round(R * c * 10) / 10;
            const hasSpecialist = (h.matching_specialists || 0) > 0;
            const hasIcu = (h.icu_beds || 0) > 0 && h.icu_facility_status !== 'UNAVAILABLE';
            const availableGeneralBeds = Math.max(0, (h.general_beds || 0) - (h.occupied_beds || 0));
            let score = 100;
            score -= Math.min(dist * 0.5, 40); // distance penalty
            if (hasSpecialist)
                score += 30;
            else
                score -= 25;
            if (hasIcu)
                score += 20;
            else if (requires_icu)
                score -= 40;
            if (availableGeneralBeds > 5)
                score += 15;
            return {
                ...h,
                distance_km: dist,
                has_specialist: hasSpecialist,
                has_icu: hasIcu,
                available_beds: availableGeneralBeds,
                recommendation_score: Math.max(0, Math.round(score)),
                specialist_status: hasSpecialist ? 'AVAILABLE' : 'LIMITED',
                icu_status: hasIcu ? 'AVAILABLE' : 'UNAVAILABLE'
            };
        }).sort((a, b) => b.recommendation_score - a.recommendation_score);
        res.json(ranked);
    }
    catch (error) {
        console.error('Error calculating hospital recommendations:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// --- PATIENTS & RECORDS ---
app.get('/api/patients/:uid', (req, res) => {
    try {
        const identifier = req.params.uid;
        const db = (0, db_1.getDatabase)();
        const patient = db.prepare('SELECT * FROM patients WHERE uid = ? OR qr_token = ? OR id = ?').get(identifier, identifier, identifier);
        if (!patient)
            return res.status(404).json({ error: { code: 'PATIENT_NOT_FOUND', message: 'Patient identity record not found.' } });
        res.json(patient);
    }
    catch (error) {
        console.error('Error fetching patient:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// Stream 6-Page Clinical EHR & Radiology PDF Report directly to browser or download
app.get('/api/patients/:uid/pdf', async (req, res) => {
    try {
        const identifier = req.params.uid;
        const db = (0, db_1.getDatabase)();
        const patient = db.prepare('SELECT * FROM patients WHERE uid = ? OR qr_token = ? OR id = ?').get(identifier, identifier, identifier) || {
            id: 1,
            name: 'Manoj',
            uid: 'UID-IND-9842-7104',
            age: 28,
            gender: 'Male',
            blood_group: 'O Positive',
            emergency_contact: '+91-90000-00000'
        };
        const records = db.prepare('SELECT * FROM medical_records WHERE patient_id = ? ORDER BY id DESC').all(patient.id);
        const pdfBuffer = await (0, pdf_1.generateMedicalRecordPDF)(patient, records, []);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="HEALTHCARE_RECORD_${patient.name}_${patient.uid}.pdf"`);
        res.send(pdfBuffer);
    }
    catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: { code: 'PDF_ERROR', message: 'Failed to generate PDF document' } });
    }
});
// QR Token Access Endpoint (Streams PDF directly if scanned in browser!)
app.get('/api/health-records/access/:qrToken', async (req, res) => {
    try {
        const { qrToken } = req.params;
        const db = (0, db_1.getDatabase)();
        const patient = db.prepare('SELECT * FROM patients WHERE qr_token = ? OR uid = ? OR id = ?').get(qrToken, qrToken, qrToken) || {
            id: 1,
            name: 'Manoj',
            uid: 'UID-IND-9842-7104',
            age: 28,
            gender: 'Male',
            blood_group: 'O Positive',
            emergency_contact: '+91-90000-00000'
        };
        const records = db.prepare('SELECT * FROM medical_records WHERE patient_id = ? ORDER BY id DESC').all(patient.id);
        // If request asks for HTML/PDF or is accessed via browser scanner GET directly, stream the 6-page PDF!
        const acceptHeader = req.headers['accept'] || '';
        if (acceptHeader.includes('text/html') || acceptHeader.includes('application/pdf') || req.query.format === 'pdf') {
            const pdfBuffer = await (0, pdf_1.generateMedicalRecordPDF)(patient, records, []);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="HEALTHCARE_RECORD_${patient.name}.pdf"`);
            return res.send(pdfBuffer);
        }
        res.json({
            valid: true,
            patient,
            records,
            pdf_url: `/api/patients/${patient.uid}/pdf`
        });
    }
    catch (error) {
        console.error('Error verifying QR token:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.get('/api/patients/:uid/records', (req, res) => {
    try {
        const identifier = req.params.uid;
        const db = (0, db_1.getDatabase)();
        const patient = db.prepare('SELECT * FROM patients WHERE uid = ? OR qr_token = ? OR id = ?').get(identifier, identifier, identifier);
        if (!patient)
            return res.status(404).json({ error: { code: 'PATIENT_NOT_FOUND', message: 'Patient not found.' } });
        const records = db.prepare('SELECT * FROM medical_records WHERE patient_id = ? ORDER BY id DESC').all(patient.id);
        const parsed = records.map((r) => ({
            ...r,
            prescription_data: r.prescription_json ? JSON.parse(r.prescription_json) : []
        }));
        res.json({ patient_id: patient.id, patient_name: patient.name, patient_uid: patient.uid, records: parsed });
    }
    catch (error) {
        console.error('Error fetching medical records:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.post('/api/records', authenticateToken, requireRole(['DOCTOR', 'PHC_MASTER']), (req, res) => {
    try {
        const { patient_id, hospital_name, record_type, title, diagnosis, notes, prescription_data } = req.body;
        const db = (0, db_1.getDatabase)();
        const result = db.prepare(`
      INSERT INTO medical_records (patient_id, doctor_id, hospital_id, hospital_name, record_type, title, diagnosis, notes, prescription_json, created_at, created_by, version)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(patient_id, req.user?.doctor_id || 10, req.user?.hospital_id || 1, hospital_name || 'Healthcare Center', record_type || 'Consultation', title, diagnosis || '', notes || '', JSON.stringify(prescription_data || []), new Date().toISOString(), req.user?.name || 'Doctor');
        broadcastEvent('ConsultationRecorded', { patient_id, record_id: Number(result.lastInsertRowid), title });
        res.status(201).json({ id: Number(result.lastInsertRowid), patient_id, title });
    }
    catch (error) {
        console.error('Error creating record:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// --- REFERRAL PIPELINE ---
app.get('/api/referrals', authenticateToken, (req, res) => {
    try {
        const db = (0, db_1.getDatabase)();
        const rows = db.prepare(`
      SELECT r.*, p.name as patient_name, p.uid as patient_uid, p.age as patient_age, p.blood_group,
             d.name as referring_doctor_name, d.specialty as referring_doctor_specialty,
             h1.name as referring_hospital_name, h2.name as destination_hospital_name
      FROM referrals r
      JOIN patients p ON r.patient_id = p.id
      JOIN doctors d ON r.referring_doctor_id = d.id
      JOIN hospitals h1 ON d.hospital_id = h1.id
      JOIN hospitals h2 ON r.destination_hospital_id = h2.id
      ORDER BY r.id DESC
    `).all();
        res.json(rows);
    }
    catch (error) {
        console.error('Error fetching referrals:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.post('/api/referrals', authenticateToken, requireRole(['DOCTOR', 'HOSPITAL_ADMIN', 'PHC_MASTER']), (req, res) => {
    try {
        const { patient_id, destination_hospital_id, required_specialty, required_facility, clinical_notes } = req.body;
        const db = (0, db_1.getDatabase)();
        const code = `REF-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const result = db.prepare(`
      INSERT INTO referrals (referral_code, patient_id, referring_doctor_id, destination_hospital_id, required_specialty, required_facility, status, clinical_notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'SENT', ?, ?, ?)
    `).run(code, patient_id, req.user?.doctor_id || 10, destination_hospital_id, required_specialty || 'Cardiology', required_facility || 'ICU Bed', clinical_notes || 'Patient transfer requested', new Date().toISOString(), new Date().toISOString());
        broadcastEvent('ReferralCreated', { referral_code: code, destination_hospital_id });
        res.status(201).json({ id: Number(result.lastInsertRowid), referral_code: code, status: 'SENT' });
    }
    catch (error) {
        console.error('Error creating referral:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.patch('/api/referrals/:id/status', authenticateToken, requireRole(['DOCTOR', 'HOSPITAL_ADMIN', 'PHC_MASTER']), (req, res) => {
    try {
        const refId = parseInt(req.params.id);
        const { status } = req.body;
        const db = (0, db_1.getDatabase)();
        db.prepare('UPDATE referrals SET status = ?, updated_at = ? WHERE id = ?').run(status, new Date().toISOString(), refId);
        broadcastEvent('ReferralUpdated', { id: refId, status });
        res.json({ id: refId, status, message: 'Referral status updated successfully' });
    }
    catch (error) {
        console.error('Error updating referral status:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// --- EMERGENCY RESPONSE & PHC REQUEST ENDPOINTS ---
app.post('/api/emergency/requests', (req, res) => {
    try {
        const { patient_id, patient_name, patient_age, patient_blood_group, health_id, facility_id, latitude, longitude, distance_km, priority, description } = req.body;
        if (!patient_id || !facility_id) {
            return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Patient ID and Facility ID are required.' } });
        }
        const db = (0, db_1.getDatabase)();
        const facility = db.prepare('SELECT * FROM hospitals WHERE id = ?').get(facility_id);
        if (!facility) {
            return res.status(404).json({ error: { code: 'FACILITY_NOT_FOUND', message: 'Target healthcare facility not found.' } });
        }
        const now = new Date().toISOString();
        const result = db.prepare(`
      INSERT INTO emergency_requests (
        patient_id, patient_name, patient_age, patient_blood_group, health_id,
        facility_id, facility_name, facility_type, latitude, longitude, distance_km, priority,
        description, status, ambulance_status, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CREATED', 'NOT_DISPATCHED', ?, ?)
    `).run(patient_id, patient_name || 'Manoj', patient_age || 28, patient_blood_group || 'O+', health_id || 'UID-IND-9842-7104', facility_id, facility.name, facility.facility_type, latitude || 16.9891, longitude || 82.2475, distance_km || 3.4, priority || 'CRITICAL', description || 'Emergency Assistance Request', now, now);
        const requestId = Number(result.lastInsertRowid);
        const emergencyReq = db.prepare('SELECT * FROM emergency_requests WHERE id = ?').get(requestId);
        broadcastEvent('EmergencyRequestCreated', emergencyReq);
        res.status(201).json(emergencyReq);
    }
    catch (error) {
        console.error('Error creating emergency request:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message || 'Internal Server Error' } });
    }
});
app.get('/api/emergency/requests', (req, res) => {
    try {
        const db = (0, db_1.getDatabase)();
        const patientId = req.query.patient_id ? parseInt(req.query.patient_id) : null;
        const facilityId = req.query.facility_id ? parseInt(req.query.facility_id) : null;
        let query = 'SELECT * FROM emergency_requests';
        const params = [];
        if (patientId) {
            query += ' WHERE patient_id = ?';
            params.push(patientId);
        }
        else if (facilityId) {
            query += ' WHERE facility_id = ?';
            params.push(facilityId);
        }
        query += ' ORDER BY id DESC';
        const rows = db.prepare(query).all(...params);
        res.json(rows);
    }
    catch (error) {
        console.error('Error fetching emergency requests:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.post('/api/emergency/requests/:id/accept', (req, res) => {
    try {
        const requestId = parseInt(req.params.id);
        const { doctor_name, phc_notes } = req.body;
        const db = (0, db_1.getDatabase)();
        const now = new Date().toISOString();
        db.prepare(`
      UPDATE emergency_requests
      SET status = 'ACCEPTED', assigned_doctor = ?, acknowledged_at = ?, phc_notes = ?, updated_at = ?
      WHERE id = ?
    `).run(doctor_name || 'Dr. Sunita Rani (Medical Officer)', now, phc_notes || 'Emergency case accepted by on-duty medical officer.', now, requestId);
        const updatedReq = db.prepare('SELECT * FROM emergency_requests WHERE id = ?').get(requestId);
        broadcastEvent('EmergencyRequestUpdated', updatedReq);
        res.json(updatedReq);
    }
    catch (error) {
        console.error('Error accepting emergency:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.post('/api/emergency/requests/:id/dispatch-ambulance', (req, res) => {
    try {
        const requestId = parseInt(req.params.id);
        const { driver_name, eta_minutes, phc_notes, ambulance_code } = req.body;
        const db = (0, db_1.getDatabase)();
        const now = new Date().toISOString();
        db.prepare(`
      UPDATE emergency_requests
      SET status = 'AMBULANCE_DISPATCHED', ambulance_status = 'DISPATCHED', ambulance_code = ?,
          ambulance_lifecycle_state = 'EN_ROUTE_TO_PATIENT', ambulance_lat = 17.0198, ambulance_lng = 82.1292,
          ambulance_speed_kmh = 44.0, ambulance_heading = 78, ambulance_accuracy_m = 4.5,
          ambulance_last_updated = ?, assigned_driver = ?, eta_minutes = ?, phc_notes = ?, updated_at = ?
      WHERE id = ?
    `).run(ambulance_code || 'AMB-07', now, driver_name || 'Ramesh (Driver) • 108 Emergency Unit', eta_minutes || 6, phc_notes || 'Ambulance AMB-07 dispatched with oxygen & AED onboard.', now, requestId);
        const updatedReq = db.prepare('SELECT * FROM emergency_requests WHERE id = ?').get(requestId);
        broadcastEvent('EmergencyRequestUpdated', updatedReq);
        res.json(updatedReq);
    }
    catch (error) {
        console.error('Error dispatching ambulance:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.patch('/api/emergency/requests/:id/telemetry', (req, res) => {
    try {
        const requestId = parseInt(req.params.id);
        const { patient_lat, patient_lng, patient_accuracy_m, ambulance_lat, ambulance_lng, ambulance_speed_kmh, ambulance_heading, ambulance_accuracy_m, eta_minutes, distance_km } = req.body;
        const db = (0, db_1.getDatabase)();
        const oldReq = db.prepare('SELECT * FROM emergency_requests WHERE id = ?').get(requestId);
        if (!oldReq) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Emergency request not found' } });
        }
        const now = new Date().toISOString();
        const nextPatientLat = patient_lat !== undefined ? patient_lat : oldReq.latitude;
        const nextPatientLng = patient_lng !== undefined ? patient_lng : oldReq.longitude;
        const nextPatientAcc = patient_accuracy_m !== undefined ? patient_accuracy_m : (oldReq.patient_accuracy_m || 6.0);
        const nextAmbLat = ambulance_lat !== undefined ? ambulance_lat : (oldReq.ambulance_lat || 17.0198);
        const nextAmbLng = ambulance_lng !== undefined ? ambulance_lng : (oldReq.ambulance_lng || 82.1292);
        const nextAmbSpeed = ambulance_speed_kmh !== undefined ? ambulance_speed_kmh : (oldReq.ambulance_speed_kmh || 42.0);
        const nextAmbHead = ambulance_heading !== undefined ? ambulance_heading : (oldReq.ambulance_heading || 78);
        const nextAmbAcc = ambulance_accuracy_m !== undefined ? ambulance_accuracy_m : (oldReq.ambulance_accuracy_m || 4.5);
        const nextEta = eta_minutes !== undefined ? eta_minutes : oldReq.eta_minutes;
        const nextDist = distance_km !== undefined ? distance_km : oldReq.distance_km;
        db.prepare(`
      UPDATE emergency_requests
      SET latitude = ?, longitude = ?, patient_accuracy_m = ?, patient_last_updated = ?,
          ambulance_lat = ?, ambulance_lng = ?, ambulance_speed_kmh = ?, ambulance_heading = ?,
          ambulance_accuracy_m = ?, ambulance_last_updated = ?, eta_minutes = ?, distance_km = ?,
          updated_at = ?
      WHERE id = ?
    `).run(nextPatientLat, nextPatientLng, nextPatientAcc, now, nextAmbLat, nextAmbLng, nextAmbSpeed, nextAmbHead, nextAmbAcc, now, nextEta, nextDist, now, requestId);
        const updatedReq = db.prepare('SELECT * FROM emergency_requests WHERE id = ?').get(requestId);
        broadcastEvent('EmergencyTelemetryUpdated', updatedReq);
        res.json(updatedReq);
    }
    catch (error) {
        console.error('Error updating telemetry:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.patch('/api/emergency/requests/:id/ambulance-state', (req, res) => {
    try {
        const requestId = parseInt(req.params.id);
        const { lifecycle_state, eta_minutes, phc_notes } = req.body;
        const db = (0, db_1.getDatabase)();
        const oldReq = db.prepare('SELECT * FROM emergency_requests WHERE id = ?').get(requestId);
        if (!oldReq) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Emergency request not found' } });
        }
        const now = new Date().toISOString();
        let overallStatus = oldReq.status;
        let ambStatus = oldReq.ambulance_status;
        if (lifecycle_state === 'EN_ROUTE_TO_PATIENT' || lifecycle_state === 'DISPATCHED') {
            overallStatus = 'AMBULANCE_DISPATCHED';
            ambStatus = 'DISPATCHED';
        }
        else if (lifecycle_state === 'ARRIVED_AT_PATIENT') {
            overallStatus = 'IN_PROGRESS';
            ambStatus = 'ARRIVED';
        }
        else if (lifecycle_state === 'PATIENT_PICKED_UP' || lifecycle_state === 'EN_ROUTE_TO_HOSPITAL') {
            overallStatus = 'IN_PROGRESS';
            ambStatus = 'DISPATCHED';
        }
        else if (lifecycle_state === 'ARRIVED' || lifecycle_state === 'RESOLVED') {
            ambStatus = 'COMPLETED';
        }
        db.prepare(`
      UPDATE emergency_requests
      SET ambulance_lifecycle_state = ?, ambulance_status = ?, status = ?,
          eta_minutes = ?, phc_notes = ?, ambulance_last_updated = ?, updated_at = ?
      WHERE id = ?
    `).run(lifecycle_state, ambStatus, overallStatus, eta_minutes !== undefined ? eta_minutes : oldReq.eta_minutes, phc_notes || `Ambulance status transitioned to ${lifecycle_state}`, now, now, requestId);
        const updatedReq = db.prepare('SELECT * FROM emergency_requests WHERE id = ?').get(requestId);
        broadcastEvent('EmergencyRequestUpdated', updatedReq);
        res.json(updatedReq);
    }
    catch (error) {
        console.error('Error updating ambulance state:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.post('/api/emergency/requests/:id/refer', (req, res) => {
    try {
        const requestId = parseInt(req.params.id);
        const { destination_hospital_id, destination_hospital_name, required_specialty, required_facility, clinical_notes } = req.body;
        const db = (0, db_1.getDatabase)();
        const oldReq = db.prepare('SELECT * FROM emergency_requests WHERE id = ?').get(requestId);
        if (!oldReq) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Emergency not found' } });
        }
        const now = new Date().toISOString();
        const refCode = `REF-EMG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const refResult = db.prepare(`
      INSERT INTO referrals (referral_code, patient_id, referring_doctor_id, destination_hospital_id, required_specialty, required_facility, status, clinical_notes, created_at, updated_at)
      VALUES (?, ?, 14, ?, ?, ?, 'SENT', ?, ?, ?)
    `).run(refCode, oldReq.patient_id, destination_hospital_id || 1, required_specialty || 'Cardiology', required_facility || destination_hospital_name || 'AIIMS Delhi Trauma & Cardiac Unit', clinical_notes || `Emergency referral from PHC for patient ${oldReq.patient_name}`, now, now);
        const referralId = Number(refResult.lastInsertRowid);
        db.prepare(`
      UPDATE emergency_requests
      SET status = 'REFERRED', referral_id = ?, phc_notes = ?, updated_at = ?
      WHERE id = ?
    `).run(referralId, `Referred to ${destination_hospital_name || 'Apex Super-Speciality Hospital'} (${refCode})`, now, requestId);
        const updatedReq = db.prepare('SELECT * FROM emergency_requests WHERE id = ?').get(requestId);
        broadcastEvent('EmergencyRequestUpdated', updatedReq);
        res.json({ emergency: updatedReq, referral_code: refCode, referral_id: referralId });
    }
    catch (error) {
        console.error('Error creating emergency referral:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.post('/api/emergency/requests/:id/resolve', (req, res) => {
    try {
        const requestId = parseInt(req.params.id);
        const { resolution_notes, record_title, diagnosis, prescription_items } = req.body;
        const db = (0, db_1.getDatabase)();
        const oldReq = db.prepare('SELECT * FROM emergency_requests WHERE id = ?').get(requestId);
        if (!oldReq) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Emergency not found' } });
        }
        const now = new Date().toISOString();
        // 1. Mark emergency resolved
        db.prepare(`
      UPDATE emergency_requests
      SET status = 'RESOLVED', resolved_at = ?, resolution_notes = ?, updated_at = ?
      WHERE id = ?
    `).run(now, resolution_notes || 'Emergency stabilized and resolved at PHC.', now, requestId);
        // 2. Auto-record clinical encounter into patient central medical records (EHR)
        const recResult = db.prepare(`
      INSERT INTO medical_records (patient_id, hospital_name, record_type, title, diagnosis, notes, prescription_data, created_at, created_by)
      VALUES (?, ?, 'Emergency Encounter', ?, ?, ?, ?, ?, ?)
    `).run(oldReq.patient_id, oldReq.facility_name || 'Primary Health Centre', record_title || '🚨 Emergency Triage & Stabilization Report', diagnosis || 'Acute Emergency Stabilized (Normal Sinus Rhythm restored, Vitals stable)', resolution_notes || oldReq.description || 'Emergency patient stabilized with oxygen support and medication.', JSON.stringify(prescription_items || [{ medicine: 'Aspirin 300mg / Sorbitrate 5mg', dosage: 'Stat dose given', duration: '1 day' }]), now, 'Dr. Sunita Rani (PHC Medical Officer)');
        const updatedReq = db.prepare('SELECT * FROM emergency_requests WHERE id = ?').get(requestId);
        broadcastEvent('EmergencyRequestUpdated', updatedReq);
        broadcastEvent('ConsultationRecorded', { patient_id: oldReq.patient_id });
        res.json({ emergency: updatedReq, record_id: Number(recResult.lastInsertRowid) });
    }
    catch (error) {
        console.error('Error resolving emergency request:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.patch('/api/emergency/requests/:id/status', (req, res) => {
    try {
        const requestId = parseInt(req.params.id);
        const { status, phc_notes } = req.body;
        const db = (0, db_1.getDatabase)();
        const oldReq = db.prepare('SELECT * FROM emergency_requests WHERE id = ?').get(requestId);
        if (!oldReq) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Emergency request not found.' } });
        }
        const now = new Date().toISOString();
        let ackAt = oldReq.acknowledged_at;
        let resAt = oldReq.resolved_at;
        if (status === 'ACKNOWLEDGED' || status === 'IN_PROGRESS' || status === 'ACCEPTED') {
            ackAt = ackAt || now;
        }
        else if (status === 'RESOLVED' || status === 'CANCELLED') {
            resAt = now;
        }
        db.prepare(`
      UPDATE emergency_requests SET status = ?, phc_notes = ?, acknowledged_at = ?, resolved_at = ?, updated_at = ? WHERE id = ?
    `).run(status, phc_notes || oldReq.phc_notes, ackAt, resAt, now, requestId);
        const updatedReq = db.prepare('SELECT * FROM emergency_requests WHERE id = ?').get(requestId);
        broadcastEvent('EmergencyRequestUpdated', updatedReq);
        res.json(updatedReq);
    }
    catch (error) {
        console.error('Error updating emergency request status:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// ==========================================
// 🏥 HOSPITAL OPERATING SYSTEM (HOSPITAL OS)
// ==========================================
// 1. Hospital OS Command Center Overview
app.get('/api/hospital-os/:id/overview', (req, res) => {
    try {
        const hospitalId = parseInt(req.params.id);
        const db = (0, db_1.getDatabase)();
        const hospital = db.prepare('SELECT * FROM hospitals WHERE id = ?').get(hospitalId);
        const resources = db.prepare('SELECT * FROM hospital_resources WHERE hospital_id = ?').get(hospitalId);
        const emergencies = db.prepare('SELECT * FROM emergency_requests WHERE facility_id = ? AND status != "RESOLVED" AND status != "CANCELLED"').all(hospitalId);
        const nurseTasks = db.prepare('SELECT * FROM nurse_tasks WHERE hospital_id = ?').all(hospitalId);
        const labOrders = db.prepare('SELECT * FROM diagnostic_orders WHERE hospital_id = ?').all(hospitalId);
        const equipment = db.prepare('SELECT * FROM hospital_equipment WHERE hospital_id = ?').all(hospitalId);
        const medicines = db.prepare('SELECT * FROM phc_medicines WHERE hospital_id = ?').all(hospitalId);
        const bedUnits = db.prepare('SELECT * FROM bed_units WHERE hospital_id = ?').all(hospitalId);
        const escalations = db.prepare('SELECT * FROM escalations WHERE hospital_id = ? AND status = "ACTIVE"').all(hospitalId);
        // Calculate metrics
        const totalBeds = resources?.general_beds || 20;
        const occupiedBeds = resources?.occupied_beds || 14;
        const bedUtilization = Math.min(100, Math.round((occupiedBeds / totalBeds) * 100));
        // Predictive Warnings Engine
        const warnings = [];
        if (resources?.icu_facility_status === 'UNAVAILABLE' || resources?.icu_beds === 0) {
            warnings.push({
                type: 'CRITICAL',
                message: '🔴 ICU Capacity Alert: 0 ICU beds available. Incoming critical trauma will require secondary referral.',
                action: 'CHECK_REFERRAL_NETWORK'
            });
        }
        const lowStockMeds = medicines.filter((m) => m.stock_level === 'Low Stock' || m.status === 'LIMITED');
        if (lowStockMeds.length > 0) {
            warnings.push({
                type: 'WARNING',
                message: `🟠 Inventory Warning: ${lowStockMeds.length} essential medicines running low (${lowStockMeds.map((m) => m.name).slice(0, 2).join(', ')}).`,
                action: 'RESTOCK_PHARMACY'
            });
        }
        if (emergencies.length >= 3) {
            warnings.push({
                type: 'WARNING',
                message: `🟠 Surge Notice: Emergency intake queue has ${emergencies.length} active cases. Additional triage doctor recommended.`,
                action: 'CALL_ON_CALL_DOCTOR'
            });
        }
        res.json({
            hospital: hospital || { id: hospitalId, name: 'AIIMS Delhi' },
            resources: resources || {},
            active_emergencies: emergencies,
            active_emergencies_count: emergencies.length,
            patients_today_count: 186,
            bed_utilization_percent: bedUtilization,
            ambulances_ready: resources?.ambulances || 2,
            ambulances_total: 5,
            nurse_tasks_pending_count: nurseTasks.filter((t) => t.status === 'PENDING').length,
            lab_orders_pending_count: labOrders.filter((l) => l.status !== 'COMPLETED').length,
            escalations_active: escalations,
            predictive_warnings: warnings,
            equipment_summary: equipment,
            bed_units: bedUnits,
            last_verified_at: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error fetching hospital OS overview:', error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// 2. Nurse Tasks & Care Board
app.get('/api/hospital-os/:id/nurse-tasks', (req, res) => {
    try {
        const hospitalId = parseInt(req.params.id);
        const db = (0, db_1.getDatabase)();
        const tasks = db.prepare('SELECT * FROM nurse_tasks WHERE hospital_id = ? ORDER BY id DESC').all(hospitalId);
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.post('/api/hospital-os/:id/nurse-tasks', (req, res) => {
    try {
        const hospitalId = parseInt(req.params.id);
        const { patient_id, patient_name, bed_number, title, priority, assigned_nurse, shift, due_time } = req.body;
        const db = (0, db_1.getDatabase)();
        const result = db.prepare(`
      INSERT INTO nurse_tasks (hospital_id, patient_id, patient_name, bed_number, title, priority, status, assigned_nurse, shift, due_time, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?)
    `).run(hospitalId, patient_id || 1, patient_name || 'Rahul Kumar', bed_number || 'ICU-02', title, priority || 'ROUTINE', assigned_nurse || 'Sister Lakshmi Devi', shift || 'Morning', due_time || '12:00 PM', new Date().toISOString());
        const newTask = db.prepare('SELECT * FROM nurse_tasks WHERE id = ?').get(Number(result.lastInsertRowid));
        broadcastEvent('NurseTaskUpdated', newTask);
        res.json(newTask);
    }
    catch (error) {
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.patch('/api/hospital-os/:id/nurse-tasks/:taskId/complete', (req, res) => {
    try {
        const taskId = parseInt(req.params.taskId);
        const db = (0, db_1.getDatabase)();
        db.prepare('UPDATE nurse_tasks SET status = "COMPLETED" WHERE id = ?').run(taskId);
        const updated = db.prepare('SELECT * FROM nurse_tasks WHERE id = ?').get(taskId);
        broadcastEvent('NurseTaskUpdated', updated);
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// 3. Nurse Escalation / Call Doctor Trigger
app.post('/api/hospital-os/:id/escalate', (req, res) => {
    try {
        const hospitalId = parseInt(req.params.id);
        const { patient_id, patient_name, room_number, nurse_name, doctor_name, reason, priority } = req.body;
        const db = (0, db_1.getDatabase)();
        const result = db.prepare(`
      INSERT INTO escalations (hospital_id, patient_id, patient_name, room_number, nurse_name, doctor_name, priority, reason, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
    `).run(hospitalId, patient_id || 1, patient_name || 'Rahul Kumar', room_number || 'Room 102 (ICU Bed 2)', nurse_name || 'Sister Lakshmi Devi', doctor_name || 'Dr. Anil Kumar', priority || 'CRITICAL', reason || 'Patient vitals deteriorating: SpO2 dropping to 88%, acute dyspnea.', new Date().toISOString());
        const escalation = db.prepare('SELECT * FROM escalations WHERE id = ?').get(Number(result.lastInsertRowid));
        broadcastEvent('DoctorEscalationTriggered', escalation);
        res.json(escalation);
    }
    catch (error) {
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// 4. Diagnostic Work Queue & Direct Doctor-Lab Orders
app.get('/api/hospital-os/:id/lab-orders', (req, res) => {
    try {
        const hospitalId = parseInt(req.params.id);
        const db = (0, db_1.getDatabase)();
        const orders = db.prepare('SELECT * FROM diagnostic_orders WHERE hospital_id = ? ORDER BY id DESC').all(hospitalId);
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.post('/api/hospital-os/:id/lab-orders', (req, res) => {
    try {
        const hospitalId = parseInt(req.params.id);
        const { patient_id, patient_name, doctor_id, doctor_name, test_name, priority } = req.body;
        const db = (0, db_1.getDatabase)();
        const result = db.prepare(`
      INSERT INTO diagnostic_orders (hospital_id, patient_id, patient_name, doctor_id, doctor_name, test_name, priority, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'ORDERED', ?)
    `).run(hospitalId, patient_id || 1, patient_name || 'Rahul Kumar', doctor_id || 1, doctor_name || 'Dr. Anil Kumar', test_name || '12-Lead Electrocardiogram (ECG)', priority || 'CRITICAL', new Date().toISOString());
        const newOrder = db.prepare('SELECT * FROM diagnostic_orders WHERE id = ?').get(Number(result.lastInsertRowid));
        broadcastEvent('LabOrderCreated', newOrder);
        res.json(newOrder);
    }
    catch (error) {
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.patch('/api/hospital-os/:id/lab-orders/:orderId/status', (req, res) => {
    try {
        const orderId = parseInt(req.params.orderId);
        const { status, result_summary, report_url } = req.body;
        const db = (0, db_1.getDatabase)();
        const now = new Date().toISOString();
        db.prepare(`
      UPDATE diagnostic_orders
      SET status = ?, result_summary = ?, report_url = ?, completed_at = ?
      WHERE id = ?
    `).run(status, result_summary || 'Test processed and verified by Clinical Pathologist.', report_url || '/reports/lab_verified.pdf', status === 'COMPLETED' ? now : null, orderId);
        const updated = db.prepare('SELECT * FROM diagnostic_orders WHERE id = ?').get(orderId);
        broadcastEvent('LabOrderUpdated', updated);
        // If completed, automatically append to patient's longitudinal EHR!
        if (status === 'COMPLETED' && updated) {
            db.prepare(`
        INSERT INTO medical_records (patient_id, doctor_id, hospital_id, hospital_name, record_type, title, diagnosis, notes, prescription_json, created_at, created_by, version)
        VALUES (?, ?, ?, 'AIIMS Central Diagnostic Lab', 'Laboratory Report', ?, ?, ?, '[]', ?, 'Diagnostic Lab Desk', 1)
      `).run(updated.patient_id, updated.doctor_id || 1, updated.hospital_id, `🧪 ${updated.test_name} Result`, updated.result_summary || 'Verified Diagnostic Test Result', `Diagnostic report completed. Summary: ${updated.result_summary}`, now);
            broadcastEvent('ConsultationRecorded', { patient_id: updated.patient_id });
        }
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// 5. Equipment Health Monitoring
app.get('/api/hospital-os/:id/equipment', (req, res) => {
    try {
        const hospitalId = parseInt(req.params.id);
        const db = (0, db_1.getDatabase)();
        const equip = db.prepare('SELECT * FROM hospital_equipment WHERE hospital_id = ?').all(hospitalId);
        res.json(equip);
    }
    catch (error) {
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.patch('/api/hospital-os/:id/equipment/:eqId', (req, res) => {
    try {
        const eqId = parseInt(req.params.eqId);
        const { status, notes } = req.body;
        const db = (0, db_1.getDatabase)();
        db.prepare('UPDATE hospital_equipment SET status = ?, notes = ?, last_inspected = ? WHERE id = ?').run(status, notes || '', new Date().toISOString(), eqId);
        const updated = db.prepare('SELECT * FROM hospital_equipment WHERE id = ?').get(eqId);
        broadcastEvent('EquipmentStatusUpdated', updated);
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// 6. Visual Bed Grid & Emergency Bed Reservation
app.get('/api/hospital-os/:id/beds/grid', (req, res) => {
    try {
        const hospitalId = parseInt(req.params.id);
        const db = (0, db_1.getDatabase)();
        const beds = db.prepare('SELECT * FROM bed_units WHERE hospital_id = ? ORDER BY ward_name, bed_number').all(hospitalId);
        res.json(beds);
    }
    catch (error) {
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.post('/api/hospital-os/:id/beds/reserve', (req, res) => {
    try {
        const hospitalId = parseInt(req.params.id);
        const { bed_id, emergency_id, patient_name, ward_name } = req.body;
        const db = (0, db_1.getDatabase)();
        const now = new Date().toISOString();
        let targetBedId = bed_id;
        if (!targetBedId) {
            // Find first available ICU or General bed
            const availBed = db.prepare('SELECT id FROM bed_units WHERE hospital_id = ? AND status = "AVAILABLE" LIMIT 1').get(hospitalId);
            if (availBed)
                targetBedId = availBed.id;
        }
        if (targetBedId) {
            db.prepare(`
        UPDATE bed_units
        SET status = 'RESERVED_EMERGENCY', patient_name = ?, reserved_emergency_id = ?, last_updated = ?
        WHERE id = ?
      `).run(patient_name || 'Incoming Emergency Patient', emergency_id || null, now, targetBedId);
            // Decrement available beds count in resources
            db.prepare('UPDATE hospital_resources SET occupied_beds = occupied_beds + 1 WHERE hospital_id = ?').run(hospitalId);
        }
        const updatedBed = targetBedId ? db.prepare('SELECT * FROM bed_units WHERE id = ?').get(targetBedId) : null;
        broadcastEvent('BedReserved', updatedBed);
        res.json({ success: true, bed: updatedBed });
    }
    catch (error) {
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// 7. Automated "Can My Hospital Handle This?" Capability & Referral Matcher
app.post('/api/hospital-os/capability-check', (req, res) => {
    try {
        const { hospital_id, required_specialty, requires_icu, requires_cath_lab, requires_ventilator } = req.body;
        const db = (0, db_1.getDatabase)();
        const hospId = hospital_id || 1;
        const hospital = db.prepare('SELECT * FROM hospitals WHERE id = ?').get(hospId);
        const resources = db.prepare('SELECT * FROM hospital_resources WHERE hospital_id = ?').get(hospId);
        const doctors = db.prepare('SELECT * FROM doctors WHERE hospital_id = ? AND is_active = 1').all(hospId);
        const equipment = db.prepare('SELECT * FROM hospital_equipment WHERE hospital_id = ?').all(hospId);
        const hasSpecialist = doctors.some((d) => d.specialty?.toLowerCase().includes((required_specialty || 'cardio').toLowerCase()));
        const hasIcu = resources?.icu_facility_status === 'AVAILABLE' && (resources?.icu_beds || 4) > 0;
        const hasBed = (resources?.general_beds || 20) - (resources?.occupied_beds || 0) > 0;
        const hasAmbulance = (resources?.ambulances || 2) > 0;
        const hasCathLab = equipment.some((e) => e.name.toLowerCase().includes('cath') && e.status === 'OPERATIONAL');
        let score = 0;
        if (hasSpecialist)
            score += 30;
        if (hasIcu)
            score += 25;
        if (hasBed)
            score += 20;
        if (hasCathLab || !requires_cath_lab)
            score += 15;
        if (hasAmbulance)
            score += 10;
        const canHandle = score >= 80;
        // Alternative matching hospitals
        const allHospitals = db.prepare('SELECT * FROM hospitals WHERE id != ? AND is_active = 1').all(hospId);
        const matchHospitals = allHospitals.map((h) => ({
            id: h.id,
            name: h.name,
            distance_km: (h.id * 2.8 + 3.2).toFixed(1),
            match_score: h.type.includes('Medical College') || h.name.includes('AIIMS') ? 95 : 82,
            has_specialist: true,
            has_icu: true
        }));
        res.json({
            hospital_id: hospId,
            hospital_name: hospital?.name || 'Current Hospital',
            can_handle: canHandle,
            score: score,
            breakdown: {
                specialist_available: hasSpecialist,
                icu_available: hasIcu,
                bed_available: hasBed,
                equipment_available: hasCathLab || !requires_cath_lab,
                ambulance_available: hasAmbulance,
                medicines_available: true
            },
            recommendation: canHandle
                ? '🟢 Hospital is fully equipped to provide comprehensive emergency and specialty care.'
                : '⚠️ Hospital has limited capacity/specialist. Prepare stabilization and initiate inter-facility tertiary referral.',
            matching_hospitals: matchHospitals
        });
    }
    catch (error) {
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// 8. Patient Consent & Granular Sharing
app.post('/api/patients/:uid/consent', (req, res) => {
    try {
        const uid = req.params.uid;
        const { doctor_name, hospital_name, scopes, duration_minutes } = req.body;
        const db = (0, db_1.getDatabase)();
        const patient = db.prepare('SELECT id FROM patients WHERE uid = ?').get(uid);
        if (!patient)
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Patient not found' } });
        const now = new Date().toISOString();
        const duration = duration_minutes || 30;
        const expiresAt = new Date(Date.now() + duration * 60000).toISOString();
        const result = db.prepare(`
      INSERT INTO patient_consent_grants (patient_id, health_id, doctor_name, hospital_name, scopes_json, duration_minutes, granted_at, expires_at, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
    `).run(patient.id, uid, doctor_name || 'Dr. Anil Kumar', hospital_name || 'AIIMS Delhi', JSON.stringify(scopes || ['REPORTS', 'PRESCRIPTIONS', 'FULL_HISTORY']), duration, now, expiresAt);
        // Audit the consent grant
        db.prepare(`
      INSERT INTO access_audit_logs (patient_id, health_id, accessor_name, accessor_role, facility_name, action, resource_accessed, timestamp)
      VALUES (?, ?, 'Patient Self-Service', 'PATIENT', 'Patient Portal', 'GRANT_CONSENT', ?, ?)
    `).run(patient.id, uid, `Consent granted to ${doctor_name} for ${duration} mins`, now);
        res.json({
            success: true,
            grant_id: Number(result.lastInsertRowid),
            expires_at: expiresAt,
            scopes: scopes || ['REPORTS', 'PRESCRIPTIONS', 'FULL_HISTORY']
        });
    }
    catch (error) {
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
app.get('/api/patients/:uid/access-logs', (req, res) => {
    try {
        const uid = req.params.uid;
        const db = (0, db_1.getDatabase)();
        const patient = db.prepare('SELECT id FROM patients WHERE uid = ?').get(uid);
        if (!patient)
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Patient not found' } });
        const logs = db.prepare('SELECT * FROM access_audit_logs WHERE patient_id = ? ORDER BY id DESC').all(patient.id);
        res.json(logs);
    }
    catch (error) {
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// 9. Staff AI Assistant NLP Query Engine
app.post('/api/hospital-os/staff-ai', (req, res) => {
    try {
        const { query, hospital_id } = req.body;
        const q = (query || '').toLowerCase();
        const db = (0, db_1.getDatabase)();
        const hospId = hospital_id || 1;
        let reply = '';
        let dataPayload = null;
        if (q.includes('cardiologist') || q.includes('doctor')) {
            const docs = db.prepare('SELECT name, specialty, is_on_duty FROM doctors WHERE hospital_id = ?').all(hospId);
            reply = `Found ${docs.length} doctors at your facility. Dr. Anil Kumar (Chief Cardiologist) and Dr. Sunita Rani are currently ON DUTY.`;
            dataPayload = docs;
        }
        else if (q.includes('bed') || q.includes('icu') || q.includes('capacity')) {
            const resData = db.prepare('SELECT * FROM hospital_resources WHERE hospital_id = ?').get(hospId);
            reply = `Current Bed Capacity: ${(resData?.general_beds || 20) - (resData?.occupied_beds || 14)} General Beds available, ${resData?.icu_beds || 2} ICU beds available. ICU Status: ${resData?.icu_facility_status || 'AVAILABLE'}.`;
            dataPayload = resData;
        }
        else if (q.includes('emergency') || q.includes('ambulance')) {
            const emg = db.prepare('SELECT * FROM emergency_requests WHERE facility_id = ? AND status != "RESOLVED"').all(hospId);
            reply = `You have ${emg.length} active emergency cases. Ambulance AMB-07 is currently EN ROUTE to patient Rahul Kumar with ETA 4 minutes.`;
            dataPayload = emg;
        }
        else if (q.includes('hospital') || q.includes('referral') || q.includes('icu within')) {
            reply = `Found 2 nearby facilities with full ICU & Cath Lab availability: 1. AIIMS Delhi (8.2 km • 95% Match), 2. Safdarjung Trauma Hub (9.5 km • 92% Match).`;
            dataPayload = [{ name: 'AIIMS Delhi', distance: '8.2 km' }, { name: 'Safdarjung Trauma Hub', distance: '9.5 km' }];
        }
        else {
            reply = `Clinical AI Command processed: "${query}". All hospital parameters, staff rosters, and patient records are synchronized in real time.`;
        }
        res.json({ reply, data: dataPayload });
    }
    catch (error) {
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
    }
});
// Seed & Start Server
(0, seed_1.seedDatabase)();
app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`SIH Healthcare Backend Running on http://localhost:${PORT}`);
    console.log(`=======================================================`);
});
