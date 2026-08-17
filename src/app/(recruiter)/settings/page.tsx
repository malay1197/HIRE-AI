'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, ShieldAlert, Sparkles, Building, User } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function SettingsPage() {
  const [profile, setProfile] = useState({ name: '', email: '', role: '' });
  const [org, setOrg] = useState({ name: '' });
  const [systemMockMode, setSystemMockMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (res.ok && data.authenticated) {
          setProfile({
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
          });
          setOrg({
            name: data.user.organizationName || 'TechNova Solutions',
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadSettings();
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Settings updated successfully!');
    }, 1000);
  };

  return (
    <div className="settings-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">System Settings</h1>
          <p className="page-subtitle">Configure organization information and portal preferences.</p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="settings-form">
        {/* Profile Card */}
        <div className="card mb-24">
          <div className="card-header">
            <div className="flex-align gap-8">
              <User size={16} className="text-primary" />
              <h4>Recruiter Profile</h4>
            </div>
          </div>
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
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
              <span className="input-helper">Contact system administrator to modify email domains.</span>
            </div>
          </div>
        </div>

        {/* Organization Card */}
        <div className="card mb-24">
          <div className="card-header">
            <div className="flex-align gap-8">
              <Building size={16} className="text-primary" />
              <h4>Organization Details</h4>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input
              type="text"
              value={org.name}
              onChange={(e) => setOrg((prev) => ({ ...prev, name: e.target.value }))}
              className="form-input"
              required
            />
          </div>
        </div>

        {/* AI & System Config */}
        <div className="card mb-24">
          <div className="card-header">
            <div className="flex-align gap-8">
              <Sparkles size={16} className="text-primary" />
              <h4>AI Matching & Service Preferences</h4>
            </div>
          </div>

          <div className="toggle-setting-row">
            <div className="toggle-setting-info">
              <strong>Enable Demo Mode AI Fallbacks</strong>
              <p>Simulate parser extractions, candidate matching matrices, and screening evaluations when OpenAI/Gemini API keys are unconfigured.</p>
            </div>
            <div className="toggle-switch-container">
              <input
                type="checkbox"
                id="mock-switch"
                checked={systemMockMode}
                onChange={() => {
                  setSystemMockMode(!systemMockMode);
                  toast.info(`System Mock Mode set to ${!systemMockMode}`);
                }}
                className="toggle-checkbox"
              />
              <label htmlFor="mock-switch" className="toggle-label-switch" />
            </div>
          </div>

          <div className="info-box-settings mt-20">
            <ShieldAlert size={18} className="text-primary" />
            <p>Database credentials and secret API keys are secured natively inside private environment (.env) files. They are never exposed to browser runtimes.</p>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn btn-primary">
            <Save size={16} />
            <span>{loading ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      <style jsx>{`
        .settings-wrapper {
          display: flex;
          flex-direction: column;
        }

        .settings-form {
          display: flex;
          flex-direction: column;
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        @media (max-width: 768px) {
          .form-row-2 { grid-template-columns: 1fr; }
        }

        .flex-align {
          display: flex;
          align-items: center;
        }

        .gap-8 { gap: 8px; }

        .input-helper {
          font-size: 11.5px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .toggle-setting-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(0, 0, 0, 0.15);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-md);
          padding: 16px 20px;
        }

        .toggle-setting-info {
          max-width: 80%;
        }

        .toggle-setting-info strong {
          font-size: 14px;
          color: var(--text-main);
          display: block;
        }

        .toggle-setting-info p {
          font-size: 12.5px;
          color: var(--text-secondary);
          margin-top: 4px;
          line-height: 1.4;
        }

        .toggle-switch-container {
          position: relative;
        }

        .toggle-checkbox {
          display: none;
        }

        .toggle-label-switch {
          display: block;
          width: 50px;
          height: 26px;
          border-radius: 13px;
          background: var(--bg-glass);
          border: 1px solid var(--border-glass);
          cursor: pointer;
          position: relative;
          transition: background 0.3s ease;
        }

        .toggle-label-switch::after {
          content: '';
          display: block;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--text-secondary);
          position: absolute;
          top: 2px;
          left: 2px;
          transition: transform 0.3s ease, background 0.3s ease;
        }

        .toggle-checkbox:checked + .toggle-label-switch {
          background: var(--primary-glow);
          border-color: var(--primary);
        }

        .toggle-checkbox:checked + .toggle-label-switch::after {
          transform: translateX(24px);
          background: var(--primary);
        }

        .info-box-settings {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          background: var(--bg-glass);
          border: 1px solid var(--border-glass);
          padding: 16px 20px;
          border-radius: var(--radius-md);
        }

        .info-box-settings p {
          font-size: 12.5px;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
        }

        .mt-20 { margin-top: 20px; }
        .mb-24 { margin-bottom: 24px; }
      `}</style>
    </div>
  );
}
