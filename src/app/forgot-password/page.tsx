'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.warning('Please enter your email address.');
      return;
    }

    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      setIsSent(true);
      toast.success('Recovery link sent! Check notifications log.');
    }, 1500);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-split-left">
        <Link href="/" className="auth-logo">
          <Sparkles className="logo-icon" size={24} />
          <span>HireAI</span>
        </Link>
        <div className="auth-intro">
          <h2>Recover Account</h2>
          <p className="intro-subtitle">
            Provide your registered email address, and we will send a secure token link to reset your credentials.
          </p>
        </div>
      </div>

      <div className="auth-split-right">
        <div className="auth-form-card">
          <Link href="/login" className="back-link">
            <ArrowLeft size={14} />
            <span>Back to Sign In</span>
          </Link>

          <div className="auth-header">
            <h3>Reset Password</h3>
            <p>We will email you resetting instructions.</p>
          </div>

          {isSent ? (
            <div className="success-state animate-reveal">
              <CheckCircle2 className="success-icon" size={48} />
              <h4>Check Your Email</h4>
              <p>
                We have logged a password reset link for <strong>{email}</strong> in the notifications service.
              </p>
              <Link href="/login" className="btn btn-primary btn-full mt-20">
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="form-input"
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary btn-full mt-10">
                {loading ? 'Sending Link...' : 'Send Reset Link'}
                {!loading && <Send size={14} />}
              </button>
            </form>
          )}
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
          color: var(--text-main);
          margin-bottom: 12px;
        }

        .intro-subtitle {
          color: var(--text-secondary);
          font-size: 15px;
          line-height: 1.5;
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

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 24px;
        }

        .back-link:hover {
          color: var(--text-main);
        }

        .auth-header {
          margin-bottom: 28px;
        }

        .auth-header h3 {
          font-size: 24px;
          font-weight: 800;
          color: var(--text-main);
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

        .success-state {
          text-align: center;
          background: rgba(16, 185, 129, 0.02);
          border: 1px solid rgba(16, 185, 129, 0.15);
          padding: 32px 24px;
          border-radius: var(--radius-lg);
        }

        .success-icon {
          color: var(--success);
          margin-bottom: 16px;
          margin-left: auto;
          margin-right: auto;
        }

        .success-state h4 {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 8px;
        }

        .success-state p {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .btn-full {
          width: 100%;
        }

        .mt-10 { margin-top: 10px; }
        .mt-20 { margin-top: 20px; }

        .animate-reveal {
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 900px) {
          .auth-split-left { display: none; }
        }
      `}</style>
    </div>
  );
}
