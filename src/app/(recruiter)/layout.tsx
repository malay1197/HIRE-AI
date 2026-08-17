import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { Sidebar } from '@/components/ui/Sidebar';

export default async function RecruiterLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionUser();

  if (!session) {
    redirect('/login');
  }

  if (session.role === 'CANDIDATE') {
    redirect('/candidate/dashboard');
  }

  let organizationName = 'TechNova Solutions';
  if (session.organizationId) {
    const org = await db.organization.findUnique({
      where: { id: session.organizationId },
      select: { name: true },
    });
    if (org) organizationName = org.name;
  }

  const user = {
    name: session.name,
    email: session.email,
    role: session.role,
    organizationName,
  };

  return (
    <div className="recruiter-shell">
      <Sidebar user={user} />
      <main className="recruiter-main">
        <div className="recruiter-content">{children}</div>
      </main>
    </div>
  );
}
