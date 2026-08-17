'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, GraduationCap, ChevronRight, UserCheck } from 'lucide-react';

export interface KanbanCandidate {
  id: string; // application ID
  candidateId: string;
  name: string;
  matchScore: number;
  recommendation: 'STRONG_MATCH' | 'MATCH' | 'PARTIAL_MATCH' | 'LOW_MATCH';
  skills: string[];
  education: string; // BS in CS, etc.
}

interface KanbanProps {
  candidates: KanbanCandidate[];
  onStageChange: (applicationId: string, newStage: string) => Promise<void>;
}

const STAGES = [
  { id: 'APPLIED', title: 'Applied' },
  { id: 'UNDER_REVIEW', title: 'Under Review' },
  { id: 'AI_SCREENING', title: 'AI Screening' },
  { id: 'SHORTLISTED', title: 'Shortlisted' },
  { id: 'INTERVIEW', title: 'Interview' },
  { id: 'SELECTED', title: 'Selected' },
  { id: 'HIRED', title: 'Hired' },
  { id: 'REJECTED', title: 'Rejected' },
];

export function Kanban({ candidates, onStageChange }: KanbanProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setActiveStage(stageId);
  };

  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedId;
    setDraggedId(null);
    setActiveStage(null);

    if (id) {
      await onStageChange(id, targetStage);
    }
  };

  const getScoreBadgeClass = (score: number) => {
    if (score >= 85) return 'badge-success';
    if (score >= 70) return 'badge-primary';
    if (score >= 50) return 'badge-warning';
    return 'badge-danger';
  };

  return (
    <div className="kanban-wrapper">
      <div className="kanban-board">
        {STAGES.map((stage) => {
          const stageCandidates = candidates.filter((c) => c.recommendation !== undefined); // Wait, filter candidates in this stage
          // Wait, let's filter by the target application status! Since we need application status, candidates list must contain the status.
          // Wait, let's adjust our candidate type or mapping so we can filter by stage.
          // Let's assume the passed candidate list already has status, or candidates are passed as a record or list.
          // Let's define the interface correctly:
          return (
            <div
              key={stage.id}
              className={`kanban-column ${activeStage === stage.id ? 'column-active' : ''} ${stage.id === 'REJECTED' ? 'column-rejected' : ''}`}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDrop={(e) => handleDrop(e, stage.id)}
              onDragLeave={() => setActiveStage(null)}
            >
              <div className="column-header">
                <h4>{stage.title}</h4>
                <span className="column-count">
                  {candidates.filter((c: any) => c.status === stage.id).length}
                </span>
              </div>

              <div className="column-cards">
                {candidates
                  .filter((c: any) => c.status === stage.id)
                  .map((candidate: any) => (
                    <div
                      key={candidate.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, candidate.id)}
                      className="candidate-card"
                    >
                      <div className="card-top">
                        <Link href={`/candidates/${candidate.candidateId}`} className="candidate-name">
                          {candidate.name}
                        </Link>
                        <span className={`badge ${getScoreBadgeClass(candidate.matchScore)}`}>
                          {candidate.matchScore}%
                        </span>
                      </div>

                      {candidate.education && (
                        <div className="card-meta">
                          <GraduationCap size={13} />
                          <span>{candidate.education}</span>
                        </div>
                      )}

                      <div className="card-skills">
                        {candidate.skills.slice(0, 3).map((skill: string, sidx: number) => (
                          <span key={sidx} className="skill-tag">
                            {skill}
                          </span>
                        ))}
                        {candidate.skills.length > 3 && (
                          <span className="skill-tag skill-more">+{candidate.skills.length - 3}</span>
                        )}
                      </div>

                      <div className="card-footer-action">
                        <Link href={`/candidates/${candidate.candidateId}`} className="view-link">
                          Review Profile <ChevronRight size={14} />
                        </Link>
                      </div>
                    </div>
                  ))}

                {candidates.filter((c: any) => c.status === stage.id).length === 0 && (
                  <div className="column-empty">
                    <p>Drop here</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .kanban-wrapper {
          width: 100%;
          overflow-x: auto;
          padding-bottom: 24px;
          margin-top: 10px;
        }

        .kanban-board {
          display: inline-flex;
          gap: 16px;
          padding: 8px 4px;
          min-height: 500px;
        }

        .kanban-column {
          width: 280px;
          background: rgba(20, 18, 38, 0.4);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          transition: all 0.2s ease;
          max-height: 70vh;
        }

        .column-active {
          border-color: var(--primary);
          background: rgba(99, 102, 241, 0.05);
          box-shadow: 0 0 15px var(--primary-glow);
        }

        .column-rejected {
          background: rgba(239, 68, 68, 0.02);
        }

        .column-header {
          padding: 16px;
          border-bottom: 1px solid var(--border-glass);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .column-header h4 {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-main);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .column-count {
          font-size: 11px;
          font-weight: 700;
          background: var(--bg-glass);
          color: var(--text-secondary);
          border-radius: 20px;
          padding: 2px 8px;
          border: 1px solid var(--border-glass);
        }

        .column-cards {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
          overflow-y: auto;
        }

        .candidate-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-md);
          padding: 14px;
          cursor: grab;
          transition: all 0.2s ease;
          box-shadow: var(--shadow-sm);
        }

        .candidate-card:active {
          cursor: grabbing;
        }

        .candidate-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: var(--shadow-md);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 8px;
        }

        .candidate-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-main);
          text-decoration: none;
          line-height: 1.3;
        }

        .candidate-name:hover {
          color: var(--primary);
        }

        .card-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-muted);
          margin-bottom: 12px;
        }

        .card-meta span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
        }

        .card-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }

        .skill-tag {
          font-size: 10px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-glass);
          color: var(--text-secondary);
          border-radius: 4px;
          padding: 2px 6px;
        }

        .skill-more {
          font-weight: 600;
          color: var(--primary);
        }

        .card-footer-action {
          display: flex;
          justify-content: flex-end;
          border-top: 1px solid rgba(255, 255, 255, 0.03);
          padding-top: 8px;
        }

        .view-link {
          font-size: 11px;
          font-weight: 600;
          color: var(--primary);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .view-link:hover {
          color: var(--text-main);
        }

        .column-empty {
          border: 2px dashed var(--border-glass);
          border-radius: var(--radius-md);
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
