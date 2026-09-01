import React, { useState } from 'react';
import {
  Users,
  Bed,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Activity,
  HeartPulse,
  Pill,
  FileText,
  User,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { NurseTask } from '../../types';

interface NursePortalViewProps {
  nurseName?: string;
  facilityName: string;
  onRefresh?: () => void;
}

export const NursePortalView: React.FC<NursePortalViewProps> = ({
  nurseName = 'Sister Lakshmi Devi',
  facilityName,
  onRefresh
}) => {
  const [currentShift, setCurrentShift] = useState<'Morning' | 'Evening' | 'Night'>('Morning');

  // Assigned Patients in Ward
  const [assignedPatients, setAssignedPatients] = useState([
    {
      id: 1,
      name: 'Rahul Kumar',
      age: 42,
      bed: 'ICU Bed #02',
      diagnosis: 'Acute Coronary Syndrome',
      status: 'CRITICAL',
      vitals: { bp: '130/85', hr: '82 bpm', spo2: '97%', temp: '98.6°F' },
      medicationDue: 'IV Heparin & Sorbitrate 5mg'
    },
    {
      id: 2,
      name: 'Priya Sharma',
      age: 31,
      bed: 'Ward Bed #07',
      diagnosis: 'Severe Allergic Bronchitis',
      status: 'STABLE',
      vitals: { bp: '118/78', hr: '74 bpm', spo2: '99%', temp: '98.4°F' },
      medicationDue: 'Nebulization Salbutamol'
    },
    {
      id: 3,
      name: 'Venkatesh Rao',
      age: 58,
      bed: 'Ward Bed #11',
      diagnosis: 'Post-op Herniorrhaphy Day 1',
      status: 'STABLE',
      vitals: { bp: '124/82', hr: '76 bpm', spo2: '98%', temp: '99.1°F' },
      medicationDue: 'Tab Tramadol 50mg & Dressing'
    },
    {
      id: 4,
      name: 'Ananya Rao',
      age: 26,
      bed: 'Room #204',
      diagnosis: 'Migraine with Dehydration',
      status: 'OBSERVATION',
      vitals: { bp: '110/70', hr: '70 bpm', spo2: '100%', temp: '98.6°F' },
      medicationDue: 'IV Normal Saline 500ml'
    }
  ]);

  // Tasks Checklist State
  const [tasks, setTasks] = useState<NurseTask[]>([
    {
      id: 1,
      hospital_id: 1,
      patient_id: 1,
      patient_name: 'Rahul Kumar',
      bed_number: 'ICU Bed #02',
      title: 'Hourly Vital Signs & Continuous SpO2 Monitoring',
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      assigned_nurse: nurseName,
      shift: currentShift,
      due_time: '11:45 AM'
    },
    {
      id: 2,
      hospital_id: 1,
      patient_id: 2,
      patient_name: 'Priya Sharma',
      bed_number: 'Ward Bed #07',
      title: 'Administer IV Ceftriaxone 1g & Vitals Check',
      priority: 'URGENT',
      status: 'PENDING',
      assigned_nurse: nurseName,
      shift: currentShift,
      due_time: '12:00 PM'
    },
    {
      id: 3,
      hospital_id: 1,
      patient_id: 3,
      patient_name: 'Venkatesh Rao',
      bed_number: 'Ward Bed #11',
      title: 'Post-operative Surgical Wound Dressing Change',
      priority: 'ROUTINE',
      status: 'PENDING',
      assigned_nurse: nurseName,
      shift: currentShift,
      due_time: '12:30 PM'
    },
    {
      id: 4,
      hospital_id: 1,
      patient_id: 4,
      patient_name: 'Ananya Rao',
      bed_number: 'Room #204',
      title: 'IV Fluid Rate Check & Pain Score Assessment',
      priority: 'ROUTINE',
      status: 'COMPLETED',
      assigned_nurse: nurseName,
      shift: currentShift,
      due_time: '10:30 AM'
    }
  ]);

  // New task input state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskBed, setNewTaskBed] = useState('Ward Bed #07');
  const [newTaskPriority, setNewTaskPriority] = useState<'CRITICAL' | 'URGENT' | 'ROUTINE'>('URGENT');

  const pendingCount = tasks.filter((t) => t.status !== 'COMPLETED').length;
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const criticalPatientsCount = assignedPatients.filter((p) => p.status === 'CRITICAL').length;

  const handleToggleTaskStatus = (taskId: number) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === taskId) {
          const nextStatus = t.status === 'PENDING' ? 'IN_PROGRESS' : t.status === 'IN_PROGRESS' ? 'COMPLETED' : 'PENDING';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: NurseTask = {
      id: Date.now(),
      hospital_id: 1,
      patient_name: newTaskBed.includes('ICU') ? 'Rahul Kumar' : 'Assigned Patient',
      bed_number: newTaskBed,
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      status: 'PENDING',
      assigned_nurse: nurseName,
      shift: currentShift,
      due_time: 'Next 30 mins'
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Nurse Profile & Shift Bar */}
      <div className="bg-gradient-to-r from-teal-700 to-[#00695C] text-white p-6 rounded-3xl shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black shadow-inner border border-white/30">
            👩‍⚕️
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-200 bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-400/30">
                👩‍⚕️ NURSE PORTAL
              </span>
              <span className="text-xs text-teal-100">• {facilityName}</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">{nurseName}</h2>
            <p className="text-xs text-teal-100 font-medium">
              Senior Staff Nurse • Maternal, Critical Care & General Inpatient Ward
            </p>
          </div>
        </div>

        {/* Shift Selector */}
        <div className="flex items-center space-x-2 bg-black/20 p-1.5 rounded-2xl border border-white/20">
          {(['Morning', 'Evening', 'Night'] as const).map((shift) => (
            <button
              key={shift}
              type="button"
              onClick={() => setCurrentShift(shift)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                currentShift === shift
                  ? 'bg-white text-[#00695C] shadow'
                  : 'text-teal-100 hover:text-white'
              }`}
            >
              {shift} Shift
            </button>
          ))}
        </div>
      </div>

      {/* 4 Summary Metric Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#607D8B]">CURRENT SHIFT</span>
            <span className="text-lg">☀️</span>
          </div>
          <span className="text-xl font-black text-[#263238] block">{currentShift} Shift</span>
          <span className="text-[11px] text-[#00695C] font-bold">08:00 AM - 04:00 PM</span>
        </div>

        <div className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#607D8B]">PATIENTS ASSIGNED</span>
            <span className="text-lg">👥</span>
          </div>
          <span className="text-xl font-black text-[#00695C] block">{assignedPatients.length} Patients</span>
          <span className="text-[11px] text-[#607D8B]">General Ward & ICU Bay</span>
        </div>

        <div className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#607D8B]">AVAILABLE BEDS</span>
            <span className="text-lg">🛏️</span>
          </div>
          <span className="text-xl font-black text-[#00695C] block">8 Beds Ready</span>
          <span className="text-[11px] text-[#00695C] font-bold">🟢 Ready for Intake</span>
        </div>

        <div className="bg-white border-2 border-red-200 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-600">CRITICAL PATIENTS</span>
            <span className="text-lg">🚨</span>
          </div>
          <span className="text-xl font-black text-red-600 block">{criticalPatientsCount} Critical</span>
          <span className="text-[11px] text-red-600 font-bold">Continuous SpO2 / ECG</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ASSIGNED PATIENTS LIST WITH VITALS */}
        <div className="lg:col-span-2 bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-black text-[#263238] uppercase tracking-wider flex items-center space-x-2">
              <Users className="w-4 h-4 text-[#00695C]" />
              <span>Assigned Ward Patients & Vitals</span>
            </h3>
            <span className="text-xs text-[#00695C] font-black">{assignedPatients.length} Active Inpatients</span>
          </div>

          <div className="space-y-3">
            {assignedPatients.map((pat) => (
              <div
                key={pat.id}
                className={`p-4 rounded-2xl border-2 transition-all space-y-3 ${
                  pat.status === 'CRITICAL'
                    ? 'border-red-300 bg-red-50/30'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        pat.status === 'CRITICAL'
                          ? 'bg-red-600 animate-ping'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <h4 className="text-sm font-black text-[#263238]">{pat.name}</h4>
                    <span className="text-xs text-slate-500 font-bold">({pat.age} yrs)</span>
                    <span className="text-xs font-bold text-[#00695C] bg-[#E0F2F1] px-2 py-0.5 rounded">
                      {pat.bed}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                      pat.status === 'CRITICAL'
                        ? 'bg-red-100 text-red-700 border-red-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    {pat.status}
                  </span>
                </div>

                {/* Vitals Ribbon */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-normal">BP</span>
                    <span className="text-[#263238]">{pat.vitals.bp}</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-normal">HR</span>
                    <span className="text-[#263238]">{pat.vitals.hr}</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-normal">SpO2</span>
                    <span className={parseInt(pat.vitals.spo2) < 95 ? 'text-red-600' : 'text-emerald-700'}>
                      {pat.vitals.spo2}
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-normal">Temp</span>
                    <span className="text-[#263238]">{pat.vitals.temp}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                  <span className="text-slate-600 flex items-center space-x-1.5">
                    <Pill className="w-3.5 h-3.5 text-[#00695C]" />
                    <span>Next Med: <strong>{pat.medicationDue}</strong></span>
                  </span>
                  <button
                    type="button"
                    onClick={() => alert(`Marked medication administered for ${pat.name}`)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-[#E0F2F1] text-[#00695C] rounded-lg text-[11px] font-black transition-colors"
                  >
                    Administer ✓
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NURSING TASK CHECKLIST */}
        <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-black text-[#263238] uppercase tracking-wider flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#00695C]" />
              <span>Shift Task Checklist</span>
            </h3>
            <div className="flex items-center space-x-1.5 text-xs font-black">
              <span className="text-[#F57C00] bg-amber-50 px-2 py-0.5 rounded">🟠 {pendingCount} Pending</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">🟢 {completedCount} Done</span>
            </div>
          </div>

          {/* Add New Task Form */}
          <form onSubmit={handleAddTask} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add new nursing task..."
              className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-xs font-medium text-[#263238] focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <select
                value={newTaskBed}
                onChange={(e) => setNewTaskBed(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded-xl py-1.5 px-2 text-[11px] font-bold text-[#263238]"
              >
                <option value="ICU Bed #02">ICU Bed #02</option>
                <option value="Ward Bed #07">Ward Bed #07</option>
                <option value="Ward Bed #11">Ward Bed #11</option>
                <option value="Room #204">Room #204</option>
              </select>
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#00695C] text-white rounded-xl text-xs font-black hover:bg-[#004D40] transition-colors"
              >
                + Add Task
              </button>
            </div>
          </form>

          {/* Task List */}
          <div className="space-y-2.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggleTaskStatus(task.id)}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer space-y-1.5 ${
                  task.status === 'COMPLETED'
                    ? 'border-emerald-200 bg-emerald-50/40 opacity-75'
                    : task.status === 'IN_PROGRESS'
                    ? 'border-amber-300 bg-amber-50/40'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start space-x-2">
                    <span className="text-base mt-0.5">
                      {task.status === 'COMPLETED' ? '🟢' : task.status === 'IN_PROGRESS' ? '🟠' : '⚪'}
                    </span>
                    <div>
                      <h5
                        className={`text-xs font-black ${
                          task.status === 'COMPLETED' ? 'line-through text-slate-500' : 'text-[#263238]'
                        }`}
                      >
                        {task.title}
                      </h5>
                      <span className="text-[10px] text-slate-500 font-bold block">
                        {task.patient_name} • {task.bed_number}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-black ${
                      task.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : task.status === 'IN_PROGRESS'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
