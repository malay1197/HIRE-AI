'use client';

import React from 'react';
import { Sparkles, CheckCircle2, AlertCircle, TrendingUp, HelpCircle } from 'lucide-react';

interface MatchReportProps {
  matchScore: number;
  recommendation: 'STRONG_MATCH' | 'MATCH' | 'PARTIAL_MATCH' | 'LOW_MATCH';
  matchedSkills: string[];
  missingSkills: string[];
  relevantExperience: string;
  potentialConcerns: string;
  matchExplanation: string;
}

export function MatchReport({
  matchScore,
  recommendation,
  matchedSkills,
  missingSkills,
  relevantExperience,
  potentialConcerns,
  matchExplanation,
}: MatchReportProps) {
  const getRecommendationDetails = () => {
    switch (recommendation) {
      case 'STRONG_MATCH':
        return { label: 'Strong Match', color: 'var(--success)', glow: 'var(--success-glow)' };
      case 'MATCH':
        return { label: 'Match', color: 'var(--primary)', glow: 'var(--primary-glow)' };
      case 'PARTIAL_MATCH':
        return { label: 'Partial Match', color: 'var(--warning)', glow: 'var(--warning-glow)' };
      case 'LOW_MATCH':
        return { label: 'Low Match', color: 'var(--error)', glow: 'var(--error-glow)' };
      default:
        return { label: 'Unknown', color: 'var(--text-muted)', glow: 'transparent' };
    }
  };

  const rec = getRecommendationDetails();

  return (
    <div className="report-card">
      <div className="report-header">
        <div className="sparkle-title">
          <Sparkles className="sparkle-icon" size={18} />
          <h4>HireAI Suitability Report</h4>
        </div>
        <div className="score-container">
          <div className="score-circle" style={{ borderColor: rec.color }}>
            <span className="score-num">{matchScore}</span>
            <span className="score-label">Score</span>
          </div>
          <div className="rec-badge" style={{ color: rec.color, background: rec.glow, borderColor: rec.color }}>
            {rec.label}
          </div>
        </div>
      </div>

      <div className="report-body">
        {/* Match Explanation */}
        <div className="section">
          <h5>Analysis Summary</h5>
          <p className="explanation-text">{matchExplanation}</p>
        </div>

        {/* Skills Alignment Grid */}
        <div className="grid-2">
          <div className="skills-column match-bg">
            <h6 className="skills-header text-success">
              <CheckCircle2 size={14} /> Matched Skills ({matchedSkills.length})
            </h6>
            <div className="skills-list">
              {matchedSkills.map((s, i) => (
                <span key={i} className="skill-chip chip-success">{s}</span>
              ))}
              {matchedSkills.length === 0 && <span className="empty-text">No skills matched.</span>}
            </div>
          </div>

          <div className="skills-column missing-bg">
            <h6 className="skills-header text-error">
              <AlertCircle size={14} /> Missing Skills ({missingSkills.length})
            </h6>
            <div className="skills-list">
              {missingSkills.map((s, i) => (
                <span key={i} className="skill-chip chip-missing">{s}</span>
              ))}
              {missingSkills.length === 0 && <span className="empty-text">No missing skills.</span>}
            </div>
          </div>
        </div>

        {/* Experience & Concerns Details */}
        <div className="details-section">
          <div className="detail-row">
            <TrendingUp className="row-icon text-primary" size={16} />
            <div className="row-content">
              <strong>Experience Fit</strong>
              <p>{relevantExperience}</p>
            </div>
          </div>

          <div className="detail-row border-top">
            <HelpCircle className="row-icon text-warning" size={16} />
            <div className="row-content">
              <strong>Potential Concerns</strong>
              <p>{potentialConcerns}</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .report-card {
          background: rgba(20, 18, 38, 0.4);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-lg);
          padding: 24px;
        }

        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 20px;
          margin-bottom: 20px;
        }

        .sparkle-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sparkle-icon {
          color: var(--primary);
          animation: pulseGlow 2s infinite;
        }

        .sparkle-title h4 {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-main);
          letter-spacing: -0.01em;
        }

        .score-container {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .score-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 3.5px solid;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.2);
        }

        .score-num {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-main);
          line-height: 1.1;
        }

        .score-label {
          font-size: 8px;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .rec-badge {
          font-size: 12px;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          border: 1px solid;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .report-body {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .section h5 {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-secondary);
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }

        .explanation-text {
          font-size: 14px;
          color: var(--text-main);
          line-height: 1.5;
        }

        .skills-column {
          padding: 16px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-glass);
        }

        .match-bg { background: rgba(16, 185, 129, 0.02); }
        .missing-bg { background: rgba(239, 68, 68, 0.02); }

        .skills-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .text-success { color: var(--success); }
        .text-error { color: var(--error); }

        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .skill-chip {
          font-size: 11px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 4px;
          border: 1px solid;
        }

        .chip-success {
          background: var(--success-glow);
          color: var(--success);
          border-color: rgba(16, 185, 129, 0.15);
        }

        .chip-missing {
          background: var(--error-glow);
          color: var(--error);
          border-color: rgba(239, 68, 68, 0.15);
        }

        .empty-text {
          font-size: 12px;
          color: var(--text-muted);
          font-style: italic;
        }

        .details-section {
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-md);
          background: rgba(0, 0, 0, 0.1);
        }

        .detail-row {
          display: flex;
          gap: 16px;
          padding: 16px;
        }

        .border-top {
          border-top: 1px solid var(--border-glass);
        }

        .row-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .text-primary { color: var(--primary); }
        .text-warning { color: var(--warning); }

        .row-content strong {
          font-size: 13px;
          color: var(--text-main);
          display: block;
        }

        .row-content p {
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
}
