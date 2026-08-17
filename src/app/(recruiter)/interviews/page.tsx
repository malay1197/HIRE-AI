'use client';

import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  Phone, 
  MapPin, 
  Plus, 
  User, 
  CheckCircle,
  Loader2 
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';

interface Interview {
  id: string;
  interviewerName: string;
  type: string;
  date: string;
  timeSlot: string;
  status: string;
  application: {
    candidate: { name: string; email: string };
    job: { title: string };
  };
}

interface Slot {
  id: string;
  date: string;
  time: string;
  isBooked: boolean;
}

interface JobOption {
  id: string;
  title: string;
}

export default function RecruiterInterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSlot, setNewSlot] = useState({ date: '', time: '10:00 AM - 11:00 AM' });
  const toast = useToast();

  const loadPageData = async () => {
    try {
      const res = await fetch('/api/interviews');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch interviews');
      setInterviews(data.interviews);

      // Fetch organization jobs for selector
      const jobsRes = await fetch('/api/jobs');
      const jobsData = await jobsRes.json();
      if (jobsRes.ok) {
        setJobs(jobsData.jobs.map((j: any) => ({ id: j.id, title: j.title })));
        if (jobsData.jobs.length > 0) {
          setSelectedJobId(jobsData.jobs[0].id);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error loading interview rosters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, [toast]);

  // Load slots for selected job
  useEffect(() => {
    if (!selectedJobId) return;

    async function loadJobSlots() {
      try {
        const res = await fetch(`/api/interviews?jobId=${selectedJobId}`);
        const data = await res.json();
        if (res.ok) {
          setSlots(data.slots || []);
        }
      } catch (e) {
        console.error(e);
      }
    }

    loadJobSlots();
  }, [selectedJobId]);

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlot.date) {
      toast.warning('Please select a date.');
      return;
    }

    try {
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: selectedJobId,
          date: newSlot.date,
          time: newSlot.time,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create slot');

      toast.success('Interview slot created successfully.');
      setSlots((prev) => [data.slot, ...prev]);
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error creating interview slot.');
    }
  };

  const getTypeIcon = (type: string) => {
    if (type === 'VIDEO') return <Video size={14} />;
    if (type === 'PHONE') return <Phone size={14} />;
    return <MapPin size={14} />;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'SCHEDULED') return <span className="badge badge-primary">Scheduled</span>;
    if (status === 'COMPLETED') return <span className="badge badge-success">Completed</span>;
    return <span className="badge badge-danger">Cancelled</span>;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 className="spinner" size={40} />
        <p>Loading schedule profiles...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 60vh;
            color: var(--text-secondary);
            gap: 12px;
          }
          .spinner {
            animation: spin 1s linear infinite;
            color: var(--primary);
          }
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="interviews-page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Interviews & Scheduling</h1>
          <p className="page-subtitle">Track meetings and manage candidate availability slots.</p>
        </div>
      </div>

      <div className="interviews-grid mb-30">
        {/* Left: Scheduled meetings */}
        <div className="meetings-panel">
          <div className="section-header mb-16">
            <h4>Scheduled Meetings</h4>
          </div>

          <div className="meeting-cards-list">
            {interviews.map((int) => (
              <div key={int.id} className="card meeting-card mb-16">
                <div className="meeting-header">
                  <div>
                    <h5>{int.application.candidate.name}</h5>
                    <span>{int.application.job.title}</span>
                  </div>
                  {getStatusBadge(int.status)}
                </div>

                <div className="meeting-body mt-12">
                  <div className="info-item">
                    <Calendar size={13} />
                    <span>{new Date(int.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="info-item">
                    <Clock size={13} />
                    <span>{int.timeSlot}</span>
                  </div>
                  <div className="info-item flex-align gap-4">
                    {getTypeIcon(int.type)}
                    <span>{int.type}</span>
                  </div>
                  <div className="info-item">
                    <User size={13} />
                    <span>Interviewer: {int.interviewerName}</span>
                  </div>
                </div>
              </div>
            ))}

            {interviews.length === 0 && (
              <div className="card text-center p-32">
                <p className="empty-text">No interviews scheduled yet. Advanced candidates to slot booking.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Available slots manager */}
        <div className="slots-panel">
          <div className="section-header mb-16 flex-between">
            <h4>Availability Slots</h4>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-secondary btn-sm">
              <Plus size={12} /> Add Slot
            </button>
          </div>

          <div className="card slot-manager-card">
            <div className="form-group mb-16">
              <label className="form-label">Selected Position Pipeline</label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="form-select"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </div>

            <div className="slots-list mt-20">
              {slots.map((s) => (
                <div key={s.id} className="slot-row">
                  <div className="slot-date-time">
                    <strong>{new Date(s.date).toLocaleDateString()}</strong>
                    <span>{s.time}</span>
                  </div>
                  {s.isBooked ? (
                    <span className="badge badge-success flex-align gap-4"><CheckCircle size={10} /> Booked</span>
                  ) : (
                    <span className="badge badge-primary">Open</span>
                  )}
                </div>
              ))}

              {slots.length === 0 && (
                <p className="empty-text text-center mt-20">No interview slots added for this position yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CREATE SLOT MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Configure Interview Availability">
        <form onSubmit={handleCreateSlot} className="slot-form">
          <div className="form-group">
            <label className="form-label">Interview Date *</label>
            <input
              type="date"
              value={newSlot.date}
              onChange={(e) => setNewSlot((prev) => ({ ...prev, date: e.target.value }))}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Time Window *</label>
            <select
              value={newSlot.time}
              onChange={(e) => setNewSlot((prev) => ({ ...prev, time: e.target.value }))}
              className="form-select"
            >
              <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
              <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
              <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
              <option value="01:00 PM - 02:00 PM">01:00 PM - 02:00 PM</option>
              <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
              <option value="03:00 PM - 04:00 PM">03:00 PM - 04:00 PM</option>
              <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
            </select>
          </div>

          <div className="form-actions mt-20">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost">Cancel</button>
            <button type="submit" className="btn btn-primary">Add Slot</button>
          </div>
        </form>
      </Modal>

      <style jsx>{`
        .interviews-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 32px;
        }

        @media (max-width: 1024px) {
          .interviews-grid { grid-template-columns: 1fr; }
        }

        .section-header h4 {
          font-size: 15px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-secondary);
          letter-spacing: 0.05em;
        }

        .flex-between {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .flex-align {
          display: flex;
          align-items: center;
        }

        .gap-4 { gap: 4px; }

        .meeting-card {
          padding: 18px 20px;
        }

        .meeting-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .meeting-header h5 {
          font-size: 14.5px;
          font-weight: 700;
          color: var(--text-main);
        }

        .meeting-header span {
          font-size: 11.5px;
          color: var(--text-muted);
        }

        .meeting-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          border-top: 1px solid var(--border-glass);
          padding-top: 12px;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .slot-manager-card {
          padding: 24px;
        }

        .slots-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 400px;
          overflow-y: auto;
        }

        .slot-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(0, 0, 0, 0.15);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-md);
          padding: 12px 16px;
        }

        .slot-date-time {
          display: flex;
          flex-direction: column;
        }

        .slot-date-time strong {
          font-size: 13.5px;
          color: var(--text-main);
        }

        .slot-date-time span {
          font-size: 11.5px;
          color: var(--text-muted);
        }

        .empty-text {
          font-size: 13px;
          color: var(--text-muted);
        }

        .slot-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .mt-12 { margin-top: 12px; }
        .mt-20 { margin-top: 20px; }
        .mb-16 { margin-bottom: 16px; }
        .mb-30 { margin-bottom: 30px; }
      `}</style>
    </div>
  );
}
