import React, { useState } from 'react';
import { X, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { loginUser, registerUser } from '../api';
import { UserSession, setStoredSession } from '../services/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (session: UserSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('48');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [phone, setPhone] = useState('+91-9876543210');
  const [emergencyContact, setEmergencyContact] = useState('Sita Kumar +91-9876543211');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const fillQuickDemo = (demoType: 'patient' | 'doctor' | 'admin') => {
    setErrorMsg('');
    setMode('login');
    if (demoType === 'patient') {
      setEmail('rajesh@example.com');
      setPassword('patient123');
    } else if (demoType === 'doctor') {
      setEmail('sunita@hospital.org');
      setPassword('doctor123');
    } else if (demoType === 'admin') {
      setEmail('admin@aiims.edu');
      setPassword('admin123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await loginUser({ email, password });
        setStoredSession(res.user);
        if (onLoginSuccess) onLoginSuccess(res.user);
        onClose();
      } else {
        const res = await registerUser({
          email,
          password,
          name,
          age,
          gender,
          blood_group: bloodGroup,
          phone,
          emergency_contact: emergencyContact
        });
        setStoredSession(res.user);
        if (onLoginSuccess) onLoginSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold">{mode === 'login' ? 'Account Sign In' : 'Patient Registration'}</h3>
              <p className="text-xs text-slate-300">Secure access to clinical records & discovery</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-50 p-3 border-b border-slate-200 text-xs flex items-center justify-between">
          <span className="font-bold text-slate-600 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Select Demo Account:</span>
          </span>
          <div className="flex items-center space-x-1">
            <button type="button" onClick={() => fillQuickDemo('patient')} className="px-2 py-0.5 bg-white border border-slate-300 rounded font-bold text-slate-700 hover:bg-emerald-50">Patient</button>
            <button type="button" onClick={() => fillQuickDemo('doctor')} className="px-2 py-0.5 bg-white border border-slate-300 rounded font-bold text-slate-700 hover:bg-emerald-50">Doctor</button>
            <button type="button" onClick={() => fillQuickDemo('admin')} className="px-2 py-0.5 bg-white border border-slate-300 rounded font-bold text-slate-700 hover:bg-emerald-50">Admin</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-xs text-emerald-900 font-semibold mb-3">
                Public registration creates a <strong>Patient Identity</strong> account. Provider and Admin accounts are provisioned via administrative verification.
              </div>

              <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rajesh Kumar"
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-3"
                required
              />

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Age</label>
                  <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full p-2 border border-slate-300 rounded text-xs" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Blood Group</label>
                  <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="w-full p-2 border border-slate-300 rounded text-xs">
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md active:scale-95"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In to Account' : 'Complete Patient Registration'}
          </button>

          <div className="text-center pt-2 text-xs">
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-emerald-700 font-bold hover:underline"
            >
              {mode === 'login' ? "Don't have an account? Register Patient Profile" : 'Already registered? Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
