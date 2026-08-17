'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, ShieldCheck, HelpCircle, Check } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleDemoFill = (role: 'RECRUITER' | 'CANDIDATE' | 'ADMIN') => {
    if (role === 'RECRUITER') {
      setEmail('recruiter@technova.demo');
      setPassword('Demo123!');
    } else if (role === 'CANDIDATE') {
      setEmail('candidate@technova.demo');
      setPassword('Demo123!');
    } else if (role === 'ADMIN') {
      setEmail('admin@technova.demo');
      setPassword('Demo123!');
    }
    toast.info(`Filled credentials for ${role}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      toast.success('Successfully logged in!');
      router.refresh();

      // Redirect based on role returned
      const role = data.user.role;
      if (role === 'CANDIDATE') {
        router.push('/candidate/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Invalid email or password.');
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
          <h2>Welcome Back</h2>
          <p className="intro-subtitle">
            Sign in to access your recruitment pipeline, analyze match suitability, or continue your screening interview.
          </p>

          <div className="demo-hint-box">
            <h4>💡 Quick Demo Mode</h4>
            <p>Click a role below to automatically fill credentials and test the different portals.</p>
            <div className="demo-btn-group">
              <button onClick={() => handleDemoFill('RECRUITER')} className="demo-btn btn-rec">
                Recruiter Portal
              </button>
              <button onClick={() => handleDemoFill('CANDIDATE')} className="demo-btn btn-cand">
                Candidate Portal
              </button>
              <button onClick={() => handleDemoFill('ADMIN')} className="demo-btn btn-adm">
                Admin Panel
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-split-right">
        <div className="auth-form-card">
          <div className="auth-header">
            <h3>Account Sign In</h3>
            <p>Enter your credentials to access your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="recruiter@technova.demo"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <div className="flex-between">
                <label className="form-label">Password</label>
                <Link href="/forgot-password" className="forgot-link">Forgot?</Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-full mt-10">
              {loading ? 'Signing In...' : 'Sign In'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="auth-footer-text">
            Don't have an account? <Link href="/signup">Sign Up</Link>
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
          margin-bottom: 40px;
        }

        .auth-intro h2 {
          font-size: 32px;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 12px;
          letter-spacing: -0.02em;
        }

        .intro-subtitle {
          color: var(--text-secondary);
          font-size: 15px;
          line-height: 1.5;
          margin-bottom: 32px;
        }

        .demo-hint-box {
          background: rgba(99, 102, 241, 0.03);
          border: 1px solid rgba(99, 102, 241, 0.15);
          padding: 24px;
          border-radius: var(--radius-lg);
        }

        .demo-hint-box h4 {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 6px;
        }

        .demo-hint-box p {
          font-size: 12.5px;
          color: var(--text-secondary);
          margin-bottom: 16px;
        }

        .demo-btn-group {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .demo-btn {
          background: var(--bg-glass);
          border: 1px solid var(--border-glass);
          color: var(--text-main);
          font-family: var(--font-sans);
          font-size: 12px;
          font-weight: 600;
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .demo-btn:hover {
          transform: translateY(-1px);
        }

        .btn-rec:hover { border-color: var(--primary); background: var(--primary-glow); color: var(--primary); }
        .btn-cand:hover { border-color: var(--success); background: var(--success-glow); color: var(--success); }
        .btn-adm:hover { border-color: var(--warning); background: var(--warning-glow); color: var(--warning); }

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

        .flex-between {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .forgot-link {
          font-size: 12px;
          color: var(--text-muted);
          text-decoration: none;
        }

        .forgot-link:hover {
          color: var(--primary);
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

        @media (max-width: 900px) {
          .auth-split-left { display: none; }
        }
      `}</style>
    </div>
  );
}
