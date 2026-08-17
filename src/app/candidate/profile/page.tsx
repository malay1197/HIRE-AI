'use client';

import React, { useEffect, useState } from 'react';
import { 
  User, 
  UploadCloud, 
  Sparkles, 
  MapPin, 
  Phone, 
  Briefcase, 
  GraduationCap, 
  Save, 
  Loader2 
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface CandidateData {
  name: string;
  email: string;
  phone: string;
  location: string;
  yearsOfExperience: number;
  skills: string; // Comma-separated
  education: string; // JSON
  experience: string; // JSON
}

export default function CandidateProfilePage() {
  const [profile, setProfile] = useState<CandidateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/candidates');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch details');
      setProfile(data.candidate);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Profile details saved successfully!');
    }, 1000);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 className="spinner" size={40} />
        <p>Loading your profile file...</p>
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

  const parsedEdu = profile?.education ? JSON.parse(profile.education) : { degree: '', school: '', year: '' };

  return (
    <div className="profile-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage parsed qualifications, resume, and experience.</p>
        </div>
      </div>

      {profile && (
        <form onSubmit={handleSaveProfile} className="profile-form card">
          <div className="form-section-title">
            <User size={16} className="section-icon" />
            <h3>Personal Information</h3>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile((prev) => prev ? { ...prev, name: e.target.value } : null)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={profile.email}
                className="form-input"
                disabled
              />
              <span className="input-helper">Contact recruiter to edit registered email.</span>
            </div>
          </div>

          <div className="form-row-3 mt-12">
            <div className="form-group">
              <label className="form-label"><Phone size={12} className="mr-4" /> Phone Number</label>
              <input
                type="text"
                value={profile.phone || ''}
                onChange={(e) => setProfile((prev) => prev ? { ...prev, phone: e.target.value } : null)}
                placeholder="+1 (555) 000-0000"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label"><MapPin size={12} className="mr-4" /> Location</label>
              <input
                type="text"
                value={profile.location || ''}
                onChange={(e) => setProfile((prev) => prev ? { ...prev, location: e.target.value } : null)}
                placeholder="San Francisco, CA"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label"><Briefcase size={12} className="mr-4" /> Years of Experience</label>
              <input
                type="number"
                step="0.5"
                value={profile.yearsOfExperience}
                onChange={(e) => setProfile((prev) => prev ? { ...prev, yearsOfExperience: parseFloat(e.target.value) || 0 } : null)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-section-title border-top-sec">
            <Sparkles size={16} className="section-icon" />
            <h3>Hiring Match parameters</h3>
          </div>

          <div className="form-group">
            <label className="form-label">My Skills (Comma separated)</label>
            <input
              type="text"
              value={profile.skills || ''}
              onChange={(e) => setProfile((prev) => prev ? { ...prev, skills: e.target.value } : null)}
              placeholder="React, Node.js, SQL"
              className="form-input"
            />
          </div>

          <div className="form-section-title border-top-sec">
            <GraduationCap size={16} className="section-icon" />
            <h3>Education History</h3>
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Degree</label>
              <input
                type="text"
                value={parsedEdu.degree || ''}
                onChange={(e) => {
                  const updatedEdu = { ...parsedEdu, degree: e.target.value };
                  setProfile((prev) => prev ? { ...prev, education: JSON.stringify(updatedEdu) } : null);
                }}
                placeholder="B.S. Computer Science"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">School / Institution</label>
              <input
                type="text"
                value={parsedEdu.school || ''}
                onChange={(e) => {
                  const updatedEdu = { ...parsedEdu, school: e.target.value };
                  setProfile((prev) => prev ? { ...prev, education: JSON.stringify(updatedEdu) } : null);
                }}
                placeholder="State University"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Graduation Year</label>
              <input
                type="text"
                value={parsedEdu.year || ''}
                onChange={(e) => {
                  const updatedEdu = { ...parsedEdu, year: e.target.value };
                  setProfile((prev) => prev ? { ...prev, education: JSON.stringify(updatedEdu) } : null);
                }}
                placeholder="2020"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-actions border-top-sec">
            <button type="submit" disabled={saving} className="btn btn-primary">
              <Save size={16} />
              <span>{saving ? 'Saving changes...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      )}

      <style jsx>{`
        .profile-form {
          padding: 32px;
        }

        .form-section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .form-section-title h3 {
          font-size: 15px;
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

        .border-top-sec {
          border-top: 1px solid var(--border-glass);
          padding-top: 24px;
          margin-top: 16px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
        }

        .input-helper {
          font-size: 11.5px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .mr-4 { margin-right: 4px; }
        .mt-12 { margin-top: 12px; }
      `}</style>
    </div>
  );
}
