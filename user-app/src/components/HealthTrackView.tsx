import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Search,
  FileText,
  Building2,
  Stethoscope,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Lock,
  Layers,
  Check,
  User,
  Info
} from 'lucide-react';
import { Patient, HealthTrack, HealthTrackTask, MedicalRecord } from '../types';

interface HealthTrackViewProps {
  patient: Patient;
  records: MedicalRecord[];
  onFindFacility: (searchQuery: string, module: 'hospitals' | 'diagnostics' | 'doctors') => void;
  onSelectRecord: (record: MedicalRecord) => void;
}

export const HealthTrackView: React.FC<HealthTrackViewProps> = ({
  patient,
  records,
  onFindFacility,
  onSelectRecord
}) => {
  const [tracks, setTracks] = useState<HealthTrack[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Health Tracks for Patient
  useEffect(() => {
    fetchTracks();
  }, [patient.id]);

  const fetchTracks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/health-tracks?patient_id=${patient.id || 1}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setTracks(data);
          setSelectedTrackId(data[0].id);
        } else {
          setFallbackTracks();
        }
      } else {
        setFallbackTracks();
      }
    } catch (e) {
      setFallbackTracks();
    } finally {
      setIsLoading(false);
    }
  };

  const setFallbackTracks = () => {
    // Structured Fallback Data for Manoj
    const activeTrack: HealthTrack = {
      id: 1,
      patient_id: patient.id || 1,
      title: 'Specialist Cardiology Evaluation',
      description: 'Comprehensive cardiac assessment pathway following PHC referral.',
      status: 'IN_PROGRESS',
      progress_percent: 57,
      completed_steps: 4,
      total_steps: 7,
      created_at: '2026-08-18T10:00:00.000Z',
      updated_at: new Date().toISOString(),
      tasks: [
        {
          id: 1,
          health_track_id: 1,
          type: 'CONSULTATION',
          title: '1. PHC Initial Consultation',
          description: 'Primary consultation at Village PHC.',
          status: 'COMPLETED',
          priority: 'ROUTINE',
          required: 1,
          facility_name: 'Village PHC — DEMO',
          doctor_name: 'Dr. Surya',
          record_id: 6,
          completed_at: '2026-08-20T10:00:00.000Z',
          created_at: '2026-08-18T10:00:00.000Z',
          updated_at: '2026-08-20T10:00:00.000Z',
          instructions: 'Initial clinical evaluation completed.'
        },
        {
          id: 2,
          health_track_id: 1,
          type: 'REFERRAL',
          title: '2. Inter-Facility Referral Created',
          description: 'Digital transfer referral generated for AIIMS Delhi.',
          status: 'COMPLETED',
          priority: 'ROUTINE',
          required: 1,
          facility_name: 'AIIMS Delhi — DEMO',
          doctor_name: 'Dr. Surya',
          referral_id: 1,
          completed_at: '2026-08-21T09:00:00.000Z',
          created_at: '2026-08-18T10:30:00.000Z',
          updated_at: '2026-08-21T09:00:00.000Z',
          instructions: 'Specialist referral accepted by AIIMS Cardiology.'
        },
        {
          id: 3,
          health_track_id: 1,
          type: 'PROCEDURE',
          title: '3. Hospital Desk Registration',
          description: 'Patient intake and electronic registration at AIIMS Cardiology.',
          status: 'COMPLETED',
          priority: 'ROUTINE',
          required: 1,
          facility_name: 'AIIMS Delhi — DEMO',
          completed_at: '2026-08-22T08:30:00.000Z',
          created_at: '2026-08-21T09:00:00.000Z',
          updated_at: '2026-08-22T08:30:00.000Z',
          instructions: 'Electronic patient intake completed.'
        },
        {
          id: 4,
          health_track_id: 1,
          type: 'LAB_TEST',
          title: '4. Blood Tests (CBC & Cardiac Biomarkers)',
          description: 'Laboratory evaluation including Trop-I and CBC.',
          status: 'COMPLETED',
          priority: 'ROUTINE',
          required: 1,
          facility_name: 'AIIMS Pathology Laboratory — DEMO',
          doctor_name: 'Dr. Manoj Reddy',
          record_id: 2,
          completed_at: '2026-08-23T11:00:00.000Z',
          created_at: '2026-08-22T08:30:00.000Z',
          updated_at: '2026-08-23T11:00:00.000Z',
          instructions: 'Laboratory samples analyzed and report published.'
        },
        {
          id: 5,
          health_track_id: 1,
          type: 'MRI',
          title: '5. MRI Scan 3T Examination',
          description: 'Urgent 3T Cardiac MRI scan required prior to specialist review.',
          status: 'ACTION_REQUIRED',
          priority: 'URGENT',
          required: 1,
          due_date: '2026-09-05',
          facility_name: 'AIIMS Radiology Department — DEMO',
          doctor_name: 'Dr. Manoj Reddy',
          record_id: 1,
          created_at: '2026-08-23T11:00:00.000Z',
          updated_at: new Date().toISOString(),
          instructions: 'Fast for 4 hours prior to MRI scan. Bring prior ECG & lab reports.'
        },
        {
          id: 6,
          health_track_id: 1,
          type: 'REPORT_REVIEW',
          title: '6. MRI Scan Report Review',
          description: 'Attending radiologist review of 3T MRI scan images.',
          status: 'UPCOMING',
          priority: 'ROUTINE',
          required: 1,
          due_date: '2026-09-07',
          facility_name: 'AIIMS Radiology Department — DEMO',
          doctor_name: 'Dr. Manoj Reddy',
          dependencies: ['5. MRI Scan 3T Examination'],
          created_at: '2026-08-23T11:00:00.000Z',
          updated_at: new Date().toISOString(),
          instructions: 'Awaiting MRI 3T scan completion.'
        },
        {
          id: 7,
          health_track_id: 1,
          type: 'SPECIALIST_CONSULTATION',
          title: '7. Cardiology Specialist Consultation',
          description: 'Final cardiology evaluation and treatment plan with Dr. Manoj Reddy.',
          status: 'UPCOMING',
          priority: 'ROUTINE',
          required: 1,
          due_date: '2026-09-10',
          facility_name: 'AIIMS Cardiology Department — DEMO',
          doctor_name: 'Dr. Manoj Reddy',
          dependencies: ['6. MRI Scan Report Review'],
          created_at: '2026-08-23T11:00:00.000Z',
          updated_at: new Date().toISOString(),
          instructions: 'Awaiting completion of MRI scan report review.'
        }
      ]
    };

    const completedTrack: HealthTrack = {
      id: 2,
      patient_id: patient.id || 1,
      title: 'Routine Diabetes & Lipid Screening',
      description: 'Annual metabolic risk factor evaluation.',
      status: 'COMPLETED',
      progress_percent: 100,
      completed_steps: 3,
      total_steps: 3,
      created_at: '2026-08-10T09:00:00.000Z',
      updated_at: '2026-08-15T16:00:00.000Z',
      completed_at: '2026-08-15T16:00:00.000Z',
      tasks: [
        {
          id: 8,
          health_track_id: 2,
          type: 'CONSULTATION',
          title: 'General Physician Screening',
          description: 'Routine screening for HbA1c and lipid profile.',
          status: 'COMPLETED',
          priority: 'ROUTINE',
          required: 1,
          facility_name: 'Safdarjung Hospital — DEMO',
          doctor_name: 'Dr. Surya',
          record_id: 4,
          completed_at: '2026-08-12T10:00:00.000Z',
          created_at: '2026-08-10T09:00:00.000Z',
          updated_at: '2026-08-12T10:00:00.000Z'
        },
        {
          id: 9,
          health_track_id: 2,
          type: 'LAB_TEST',
          title: 'Fasting Blood Sugar & HbA1c',
          description: 'Glycemic control testing.',
          status: 'COMPLETED',
          priority: 'ROUTINE',
          required: 1,
          facility_name: 'Max Pathology Lab — DEMO',
          record_id: 4,
          completed_at: '2026-08-14T09:00:00.000Z',
          created_at: '2026-08-12T10:00:00.000Z',
          updated_at: '2026-08-14T09:00:00.000Z'
        },
        {
          id: 10,
          health_track_id: 2,
          type: 'TREATMENT',
          title: 'Dietary Consultation & Prescription',
          description: 'Medication and lifestyle guidance.',
          status: 'COMPLETED',
          priority: 'ROUTINE',
          required: 1,
          facility_name: 'Safdarjung Hospital — DEMO',
          doctor_name: 'Dr. Surya',
          record_id: 4,
          completed_at: '2026-08-15T16:00:00.000Z',
          created_at: '2026-08-14T09:00:00.000Z',
          updated_at: '2026-08-15T16:00:00.000Z'
        }
      ]
    };

    setTracks([activeTrack, completedTrack]);
    setSelectedTrackId(1);
  };

  const handleCompleteTask = async (taskId: number) => {
    try {
      const res = await fetch(`/api/health-track-tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facility_name: 'AIIMS Radiology Department' })
      });
      if (res.ok) {
        fetchTracks();
      } else {
        updateLocalTaskStatus(taskId);
      }
    } catch (e) {
      updateLocalTaskStatus(taskId);
    }
  };

  const updateLocalTaskStatus = (taskId: number) => {
    setTracks((prev) =>
      prev.map((track) => {
        if (!track.tasks) return track;
        const updatedTasks = track.tasks.map((t) => {
          if (t.id === taskId) {
            return { ...t, status: 'COMPLETED' as const, completed_at: new Date().toISOString() };
          }
          return t;
        });

        // Unlock next task if dependent
        const completedCount = updatedTasks.filter((t) => t.status === 'COMPLETED').length;
        const percent = Math.round((completedCount / updatedTasks.length) * 100);

        return {
          ...track,
          progress_percent: percent,
          completed_steps: completedCount,
          status: completedCount === updatedTasks.length ? ('COMPLETED' as const) : track.status,
          tasks: updatedTasks
        };
      })
    );
  };

  const selectedTrack = tracks.find((t) => t.id === selectedTrackId) || tracks[0];
  const nextActionTask = selectedTrack?.tasks?.find((t) => t.status === 'ACTION_REQUIRED' || t.status === 'IN_PROGRESS') || selectedTrack?.tasks?.find((t) => t.status === 'UPCOMING');

  if (isLoading) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 shadow-sm">
        <div className="w-8 h-8 border-4 border-[#00695C] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-[#607D8B]">Loading Live Care Journey Pathway...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 relative overflow-hidden">
        <div className="tricolour-strip absolute top-0 left-0 right-0" />
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-[#E0F2F1] text-[#00695C] rounded-2xl border border-[#00695C]/20">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#263238] flex items-center space-x-2">
                <span>🩺 HEALTH TRACK</span>
                <span className="text-[10px] font-bold text-[#00695C] bg-[#E0F2F1] px-2.5 py-0.5 rounded-full border border-[#00695C]/20">
                  LIVE CARE JOURNEY
                </span>
              </h2>
              <p className="text-xs text-[#607D8B] font-semibold">
                Personalized treatment pathway & next action guide for <span className="text-[#00695C] font-bold">{patient.name}</span>
              </p>
            </div>
          </div>

          {/* Active Care Journey Selector Tabs */}
          <div className="flex items-center space-x-2">
            {tracks.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTrackId(t.id)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                  selectedTrackId === t.id
                    ? 'bg-[#00695C] text-white border-[#00695C] shadow'
                    : 'bg-slate-100 hover:bg-slate-200 text-[#263238] border-slate-200'
                }`}
              >
                {t.status === 'COMPLETED' ? '✓ ' : ''}{t.title}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Bar & Summary */}
        {selectedTrack && (
          <div className="bg-[#F7FAF9] p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex flex-wrap items-center justify-between text-xs gap-2">
              <span className="font-extrabold text-[#263238] flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-[#00695C]" />
                <span>Active Journey: {selectedTrack.title}</span>
              </span>

              <div className="flex items-center space-x-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                  selectedTrack.status === 'COMPLETED'
                    ? 'bg-emerald-50 text-[#2E7D32] border-emerald-300'
                    : 'bg-amber-50 text-[#F9A825] border-amber-300'
                }`}>
                  {selectedTrack.status === 'COMPLETED' ? '🟢 JOURNEY COMPLETED' : '🟡 IN PROGRESS'}
                </span>

                <span className="font-mono font-black text-xs text-[#00695C]">
                  {selectedTrack.completed_steps} / {selectedTrack.total_steps} STEPS ({selectedTrack.progress_percent}%)
                </span>
              </div>
            </div>

            {/* Visual Progress Line */}
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-[#00695C] h-full transition-all duration-500 rounded-full"
                style={{ width: `${selectedTrack.progress_percent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* PROMINENT NEXT ACTION CARD (Desktop & Mobile) */}
      {nextActionTask && selectedTrack?.status !== 'COMPLETED' && (
        <div className="bg-white p-6 rounded-3xl border-2 border-[#00695C] shadow-lg space-y-4 relative overflow-hidden ring-4 ring-[#00695C]/10">
          <div className="bg-[#00695C] text-white px-4 py-1.5 rounded-br-2xl text-[10px] font-black tracking-widest uppercase absolute top-0 left-0 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>IMMEDIATE NEXT ACTION REQUIRED</span>
          </div>

          <div className="pt-4 flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 bg-amber-50 text-[#F57C00] border border-amber-300 text-[10px] font-black rounded-full uppercase">
                  {nextActionTask.priority} PRIORITY
                </span>
                {nextActionTask.due_date && (
                  <span className="text-[11px] font-mono text-[#607D8B] font-bold flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-[#00695C]" />
                    <span>Target Due: {nextActionTask.due_date}</span>
                  </span>
                )}
              </div>

              <h3 className="text-xl font-black text-[#263238] flex items-center space-x-2">
                <span>{nextActionTask.title}</span>
              </h3>

              <p className="text-xs text-[#607D8B] font-medium leading-relaxed max-w-xl">
                {nextActionTask.description || nextActionTask.instructions}
              </p>

              {nextActionTask.instructions && (
                <div className="bg-[#E0F2F1] p-3 rounded-2xl border border-[#00695C]/20 text-xs text-[#00695C] font-semibold flex items-start space-x-2 mt-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#00695C]" />
                  <span>Instructions: {nextActionTask.instructions}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => {
                  const type = nextActionTask.type.toLowerCase();
                  if (type.includes('mri') || type.includes('ct') || type.includes('lab') || type.includes('xray')) {
                    onFindFacility(nextActionTask.type, 'diagnostics');
                  } else if (type.includes('doctor') || type.includes('consultation')) {
                    onFindFacility(nextActionTask.title, 'doctors');
                  } else {
                    onFindFacility(nextActionTask.title, 'hospitals');
                  }
                }}
                className="px-5 py-3 bg-[#00695C] hover:bg-[#004D40] text-white rounded-2xl text-xs font-black shadow transition-colors flex items-center justify-center space-x-1.5"
              >
                <Search className="w-4 h-4" />
                <span>🔎 FIND NEARBY FACILITY</span>
              </button>

              <button
                onClick={() => handleCompleteTask(nextActionTask.id)}
                className="px-5 py-3 bg-white hover:bg-slate-50 text-[#00695C] border border-[#00695C] rounded-2xl text-xs font-black shadow-sm transition-colors flex items-center justify-center space-x-1.5"
              >
                <Check className="w-4 h-4 text-[#00695C]" />
                <span>MARK COMPLETED</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VISUAL CARE JOURNEY TIMELINE GRID */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <h3 className="font-black text-lg text-[#263238]">Care Pathway Step-by-Step Timeline</h3>
          <span className="text-xs text-[#607D8B] font-mono">Synced with Authorized EHR Data</span>
        </div>

        <div className="relative space-y-6 before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
          {selectedTrack?.tasks?.map((task, idx) => {
            const isCompleted = task.status === 'COMPLETED';
            const isCurrent = task.status === 'ACTION_REQUIRED' || task.status === 'IN_PROGRESS';
            const isUpcoming = task.status === 'UPCOMING';

            let statusBadge = {
              label: '○ UPCOMING / WAITING',
              badgeClass: 'bg-slate-100 text-[#607D8B] border-slate-300',
              icon: Clock
            };

            if (isCompleted) {
              statusBadge = {
                label: '✓ COMPLETED',
                badgeClass: 'bg-emerald-50 text-[#2E7D32] border-emerald-300',
                icon: CheckCircle2
              };
            } else if (isCurrent) {
              statusBadge = {
                label: '● ACTION REQUIRED',
                badgeClass: 'bg-amber-50 text-[#F57C00] border-amber-300 animate-pulse',
                icon: AlertTriangle
              };
            }

            const StatusIcon = statusBadge.icon;

            // Check if corresponding medical record exists for completed task
            const linkedRecord = task.record_id ? records.find((r) => r.id === task.record_id) : null;

            return (
              <div key={task.id} className="relative pl-12 group">
                {/* Timeline Circle Node */}
                <div className={`absolute left-3 top-1 -translate-x-1/2 w-7 h-7 rounded-full border-2 flex items-center justify-center z-10 transition-all ${
                  isCompleted
                    ? 'bg-[#00695C] border-[#00695C] text-white shadow'
                    : isCurrent
                    ? 'bg-amber-500 border-amber-600 text-white shadow-md ring-4 ring-amber-100'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}>
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : <span className="text-xs font-black">{idx + 1}</span>}
                </div>

                {/* Task Card Box */}
                <div className={`p-5 rounded-3xl border transition-all space-y-3 ${
                  isCurrent
                    ? 'bg-white border-[#00695C] shadow-md ring-2 ring-[#00695C]/20'
                    : isCompleted
                    ? 'bg-[#F7FAF9] border-slate-200'
                    : 'bg-white border-slate-200 opacity-85'
                }`}>
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold text-[#00695C] uppercase bg-[#E0F2F1] px-2 py-0.5 rounded border border-[#00695C]/20">
                          {task.type}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${statusBadge.badgeClass}`}>
                          {statusBadge.label}
                        </span>
                      </div>

                      <h4 className="font-black text-[#263238] text-base mt-1.5">{task.title}</h4>
                      {task.description && <p className="text-xs text-[#607D8B] mt-0.5">{task.description}</p>}
                    </div>

                    {isCompleted && task.completed_at && (
                      <span className="text-[11px] font-mono text-[#2E7D32] font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Completed: {new Date(task.completed_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Details Grid */}
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {task.facility_name && (
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-3.5 h-3.5 text-[#00695C] shrink-0" />
                        <span className="text-[#263238] font-semibold">{task.facility_name}</span>
                      </div>
                    )}
                    {task.doctor_name && (
                      <div className="flex items-center space-x-2">
                        <Stethoscope className="w-3.5 h-3.5 text-[#1565C0] shrink-0" />
                        <span className="text-[#263238] font-semibold">Attending: {task.doctor_name}</span>
                      </div>
                    )}
                  </div>

                  {/* Dependency Notice for Locked Upcoming Tasks */}
                  {isUpcoming && task.dependencies && task.dependencies.length > 0 && (
                    <div className="bg-slate-100 p-3 rounded-2xl text-[11px] text-[#607D8B] font-semibold flex items-center space-x-2 border border-slate-200">
                      <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>Waiting for completion of: <strong className="text-[#263238]">{task.dependencies.join(', ')}</strong></span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 pt-1">
                    {linkedRecord && (
                      <button
                        onClick={() => onSelectRecord(linkedRecord)}
                        className="px-4 py-2 bg-[#E0F2F1] hover:bg-[#00695C] text-[#00695C] hover:text-white rounded-xl text-xs font-black border border-[#00695C]/30 shadow-sm transition-colors flex items-center space-x-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>[ VIEW LINKED REPORT ]</span>
                      </button>
                    )}

                    {isCurrent && (
                      <button
                        onClick={() => {
                          const type = task.type.toLowerCase();
                          if (type.includes('mri') || type.includes('ct') || type.includes('lab')) {
                            onFindFacility(task.type, 'diagnostics');
                          } else {
                            onFindFacility(task.title, 'hospitals');
                          }
                        }}
                        className="px-4 py-2 bg-[#00695C] hover:bg-[#004D40] text-white rounded-xl text-xs font-black shadow transition-colors flex items-center space-x-1.5"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>FIND FACILITY</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
