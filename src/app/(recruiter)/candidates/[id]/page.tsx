'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Sparkles, 
  GraduationCap, 
  Briefcase, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Loader2 
} from 'lucide-react';
import { MatchReport } from '@/components/ai/MatchReport';
import { useToast } from '@/components/ui/Toast';

interface Qualification {
  degree: string;
  school: string;
  year: string;
}

interface WorkHistory {
  role: string;
  company: string;
  duration: string;
  description: string;
}

interface Project {
  title: string;
  description: string;
  tech: string[];
}

interface ScreeningDetails {
  id: string;
  status: string;
  technicalScore: number;
  communicationScore: number;
  experienceScore: number;
  overallScore: number;
  summary: string;
  questions: Array<{
    id: string;
    questionText: string;
    expectedPoints: string;
    answers: Array<{
      id: string;
      answerText: string;
      technicalAnalysis: string;
      communicationAnalysis: string;
      experienceAnalysis: string;
      score: number;
      explanation: string;
    }>;
  }>;
}

interface CandidateFull {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  yearsOfExperience: number;
  skills: string;
  education: string; // JSON
  experience: string; // JSON
  projects: string; // JSON
  certifications: string; // JSON
  applications: Array<{
    id: string;
    jobId: string;
    status: string;
    matchScore: number;
    matchExplanation: string;
    matchedSkills: string;
    missingSkills: string;
    relevantExperience: string;
    potentialConcerns: string;
    recommendation: 'STRONG_MATCH' | 'MATCH' | 'PARTIAL_MATCH' | 'LOW_MATCH';
    job: { title: string; department: string };
    screenings: ScreeningDetails[];
  }>;
}

