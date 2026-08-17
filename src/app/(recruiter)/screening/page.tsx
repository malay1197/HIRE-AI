'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Search, CheckCircle, Clock, ChevronRight, AlertOctagon, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface ScreeningSessionRow {
  id: string; // screening ID
  applicationId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  status: string; // PENDING | COMPLETED
  technicalScore: number;
  communicationScore: number;
  experienceScore: number;
  overallScore: number;
  updatedAt: string;
}

export default function ScreeningLogsPage() {
  const [sessions, setSessions] = useState<ScreeningSessionRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    async function loadScreenings() {
      try {
        const res = await fetch('/api/candidates');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch screenings');

        // Extract screenings from applications
        const rows: ScreeningSessionRow[] = [];
        data.applications.forEach((app: any) => {
          if (app.screenings && app.screenings.length > 0) {
            app.screenings.forEach((sc: any) => {
              rows.push({
                id: sc.id,
                applicationId: app.id,
                candidateId: app.candidate.id,
                candidateName: app.candidate.name,
                candidateEmail: app.candidate.email,
                jobTitle: app.job.title,
                status: sc.status,
                technicalScore: sc.technicalScore,
                communicationScore: sc.communicationScore,
                experienceScore: sc.experienceScore,
                overallScore: sc.overallScore,
                updatedAt: new Date(sc.updatedAt).toLocaleDateString(),
              });
            });
          }
        });

        setSessions(rows);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || 'Error loading AI screening logs.');
      } finally {
        setLoading(false);
      }
    }

    loadScreenings();
  }, [toast]);

  const filteredSessions = sessions.filter((s) => {
    return s.candidateName.toLowerCase().includes(search.toLowerCase()) ||
           s.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
           s.candidateEmail.toLowerCase().includes(search.toLowerCase());
  });

  const getScoreBadgeClass = (score: number) => {
    if (score >= 80) return 'badge-success';
    if (score >= 65) return 'badge-primary';
    if (score >= 50) return 'badge-warning';
    return 'badge-danger';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 className="spinner" size={40} />
        <p>Loading screening transcripts...</p>
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
    <div className="screening-logs-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Screening Sessions</h1>
          <p className="page-subtitle">Track automated first-round interactive assessments.</p>
        </div>
      </div>

      {/* Roster Filters */}
      <div className="filter-bar mb-30">
        <div className="search-input-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by candidate name, email, or job title..."
            className="form-input search-input"
          />
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="card">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Candidate Name</th>
                <th>Target Job Post</th>
                <th>Session Status</th>
                <th>Overall Mark</th>
                <th>Tech Score</th>
                <th>Comm Score</th>
                <th>Completion Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="name-cell">
                      <span className="cand-name-text">{row.candidateName}</span>
                      <small className="cand-email-text">{row.candidateEmail}</small>
                    </div>
                  </td>
                  <td>{row.jobTitle}</td>
                  <td>
                    {row.status === 'COMPLETED' ? (
                      <span className="badge badge-success flex-align gap-4">
                        <CheckCircle size={12} /> Completed
                      </span>
                    ) : (
                      <span className="badge badge-warning flex-align gap-4">
                        <Clock size={12} /> Pending
                      </span>
                    )}
                  </td>
                  <td>
                    {row.status === 'COMPLETED' ? (
                      <span className={`badge ${getScoreBadgeClass(row.overallScore)}`}>
                        {row.overallScore}%
                      </span>
                    ) : (
                      <span className="empty-val">-</span>
                    )}
                  </td>
                  <td>{row.status === 'COMPLETED' ? `${row.technicalScore}%` : '-'}</td>
                  <td>{row.status === 'COMPLETED' ? `${row.communicationScore}%` : '-'}</td>
                  <td>{row.updatedAt}</td>
                  <td>
                    <Link
                      href={`/candidates/${row.candidateId}`}
                      className="btn btn-secondary btn-sm"
                    >
                      <span>Review Report</span>
                      <ChevronRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredSessions.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center-empty">
                    No screening sessions have been initialized yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .filter-bar {
          display: flex;
          background: var(--bg-surface);
          border: 1px solid var(--border-glass);
          padding: 16px;
          border-radius: var(--radius-md);
        }

        .search-input-box {
          position: relative;
          flex: 1;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-input {
          padding-left: 40px;
          width: 100%;
        }

        .name-cell {
          display: flex;
          flex-direction: column;
        }

        .cand-name-text {
          font-weight: 600;
          color: var(--text-main);
        }

        .cand-email-text {
          font-size: 11.5px;
          color: var(--text-muted);
        }

        .flex-align {
          display: flex;
          align-items: center;
        }

        .gap-4 { gap: 4px; }

        .empty-val {
          color: var(--text-muted);
        }

        .text-center-empty {
          text-align: center;
          color: var(--text-muted);
          padding: 32px !important;
          font-style: italic;
        }

        .mb-30 { margin-bottom: 30px; }
      `}</style>
    </div>
  );
}
