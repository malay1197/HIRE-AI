'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Search,
  Calendar,
  BarChart3,
  CreditCard,
  Settings,
  User,
  LogOut,
  Sparkles,
  ClipboardList,
  UserCheck
} from 'lucide-react';

interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
    organizationName?: string;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const role = user.role.toUpperCase();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const recruiterLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Jobs & Pipeline', href: '/jobs', icon: Briefcase },
    { name: 'Candidates', href: '/candidates', icon: Users },
    { name: 'AI Screening Logs', href: '/screening', icon: Sparkles },
    { name: 'Interviews', href: '/interviews', icon: Calendar },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Billing & SaaS', href: '/billing', icon: CreditCard },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const candidateLinks = [
    { name: 'My Dashboard', href: '/candidate/dashboard', icon: LayoutDashboard },
    { name: 'Search Jobs', href: '/candidate/jobs', icon: Search },
    { name: 'My Applications', href: '/candidate/applications', icon: ClipboardList },
    { name: 'AI Screening Sessions', href: '/candidate/screening', icon: Sparkles },
    { name: 'Interviews', href: '/candidate/interviews', icon: Calendar },
    { name: 'My Profile', href: '/candidate/profile', icon: User },
  ];

  const adminLinks = [
    { name: 'Overview', href: '/admin/overview', icon: LayoutDashboard },
    { name: 'Organization Settings', href: '/admin/org', icon: Settings },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Subscriptions', href: '/admin/billing', icon: CreditCard },
  ];

  let links = recruiterLinks;
  if (role === 'CANDIDATE') links = candidateLinks;
  if (role === 'ADMIN') links = adminLinks;

  return (
    <aside className="sidebar-container">
      <div className="sidebar-logo">
        <Sparkles className="logo-icon" size={24} />
        <div>
          <h2>HireAI</h2>
          <span>{user.organizationName || 'Talent Portal'}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            {user.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="user-details">
            <span className="user-name">{user.name}</span>
            <span className="user-role">{role}</span>
          </div>
        </div>

        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>

      <style jsx>{`
        .sidebar-container {
          width: var(--sidebar-width);
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 100;
        }

        .sidebar-logo {
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid var(--border-glass);
        }

        .logo-icon {
          color: var(--primary);
          filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.4));
        }

        .sidebar-logo h2 {
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text-main);
        }

        .sidebar-logo span {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: block;
        }

        .sidebar-nav {
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          overflow-y: auto;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .sidebar-link:hover {
          background: var(--bg-glass);
          color: var(--text-main);
        }

        .sidebar-link.active {
          background: var(--primary-glow);
          color: var(--primary);
          border: 1px solid rgba(99, 102, 241, 0.15);
        }

        .sidebar-footer {
          padding: 20px 16px;
          border-top: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--primary-glow);
          border: 1px solid rgba(99, 102, 241, 0.2);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
        }

        .user-details {
          display: flex;
          flex-direction: column;
          max-width: 140px;
        }

        .user-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-role {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .logout-btn {
          background: transparent;
          border: 1px solid var(--border-glass);
          color: var(--text-secondary);
          border-radius: var(--radius-md);
          padding: 10px;
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.08);
          color: var(--error);
          border-color: rgba(239, 68, 68, 0.2);
        }
      `}</style>
    </aside>
  );
}
