import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, setSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role, organizationName } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    let organizationId: string | null = null;
    let organizationNameSaved = '';

    if (role === 'RECRUITER' || role === 'ADMIN') {
      const orgName = organizationName || `${name}'s Org`;
      const org = await db.organization.create({
        data: {
          name: orgName,
          subscription: {
            create: {
              plan: 'FREE',
              status: 'ACTIVE',
              activeJobsLimit: 3,
              resumeLimit: 50,
              aiScreeningLimit: 10,
            },
          },
        },
      });
      organizationId = org.id;
      organizationNameSaved = org.name;
    }

    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        organizationId,
      },
    });

    // If candidate, initialize Candidate record
    if (role === 'CANDIDATE') {
      await db.candidate.create({
        data: {
          name,
          email,
          userId: user.id,
          yearsOfExperience: 0,
        },
      });
    }

    const sessionPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      organizationId,
    };

    await setSession(sessionPayload);

    // Audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTER',
        details: `User registered as ${role}. Email: ${email}`,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId,
        organizationName: organizationNameSaved,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
