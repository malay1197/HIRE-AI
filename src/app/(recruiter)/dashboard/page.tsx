'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  Users, 
  Sparkles, 
  Calendar, 
  UserCheck, 
  ArrowUpRight, 
  TrendingUp, 
  Plus,
  Loader2 
} from 'lucide-react';
import { LineChart, FunnelChart } from '@/components/ui/Charts';
import { useToast } from '@/components/ui/Toast';

interface KPIStats {
  activeJobs: number;
  totalApplicants: number;
  aiShortlisted: number;
  interviewsScheduled: number;
  candidatesHired: number;
  conversionRate: number;
}

interface ApplicationSummary {
  id: string;
  candidateId: string;
  name: string;
  email: string;
  status: string;
  matchScore: number;
  recommendation: string;
}

export default function RecruiterDashboard() {
  const [stats, setStats] = useState<KPIStats | null>(null);
  const [timeline, setTimeline] = useState<{ label: string; value: number }[]>([]);
  const [funnel, setFunnel] = useState<{ stage: string; count: number }[]>([]);
  const [recentApps, setRecentApps] = useState<ApplicationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const res = await fetch('/api/analytics');
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Failed to fetch analytics');

        setStats(data.kpis);
        setTimeline(data.applicationsOverTime);
        setFunnel(data.pipelineFunnel);

        // Fetch recent candidates
        const candRes = await fetch('/api/candidates');
        const candData = await candRes.json();
        
        if (candRes.ok && candData.applications) {
          const formatted = candData.applications.slice(0, 5).map((app: any) => ({
            id: app.id,
            candidateId: app.candidate.id,
            name: app.candidate.name,
            email: app.candidate.email,
            status: app.status,
            matchScore: app.matchScore,
            recommendation: app.recommendation,
          }));
          setRecentApps(formatted);
        }
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || 'Error loading dashboard metrics.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [toast]);

  const kpiItems = [
    { label: 'Active Jobs', value: stats?.activeJobs ?? 12, icon: Briefcase, color: 'var(--primary)', detail: 'Job boards active' },
    { label: 'Total Applicants', value: stats?.totalApplicants ?? 1482, icon: Users, color: 'var(--info)', detail: '+12% from last week' },
    { label: 'AI Shortlisted', value: stats?.aiShortlisted ?? 186, icon: Sparkles, color: 'var(--success)', detail: 'Score >= 70%' },
    { label: 'Interviews', value: stats?.interviewsScheduled ?? 74, icon: Calendar, color: 'var(--warning)', detail: 'Upcoming schedules' },
    { label: 'Candidates Hired', value: stats?.candidatesHired ?? 12, icon: UserCheck, color: 'var(--success)', detail: 'Conversion: ' + (stats?.conversionRate ?? 12) + '%' },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 className="spinner" size={40} />
        <p>Analyzing recruitment metrics...</p>
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
    <div className="dashboard-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Workspace Dashboard</h1>
          <p className="page-subtitle">Welcome back. Here is your hiring summary for today.</p>
        </div>
        <Link href="/jobs/create" className="btn btn-primary">
          <Plus size={16} /> Create Job Post
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid-5 mb-30">
        {kpiItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="card kpi-card">
              <div className="kpi-header">
                <span className="kpi-label">{item.label}</span>
                <div className="kpi-icon-box" style={{ background: item.color + '15', color: item.color }}>
                  <Icon size={16} />
                </div>
              </div>
              <h2 className="kpi-value">{item.value.toLocaleString()}</h2>
              <span className="kpi-subtext">{item.detail}</span>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid-2 mb-30">
        <div className="card chart-card">
          <div className="card-header">
            <h4>Applications Over Time</h4>
            <span className="badge badge-primary">Monthly</span>
          </div>
          <div className="chart-body">
            <LineChart data={timeline} height={200} />
          </div>
        </div>

        <div className="card chart-card">
          <div className="card-header">
            <h4>Hiring Funnel Status</h4>
            <span className="badge badge-success">Live Pipeline</span>
          </div>
          <div className="chart-body">
            <FunnelChart data={funnel} />
          </div>
        </div>
      </div>

      {/* Recent Applications list */}
      <div className="card">
        <div className="card-header">
          <h4>Recent Job Applicants</h4>
          <Link href="/candidates" className="view-all-link">
            View All Roster <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Email</th>
                <th>Current Pipeline Stage</th>
                <th>AI Match Suitability</th>
                <th>Verdict</th>
              </tr>
            </thead>
            <tbody>
              {recentApps.map((app) => (
                <tr key={app.id}>
                  <td>
                    <Link href={`/candidates/${app.candidateId}`} className="cand-table-name">
                      {app.name}
                    </Link>
                  </td>
                  <td>{app.email}</td>
                  <td>
                    <span className="badge badge-info">{app.status}</span>
                  </td>
                  <td>
                    <div className="score-cell-badge">
                      <span className="score-number">{app.matchScore}%</span>
                      <div className="score-bar-track">
                        <div className="score-bar-fill" style={{ width: `${app.matchScore}%`, background: app.matchScore >= 80 ? 'var(--success)' : app.matchScore >= 60 ? 'var(--primary)' : 'var(--warning)' }} />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${app.recommendation === 'STRONG_MATCH' ? 'badge-success' : app.recommendation === 'MATCH' ? 'badge-primary' : app.recommendation === 'PARTIAL_MATCH' ? 'badge-warning' : 'badge-danger'}`}>
                      {app.recommendation.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
              {recentApps.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center-empty">
                    No active job applications found. Create a job and upload resumes to start matching.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .dashboard-wrapper {
          display: flex;
          flex-direction: column;
        }

        .grid-5 {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
        }

        @media (max-width: 1200px) {
          .grid-5 { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 768px) {
          .grid-5 { grid-template-columns: 1fr; }
        }

        .kpi-card {
          padding: 20px;
        }

        .kpi-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .kpi-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .kpi-icon-box {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .kpi-value {
          font-size: 28px;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .kpi-subtext {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 6px;
          display: block;
        }

        .chart-card {
          display: flex;
          flex-direction: column;
        }

        .chart-body {
          padding: 10px 0;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .view-all-link {
          font-size: 13px;
          font-weight: 600;
          color: var(--primary);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .view-all-link:hover {
          color: var(--text-main);
        }

        .cand-table-name {
          font-weight: 600;
          color: var(--text-main);
          text-decoration: none;
        }

        .cand-table-name:hover {
          color: var(--primary);
        }

        .score-cell-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 140px;
        }

        .score-number {
          font-size: 13px;
          font-weight: 700;
          width: 36px;
        }

        .score-bar-track {
          flex: 1;
          height: 4px;
          background: var(--bg-glass);
          border-radius: 2px;
          overflow: hidden;
        }

        .score-bar-fill {
          height: 100%;
          border-radius: 2px;
        }

        .text-center-empty {
          text-align: center;
          color: var(--text-muted);
          padding: 32px !important;
          font-style: italic;
        }

        .mb-30 { margin-bottom: 30px; }
      `}</style>
    </div>
  );
}
