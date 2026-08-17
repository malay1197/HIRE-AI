import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

// GET job details
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionUser();
    const { id: jobId } = await context.params;

    const job = await db.job.findUnique({
      where: { id: jobId },
      include: {
        organization: {
          select: { name: true },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // If recruiter/admin is logged in and belongs to same org, include applicant details
    if (session && (session.role === 'RECRUITER' || session.role === 'ADMIN') && session.organizationId === job.organizationId) {
      const applications = await db.application.findMany({
        where: { jobId },
        include: {
          candidate: true,
          screenings: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({
        success: true,
        job,
        applications: applications.map((app) => ({
          id: app.id,
          candidateId: app.candidate.id,
          name: app.candidate.name,
          email: app.candidate.email,
          skills: app.candidate.skills ? app.candidate.skills.split(',') : [],
          education: app.candidate.education ? JSON.parse(app.candidate.education).degree || 'N/A' : 'N/A',
          status: app.status,
          matchScore: app.matchScore,
          recommendation: app.recommendation,
          screeningScore: app.screenings[0]?.overallScore || null,
        })),
      });
    }

    // Otherwise, just return standard job details
    return NextResponse.json({ success: true, job });
  } catch (error: any) {
    console.error('Fetch job details error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT update job
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== 'RECRUITER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: jobId } = await context.params;
    const body = await req.json();

    const job = await db.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.organizationId !== session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updatedJob = await db.job.update({
      where: { id: jobId },
      data: {
        title: body.title,
        department: body.department,
        location: body.location,
        employmentType: body.employmentType,
        salaryRange: body.salaryRange,
        experienceRequired: body.experienceRequired,
        skills: body.skills,
        education: body.education,
        description: body.description,
        responsibilities: body.responsibilities,
        requirements: body.requirements,
        benefits: body.benefits,
        status: body.status, // DRAFT | PUBLISHED | PAUSED | CLOSED
        deadline: body.deadline ? new Date(body.deadline) : undefined,
      },
    });

    await db.auditLog.create({
      data: {
        userId: session.id,
        action: 'JOB_UPDATE',
        details: `Job updated: ${body.title} (${jobId}). Status: ${body.status}`,
      },
    });

    return NextResponse.json({ success: true, job: updatedJob });
  } catch (error: any) {
    console.error('Update job error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE job
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== 'RECRUITER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: jobId } = await context.params;
    const job = await db.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.organizationId !== session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db.job.delete({
      where: { id: jobId },
    });

    await db.auditLog.create({
      data: {
        userId: session.id,
        action: 'JOB_DELETE',
        details: `Job deleted: ${job.title} (${jobId})`,
      },
    });

    return NextResponse.json({ success: true, message: 'Job deleted successfully' });
  } catch (error: any) {
    console.error('Delete job error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
