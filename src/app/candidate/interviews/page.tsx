'use client';

import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  Phone, 
  MapPin, 
  Check, 
  CheckCircle,
  Loader2,
  User
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface Interview {
  id: string;
  interviewerName: string;
  type: string;
  date: string;
  timeSlot: string;
  status: string;
  application: {
    job: { title: string; organization: { name: string } };
  };
}

interface AvailableSlot {
  id: string;
  date: string;
  time: string;
  jobId: string;
  job: { title: string };
}

interface Application {
  id: string;
  jobId: string;
  status: string;
  job: { title: string };
}

export default function CandidateInterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingSlotId, setBookingSlotId] = useState<string | null>(null);
  const toast = useToast();

  const loadInterviewsData = async () => {
    try {
      const res = await fetch('/api/interviews');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load interviews');

      setInterviews(data.interviews || []);
      setAvailableSlots(data.availableSlots || []);
      setApps(data.applications || []);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error loading interviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInterviewsData();
  }, [toast]);

  const handleBookSlot = async (slot: AvailableSlot) => {
    // Find the candidate's active application ID for this job
    const app = apps.find((a) => a.jobId === slot.jobId);
    if (!app) {
      toast.error('Corresponding job application not found.');
      return;
    }

    setBookingSlotId(slot.id);
    try {
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: slot.id,
          applicationId: app.id,
          type: 'VIDEO', // Default video meeting
          interviewerName: 'Technical Hiring Manager',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to book slot');

      toast.success('Interview appointment booked successfully!');
      // Reload lists
      loadInterviewsData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error booking interview.');
    } finally {
      setBookingSlotId(null);
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
        <p>Loading your appointments...</p>
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

  const hasShortlistedApp = apps.some((a) => a.status === 'SHORTLISTED' || a.status === 'INTERVIEW' || a.status === 'UNDER_REVIEW');

  return (
    <div className="interviews-page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Interviews</h1>
          <p className="page-subtitle">Select slots or review scheduled hiring appointments.</p>
        </div>
      </div>

      <div className="interviews-grid mb-30">
        {/* Left: Scheduled meetings */}
        <div className="meetings-panel">
          <div className="section-header mb-16">
            <h4>My Scheduled Meetings</h4>
          </div>

          <div className="meeting-cards-list">
            {interviews.map((int) => (
              <div key={int.id} className="card meeting-card mb-16">
                <div className="meeting-header">
                  <div>
                    <h5>{int.application.job.organization.name}</h5>
                    <span>{int.application.job.title}</span>
                  </div>
                  {getStatusBadge(int.status)}
                </div>

                <div className="meeting-body mt-12">
                  <div className="info-item">
                    <Calendar size={13} />
                    <span>{new Date(int.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="info-item">
                    <Clock size={13} />
                    <span>{int.timeSlot}</span>
                  </div>
                  <div className="info-item flex-align gap-4">
                    {getTypeIcon(int.type)}
                    <span>{int.type} Meeting</span>
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
                <p className="empty-text">You have no scheduled interview appointments yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Available slots to book */}
        <div className="slots-panel">
          <div className="section-header mb-16">
            <h4>Available Interview Slots</h4>
          </div>

          <div className="card slot-card-container">
            {hasShortlistedApp ? (
              <div className="slots-list">
                {availableSlots.map((slot) => (
                  <div key={slot.id} className="slot-row">
                    <div className="slot-date-time">
                      <strong>{slot.job.title}</strong>
                      <span>{new Date(slot.date).toLocaleDateString()} at {slot.time}</span>
                    </div>
                    <button
                      onClick={() => handleBookSlot(slot)}
                      disabled={bookingSlotId !== null}
                      className="btn btn-primary btn-sm"
                    >
                      {bookingSlotId === slot.id ? 'Booking...' : 'Book Slot'}
                    </button>
                  </div>
                ))}

                {availableSlots.length === 0 && (
                  <p className="empty-text text-center mt-20">No open interview slots are currently configured by the recruiter. We will contact you soon.</p>
                )}
              </div>
            ) : (
              <div className="no-app-state p-16 text-center">
                <p className="empty-text">You need to have an active application advanced to shortlisting or interview status to view availability slots.</p>
              </div>
            )}
          </div>
        </div>
      </div>

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

        .slot-card-container {
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

        .no-app-state {
          font-style: italic;
        }

        .mt-12 { margin-top: 12px; }
        .mt-20 { margin-top: 20px; }
        .mb-16 { margin-bottom: 16px; }
        .mb-30 { margin-bottom: 30px; }
      `}</style>
    </div>
  );
}
