import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, User, Lock, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: any, patient: any, token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUsername = usernameInput.trim();
    const cleanPassword = passwordInput.trim();

    if (!cleanUsername) {
      setErrorMsg('Please enter your Username or Full Name.');
      return;
    }
    if (!cleanPassword) {
      setErrorMsg('Please enter your Password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, password: cleanPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.error?.message || 'Authentication failed.');
        setIsSubmitting(false);
        return;
      }

      onLoginSuccess(data.user, data.patient, data.token);
    } catch (err) {
      console.error('Login error:', err);
      // Fallback demo session if offline backend
      const randId = Math.floor(1000 + Math.random() * 9000);
      const fallbackPatient = {
        id: randId,
        name: cleanUsername,
        uid: `UID-IND-${randId}-7104`,
        age: 28,
        gender: 'Female',
        blood_group: 'O Positive',
        emergency_contact: 'Emergency Contact (+91-90000-00000)',
        qr_token: `QR-PAT-${randId}-PERMANENT`
      };
      onLoginSuccess({ id: randId, name: cleanUsername, role: 'PATIENT' }, fallbackPatient, `demo-token-${randId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickLoginAs = (demoName: string) => {
    setUsernameInput(demoName);
    setPasswordInput('demo123');

    const randId = Math.floor(1000 + Math.random() * 9000);
    const fallbackPatient = {
      id: randId,
      name: demoName,
      uid: demoName === 'Manoj' ? 'UID-IND-9842-7104' : demoName === 'Ananya' ? 'UID-IND-8812-4401' : `UID-IND-${randId}-7104`,
      age: demoName === 'Manoj' ? 32 : 28,
      gender: demoName === 'Manoj' ? 'Male' : 'Female',
      blood_group: demoName === 'Manoj' ? 'O+' : 'A+',
      emergency_contact: demoName === 'Manoj' ? 'Suresh Kumar (+91-9876500000)' : 'Emergency Contact (+91-90000-00000)',
      qr_token: `QR-PAT-${randId}-PERMANENT`
    };
    onLoginSuccess({ id: randId, name: demoName, role: 'PATIENT' }, fallbackPatient, `demo-token-${randId}`);
  };

  return (
    <div className="min-h-screen bg-[#F7FAF9] text-[#263238] flex flex-col justify-between p-4 sm:p-6 font-sans relative">
      {/* Top Header Banner */}
      <header className="max-w-md mx-auto w-full flex items-center justify-between py-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#00695C] p-2 rounded-xl text-white shadow flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-black text-lg text-[#263238] tracking-tight flex items-center space-x-1.5">
              <span>Sanjeevani Healthcare</span>
              <span className="text-[10px] font-bold text-[#00695C] bg-[#E0F2F1] px-2 py-0.5 rounded border border-[#00695C]/20">
                Citizen Portal
              </span>
            </h1>
            <p className="text-[11px] text-[#607D8B] font-medium">National Health Stack • Official Public Service</p>
          </div>
        </div>

        {/* DEMO MODE Badge */}
        <span className="text-[10px] font-bold text-[#F57C00] bg-amber-50 px-2.5 py-1 rounded-full border border-[#F57C00]/30 uppercase tracking-wider">
          DEMO MODE
        </span>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md mx-auto w-full my-auto py-8 space-y-6">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
          {/* Subtle Tricolour Accent Line at Top of Card */}
          <div className="tricolour-strip absolute top-0 left-0 right-0" />

          <div className="text-center space-y-2 pt-2">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#E0F2F1] text-[#00695C] rounded-2xl border border-[#00695C]/20 mb-1 shadow-sm">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="font-black text-2xl text-[#263238] tracking-tight">Citizen Patient Login</h2>
            <p className="text-xs text-[#607D8B] max-w-xs mx-auto">
              Your Digital Healthcare Companion — Enter your name to access your EHR records & healthcare discovery.
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-2xl text-xs text-[#C62828] text-center font-bold">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Username / Name Input */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-[#263238] flex items-center justify-between">
                <span>Username / Full Name</span>
                <span className="text-[10px] text-[#607D8B] font-normal">Any name accepted in Demo</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#607D8B] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="e.g. Manoj, Rajesh, Surya, Priya, Ananya"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#00695C] rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-[#263238] placeholder-slate-400 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-[#263238] flex items-center justify-between">
                <span>Password</span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] text-[#00695C] hover:underline flex items-center space-x-1 font-bold"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPassword ? 'Hide' : 'Show Password'}</span>
                </button>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#607D8B] absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter any password"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#00695C] rounded-xl py-3 pl-10 pr-10 text-xs font-bold text-[#263238] placeholder-slate-400 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Primary Submit Button (#00695C) */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#00695C] hover:bg-[#004D40] text-white font-extrabold text-xs rounded-xl shadow flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Authenticating Session...' : 'LOG IN TO HEALTHCARE PORTAL'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Pre-Seeded Profiles */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <span className="text-[10px] font-bold text-[#607D8B] uppercase tracking-wider block text-center">
              ⚡ Quick Demo User Shortcuts:
            </span>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Manoj', 'Rajesh Kumar', 'Surya', 'Priya', 'Ananya'].map((demoName) => (
                <button
                  key={demoName}
                  type="button"
                  onClick={() => quickLoginAs(demoName)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-[#E0F2F1] text-[#263238] hover:text-[#00695C] rounded-lg border border-slate-300 text-[11px] font-extrabold transition-colors flex items-center space-x-1"
                >
                  <span>👤</span>
                  <span>{demoName}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Public Health Security Disclaimer Notice */}
        <div className="bg-[#E0F2F1]/50 p-3.5 rounded-2xl border border-[#00695C]/20 text-center space-y-1">
          <span className="text-[11px] font-bold text-[#00695C] block">
            Sanjeevani Public Healthcare Digital Portal
          </span>
          <p className="text-[10px] text-[#607D8B] leading-relaxed">
            In this demo, login accepts any non-empty patient name & password to allow seamless testing of identity isolation and EHR access control.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-md mx-auto w-full text-center text-[10px] text-[#607D8B] py-3">
        Sanjeevani Healthcare Platform • Secure Unified Digital Health Interface © 2026
      </footer>
    </div>
  );
};
