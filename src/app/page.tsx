'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Zap, Target, ShieldCheck, BarChart3, HelpCircle, Check, Users, Video } from 'lucide-react';

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const features = [
    {
      icon: Target,
      title: 'AI Resume Parsing & Matching',
      desc: 'Upload hundreds of CVs in PDF/DOCX. Our AI extracts skills, experience, and projects, generating an explainable fit score from 0 to 100.',
    },
    {
      icon: Video,
      title: 'Automated AI Screening',
      desc: 'Let our conversational agent conduct the first-round interview. AI asks role-specific technical questions and evaluates response depth and clarity.',
    },
    {
      icon: BarChart3,
      title: 'Advanced Talent Analytics',
      desc: 'Track recruitment metrics like time-to-hire, source effectiveness, and conversion rates through interactive dashboard visualizers.',
    },
  ];

  const faqs = [
    {
      q: 'How does the AI Resume Matching work?',
      a: 'Our engine extracts keywords, skill lists, and years of experience from uploaded documents, comparing them directly against your job requirements. It provides a match score (0-100) and recommendation rating based solely on job-relevant data.',
    },
    {
      q: 'Can candidates try the AI screening more than once?',
      a: 'No, candidates get a single secure screening session per job application. Their answers are saved, evaluated, and sent directly to the recruiter pipeline dashboard.',
    },
    {
      q: 'Does the AI make hiring decisions?',
      a: 'Absolutely not. HireAI acts as a filtering assistant for the first 80% of recruitment. It highlights strong fits, but all final shortlisting, interview scheduling, and hiring decisions are made by human recruiters.',
    },
    {
      q: 'Can I migrate the database to PostgreSQL?',
      a: 'Yes! The application utilizes Prisma ORM. By default, it runs on SQLite for localized demoing, but you can switch to a production PostgreSQL database by updating the connection provider in prisma/schema.prisma.',
    },
  ];

  return (
    <div className="landing-wrapper">
      {/* Top Navbar */}
      <header className="navbar">
        <div className="nav-container">
          <Link href="/" className="logo">
            <Sparkles className="logo-icon" size={20} />
            <span>HireAI</span>
          </Link>
          <nav className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="nav-actions">
            <Link href="/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link href="/signup" className="btn btn-primary btn-sm">Start Hiring</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-content">
          <div className="badge-glow">
            <Zap size={12} />
            <span>Next-Gen Recruitment Automation</span>
          </div>
          <h1>Your AI Recruiter for the First 80% of Hiring</h1>
          <p className="hero-subtitle">
            Screen resumes, rank candidates, conduct initial screening interviews, and schedule meetings automatically.
          </p>
          <div className="hero-ctas">
            <Link href="/signup" className="btn btn-primary btn-lg">
              Start Hiring <ArrowRight size={18} />
            </Link>
            <Link href="/pricing" className="btn btn-secondary btn-lg">
              Book Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-title">
            <h2>Supercharge Your Hiring Flow</h2>
            <p>From resume upload to interview scheduling in under 10 minutes.</p>
          </div>
          <div className="grid-3">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="card feature-card">
                  <div className="feature-icon-box">
                    <Icon size={24} className="text-primary" />
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="how-section">
        <div className="container">
          <div className="section-title">
            <h2>Automate in 4 Easy Steps</h2>
            <p>How HireAI turns manual screening into a streamlined pipeline.</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <span className="step-num">01</span>
              <h4>Create a Job</h4>
              <p>Define requirements, target skills, and experience criteria inside the Recruiter dashboard.</p>
            </div>
            <div className="step-card">
              <span className="step-num">02</span>
              <h4>Upload Resumes</h4>
              <p>Drag and drop applicant CVs. AI instantly extracts details and calculates candidate fit scores.</p>
            </div>
            <div className="step-card">
              <span className="step-num">03</span>
              <h4>AI Conversational Screening</h4>
              <p>Advance selected matches. Candidates complete an interactive, job-specific screening wizard.</p>
            </div>
            <div className="step-card">
              <span className="step-num">04</span>
              <h4>Book & Interview</h4>
              <p>Review AI evaluation reports, trigger calendar slots, and let candidates book interviews directly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section id="pricing" className="pricing-section">
        <div className="container">
          <div className="section-title">
            <h2>Flexible Billing for Teams of All Sizes</h2>
            <p>Unlock automation features with clear, predictable monthly pricing.</p>
          </div>
          <div className="pricing-teaser-card">
            <div className="teaser-content">
              <h3>Free Startup Package</h3>
              <p>Perfect for testing the platform and hiring for your first core positions.</p>
              <ul>
                <li><Check size={16} className="text-success" /> Up to 3 Active Jobs</li>
                <li><Check size={16} className="text-success" /> 50 AI Resume Scans</li>
                <li><Check size={16} className="text-success" /> 10 Automated Screening Sessions</li>
              </ul>
            </div>
            <div className="teaser-price">
              <span className="price-num">$0</span>
              <span className="price-term">per month</span>
              <Link href="/signup" className="btn btn-primary btn-lg mt-20">Get Started Free</Link>
              <Link href="/pricing" className="pricing-link">View all plans</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faq" className="faq-section">
        <div className="container">
          <div className="section-title">
            <h2>Frequently Asked Questions</h2>
            <p>Everything you need to know about HireAI features.</p>
          </div>
          <div className="faq-list">
            {faqs.map((faq, idx) => (
              <div key={idx} className="faq-item">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="faq-question"
                >
                  <span>{faq.q}</span>
                  <HelpCircle size={18} className="faq-icon" />
                </button>
                <div className={`faq-answer ${activeFaq === idx ? 'answer-open' : ''}`}>
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-logo">
            <Sparkles className="logo-icon" size={18} />
            <span>HireAI</span>
          </div>
          <p>© 2026 HireAI Automation Inc. All rights reserved.</p>
          <div className="footer-links">
            <a href="#features">Privacy Policy</a>
            <a href="#how-it-works">Terms of Service</a>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .landing-wrapper {
          overflow-x: hidden;
        }

        .navbar {
          background: rgba(8, 7, 16, 0.6);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-glass);
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: var(--header-height);
          z-index: 1000;
          display: flex;
          align-items: center;
        }

        .nav-container {
          max-width: 1280px;
          margin: 0 auto;
          width: 100%;
          padding: 0 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: var(--text-main);
          font-weight: 800;
          font-size: 18px;
        }

        .logo-icon {
          color: var(--primary);
        }

        .nav-links {
          display: flex;
          gap: 32px;
        }

        .nav-links a {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .nav-links a:hover {
          color: var(--text-main);
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        /* Hero Section */
        .hero-section {
          padding: 180px 0 100px 0;
          text-align: center;
        }

        .hero-content {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .badge-glow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--primary-glow);
          color: var(--primary);
          padding: 6px 14px;
          border-radius: 20px;
          border: 1px solid rgba(99, 102, 241, 0.2);
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 24px;
          animation: pulseGlow 3s infinite;
        }

        .hero-section h1 {
          font-size: 54px;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
          max-width: 800px;
          color: var(--text-main);
          margin-bottom: 24px;
        }

        .hero-subtitle {
          font-size: 18px;
          color: var(--text-secondary);
          max-width: 600px;
          line-height: 1.5;
          margin-bottom: 40px;
        }

        .hero-ctas {
          display: flex;
          gap: 16px;
        }

        /* Section Titles */
        .section-title {
          text-align: center;
          margin-bottom: 60px;
        }

        .section-title h2 {
          font-size: 32px;
          font-weight: 800;
          color: var(--text-main);
        }

        .section-title p {
          color: var(--text-secondary);
          margin-top: 8px;
          font-size: 15px;
        }

        /* Features Section */
        .features-section {
          padding: 100px 0;
        }

        .feature-card {
          text-align: center;
          padding: 40px 24px;
        }

        .feature-icon-box {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          background: var(--primary-glow);
          border: 1px solid rgba(99, 102, 241, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px auto;
        }

        .feature-card h3 {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 12px;
        }

        .feature-card p {
          font-size: 14px;
          color: var(--text-secondary);
        }

        /* Steps Section */
        .how-section {
          padding: 80px 0;
          background: rgba(0, 0, 0, 0.2);
          border-top: 1px solid var(--border-glass);
          border-bottom: 1px solid var(--border-glass);
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .step-card {
          background: var(--bg-glass);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-lg);
          padding: 24px;
        }

        .step-num {
          font-size: 24px;
          font-weight: 800;
          color: var(--primary);
          display: block;
          margin-bottom: 16px;
        }

        .step-card h4 {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 8px;
        }

        .step-card p {
          font-size: 13px;
          color: var(--text-secondary);
        }

        @media (max-width: 1024px) {
          .steps-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .steps-grid { grid-template-columns: 1fr; }
          .hero-section h1 { font-size: 38px; }
          .nav-links { display: none; }
        }

        /* Pricing Section */
        .pricing-section {
          padding: 100px 0;
        }

        .pricing-teaser-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-lg);
          display: flex;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
          box-shadow: var(--shadow-md);
        }

        .teaser-content {
          flex: 1.2;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .teaser-content h3 {
          font-size: 22px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 8px;
        }

        .teaser-content p {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 20px;
        }

        .teaser-content ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .teaser-content li {
          font-size: 13px;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .teaser-price {
          flex: 0.8;
          border-left: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding-left: 40px;
        }

        .price-num {
          font-size: 54px;
          font-weight: 800;
          color: var(--text-main);
          line-height: 1.1;
        }

        .price-term {
          font-size: 12px;
          color: var(--text-muted);
        }

        .pricing-link {
          font-size: 13px;
          color: var(--text-muted);
          text-decoration: none;
          margin-top: 12px;
        }

        .pricing-link:hover {
          color: var(--text-main);
        }

        .mt-20 { margin-top: 20px; }

        @media (max-width: 768px) {
          .pricing-teaser-card { flex-direction: column; padding: 24px; gap: 24px; }
          .teaser-price { border-left: none; border-top: 1px solid var(--border-glass); padding-left: 0; padding-top: 24px; }
        }

        /* FAQ Section */
        .faq-section {
          padding: 80px 0;
          background: rgba(0, 0, 0, 0.1);
          border-top: 1px solid var(--border-glass);
        }

        .faq-list {
          max-width: 680px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .faq-item {
          background: var(--bg-surface);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .faq-question {
          width: 100%;
          background: transparent;
          border: none;
          padding: 20px;
          font-family: var(--font-sans);
          font-size: 15px;
          font-weight: 600;
          color: var(--text-main);
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          text-align: left;
        }

        .faq-icon {
          color: var(--text-muted);
          transition: transform 0.2s ease;
        }

        .faq-question:hover .faq-icon {
          color: var(--text-main);
        }

        .faq-answer {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s cubic-bezier(0, 1, 0, 1);
          background: rgba(0, 0, 0, 0.15);
        }

        .faq-answer p {
          padding: 0 20px 20px 20px;
          font-size: 13.5px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .answer-open {
          max-height: 500px;
          transition: max-height 0.3s cubic-bezier(0.5, 0, 0.1, 1);
        }

        /* Footer */
        .footer {
          border-top: 1px solid var(--border-glass);
          padding: 40px 0;
          text-align: center;
          background: var(--bg-secondary);
        }

        .footer-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 16px;
          font-weight: 700;
        }

        .footer p {
          font-size: 13px;
          color: var(--text-muted);
        }

        .footer-links {
          display: flex;
          gap: 20px;
        }

        .footer-links a {
          font-size: 12px;
          color: var(--text-muted);
          text-decoration: none;
        }

        .footer-links a:hover {
          color: var(--text-main);
        }
      `}</style>
    </div>
  );
}
