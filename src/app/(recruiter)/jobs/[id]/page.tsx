'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  UploadCloud, 
  Briefcase, 
  MapPin, 
  Clock, 
  Plus, 
  Sparkles,
  Loader2 
} from 'lucide-react';
import { Kanban, KanbanCandidate } from '@/components/ui/Kanban';
import { useToast } from '@/components/ui/Toast';

interface JobDetails {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  skills: string;
  experienceRequired: string;
  description: string;
  status: string;
  organizationId: string;
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;
  const [job, setJob] = useState<JobDetails | null>(null);
  const [candidates, setCandidates] = useState<KanbanCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const loadJobData = useCallback(async () => {
    try {
      const res = await fetch(`/api/jobs/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load job details');

      setJob(data.job);
      setCandidates(data.applications || []);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error loading job details.');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    loadJobData();
  }, [loadJobData]);

  const handleStageChange = async (applicationId: string, newStage: string) => {
    try {
      const res = await fetch('/api/candidates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, status: newStage }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update stage');
      }

      toast.success(`Candidate advanced to ${newStage.replace('_', ' ')}`);
      // Update local state
      setCandidates((prev) =>
        prev.map((c) => (c.id === applicationId ? { ...c, status: newStage } : c))
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error updating candidate stage.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    toast.info(`Uploading ${files.length} resume(s)...`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('jobId', id);

      try {
        const res = await fetch('/api/resumes/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to upload');
        }

        successCount++;
      } catch (err) {
        console.error(err);
        failCount++;
      }
    }

    setUploading(false);

    if (successCount > 0) {
      toast.success(`Successfully uploaded and parsed ${successCount} resume(s).`);
      loadJobData(); // Reload pipeline content
    }
    if (failCount > 0) {
      toast.error(`Failed to upload ${failCount} resume(s).`);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 className="spinner" size={40} />
        <p>Loading candidate pipeline...</p>
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

  if (!job) {
    return (
      <div className="card text-center p-40">
        <h3>Job post not found</h3>
        <p>The job posting you are looking for does not exist or has been deleted.</p>
        <Link href="/jobs" className="btn btn-primary mt-20">Back to Listings</Link>
      </div>
    );
  }

  return (
    <div className="pipeline-wrapper">
      <div className="pipeline-header">
        <Link href="/jobs" className="back-btn-circle mr-16">
          <ArrowLeft size={16} />
        </Link>
        <div className="job-info-header">
          <div className="title-badges">
            <h1 className="page-title">{job.title}</h1>
            <span className="badge badge-primary">{job.department}</span>
          </div>
          <div className="meta-row">
            <div className="meta-item"><MapPin size={13} /> <span>{job.location}</span></div>
            <div className="meta-item"><Clock size={13} /> <span className="capitalize">{job.employmentType.toLowerCase().replace('_', ' ')}</span></div>
            <div className="meta-item"><Briefcase size={13} /> <span>Experience: {job.experienceRequired}</span></div>
          </div>
        </div>
      </div>

      {/* Upload Zone Panel */}
      <div className="card upload-card mb-24">
        <div className="upload-header">
          <div className="sparkle-title">
            <Sparkles className="sparkle-icon" size={16} />
            <h4>AI Resume Parsing Portal</h4>
          </div>
          <p className="upload-subtitle">Drag and drop applicant resumes (PDF/DOCX) below. AI will automatically parse skills, experience, and score suitability.</p>
        </div>

        <div className="dropzone-area">
          <input
            type="file"
            id="resume-files"
            multiple
            accept=".pdf,.docx"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden-file-input"
          />
          <label htmlFor="resume-files" className={`dropzone-label ${uploading ? 'disabled' : ''}`}>
            {uploading ? (
              <>
                <Loader2 className="spinner spinner-margin" size={32} />
                <p>AI Engine is parsing files and computing match scores...</p>
              </>
            ) : (
              <>
                <UploadCloud className="upload-icon" size={36} />
                <p><strong>Click to upload</strong> or drag and drop resumes</p>
                <span>Supports multiple PDF, DOCX (Max 5MB per file)</span>
              </>
            )}
          </label>
        </div>
      </div>

      {/* Pipeline Kanban Board */}
      <div className="pipeline-board-section">
        <div className="section-header">
          <h4>Candidate Pipeline</h4>
          <span className="badge badge-info">{candidates.length} Applicants</span>
        </div>
        <Kanban candidates={candidates} onStageChange={handleStageChange} />
      </div>

      <style jsx>{`
        .pipeline-wrapper {
          display: flex;
          flex-direction: column;
        }

        .pipeline-header {
          display: flex;
          align-items: center;
          margin-bottom: 24px;
        }

        .back-btn-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid var(--border-glass);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .back-btn-circle:hover {
          background: var(--bg-glass);
          color: var(--text-main);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .job-info-header {
          display: flex;
          flex-direction: column;
        }

        .title-badges {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .meta-row {
          display: flex;
          gap: 16px;
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .capitalize {
          text-transform: capitalize;
        }

        .upload-card {
          padding: 24px;
        }

        .upload-header {
          margin-bottom: 16px;
        }

        .sparkle-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .sparkle-title h4 {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-main);
        }

        .sparkle-icon {
          color: var(--primary);
        }

        .upload-subtitle {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .dropzone-area {
          position: relative;
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

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 8px;
        }

        .section-header h4 {
          font-size: 15px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
        }

        .mb-24 { margin-bottom: 24px; }
        .mr-16 { margin-right: 16px; }
      `}</style>
    </div>
  );
}
