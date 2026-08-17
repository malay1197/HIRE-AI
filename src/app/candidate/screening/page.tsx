'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, HelpCircle, Loader2 } from 'lucide-react';
import { InterviewSession } from '@/components/ai/InterviewSession';
import { useToast } from '@/components/ui/Toast';

interface Question {
  id: string;
  questionText: string;
}

interface ScreeningSession {
  id: string;
  status: string;
  questions: Question[];
}

export default function CandidateScreeningPage() {
  const [session, setSession] = useState<ScreeningSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    async function loadScreening() {
      try {
        const res = await fetch('/api/candidates');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch details');

        const activeApp = data.candidate?.applications[0];
        if (activeApp && (activeApp.status === 'SHORTLISTED' || activeApp.status === 'AI_SCREENING' || activeApp.status === 'UNDER_REVIEW')) {
          const pendingScreening = activeApp.screenings?.find((s: any) => s.status === 'PENDING');
          if (pendingScreening) {
            setSession({
              id: pendingScreening.id,
              status: pendingScreening.status,
              questions: pendingScreening.questions || [],
            });
          }
        }
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || 'Error loading AI screening session.');
      } finally {
        setLoading(false);
      }
    }

    loadScreening();
  }, [toast]);

  const handleComplete = () => {
    router.push('/candidate/dashboard');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 className="spinner" size={40} />
        <p>Loading your AI screening session...</p>
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
    <div className="screening-page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Screening Interview</h1>
          <p className="page-subtitle">Answer the questions below to complete your first-round assessment.</p>
        </div>
      </div>

      <div className="screening-content">
        {session ? (
          <InterviewSession
            screeningId={session.id}
            questions={session.questions}
            onComplete={handleComplete}
          />
        ) : (
          <div className="card empty-screening-card">
            <HelpCircle size={40} className="empty-icon text-muted" />
            <h3>No Active Screening Session</h3>
            <p>
              There are no pending first-round AI screening sessions scheduled for your account. You will receive an email once a recruiter advances your application.
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .screening-page-wrapper {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
        }

        .empty-screening-card {
          text-align: center;
          padding: 60px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .empty-icon {
          margin-bottom: 16px;
        }

        .empty-screening-card h3 {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-main);
        }

        .empty-screening-card p {
          color: var(--text-secondary);
          max-width: 440px;
          font-size: 14px;
          margin-top: 8px;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}
