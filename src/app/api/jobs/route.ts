import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

// GET all jobs
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';

    // If candidate or public browsing, show all published jobs
    if (!session || session.role === 'CANDIDATE') {
      const jobs = await db.job.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { title: { contains: search } },
            { department: { contains: search } },
            { skills: { contains: search } },
          ],
        },
        include: {
          organization: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ success: true, jobs });
    }

    // If recruiter or admin, show their organization's jobs
    if (!session.organizationId) {
      return NextResponse.json({ error: 'User does not belong to any organization' }, { status: 400 });
    }

    const jobs = await db.job.findMany({
      where: {
        organizationId: session.organizationId,
        OR: [
          { title: { contains: search } },
          { department: { contains: search } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, jobs });
  } catch (error: any) {
    console.error('Fetch jobs error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST create job
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== 'RECRUITER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.organizationId) {
      return NextResponse.json({ error: 'Organization required' }, { status: 400 });
    }

    const body = await req.json();
    const {
      title,
      department,
      location,
      employmentType,
      salaryRange,
      experienceRequired,
      skills,
      education,
      description,
      responsibilities,
      requirements,
      benefits,
      deadline,
    } = body;

    if (!title || !department || !skills || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check limits on Free plan
    const org = await db.organization.findUnique({
      where: { id: session.organizationId },
      include: { subscription: true, jobs: true },
    });

    if (org?.subscription) {
      const activeJobsCount = org.jobs.filter((j) => j.status === 'PUBLISHED').length;
      if (org.subscription.plan === 'FREE' && activeJobsCount >= org.subscription.activeJobsLimit) {
        return NextResponse.json({
          error: 'Active job limit reached. Please upgrade your subscription plan.',
        }, { status: 403 });
      }
    }

    const parsedDeadline = deadline ? new Date(deadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days default

    const job = await db.job.create({
      data: {
        title,
        department,
        location: location || 'Remote',
        employmentType: employmentType || 'FULL_TIME',
        salaryRange: salaryRange || 'Not disclosed',
        experienceRequired: experienceRequired || 'Entry level',
        skills,
        education: education || 'Not specified',
        description,
        responsibilities: responsibilities || '',
        requirements: requirements || '',
        benefits: benefits || '',
        deadline: parsedDeadline,
        status: 'PUBLISHED',
        organizationId: session.organizationId,
      },
    });

    // Seed mock interview slots for candidates to pick later
    const slotDates = [1, 2, 3].map((days) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return d;
    });

    const slotsData = [];
    for (const d of slotDates) {
      slotsData.push({ jobId: job.id, date: d, time: '10:00 AM - 11:00 AM', isBooked: false });
      slotsData.push({ jobId: job.id, date: d, time: '02:00 PM - 03:00 PM', isBooked: false });
    }

    // Bulk creation of slots in SQLite is handled via createMany if supported, or multiple creates.
    // In Prisma SQLite, createMany is supported. Let's do it!
    await db.interviewSlot.createMany({
      data: slotsData,
    });

    await db.auditLog.create({
      data: {
        userId: session.id,
        action: 'JOB_CREATE',
        details: `Job created: ${title} (${job.id})`,
      },
    });

    return NextResponse.json({ success: true, job });
  } catch (error: any) {
    console.error('Create job error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
