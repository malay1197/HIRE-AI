'use client';

import React, { useEffect, useState } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Search, 
  UploadCloud, 
  ChevronRight, 
  Check, 
  Sparkles,
  Loader2 
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  salaryRange: string;
  experienceRequired: string;
  skills: string;
  description: string;
  requirements: string;
  organization: { name: string };
}

export default function CandidateJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const toast = useToast();

  const loadJobs = async (query = '') => {
    try {
      const res = await fetch(`/api/jobs?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch jobs');
      setJobs(data.jobs || []);

      // Load candidate profile to check already applied jobs
      const profileRes = await fetch('/api/candidates');
      const profileData = await profileRes.json();
      if (profileRes.ok && profileData.candidate?.applications) {
        const ids = profileData.candidate.applications.map((app: any) => app.jobId);
        setAppliedJobIds(ids);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error loading job directories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [toast]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    loadJobs(search);
  };

  const handleOpenApplyModal = (job: Job) => {
    setSelectedJob(job);
    setIsApplyModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedJob) return;

    setUploading(true);
    toast.info('AI Engine is parsing your resume and computing suitability score...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('jobId', selectedJob.id);

    try {
      const res = await fetch('/api/resumes/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to apply');
      }

      toast.success(`Application submitted! AI Match Score: ${data.match.matchScore}%`);
      setAppliedJobIds((prev) => [...prev, selectedJob.id]);
      setIsApplyModalOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error submitting application.');
    } finally {
      setUploading(false);
    }
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
    <div className="candidate-jobs-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Explore Openings</h1>
          <p className="page-subtitle">Find jobs matching your skills and apply with AI resume parsing.</p>
        </div>
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
              placeholder="Search by keywords, skills, or roles..."
              className="form-input search-input"
            />
          </div>
          <button type="submit" className="btn btn-secondary">Search</button>
        </form>
      </div>

      {/* Jobs grid */}
      <div className="jobs-list">
        {jobs.map((job) => {
          const isApplied = appliedJobIds.includes(job.id);
          return (
            <div key={job.id} className="card job-card-cand mb-16">
              <div className="job-card-top-row">
                <div>
                  <span className="org-label">{job.organization.name}</span>
                  <h3>{job.title}</h3>
                  <span className="dept-label">{job.department}</span>
                </div>

                <div>
                  {isApplied ? (
                    <span className="badge badge-success flex-align gap-4">
                      <Check size={12} /> Applied
                    </span>
                  ) : (
                    <button
                      onClick={() => handleOpenApplyModal(job)}
                      className="btn btn-primary"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>

              <p className="job-desc mt-12">{job.description.substring(0, 200)}...</p>

              <div className="job-skills-chips mt-12">
                {job.skills.split(',').map((skill, sidx) => (
                  <span key={sidx} className="skill-chip">{skill.trim()}</span>
                ))}
              </div>

              <div className="job-card-footer mt-16">
                <div className="meta-item"><MapPin size={13} /> <span>{job.location}</span></div>
                <div className="meta-item"><Clock size={13} /> <span className="capitalize">{job.employmentType.toLowerCase().replace('_', ' ')}</span></div>
                <div className="meta-item"><DollarSign size={13} /> <span>{job.salaryRange}</span></div>
                <div className="meta-item ml-auto"><span>Required: {job.experienceRequired}</span></div>
              </div>
            </div>
          );
        })}

        {jobs.length === 0 && (
          <div className="card empty-jobs-card">
            <Briefcase size={40} className="empty-icon" />
            <h3>No Careers Available</h3>
            <p>There are no active openings matching your search criteria right now.</p>
          </div>
        )}
      </div>

      {/* APPLY MODAL */}
      {selectedJob && (
        <Modal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          title={`Apply for ${selectedJob.title}`}
        >
          <div className="apply-modal-content">
            <div className="job-summary-modal mb-16">
              <span>{selectedJob.organization.name}</span>
              <h4>{selectedJob.title}</h4>
              <p className="mt-4">{selectedJob.location} • {selectedJob.salaryRange}</p>
            </div>

            <div className="modal-separator pb-12 mb-16" />

            <div className="dropzone-area">
              <input
                type="file"
                id="cand-resume"
                accept=".pdf,.docx"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden-file-input"
              />
              <label htmlFor="cand-resume" className={`dropzone-label ${uploading ? 'disabled' : ''}`}>
                {uploading ? (
                  <>
                    <Loader2 className="spinner spinner-margin" size={32} />
                    <p>AI Engine is parsing your CV and scoring matching parameters...</p>
                  </>
                ) : (
                  <>
                    <UploadCloud className="upload-icon" size={36} />
                    <p><strong>Click to upload your resume</strong> or drag & drop</p>
                    <span>Supports PDF or DOCX up to 5MB</span>
                  </>
                )}
              </label>
            </div>
          </div>
        </Modal>
      )}

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

        .jobs-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .job-card-cand {
          padding: 24px;
        }

        .job-card-top-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
        }

        .org-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: block;
        }

        .job-card-cand h3 {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-main);
          margin-top: 2px;
        }

        .dept-label {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 2px;
          display: block;
        }

        .job-desc {
          font-size: 13.5px;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .job-skills-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .skill-chip {
          font-size: 10.5px;
          background: var(--bg-glass);
          border: 1px solid var(--border-glass);
          color: var(--text-secondary);
          border-radius: 4px;
          padding: 2px 8px;
        }

        .job-card-footer {
          display: flex;
          gap: 24px;
          font-size: 12.5px;
          color: var(--text-muted);
          border-top: 1px solid var(--border-glass);
          padding-top: 16px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .capitalize {
          text-transform: capitalize;
        }

        .ml-auto { margin-left: auto; }

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

        .flex-align {
          display: flex;
          align-items: center;
        }

        .gap-4 { gap: 4px; }

        /* Modal specific */
        .job-summary-modal h4 {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-main);
          margin-top: 2px;
        }

        .job-summary-modal span {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .job-summary-modal p {
          font-size: 12.5px;
          color: var(--text-secondary);
        }

        .modal-separator {
          border-bottom: 1px solid var(--border-glass);
        }

        .hidden-file-input {
          display: none;
        }

        .dropzone-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px;
          border: 2px dashed var(--border-glass);
          border-radius: var(--radius-md);
          background: rgba(0, 0, 0, 0.15);
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }

        .dropzone-label:hover {
          border-color: var(--primary);
          background: rgba(99, 102, 241, 0.03);
        }

        .dropzone-label.disabled {
          cursor: not-allowed;
          opacity: 0.8;
          border-color: var(--text-muted);
        }

        .upload-icon {
          color: var(--text-muted);
          margin-bottom: 12px;
        }

        .dropzone-label p {
          font-size: 14px;
          color: var(--text-main);
        }

        .dropzone-label span {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .spinner {
          animation: spin 1s linear infinite;
          color: var(--primary);
        }

        .spinner-margin {
          margin-bottom: 12px;
        }

        @keyframes spin { 100% { transform: rotate(360deg); } }

        .pb-12 { padding-bottom: 12px; }
        .mt-12 { margin-top: 12px; }
        .mt-16 { margin-top: 16px; }
        .mb-16 { margin-bottom: 16px; }
        .mb-30 { margin-bottom: 30px; }
      `}</style>
    </div>
  );
}
