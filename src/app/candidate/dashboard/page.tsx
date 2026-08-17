'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Search, 
  ClipboardList, 
  Calendar, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2,
  Loader2 
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface Application {
  id: string;
  status: string;
  matchScore: number;
  job: { id: string; title: string; location: string };
  screenings: Array<{ id: string; status: string }>;
}

interface CandidateData {
  name: string;
  email: string;
  applications: Application[];
}

export default function CandidateDashboard() {
  const [cand, setCand] = useState<CandidateData | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    async function loadCandidateDashboard() {
      try {
        const res = await fetch('/api/candidates');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch candidate details');

        setCand(data.candidate);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || 'Error loading candidate portal.');
      } finally {
        setLoading(false);
      }
    }

    loadCandidateDashboard();
  }, [toast]);

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 className="spinner" size={40} />
        <p>Loading candidate file...</p>
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

  const activeApp = cand?.applications[0];
  const pendingScreening = activeApp?.status === 'SHORTLISTED' || activeApp?.status === 'AI_SCREENING';
  const readyForInterview = activeApp?.status === 'INTERVIEW';

  const getStatusDetails = (status?: string) => {
    switch (status) {
      case 'APPLIED':
        return { text: 'Applied', color: 'var(--info)', desc: 'Your CV is successfully received. Recruiter match analysis pending.' };
      case 'UNDER_REVIEW':
        return { text: 'Under Review', color: 'var(--primary)', desc: 'Our recruiter team is currently reviewing your profile.' };
      case 'SHORTLISTED':
      case 'AI_SCREENING':
        return { text: 'AI Screening Pending', color: 'var(--warning)', desc: 'Action required: Complete your automated AI recruiter screening round.' };
      case 'INTERVIEW':
        return { text: 'Interview Stage', color: 'var(--primary)', desc: 'Action required: Select an interview slot to speak with our technical leads.' };
      case 'SELECTED':
      case 'HIRED':
        return { text: 'Selected / Hired', color: 'var(--success)', desc: 'Congratulations! An offer package has been extended to you.' };
      case 'REJECTED':
        return { text: 'Closed', color: 'var(--error)', desc: 'Thank you for your interest. We will not be advancing your application.' };
      default:
        return { text: 'No Active Applications', color: 'var(--text-muted)', desc: 'Browse and apply for open positions.' };
    }
  };

  const status = getStatusDetails(activeApp?.status);

  return (
    <div className="candidate-dashboard-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Candidate Space</h1>
          <p className="page-subtitle">Welcome, {cand?.name || 'Talent'}. Manage your submissions.</p>
        </div>
      </div>

      {/* Action Banners */}
      {pendingScreening && activeApp && (
        <div className="card action-banner banner-warning mb-24">
          <AlertCircle size={20} className="banner-icon" />
          <div className="banner-content">
            <h4>AI Screening Round Available</h4>
            <p>You have been advanced to the first-round automated assessment for <strong>{activeApp.job.title}</strong>.</p>
            <Link href="/candidate/screening" className="btn btn-primary btn-sm mt-8">
              <span>Start AI Interview</span> <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {readyForInterview && activeApp && (
        <div className="card action-banner banner-info mb-24">
          <Calendar size={20} className="banner-icon text-primary" />
          <div className="banner-content">
            <h4>Select Your Interview Slot</h4>
            <p>An interview invitation is extended for the <strong>{activeApp.job.title}</strong> position. Select your date.</p>
            <Link href="/candidate/interviews" className="btn btn-primary btn-sm mt-8">
              <span>Schedule Interview</span> <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* Status summary */}
      <div className="grid-profile mb-24">
        <div className="card status-summary-card">
          <div className="card-header">
            <h4>Application Status</h4>
            <span className="badge badge-primary">{activeApp ? 'Active Application' : 'Open'}</span>
          </div>

          <div className="status-details-block mt-20">
            {activeApp && (
              <div className="target-position mb-16">
                <span>Position</span>
                <h3>{activeApp.job.title}</h3>
                <small>{activeApp.job.location}</small>
              </div>
            )}

            <div className="status-badge-row">
              <span>Current Status</span>
              <div className="badge badge-pill mt-4" style={{ background: status.color + '15', color: status.color, border: `1px solid ${status.color}30` }}>
                {status.text}
              </div>
            </div>

            <p className="status-description-text mt-16">{status.desc}</p>
          </div>
        </div>

        {/* Quick navigations cards */}
        <div className="quick-links-column">
          <div className="card nav-quick-card mb-16">
            <ClipboardList className="nav-icon" size={20} />
            <div>
              <h4>Search & Apply</h4>
              <p>Explore open roles at our registered organizations.</p>
              <Link href="/candidate/jobs" className="arrow-link mt-8">
                <span>Explore Positions</span> <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="card nav-quick-card">
            <Calendar className="nav-icon" size={20} />
            <div>
              <h4>Interviews Calendar</h4>
              <p>Track scheduled technical assessments and logs.</p>
              <Link href="/candidate/interviews" className="arrow-link mt-8">
                <span>View Appointments</span> <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .action-banner {
          padding: 20px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .banner-warning {
          background: rgba(245, 158, 11, 0.05);
          border-color: rgba(245, 158, 11, 0.25);
        }
        .banner-warning .banner-icon { color: var(--warning); }

        .banner-info {
          background: rgba(99, 102, 241, 0.05);
          border-color: rgba(99, 102, 241, 0.25);
        }

        .banner-content h4 {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-main);
        }

        .banner-content p {
          font-size: 13.5px;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .grid-profile {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 24px;
        }

        @media (max-width: 768px) {
          .grid-profile { grid-template-columns: 1fr; }
        }

        .status-summary-card {
          padding: 24px;
        }

        .target-position span {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: block;
        }

        .target-position h3 {
          font-size: 20px;
          font-weight: 800;
          color: var(--text-main);
          margin-top: 2px;
        }

        .target-position small {
          font-size: 12.5px;
          color: var(--text-secondary);
        }

        .status-badge-row span {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          display: block;
        }

        .status-description-text {
          font-size: 13.5px;
          color: var(--text-secondary);
          line-height: 1.4;
          background: rgba(0, 0, 0, 0.15);
          border: 1px solid var(--border-glass);
          padding: 16px;
          border-radius: var(--radius-md);
        }

        .nav-quick-card {
          padding: 20px;
          display: flex;
          gap: 16px;
        }

        .nav-icon {
          color: var(--primary);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .nav-quick-card h4 {
          font-size: 14.5px;
          font-weight: 700;
          color: var(--text-main);
        }

        .nav-quick-card p {
          font-size: 12.5px;
          color: var(--text-secondary);
          margin-top: 2px;
          line-height: 1.35;
        }

        .arrow-link {
          font-size: 12px;
          font-weight: 600;
          color: var(--primary);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .arrow-link:hover {
          color: var(--text-main);
        }

        .mt-4 { margin-top: 4px; }
        .mt-8 { margin-top: 8px; }
        .mt-16 { margin-top: 16px; }
        .mt-20 { margin-top: 20px; }
        .mb-16 { margin-bottom: 16px; }
        .mb-24 { margin-bottom: 24px; }
      `}</style>
    </div>
  );
}