export default function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;
  const [candidate, setCandidate] = useState<CandidateFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'screening'>('profile');
  const router = useRouter();
  const toast = useToast();

  const loadCandidateData = useCallback(async () => {
    try {
      const res = await fetch(`/api/candidates/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load profile');

      setCandidate(data.candidate);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error loading candidate profile.');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    loadCandidateData();
  }, [loadCandidateData]);

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 className="spinner" size={40} />
        <p>Loading candidate file...</p>
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

  if (!candidate) {
    return (
      <div className="card text-center p-40">
        <h3>Profile not found</h3>
        <p>The candidate profile you are requesting does not exist or has been deleted.</p>
        <Link href="/candidates" className="btn btn-primary mt-20">Back to Roster</Link>
      </div>
    );
  }

  const app = candidate.applications[0];
  const screening = app?.screenings[0];

  const parsedEdu: Qualification = candidate.education ? JSON.parse(candidate.education) : { degree: 'N/A', school: 'N/A', year: 'N/A' };
  const parsedExp: WorkHistory[] = candidate.experience ? JSON.parse(candidate.experience) : [];
  const parsedProj: Project[] = candidate.projects ? JSON.parse(candidate.projects) : [];
  const parsedCerts: string[] = candidate.certifications ? JSON.parse(candidate.certifications) : [];

  return (
    <div className="profile-page-wrapper">
      <div className="page-header">
        <div className="flex-align">
          <button onClick={() => router.back()} className="back-btn-circle mr-16">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="page-title">{candidate.name}</h1>
            <p className="page-subtitle">Applying for: {app?.job.title || 'General Roster'}</p>
          </div>
        </div>
      </div>

      {/* Candidate Contact Card */}
      <div className="card contact-card mb-24">
        <div className="contact-grid">
          <div className="contact-item">
            <Mail size={16} className="contact-icon" />
            <div>
              <span>Email Address</span>
              <p>{candidate.email}</p>
            </div>
          </div>
          <div className="contact-item">
            <Phone size={16} className="contact-icon" />
            <div>
              <span>Phone Number</span>
              <p>{candidate.phone || 'Not provided'}</p>
            </div>
          </div>
          <div className="contact-item">
            <MapPin size={16} className="contact-icon" />
            <div>
              <span>Location</span>
              <p>{candidate.location || 'Remote'}</p>
            </div>
          </div>
          <div className="contact-item border-left-highlight">
            <Briefcase size={16} className="contact-icon text-primary" />
            <div>
              <span>Work Experience</span>
              <p>{candidate.yearsOfExperience} Years</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="tab-menu mb-24">
        <button
          onClick={() => setActiveTab('profile')}
          className={`tab-btn ${activeTab === 'profile' ? 'tab-active' : ''}`}
        >
          Resume & AI Match
        </button>
        <button
          onClick={() => setActiveTab('screening')}
          className={`tab-btn ${activeTab === 'screening' ? 'tab-active' : ''}`}
          disabled={!screening}
        >
          AI Screening Results {!screening && <span className="tab-disabled-text">(No session)</span>}
        </button>
      </div>

      {/* TABS CONTAINER */}
      {activeTab === 'profile' ? (
        <div className="tab-content animate-reveal">
          <div className="grid-profile">
            {/* Left Column: Match Report */}
            <div className="match-column">
              {app ? (
                <MatchReport
                  matchScore={app.matchScore}
                  recommendation={app.recommendation}
                  matchedSkills={app.matchedSkills ? app.matchedSkills.split(',') : []}
                  missingSkills={app.missingSkills ? app.missingSkills.split(',') : []}
                  relevantExperience={app.relevantExperience || ''}
                  potentialConcerns={app.potentialConcerns || ''}
                  matchExplanation={app.matchExplanation || ''}
                />
              ) : (
                <div className="card text-center p-20">
                  <AlertCircle size={24} className="text-warning mb-8" />
                  <p>No active application record exists for matching analysis.</p>
                </div>
              )}
            </div>

            {/* Right Column: Work History & Edu */}
            <div className="details-column">
              <div className="card mb-24">
                <div className="card-header">
                  <div className="flex-align gap-8">
                    <Briefcase size={16} className="text-primary" />
                    <h4>Work Experience</h4>
                  </div>
                </div>
                <div className="timeline-list">
                  {parsedExp.map((exp, idx) => (
                    <div key={idx} className="timeline-item">
                      <div className="timeline-marker" />
                      <div className="timeline-details">
                        <div className="role-company">
                          <h5>{exp.role}</h5>
                          <span>{exp.company} | {exp.duration}</span>
                        </div>
                        <p>{exp.description}</p>
                      </div>
                    </div>
                  ))}
                  {parsedExp.length === 0 && <p className="empty-text">No experience listed.</p>}
                </div>
              </div>

              <div className="card mb-24">
                <div className="card-header">
                  <div className="flex-align gap-8">
                    <GraduationCap size={16} className="text-primary" />
                    <h4>Education</h4>
                  </div>
                </div>
                <div className="education-box">
                  <h5>{parsedEdu.degree}</h5>
                  <p>{parsedEdu.school} • {parsedEdu.year}</p>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h4>Certifications</h4>
                </div>
                <div className="skills-list">
                  {parsedCerts.map((cert, idx) => (
                    <span key={idx} className="skill-chip chip-success">{cert}</span>
                  ))}
                  {parsedCerts.length === 0 && <p className="empty-text">No certifications listed.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* SCREENING REPORT TAB */
        <div className="tab-content animate-reveal">
          {screening ? (
            <div className="screening-tab-content">
              {/* Scores Header Summary */}
              <div className="card mb-24">
                <div className="card-header">
                  <div className="flex-align gap-8">
                    <Sparkles className="text-primary" size={18} />
                    <h4>AI Screening Scorecard</h4>
                  </div>
                  <span className={`badge ${screening.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>
                    {screening.status}
                  </span>
                </div>

                <div className="screening-scores-grid">
                  <div className="screening-overall-card">
                    <div className="score-label">Overall Match</div>
                    <h2 className="overall-score-big text-primary">{screening.overallScore}%</h2>
                  </div>
                  <div className="component-scores">
                    <div className="comp-row">
                      <span>Technical Relevance</span>
                      <div className="comp-bar-wrapper">
                        <div className="comp-bar" style={{ width: `${screening.technicalScore}%`, background: 'var(--success)' }} />
                      </div>
                      <span className="comp-val">{screening.technicalScore}%</span>
                    </div>

                    <div className="comp-row">
                      <span>Communication Clarity</span>
                      <div className="comp-bar-wrapper">
                        <div className="comp-bar" style={{ width: `${screening.communicationScore}%`, background: 'var(--info)' }} />
                      </div>
                      <span className="comp-val">{screening.communicationScore}%</span>
                    </div>

                    <div className="comp-row">
                      <span>Experience Context</span>
                      <div className="comp-bar-wrapper">
                        <div className="comp-bar" style={{ width: `${screening.experienceScore}%`, background: 'var(--warning)' }} />
                      </div>
                      <span className="comp-val">{screening.experienceScore}%</span>
                    </div>
                  </div>
                </div>

                <div className="screening-summary-box mt-20">
                  <strong>AI Recruiter Evaluation Summary</strong>
                  <p>{screening.summary}</p>
                </div>
              </div>

              {/* Questions and Answers list */}
              <div className="section-header mb-16">
                <h4>Conversational Q&A Transcript</h4>
              </div>

              <div className="qa-list">
                {screening.questions.map((q, idx) => {
                  const ans = q.answers[0];
                  return (
                    <div key={q.id} className="card qa-item mb-16">
                      <div className="qa-question-box">
                        <span className="q-label-badge">Q{idx + 1}</span>
                        <h5>{q.questionText}</h5>
                      </div>

                      {ans ? (
                        <div className="qa-answer-box">
                          <div className="ans-text">
                            <strong>Candidate Response:</strong>
                            <p>{ans.answerText}</p>
                          </div>

                          <div className="ans-evaluation">
                            <div className="sparkle-title border-bottom-sec pb-8 mb-8">
                              <Sparkles size={14} className="text-primary" />
                              <strong>AI Answer Assessment (Score: {ans.score}%)</strong>
                            </div>
                            <div className="grid-3 pt-8">
                              <div className="eval-subfield">
                                <strong>Technical Analysis</strong>
                                <p>{ans.technicalAnalysis}</p>
                              </div>
                              <div className="eval-subfield">
                                <strong>Communication</strong>
                                <p>{ans.communicationAnalysis}</p>
                              </div>
                              <div className="eval-subfield">
                                <strong>Experience Fit</strong>
                                <p>{ans.experienceAnalysis}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="qa-unanswered">
                          <p>Candidate did not answer this question yet.</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="card text-center p-40">
              <HelpCircle size={40} className="text-muted mb-12" />
              <h3>No Screening Session</h3>
              <p>This candidate has not completed an AI screening session for this job application yet.</p>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .profile-page-wrapper {
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
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .back-btn-circle:hover {
          background: var(--bg-glass);
          color: var(--text-main);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .contact-card {
          padding: 20px;
          background: rgba(0, 0, 0, 0.2);
        }

        .contact-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        @media (max-width: 1024px) {
          .contact-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .contact-grid { grid-template-columns: 1fr; }
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .border-left-highlight {
          border-left: 2px solid var(--primary);
          padding-left: 16px;
        }

        .contact-icon {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .contact-item span {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          display: block;
        }

        .contact-item p {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-main);
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
        }

        .tab-menu {
          display: flex;
          gap: 12px;
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 1px;
        }

        .tab-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-family: var(--font-sans);
          font-size: 14px;
          font-weight: 600;
          padding: 12px 16px;
          cursor: pointer;
          position: relative;
          transition: color 0.25s ease;
        }

        .tab-btn:hover {
          color: var(--text-main);
        }

        .tab-active {
          color: var(--primary);
        }

        .tab-active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--primary);
        }

        .tab-disabled-text {
          font-size: 11px;
          font-weight: 400;
          color: var(--text-muted);
        }

        .grid-profile {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .grid-profile { grid-template-columns: 1fr; }
        }

        .timeline-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
          position: relative;
          padding-left: 20px;
        }

        .timeline-list::before {
          content: '';
          position: absolute;
          left: 4px;
          top: 8px;
          bottom: 8px;
          width: 1px;
          background: var(--border-glass);
        }

        .timeline-item {
          position: relative;
        }

        .timeline-marker {
          position: absolute;
          left: -20px;
          top: 6px;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: var(--primary);
          border: 2px solid var(--bg-secondary);
        }

        .role-company h5 {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-main);
        }

        .role-company span {
          font-size: 11.5px;
          color: var(--text-muted);
          display: block;
          margin-bottom: 6px;
        }

        .timeline-details p {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .education-box h5 {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-main);
        }

        .education-box p {
          font-size: 12.5px;
          color: var(--text-secondary);
          margin-top: 4px;
        }

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

        .empty-text {
          font-size: 12.5px;
          color: var(--text-muted);
          font-style: italic;
        }

        .screening-scores-grid {
          display: flex;
          gap: 32px;
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 24px;
          margin-bottom: 24px;
          align-items: center;
        }

        .screening-overall-card {
          width: 140px;
          height: 100px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .overall-score-big {
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .component-scores {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .comp-row {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 13px;
        }

        .comp-row span:first-child {
          width: 150px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .comp-bar-wrapper {
          flex: 1;
          height: 6px;
          background: var(--bg-glass);
          border-radius: 3px;
          overflow: hidden;
        }

        .comp-bar {
          height: 100%;
          border-radius: 3px;
        }

        .comp-val {
          width: 40px;
          text-align: right;
          font-weight: 700;
          color: var(--text-main);
        }

        .screening-summary-box {
          background: var(--primary-glow);
          border: 1px solid rgba(99, 102, 241, 0.15);
          border-radius: var(--radius-md);
          padding: 16px 20px;
        }

        .screening-summary-box strong {
          font-size: 13px;
          color: var(--text-main);
          display: block;
        }

        .screening-summary-box p {
          font-size: 13.5px;
          color: var(--text-secondary);
          line-height: 1.4;
          margin-top: 4px;
        }

        .qa-item {
          padding: 20px;
        }

        .qa-question-box {
          display: flex;
          gap: 12px;
          align-items: center;
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 12px;
          margin-bottom: 14px;
        }

        .q-label-badge {
          background: var(--primary);
          color: white;
          font-size: 11px;
          font-weight: 700;
          border-radius: 4px;
          padding: 2px 6px;
        }

        .qa-question-box h5 {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-main);
        }

        .ans-text {
          margin-bottom: 16px;
        }

        .ans-text strong {
          font-size: 12px;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .ans-text p {
          font-size: 14px;
          color: var(--text-main);
          margin-top: 4px;
          line-height: 1.4;
        }

        .ans-evaluation {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-md);
          padding: 14px 18px;
        }

        .pb-8 { padding-bottom: 8px; }
        .pt-8 { padding-top: 8px; }
        .mb-8 { margin-bottom: 8px; }
        .pb-12 { padding-bottom: 12px; }

        .eval-subfield strong {
          font-size: 12px;
          color: var(--text-secondary);
          display: block;
        }

        .eval-subfield p {
          font-size: 12.5px;
          color: var(--text-muted);
          margin-top: 2px;
          line-height: 1.35;
        }

        .border-bottom-sec {
          border-bottom: 1px solid var(--border-glass);
        }

        .qa-unanswered p {
          font-style: italic;
          color: var(--text-muted);
          font-size: 12.5px;
        }

        .section-header {
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 6px;
        }

        .section-header h4 {
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
        }

        .animate-reveal {
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .mb-16 { margin-bottom: 16px; }
        .mb-24 { margin-bottom: 24px; }
        .mr-16 { margin-right: 16px; }
      `}</style>
    </div>
  );
}
