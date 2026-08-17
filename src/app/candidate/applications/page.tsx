'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClipboardList, Sparkles, AlertCircle, ChevronRight, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface ApplicationRow {
  id: string;
  status: string;
  matchScore: number;
  recommendation: string;
  createdAt: string;
  job: { title: string; department: string; location: string };
}

export default function CandidateApplicationsPage() {
  const [apps, setApps] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    async function loadApplications() {
      try {
        const res = await fetch('/api/candidates');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch applications');

        setApps(data.candidate?.applications || []);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || 'Error loading application history.');
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, [toast]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPLIED':
        return <span className="badge badge-info">Applied</span>;
      case 'UNDER_REVIEW':
        return <span className="badge badge-primary">Under Review</span>;
      case 'SHORTLISTED':
      case 'AI_SCREENING':
        return <span className="badge badge-warning">AI Screening Pending</span>;
      case 'INTERVIEW':
        return <span className="badge badge-primary">Interview Scheduled</span>;
      case 'SELECTED':
      case 'HIRED':
        return <span className="badge badge-success">Selected</span>;
      case 'REJECTED':
        return <span className="badge badge-danger">Rejected</span>;
      default:
        return <span className="badge badge-secondary">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 className="spinner" size={40} />
        <p>Retrieving your application history...</p>
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
    <div className="candidate-apps-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Applications</h1>
          <p className="page-subtitle">Track submission statuses and recruitment progressions.</p>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Target Position</th>
                <th>Department</th>
                <th>Location</th>
                <th>Applied Date</th>
                <th>Match Score</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((row) => (
                <tr key={row.id}>
                  <td><strong>{row.job.title}</strong></td>
                  <td>{row.job.department}</td>
                  <td>{row.job.location}</td>
                  <td>{new Date(row.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className="badge badge-success">{row.matchScore}%</span>
                  </td>
                  <td>{getStatusBadge(row.status)}</td>
                  <td>
                    {(row.status === 'SHORTLISTED' || row.status === 'AI_SCREENING') ? (
                      <Link href="/candidate/screening" className="btn btn-primary btn-sm">
                        <span>Start Screening</span>
                        <ChevronRight size={12} />
                      </Link>
                    ) : row.status === 'INTERVIEW' ? (
                      <Link href="/candidate/interviews" className="btn btn-primary btn-sm">
                        <span>Book Slot</span>
                        <ChevronRight size={12} />
                      </Link>
                    ) : (
                      <span className="text-muted font-italic font-12">No actions required</span>
                    )}
                  </td>
                </tr>
              ))}
              {apps.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center-empty">
                    You haven't submitted any job applications yet. Go search jobs!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .text-center-empty {
          text-align: center;
          color: var(--text-muted);
          padding: 32px !important;
          font-style: italic;
        }

        .text-muted {
          color: var(--text-muted);
        }

        .font-italic {
          font-style: italic;
        }

        .font-12 {
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
