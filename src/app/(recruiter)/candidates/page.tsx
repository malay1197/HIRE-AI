'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Sparkles, 
  Filter, 
  ChevronRight, 
  ArrowUpDown, 
  Loader2 
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface CandidateRow {
  id: string; // application ID
  candidateId: string;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  status: string;
  matchScore: number;
  recommendation: string;
  yearsOfExperience: number;
}

export default function CandidatesRoster() {
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchCandidates = async () => {
    try {
      const res = await fetch('/api/candidates');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch candidates');

      // Map backend application array into flat rows
      const rows = data.applications.map((app: any) => ({
        id: app.id,
        candidateId: app.candidate.id,
        name: app.candidate.name,
        email: app.candidate.email,
        phone: app.candidate.phone || 'N/A',
        jobTitle: app.job.title,
        status: app.status,
        matchScore: app.matchScore,
        recommendation: app.recommendation,
        yearsOfExperience: app.candidate.yearsOfExperience || 0,
      }));

      setCandidates(rows);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error fetching candidate profiles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [toast]);

  const filteredRows = candidates.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
                          c.email.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === 'ALL' || c.status === stageFilter;
    return matchesSearch && matchesStage;
  });

  const getScoreBadgeClass = (score: number) => {
    if (score >= 85) return 'badge-success';
    if (score >= 70) return 'badge-primary';
    if (score >= 50) return 'badge-warning';
    return 'badge-danger';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 className="spinner" size={40} />
        <p>Loading candidate roster...</p>
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
    <div className="roster-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Global Candidates</h1>
          <p className="page-subtitle">View and search all active applicant profiles.</p>
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

        <div className="filter-group">
          <Filter size={16} className="filter-icon" />
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="form-select select-filter"
          >
            <option value="ALL">All Pipeline Stages</option>
            <option value="APPLIED">Applied</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="AI_SCREENING">AI Screening</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEW">Interview</option>
            <option value="SELECTED">Selected</option>
            <option value="HIRED">Hired</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Candidates List table */}
      <div className="card">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Candidate Name</th>
                <th>Target Job Post</th>
                <th>Experience</th>
                <th>Pipeline Stage</th>
                <th>AI Match Score</th>
                <th>Fit Recommendation</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="name-cell">
                      <span className="cand-name-text">{row.name}</span>
                      <small className="cand-email-text">{row.email}</small>
                    </div>
                  </td>
                  <td>{row.jobTitle}</td>
                  <td>{row.yearsOfExperience} yrs</td>
                  <td>
                    <span className="badge badge-info">{row.status}</span>
                  </td>
                  <td>
                    <span className={`badge ${getScoreBadgeClass(row.matchScore)}`}>
                      {row.matchScore}%
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${row.recommendation === 'STRONG_MATCH' ? 'badge-success' : row.recommendation === 'MATCH' ? 'badge-primary' : row.recommendation === 'PARTIAL_MATCH' ? 'badge-warning' : 'badge-danger'}`}>
                      {row.recommendation.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <Link href={`/candidates/${row.candidateId}`} className="btn btn-secondary btn-sm">
                      <span>View Profile</span>
                      <ChevronRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center-empty">
                    No candidates found matching the filters.
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
          gap: 16px;
          flex-wrap: wrap;
        }

        .search-input-box {
          position: relative;
          flex: 1;
          min-width: 250px;
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

        .filter-group {
          position: relative;
          display: flex;
          align-items: center;
        }

        .filter-icon {
          position: absolute;
          left: 14px;
          color: var(--text-muted);
          pointer-events: none;
        }

        .select-filter {
          padding-left: 36px;
          min-width: 200px;
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
