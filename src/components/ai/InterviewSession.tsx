'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, ChevronRight, MessageSquare, ShieldAlert } from 'lucide-react';
import { useToast } from '../ui/Toast';

interface Question {
  id: string;
  questionText: string;
}

interface InterviewSessionProps {
  screeningId: string;
  questions: Question[];
  onComplete: () => void;
}

export function InterviewSession({ screeningId, questions, onComplete }: InterviewSessionProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const toast = useToast();

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setAnswers((prev) => {
      const copy = [...prev];
      copy[currentIdx] = val;
      return copy;
    });
  };

  const handleNext = () => {
    const currentAnswer = answers[currentIdx].trim();
    if (!currentAnswer) {
      toast.warning('Please write an answer before proceeding.');
      return;
    }

    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/ai/screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          screeningId,
          answers: questions.map((q, i) => ({
            questionId: q.id,
            answerText: answers[i],
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate answers');
      }

      setIsDone(true);
      toast.success('AI Screening completed successfully!');
    } catch (e) {
      console.error(e);
      toast.error('An error occurred while evaluating your responses. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pct = Math.round(((currentIdx + 1) / questions.length) * 100);

  if (isDone) {
    return (
      <div className="wizard-card done-card">
        <CheckCircle2 className="done-icon" size={60} />
        <h2>Screening Completed</h2>
        <p>Your responses have been successfully submitted and analyzed by the HireAI matching engine.</p>
        <div className="info-box">
          <ShieldAlert size={16} />
          <span>Note: AI assessments are auxiliary. A human recruiter will review your full profile before any final decisions.</span>
        </div>
        <button onClick={onComplete} className="btn btn-primary btn-lg mt-20">
          Return to Dashboard
        </button>

        <style jsx>{`
          .done-card {
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 40px;
          }
          .done-icon {
            color: var(--success);
            margin-bottom: 24px;
            filter: drop-shadow(0 0 15px rgba(16, 185, 129, 0.4));
          }
          .done-card h2 {
            font-size: 24px;
            font-weight: 800;
            color: var(--text-main);
            margin-bottom: 12px;
          }
          .done-card p {
            font-size: 15px;
            color: var(--text-secondary);
            max-width: 480px;
            margin-bottom: 24px;
          }
          .info-box {
            display: flex;
            gap: 10px;
            align-items: flex-start;
            background: var(--bg-glass);
            border: 1px solid var(--border-glass);
            padding: 16px;
            border-radius: var(--radius-md);
            max-width: 480px;
            text-align: left;
          }
          .info-box span {
            font-size: 12px;
            color: var(--text-muted);
            line-height: 1.4;
          }
          .mt-20 { margin-top: 20px; }
        `}</style>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="wizard-card loading-card">
        <div className="spinner-glow">
          <Sparkles className="spin-sparkle" size={32} />
        </div>
        <h2>AI Evaluation In Progress...</h2>
        <p>Our algorithms are analyzing your responses based on technical depth, experience context, and clarity.</p>
        <span className="spinner-subtext">This will take just a few seconds. Do not close this page.</span>

        <style jsx>{`
          .loading-card {
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 60px 40px;
          }
          .spinner-glow {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: var(--primary-glow);
            border: 2px dashed var(--primary);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 24px;
            animation: spin 3s linear infinite;
          }
          .spin-sparkle {
            color: var(--primary);
            animation: pulseGlow 1.5s infinite;
          }
          .loading-card h2 {
            font-size: 22px;
            font-weight: 800;
            margin-bottom: 12px;
          }
          .loading-card p {
            color: var(--text-secondary);
            max-width: 480px;
            font-size: 14px;
            margin-bottom: 16px;
          }
          .spinner-subtext {
            font-size: 12px;
            color: var(--text-muted);
          }
          @keyframes spin {
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];

  return (
    <div className="wizard-card">
      <div className="wizard-progress">
        <div className="progress-header">
          <span>Question {currentIdx + 1} of {questions.length}</span>
          <span>{pct}% Completed</span>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="wizard-body">
        <div className="question-box">
          <MessageSquare className="q-icon" size={18} />
          <h4>{currentQuestion.questionText}</h4>
        </div>

        <div className="answer-box">
          <label className="form-label">Your Response</label>
          <textarea
            value={answers[currentIdx]}
            onChange={handleTextChange}
            placeholder="Type your detailed answer here... (minimum 25-50 words recommended for accurate matching)"
            className="form-textarea answer-input"
            rows={8}
          />
          <div className="answer-stats">
            <span>{answers[currentIdx].trim().split(/\s+/).filter(Boolean).length} words</span>
          </div>
        </div>
      </div>

      <div className="wizard-footer">
        <button
          disabled={currentIdx === 0}
          onClick={() => setCurrentIdx((prev) => prev - 1)}
          className="btn btn-secondary"
        >
          Previous
        </button>

        <button onClick={handleNext} className="btn btn-primary">
          {currentIdx === questions.length - 1 ? 'Finish & Submit' : 'Next Question'}
          <ArrowRight size={16} />
        </button>
      </div>

      <style jsx>{`
        .wizard-card {
          background: rgba(20, 18, 38, 0.5);
          backdrop-filter: blur(16px);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-lg);
          padding: 32px;
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .wizard-progress {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .progress-bar-track {
          height: 6px;
          background: var(--bg-glass);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: var(--primary);
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .wizard-body {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .question-box {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          background: var(--primary-glow);
          border: 1px solid rgba(99, 102, 241, 0.15);
          padding: 20px;
          border-radius: var(--radius-md);
        }

        .q-icon {
          color: var(--primary);
          margin-top: 3px;
          flex-shrink: 0;
        }

        .question-box h4 {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-main);
          line-height: 1.4;
        }

        .answer-box {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .answer-input {
          font-size: 15px;
          line-height: 1.5;
          background: rgba(0, 0, 0, 0.3);
        }

        .answer-stats {
          text-align: right;
          font-size: 12px;
          color: var(--text-muted);
        }

        .wizard-footer {
          display: flex;
          justify-content: space-between;
          border-top: 1px solid var(--border-glass);
          padding-top: 20px;
        }
      `}</style>
    </div>
  );
}
