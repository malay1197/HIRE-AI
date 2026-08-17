'use client';

import React from 'react';
import Link from 'next/link';
import { Check, Sparkles, X, ArrowLeft } from 'lucide-react';

export default function PricingPage() {
  const plans = [
    {
      name: 'Free Starter',
      price: '$0',
      desc: 'Test the platform and begin automated recruitment.',
      features: [
        { text: '3 Active Job Postings', included: true },
        { text: '50 Resume Parse Matches', included: true },
        { text: '10 AI Screening Sessions', included: true },
        { text: '1 Recruiter Account', included: true },
        { text: 'Basic Funnel Stats', included: true },
        { text: 'Email & Notification Logs', included: true },
        { text: 'Advanced Analytics Insights', included: false },
        { text: 'Candidate API Integrations', included: false },
      ],
      cta: 'Get Started Free',
      popular: false,
    },
    {
      name: 'Starter Recruit',
      price: '$49',
      desc: 'Ideal for growing startups hiring for multiple key roles.',
      features: [
        { text: '10 Active Job Postings', included: true },
        { text: '250 Resume Parse Matches', included: true },
        { text: '50 AI Screening Sessions', included: true },
        { text: '3 Recruiter Accounts', included: true },
        { text: 'Custom Interview Slots', included: true },
        { text: 'Email Notifications', included: true },
        { text: 'Advanced Analytics Insights', included: false },
        { text: 'Candidate API Integrations', included: false },
      ],
      cta: 'Go Starter Recruit',
      popular: false,
    },
    {
      name: 'Growth Scale',
      price: '$149',
      desc: 'Our most popular plan for active hiring teams.',
      features: [
        { text: '30 Active Job Postings', included: true },
        { text: '1,000 Resume Parse Matches', included: true },
        { text: '250 AI Screening Sessions', included: true },
        { text: '10 Recruiter Accounts', included: true },
        { text: 'Custom Interview Slots', included: true },
        { text: 'Full Email Notification Engine', included: true },
        { text: 'Advanced Analytics Insights', included: true },
        { text: 'Candidate API Integrations', included: false },
      ],
      cta: 'Start Scaling Today',
      popular: true,
    },
    {
      name: 'Business Enterprise',
      price: '$299',
      desc: 'Unlimited power for high-volume staffing agencies.',
      features: [
        { text: 'Unlimited Active Jobs', included: true },
        { text: '5,000 Resume Parse Matches', included: true },
        { text: '1,000 AI Screening Sessions', included: true },
        { text: 'Unlimited Recruiters', included: true },
        { text: 'Custom Interview Slots', included: true },
        { text: 'Full Email Notification Engine', included: true },
        { text: 'Advanced Analytics Insights', included: true },
        { text: 'Candidate API Integrations', included: true },
      ],
      cta: 'Go Enterprise',
      popular: false,
    },
  ];

  return (
    <div className="pricing-wrapper">
      <header className="pricing-header-bar">
        <Link href="/" className="back-link">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
        <Link href="/" className="pricing-logo">
          <Sparkles className="logo-icon" size={18} />
          <span>HireAI</span>
        </Link>
      </header>

      <section className="pricing-intro">
        <div className="container text-center">
          <h1>Choose the Plan That Fits Your Hiring Goals</h1>
          <p>Supercharge candidate selection with explainable, unbiased AI matching tools.</p>
        </div>
      </section>

      <section className="pricing-grid-section">
        <div className="container">
          <div className="grid-4">
            {plans.map((p, i) => (
              <div key={i} className={`card pricing-card ${p.popular ? 'card-popular' : ''}`}>
                {p.popular && <div className="popular-badge">Most Popular</div>}
                <div className="card-top">
                  <h3>{p.name}</h3>
                  <p className="plan-desc">{p.desc}</p>
                  <div className="price-box">
                    <span className="price-amount">{p.price}</span>
                    <span className="price-period">/ month</span>
                  </div>
                </div>

                <div className="card-features">
                  <ul>
                    {p.features.map((f, fidx) => (
                      <li key={fidx} className={f.included ? 'feat-included' : 'feat-excluded'}>
                        {f.included ? (
                          <Check size={14} className="icon-check" />
                        ) : (
                          <X size={14} className="icon-x" />
                        )}
                        <span>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card-action">
                  <Link
                    href={`/signup?plan=${p.name.split(' ')[0].toLowerCase()}`}
                    className={`btn ${p.popular ? 'btn-primary' : 'btn-secondary'} btn-full`}
                  >
                    {p.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        .pricing-wrapper {
          min-height: 100vh;
          padding-bottom: 80px;
        }

        .pricing-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-glass);
        }

        .back-link {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
        }

        .back-link:hover {
          color: var(--text-main);
        }

        .pricing-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-main);
          font-weight: 800;
          text-decoration: none;
        }

        .logo-icon {
          color: var(--primary);
        }

        .pricing-intro {
          padding: 60px 0 40px 0;
        }

        .text-center {
          text-align: center;
        }

        .pricing-intro h1 {
          font-size: 36px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text-main);
          margin-bottom: 12px;
        }

        .pricing-intro p {
          font-size: 16px;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto;
        }

        .pricing-grid-section {
          padding: 20px 0;
        }

        .pricing-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          padding: 32px 24px;
        }

        .card-popular {
          border-color: var(--primary);
          box-shadow: 0 15px 35px -5px rgba(99, 102, 241, 0.25);
        }

        .popular-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--primary);
          color: white;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 4px 12px;
          border-radius: 20px;
        }

        .plan-desc {
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 6px;
          line-height: 1.4;
          height: 36px;
        }

        .price-box {
          margin-top: 16px;
          display: flex;
          align-items: baseline;
          gap: 4px;
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 20px;
        }

        .price-amount {
          font-size: 40px;
          font-weight: 800;
          color: var(--text-main);
        }

        .price-period {
          font-size: 12px;
          color: var(--text-muted);
        }

        .card-features {
          margin: 24px 0;
          flex: 1;
        }

        .card-features ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .card-features li {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }

        .feat-included {
          color: var(--text-secondary);
        }

        .feat-excluded {
          color: var(--text-muted);
          text-decoration: line-through;
        }

        .icon-check {
          color: var(--success);
          flex-shrink: 0;
        }

        .icon-x {
          color: var(--error);
          flex-shrink: 0;
        }

        .card-action {
          margin-top: 16px;
        }

        .btn-full {
          width: 100%;
        }
      `}</style>
    </div>
  );
}
