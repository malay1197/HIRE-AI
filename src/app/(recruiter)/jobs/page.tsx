'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Users, 
  ChevronRight, 
  Search, 
  Plus, 
  Pause, 
  Play, 
  XCircle, 
  Loader2 
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface JobSummary {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  status: string;
  experienceRequired: string;
  createdAt: string;
  _count?: {
    applications: number;
  };
}

export default function RecruiterJobsList() {
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchJobs = async (query = '') => {
    try {
      const res = await fetch(`/api/jobs?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch jobs');
      setJobs(data.jobs);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error fetching jobs list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [toast]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetchJobs(search);
  };

  const handleToggleStatus = async (jobId: string, currentStatus: string) => {
    let newStatus = 'PUBLISHED';
    if (currentStatus === 'PUBLISHED') newStatus = 'PAUSED';
    else if (currentStatus === 'PAUSED') newStatus = 'PUBLISHED';

    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update job status');
      }

      toast.success(`Job status updated to ${newStatus}`);
      // Update local state
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error toggling job status.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <span className="badge badge-success">Published</span>;
      case 'PAUSED':
        return <span className="badge badge-warning">Paused</span>;
      case 'CLOSED':
        return <span className="badge badge-danger">Closed</span>;
      default:
        return <span className="badge badge-primary">Draft</span>;
    }
  };

  const formatEmploymentType = (type: string) => {
    return type.replace('_', ' ').toLowerCase();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 className="spinner" size={40} />
        <p>Loading talent listings...</p>
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
    <div className="jobs-list-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Jobs & Pipeline</h1>
          <p className="page-subtitle">Manage open positions and candidate pipelines.</p>
        </div>
        <Link href="/jobs/create" className="btn btn-primary">
          <Plus size={16} /> Create Job Post
        </Link>
      </div>

      {/* Search Header */}
      <div className="filter-bar mb-30">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title or department..."
              className="form-input search-input"
            />
          </div>
          <button type="submit" className="btn btn-secondary">Filter</button>
        </form>
      </div>

      {/* Jobs list cards */}
      <div className="jobs-grid">
        {jobs.map((job) => (
          <div key={job.id} className="card job-item-card">
            <div className="job-card-top">
              <div>
                <div className="title-row">
                  <Link href={`/jobs/${job.id}`} className="job-title-link">
                    <h3>{job.title}</h3>
                  </Link>
                  {getStatusBadge(job.status)}
                </div>
                <span className="dept-tag">{job.department}</span>
              </div>

              <div className="job-card-actions">
                <button
                  onClick={() => handleToggleStatus(job.id, job.status)}
                  className="btn btn-secondary btn-sm"
                  title={job.status === 'PUBLISHED' ? 'Pause job' : 'Publish job'}
                >
                  {job.status === 'PUBLISHED' ? <Pause size={14} /> : <Play size={14} />}
                  <span>{job.status === 'PUBLISHED' ? 'Pause' : 'Activate'}</span>
                </button>
                <Link href={`/jobs/${job.id}`} className="btn btn-primary btn-sm">
                  <span>View Pipeline</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            <div className="job-card-meta">
              <div className="meta-item">
                <MapPin size={14} />
                <span>{job.location}</span>
              </div>
              <div className="meta-item">
                <Clock size={14} />
                <span className="capitalize">{formatEmploymentType(job.employmentType)}</span>
              </div>
              <div className="meta-item">
                <Users size={14} />
                <span>Experience: {job.experienceRequired}</span>
              </div>
              <div className="meta-item ml-auto text-highlight">
                <strong>{job._count?.applications ?? 0} applicants</strong>
              </div>
            </div>
          </div>
        ))}

        {jobs.length === 0 && (
          <div className="card empty-jobs-card">
            <Briefcase size={40} className="empty-icon" />
            <h3>No Jobs Found</h3>
            <p>You haven't posted any jobs matching your search parameters yet.</p>
            <Link href="/jobs/create" className="btn btn-primary mt-16">
              Create Your First Job
            </Link>
          </div>
        )}
      </div>

      <style jsx>{`
        .filter-bar {
          display: flex;
          background: var(--bg-surface);
          border: 1px solid var(--border-glass);
          padding: 16px;
          border-radius: var(--radius-md);
        }

        .search-form {
          display: flex;
          gap: 12px;
          width: 100%;
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

        .jobs-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .job-item-card {
          padding: 24px;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .job-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 16px;
          margin-bottom: 16px;
        }

        .title-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .job-title-link {
          text-decoration: none;
        }

        .job-title-link h3 {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-main);
          letter-spacing: -0.01em;
        }

        .job-title-link h3:hover {
          color: var(--primary);
        }

        .dept-tag {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 4px;
          display: block;
        }

        .job-card-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .job-card-meta {
          display: flex;
          gap: 24px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .capitalize {
          text-transform: capitalize;
        }

        .ml-auto { margin-left: auto; }
        .text-highlight { color: var(--primary); font-weight: 600; }

        .empty-jobs-card {
          text-align: center;
          padding: 60px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .empty-icon {
          color: var(--text-muted);
          margin-bottom: 16px;
        }

        .empty-jobs-card h3 {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-main);
        }

        .empty-jobs-card p {
          color: var(--text-secondary);
          max-width: 320px;
          font-size: 13.5px;
          margin-top: 4px;
        }

        .mt-16 { margin-top: 16px; }
        .mb-30 { margin-bottom: 30px; }
      `}</style>
    </div>
  );
}
