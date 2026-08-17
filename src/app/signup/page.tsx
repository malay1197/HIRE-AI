'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Zap, Target, ShieldCheck } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'RECRUITER',
    organizationName: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.warning('Please fill in all required fields.');
      return;
    }

    if (formData.role === 'RECRUITER' && !formData.organizationName) {
      toast.warning('Please specify your Organization or Company Name.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      toast.success('Registration successful! Welcome to HireAI.');
      
      router.refresh();

      // Redirect based on role
      if (formData.role === 'CANDIDATE') {
        router.push('/candidate/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to register account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-split-left">
        <Link href="/" className="auth-logo">
          <Sparkles className="logo-icon" size={24} />
          <span>HireAI</span>
        </Link>

        <div className="auth-intro">
          <h2>Hire smarter, screen faster, scale teams effortlessly.</h2>
          <div className="intro-benefits">
            <div className="benefit-row">
              <Zap className="benefit-icon" size={16} />
              <p>Automate resume parsing and matching in seconds.</p>
            </div>
            <div className="benefit-row">
              <Target className="benefit-icon" size={16} />
              <p>Conduct unbiased conversational AI screenings.</p>
            </div>
            <div className="benefit-row">
              <ShieldCheck className="benefit-icon" size={16} />
              <p>Keep audit logs secure and candidate data private.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-split-right">
        <div className="auth-form-card">
          <div className="auth-header">
            <h3>Get Started Today</h3>
            <p>Create your HireAI portal access account.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john.doe@company.com"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">I am joining as a *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-select"
              >
                <option value="RECRUITER">Recruiter / Employer</option>
                <option value="CANDIDATE">Candidate / Job Seeker</option>
              </select>
            </div>

            {formData.role === 'RECRUITER' && (
              <div className="form-group animate-reveal">
                <label className="form-label">Company / Organization Name *</label>
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  placeholder="TechNova Solutions"
                  className="form-input"
                  required
                />
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary btn-full mt-10">
              {loading ? 'Creating Account...' : 'Create Account'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account? <Link href="/login">Sign In</Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        .auth-wrapper {
          display: flex;
          min-height: 100vh;
          width: 100vw;
          overflow: hidden;
        }

        .auth-split-left {
          flex: 1;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-glass);
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .auth-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: var(--text-main);
          font-weight: 800;
          font-size: 20px;
        }

        .logo-icon {
          color: var(--primary);
        }

        .auth-intro {
          margin-bottom: 80px;
        }

        .auth-intro h2 {
          font-size: 32px;
          font-weight: 800;
          line-height: 1.25;
          color: var(--text-main);
          margin-bottom: 32px;
          letter-spacing: -0.02em;
        }

        .intro-benefits {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .benefit-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .benefit-icon {
          color: var(--primary);
        }

        .benefit-row p {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .auth-split-right {
          flex: 1.2;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }

        .auth-form-card {
          max-width: 440px;
          width: 100%;
        }

        .auth-header {
          margin-bottom: 28px;
        }

        .auth-header h3 {
          font-size: 24px;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.01em;
        }

        .auth-header p {
          color: var(--text-secondary);
          font-size: 14px;
          margin-top: 4px;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
        }

        .animate-reveal {
          animation: slideDown 0.25s ease-out;
        }

        .btn-full {
          width: 100%;
        }

        .mt-10 {
          margin-top: 10px;
        }

        .auth-footer-text {
          text-align: center;
          font-size: 13.5px;
          color: var(--text-secondary);
          margin-top: 24px;
        }

        .auth-footer-text a {
          color: var(--primary);
          text-decoration: none;
          font-weight: 600;
        }

        .auth-footer-text a:hover {
          text-decoration: underline;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 900px) {
          .auth-split-left { display: none; }
        }
      `}</style>
    </div>
  );
}
