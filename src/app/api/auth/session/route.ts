import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    let organizationName = '';
    if (session.organizationId) {
      const org = await db.organization.findUnique({
        where: { id: session.organizationId },
        select: { name: true },
      });
      if (org) organizationName = org.name;
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.id,
        email: session.email,
        role: session.role,
        name: session.name,
        organizationId: session.organizationId,
        organizationName,
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
