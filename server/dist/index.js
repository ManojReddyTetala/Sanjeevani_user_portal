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
// Seed & Start Server
(0, seed_1.seedDatabase)();
app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`SIH Healthcare Backend Running on http://localhost:${PORT}`);
    console.log(`=======================================================`);
});
