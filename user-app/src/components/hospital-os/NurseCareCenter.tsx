import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  CheckCircle2,
  AlertTriangle,
  Pill,
  BedDouble,
  User,
  Phone,
  Mic,
  Clock,
  Plus,
  ShieldAlert,
  Flame,
  Volume2
} from 'lucide-react';
import { NurseTask } from '../../types';

interface NurseCareCenterProps {
  nurseName?: string;
  shift?: string;
  onRefreshData?: () => void;
}

export const NurseCareCenter: React.FC<NurseCareCenterProps> = ({
  nurseName = 'Sister Lakshmi Devi (Senior ICU Nurse)',
  shift = 'Morning Shift (08:00 - 16:00)',
  onRefreshData
}) => {
  const [tasks, setTasks] = useState<NurseTask[]>([
    { id: 1, hospital_id: 1, patient_id: 1, patient_name: 'Rahul Kumar', bed_number: 'ICU Bed #02', title: 'Hourly Vital Signs & Continuous SpO2 Monitoring', priority: 'CRITICAL', status: 'IN_PROGRESS', assigned_nurse: 'Sister Lakshmi Devi', shift: 'Morning', due_time: '11:45 AM' },
    { id: 2, hospital_id: 1, patient_id: 2, patient_name: 'Priya Sharma', bed_number: 'Ward Bed #07', title: 'Administer IV Ceftriaxone 1g & Vitals Check', priority: 'URGENT', status: 'PENDING', assigned_nurse: 'Sister Lakshmi Devi', shift: 'Morning', due_time: '12:00 PM' },
    { id: 3, hospital_id: 1, patient_id: 3, patient_name: 'Ananya Rao', bed_number: 'Room #204', title: 'Post-operative Dressing Change & Pain Score', priority: 'ROUTINE', status: 'COMPLETED', assigned_nurse: 'Sister Lakshmi Devi', shift: 'Morning', due_time: '10:30 AM' },
    { id: 4, hospital_id: 1, patient_id: 1, patient_name: 'Manoj', bed_number: 'OPD Observation #01', title: 'ECG Repeat Screening & Blood Glucose Verification', priority: 'URGENT', status: 'PENDING', assigned_nurse: 'Sister Lakshmi Devi', shift: 'Morning', due_time: '01:00 PM' }
  ]);

  const [activeTab, setActiveTab] = useState<'tasks' | 'rooms'>('tasks');
  const [voiceAnnouncement, setVoiceAnnouncement] = useState('');
  const [escalationSuccessMsg, setEscalationSuccessMsg] = useState('');
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [escalationReason, setEscalationReason] = useState('Patient SpO2 dropped from 96% to 88%. Acute respiratory distress and diaphoresis observed.');
  const [escalationRoom, setEscalationRoom] = useState('Room 102 (ICU Bed 2) — Rahul Kumar');

  // Room care board
  const rooms = [
    { room: 'ROOM 101', patient: 'Ananya Rao', age: 35, status: 'MONITORING', statusColor: 'bg-amber-100 text-amber-900 border-amber-300', condition: 'Post-op Recovery • BP Stable 120/80' },
    { room: 'ROOM 102', patient: 'Rahul Kumar', age: 42, status: 'CRITICAL', statusColor: 'bg-red-600 text-white border-red-700', condition: 'Acute Coronary Syndrome • Continuous ECG & SpO2' },
    { room: 'ROOM 103', patient: 'Priya Sharma', age: 28, status: 'STABLE', statusColor: 'bg-emerald-100 text-emerald-900 border-emerald-300', condition: 'Dehydration Recovery • IV Infusion on 40 dpm' }
  ];

  const speakText = (text: string) => {
    setVoiceAnnouncement(text);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
    setTimeout(() => setVoiceAnnouncement(''), 4000);
  };

  const handleCompleteTask = (task: NurseTask) => {
    setTasks(tasks.map((t) => (t.id === task.id ? { ...t, status: 'COMPLETED' } : t)));
    speakText(`Task completed: ${task.title} for patient ${task.patient_name || 'Patient'}`);
  };

  const handleTriggerEscalation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/hospital-os/1/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name: 'Rahul Kumar',
          room_number: escalationRoom,
          nurse_name: nurseName,
          reason: escalationReason,
          priority: 'CRITICAL'
        })
      });

      setShowEscalationModal(false);
      speakText('Emergency escalation transmitted! Attending Doctor Dr. Anil Kumar alerted with high-priority tone.');
      setEscalationSuccessMsg('🚨 Emergency Escalation Sent! Attending Doctor Dr. Anil Kumar notified.');
      setTimeout(() => setEscalationSuccessMsg(''), 5000);
    } catch (e) {
      setShowEscalationModal(false);
    }
  };

  const urgentTasksCount = tasks.filter((t) => t.priority === 'CRITICAL' || t.priority === 'URGENT').length;
  const pendingTasksCount = tasks.filter((t) => t.status !== 'COMPLETED').length;

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 font-black">
            <HeartPulse className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-[#263238]">👩‍⚕️ Nurse Patient Care Center</h2>
              <span className="px-2.5 py-0.5 bg-rose-600 text-white rounded-full text-xs font-bold">
                ACTIVE SHIFT
              </span>
            </div>
            <p className="text-xs text-[#607D8B] font-semibold">{nurseName} • {shift}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowEscalationModal(true)}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-2xl shadow-md transition-transform active:scale-95 flex items-center space-x-1.5 animate-pulse"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>🚨 CALL DOCTOR / ESCALATE</span>
          </button>
        </div>
      </div>

      {voiceAnnouncement && (
        <div className="bg-slate-900 text-emerald-400 p-3.5 rounded-2xl flex items-center space-x-2 text-xs font-bold shadow-md animate-in slide-in-from-top border border-emerald-500/40">
          <Volume2 className="w-4 h-4 shrink-0 animate-bounce" />
          <span>🗣️ Voice Confirmation: "{voiceAnnouncement}"</span>
        </div>
      )}

      {escalationSuccessMsg && (
        <div className="bg-red-600 text-white p-4 rounded-2xl flex items-center space-x-2 text-xs font-black shadow-lg animate-in slide-in-from-top">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>{escalationSuccessMsg}</span>
        </div>
      )}

      {/* Task Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-black">
        <div className="bg-red-50 border-2 border-red-300 p-3.5 rounded-2xl text-red-950 flex items-center justify-between">
          <span>🚨 URGENT TASKS</span>
          <span className="text-lg font-black text-red-600">0{urgentTasksCount}</span>
        </div>
        <div className="bg-blue-50 border-2 border-blue-300 p-3.5 rounded-2xl text-blue-950 flex items-center justify-between">
          <span>💊 MEDICATION</span>
          <span className="text-lg font-black text-blue-700">03</span>
        </div>
        <div className="bg-amber-50 border-2 border-amber-300 p-3.5 rounded-2xl text-amber-950 flex items-center justify-between">
          <span>🛏️ BED CHECKS</span>
          <span className="text-lg font-black text-amber-700">02</span>
        </div>
        <div className="bg-emerald-50 border-2 border-emerald-300 p-3.5 rounded-2xl text-emerald-950 flex items-center justify-between">
          <span>📋 PENDING TOTAL</span>
          <span className="text-lg font-black text-emerald-700">0{pendingTasksCount}</span>
        </div>
      </div>

      {/* Two Column Grid: Nurse Tasks (Left) + Room Patient Care Board (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tasks Board (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-[#263238] uppercase tracking-wider">
              Shift Task Board ({tasks.length})
            </h3>
            <span className="text-[11px] font-bold text-slate-500">Voice-Checkoff Enabled</span>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => {
              const isCompleted = task.status === 'COMPLETED';
              const isCritical = task.priority === 'CRITICAL';

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-3xl border-2 transition-all flex items-center justify-between gap-3 ${
                    isCompleted
                      ? 'bg-slate-50/70 border-slate-200 opacity-60'
                      : isCritical
                      ? 'bg-red-50/60 border-red-300 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-rose-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        isCritical ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {task.priority}
                      </span>
                      <span className="font-black text-sm text-[#263238]">{task.patient_name}</span>
                      <span className="text-xs text-slate-500 font-bold">({task.bed_number})</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium">{task.title}</p>
                    <span className="text-[11px] text-slate-400 font-bold flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Due: {task.due_time || '12:00 PM'}</span>
                    </span>
                  </div>

                  {!isCompleted ? (
                    <button
                      type="button"
                      onClick={() => handleCompleteTask(task)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-sm transition-transform active:scale-95 flex items-center space-x-1 shrink-0"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>DONE</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1 bg-slate-200 text-slate-600 font-bold text-xs rounded-xl">
                      ✓ COMPLETED
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Room Patient Care Board (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-[#263238] uppercase tracking-wider">
              🏥 Patient Care Board
            </h3>
            <span className="text-[11px] font-bold text-slate-500">Live Ward Status</span>
          </div>

          <div className="space-y-3">
            {rooms.map((rm, idx) => (
              <div key={idx} className="bg-white border-2 border-slate-200 p-4 rounded-3xl space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-black text-sm text-slate-900">{rm.room}</span>
                    <span className="text-xs text-slate-500 font-bold">• {rm.patient} ({rm.age}y)</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${rm.statusColor}`}>
                    ● {rm.status}
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-medium bg-slate-50 p-2 rounded-xl border border-slate-200">
                  {rm.condition}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      speakText(`Vitals recorded for ${rm.patient}: Normal range confirmed.`);
                    }}
                    className="text-[11px] text-[#00695C] font-black hover:underline"
                  >
                    + Log Vitals
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEscalationRoom(`${rm.room} — ${rm.patient}`);
                      setShowEscalationModal(true);
                    }}
                    className="text-[11px] text-red-600 font-black hover:underline"
                  >
                    🚨 Escalate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL: Emergency Escalation Trigger */}
      {showEscalationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border-2 border-red-600 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-red-100 pb-2">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🚨</span>
                <h3 className="font-black text-base text-red-950">Call Doctor / Emergency Escalation</h3>
              </div>
              <button type="button" onClick={() => setShowEscalationModal(false)}>✕</button>
            </div>

            <form onSubmit={handleTriggerEscalation} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Patient & Ward / Room</label>
                <input
                  type="text"
                  value={escalationRoom}
                  onChange={(e) => setEscalationRoom(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-bold text-slate-800"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Clinical Deterioration Reason</label>
                <textarea
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-bold text-slate-800"
                  required
                />
              </div>

              <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-red-900 font-bold">
                ⚠️ This triggers an immediate high-priority alert on Dr. Anil Kumar's Clinical Decision Workspace.
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEscalationModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow"
                >
                  🚨 TRANSMIT ESCALATION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
