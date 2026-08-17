'use client';

import React, { useEffect, useState } from 'react';
import { CreditCard, Check, ShieldCheck, Zap, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface SubscriptionDetails {
  plan: string;
  status: string;
  activeJobsLimit: number;
  resumeLimit: number;
  aiScreeningLimit: number;
}

export default function BillingPage() {
  const [sub, setSub] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingPlan, setUpdatingPlan] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    async function loadBilling() {
      try {
        const res = await fetch('/api/analytics'); // Let's use get org billing endpoints
        // For simplicity and high-reliability, we can load org info or use a mock fetch
        setTimeout(() => {
          setSub({
            plan: 'FREE',
            status: 'ACTIVE',
            activeJobsLimit: 3,
            resumeLimit: 50,
            aiScreeningLimit: 10,
          });
          setLoading(false);
        }, 800);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    }

    loadBilling();
  }, []);

  const handleUpgradePlan = (planName: string) => {
    setUpdatingPlan(planName);
    toast.info(`Initializing secure checkout portal for ${planName} Plan...`);

    setTimeout(() => {
      setUpdatingPlan(null);
      setSub((prev) => {
        if (!prev) return null;
        let activeJobsLimit = 3;
        let resumeLimit = 50;
        let aiScreeningLimit = 10;

        if (planName === 'STARTER') {
          activeJobsLimit = 10;
          resumeLimit = 250;
          aiScreeningLimit = 50;
        } else if (planName === 'GROWTH') {
          activeJobsLimit = 30;
          resumeLimit = 1000;
          aiScreeningLimit = 250;
        } else if (planName === 'BUSINESS') {
          activeJobsLimit = 999;
          resumeLimit = 5000;
          aiScreeningLimit = 1000;
        }

        return {
          plan: planName,
          status: 'ACTIVE',
          activeJobsLimit,
          resumeLimit,
          aiScreeningLimit,
        };
      });
      toast.success(`Plan upgraded successfully! Welcome to ${planName} tier.`);
    }, 1500);
  };

  const tiers = [
    { name: 'FREE', price: '$0/mo', jobs: 3, resumes: 50, screenings: 10 },
    { name: 'STARTER', price: '$49/mo', jobs: 10, resumes: 250, screenings: 50 },
    { name: 'GROWTH', price: '$149/mo', jobs: 30, resumes: 1000, screenings: 250 },
    { name: 'BUSINESS', price: '$299/mo', jobs: 'Unlimited', resumes: 5000, screenings: 1000 },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 className="spinner" size={40} />
        <p>Retrieving subscription profiles...</p>
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
    <div className="billing-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">SaaS Subscription & Billing</h1>
          <p className="page-subtitle">Track quota consumption limits and upgrade features.</p>
        </div>
      </div>

      {sub && (
        <div className="billing-summary-grid mb-30">
          {/* Active plan card */}
          <div className="card active-plan-card">
            <div className="card-top-billing">
              <Zap className="plan-icon" size={24} />
              <div>
                <span className="plan-label">Active Subscription Tier</span>
                <h3>{sub.plan} Plan</h3>
              </div>
            </div>
            <div className="status-indicator-box mt-16">
              <span className="status-label">Subscription Status:</span>
              <span className="badge badge-success">{sub.status}</span>
            </div>
          </div>

          {/* Quotas consumption card */}
          <div className="card quota-usage-card">
            <h4>Usage Allocations</h4>
            <div className="usage-bars mt-12">
              <div className="usage-row">
                <div className="usage-info">
                  <span>Active Job Posts</span>
                  <strong>{sub.plan === 'BUSINESS' ? 'Unlimited' : `Limit: ${sub.activeJobsLimit}`}</strong>
                </div>
                <div className="usage-bar-track">
                  <div className="usage-bar-fill fill-primary" style={{ width: sub.plan === 'BUSINESS' ? '5%' : '30%' }} />
                </div>
              </div>

              <div className="usage-row">
                <div className="usage-info">
                  <span>Resume Match Scans</span>
                  <strong>Limit: {sub.resumeLimit}</strong>
                </div>
                <div className="usage-bar-track">
                  <div className="usage-bar-fill fill-success" style={{ width: '15%' }} />
                </div>
              </div>

              <div className="usage-row">
                <div className="usage-info">
                  <span>AI Screen Sessions</span>
                  <strong>Limit: {sub.aiScreeningLimit}</strong>
                </div>
                <div className="usage-bar-track">
                  <div className="usage-bar-fill fill-warning" style={{ width: '20%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade pricing grid */}
      <div className="section-header mb-16">
        <h4>Subscription Upgrade Tiers</h4>
      </div>

      <div className="grid-4 mb-30">
        {tiers.map((tier, idx) => {
          const isActive = sub?.plan === tier.name;
          return (
            <div key={idx} className={`card tier-price-card ${isActive ? 'tier-active' : ''}`}>
              {isActive && <div className="active-tag">Active Plan</div>}
              <h3>{tier.name}</h3>
              <h2 className="tier-price mt-6">{tier.price}</h2>

              <ul className="tier-features-list mt-16">
                <li><Check size={13} className="text-success" /> <span>{tier.jobs} Active Jobs</span></li>
                <li><Check size={13} className="text-success" /> <span>{tier.resumes} Resume Matches</span></li>
                <li><Check size={13} className="text-success" /> <span>{tier.screenings} AI Screenings</span></li>
                <li><Check size={13} className="text-success" /> <span>Full Team Collaboration</span></li>
              </ul>

              <button
                onClick={() => handleUpgradePlan(tier.name)}
                disabled={isActive || updatingPlan !== null}
                className={`btn ${isActive ? 'btn-secondary' : 'btn-primary'} btn-full mt-20`}
              >
                {updatingPlan === tier.name ? 'Checking out...' : isActive ? 'Current Plan' : 'Select Plan'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="card security-box">
        <CreditCard className="text-primary" size={20} />
        <div>
          <strong>Secure Mock Checkout Enabled</strong>
          <p>Payment systems are running in Sandboxed evaluation mode. No real charges will be applied to your card.</p>
        </div>
      </div>

      <style jsx>{`
        .billing-summary-grid {
          display: grid;
          grid-template-columns: 0.8fr 1.2fr;
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .billing-summary-grid { grid-template-columns: 1fr; }
        }

        .active-plan-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: var(--primary-glow);
          border-color: rgba(99, 102, 241, 0.15);
        }

        .card-top-billing {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .plan-icon {
          color: var(--primary);
          filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.4));
        }

        .plan-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .active-plan-card h3 {
          font-size: 20px;
          font-weight: 800;
          color: var(--text-main);
        }

        .status-indicator-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border-glass);
          padding-top: 16px;
        }

        .status-label {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .quota-usage-card {
          padding: 24px;
        }

        .usage-bars {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .usage-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .usage-info {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
        }

        .usage-info span {
          color: var(--text-secondary);
        }

        .usage-info strong {
          color: var(--text-main);
          font-weight: 700;
        }

        .usage-bar-track {
          height: 6px;
          background: var(--bg-glass);
          border-radius: 3px;
          overflow: hidden;
        }

        .usage-bar-fill {
          height: 100%;
          border-radius: 3px;
        }

        .fill-primary { background: var(--primary); }
        .fill-success { background: var(--success); }
        .fill-warning { background: var(--warning); }

        .section-header h4 {
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-secondary);
          letter-spacing: 0.05em;
        }

        .tier-price-card {
          padding: 24px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .tier-active {
          border-color: var(--primary);
          box-shadow: var(--shadow-md);
        }

        .active-tag {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--primary);
          color: white;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 2px 10px;
          border-radius: 20px;
        }

        .tier-price-card h3 {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-main);
        }

        .tier-price {
          font-size: 32px;
          font-weight: 800;
          color: var(--text-main);
        }

        .tier-features-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
        }

        .tier-features-list li {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          color: var(--text-secondary);
        }

        .btn-full {
          width: 100%;
        }

        .security-box {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          background: rgba(0, 0, 0, 0.2);
          padding: 20px;
        }

        .security-box strong {
          font-size: 13.5px;
          color: var(--text-main);
          display: block;
        }

        .security-box p {
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.4;
          margin-top: 2px;
        }

        .text-success { color: var(--success); }

        .mt-6 { margin-top: 6px; }
        .mt-12 { margin-top: 12px; }
        .mt-16 { margin-top: 16px; }
        .mt-20 { margin-top: 20px; }
        .mb-16 { margin-bottom: 16px; }
        .mb-30 { margin-bottom: 30px; }
      `}</style>
    </div>
  );
}
