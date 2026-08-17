'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Briefcase } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function CreateJobPage() {
  const [formData, setFormData] = useState({
    title: '',
    department: 'Engineering',
    location: 'Remote',
    employmentType: 'FULL_TIME',
    salaryRange: '$120,000 - $150,000',
    experienceRequired: '3+ years',
    skills: '', // Comma-separated
    education: "Bachelor's Degree in Computer Science or equivalent",
    description: '',
    responsibilities: '',
    requirements: '',
    benefits: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.skills || !formData.description) {
      toast.warning('Please enter the job title, skills, and description.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create job');
      }

      toast.success('Job posting created successfully!');
      router.push('/jobs');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error creating job posting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-job-wrapper">
      <div className="page-header">
        <div className="flex-align">
          <Link href="/jobs" className="back-btn-circle mr-16">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="page-title">Create Job Post</h1>
            <p className="page-subtitle">Publish a new position to attract and match talent.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid-form card">
        <div className="form-section-title">
          <Briefcase size={16} className="section-icon" />
          <h3>Basic Job Information</h3>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label">Job Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Senior Frontend Engineer"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Department *</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="form-select"
            >
              <option value="Engineering">Engineering</option>
              <option value="Product Management">Product Management</option>
              <option value="Design & UX">Design & UX</option>
              <option value="Sales & Growth">Sales & Growth</option>
              <option value="Marketing">Marketing</option>
              <option value="Operations & Support">Operations & Support</option>
            </select>
          </div>
        </div>

        <div className="form-row-3">
          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Remote, San Francisco, CA"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Employment Type</label>
            <select
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              className="form-select"
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERN">Intern</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Salary Range</label>
            <input
              type="text"
              name="salaryRange"
              value={formData.salaryRange}
              onChange={handleChange}
              placeholder="e.g. $120,000 - $150,000"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-section-title border-top-sec">
          <Save size={16} className="section-icon" />
          <h3>AI Match Settings & Qualifications</h3>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label">Target Skills (Comma separated) *</label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g. React, Next.js, TypeScript, TailwindCSS, Jest"
              className="form-input"
              required
            />
            <span className="input-helper">Used by matching algorithms to compare candidate profiles.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Required Experience</label>
            <input
              type="text"
              name="experienceRequired"
              value={formData.experienceRequired}
              onChange={handleChange}
              placeholder="e.g. 5+ years"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Minimum Education Requirements</label>
          <input
            type="text"
            name="education"
            value={formData.education}
            onChange={handleChange}
            placeholder="e.g. Bachelor's Degree in Computer Science"
            className="form-input"
          />
        </div>

        <div className="form-section-title border-top-sec">
          <h3>Job Descriptions & Copy</h3>
        </div>

        <div className="form-group">
          <label className="form-label">Job Summary & Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the overall mission, role scope, and expectations..."
            className="form-textarea"
            rows={5}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Core Responsibilities</label>
          <textarea
            name="responsibilities"
            value={formData.responsibilities}
            onChange={handleChange}
            placeholder="List the day-to-day tasks expected of the applicant (one per line)..."
            className="form-textarea"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Key Requirements</label>
          <textarea
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            placeholder="List technical constraints, certifications, or backgrounds..."
            className="form-textarea"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Benefits & Perks</label>
          <textarea
            name="benefits"
            value={formData.benefits}
            onChange={handleChange}
            placeholder="Healthcare details, remote flexibility, equipment budgets..."
            className="form-textarea"
            rows={3}
          />
        </div>

        <div className="form-actions border-top-sec">
          <Link href="/jobs" className="btn btn-secondary">Cancel</Link>
          <button type="submit" disabled={loading} className="btn btn-primary">
            <Save size={16} />
            <span>{loading ? 'Creating Job...' : 'Create & Publish Job'}</span>
          </button>
        </div>
      </form>

      <style jsx>{`
        .create-job-wrapper {
          display: flex;
          flex-direction: column;
        }

        .flex-align {
          display: flex;
          align-items: center;
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

        .grid-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 32px;
        }

        .form-section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }

        .form-section-title h3 {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-main);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .section-icon {
          color: var(--primary);
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .form-row-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        @media (max-width: 768px) {
          .form-row-2, .form-row-3 {
            grid-template-columns: 1fr;
          }
        }

        .input-helper {
          font-size: 11.5px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .border-top-sec {
          border-top: 1px solid var(--border-glass);
          padding-top: 24px;
          margin-top: 12px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .mr-16 { margin-right: 16px; }
      `}</style>
    </div>
  );
}
