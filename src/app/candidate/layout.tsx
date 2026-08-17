import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { Sidebar } from '@/components/ui/Sidebar';

export default async function CandidateLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionUser();

  if (!session) {
    redirect('/login');
  }

  if (session.role !== 'CANDIDATE') {
    redirect('/dashboard');
  }

  const user = {
    name: session.name,
    email: session.email,
    role: session.role,
  };

  return (
    <div className="candidate-shell">
      <Sidebar user={user} />
      <main className="candidate-main">
        <div className="candidate-content">{children}</div>
      </main>
    </div>
  );
}
