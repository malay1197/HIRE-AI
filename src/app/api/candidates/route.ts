import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { notifyCandidateShortlisted, notifyCandidateRejected } from '@/lib/mailer';

// GET candidates list
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Recruiter fetches candidates who applied to their jobs
    if (session.role === 'RECRUITER' || session.role === 'ADMIN') {
      if (!session.organizationId) {
        return NextResponse.json({ error: 'Organization required' }, { status: 400 });
      }

      // Fetch applications for recruiter's jobs
      const applications = await db.application.findMany({
        where: {
          job: {
            organizationId: session.organizationId,
          },
        },
        include: {
          candidate: true,
          job: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ success: true, applications });
    }

    // Candidate fetches their own profile details
    const candidate = await db.candidate.findUnique({
      where: { userId: session.id },
      include: {
        applications: {
          include: {
            job: true,
            screenings: {
              include: {
                questions: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, candidate });
  } catch (error: any) {
    console.error('Fetch candidates error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT update application stage (Kanban drop/review status)
export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== 'RECRUITER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { applicationId, status } = body; // status: APPLIED | AI_SCREENING | SHORTLISTED | INTERVIEW | SELECTED | HIRED | REJECTED

    if (!applicationId || !status) {
      return NextResponse.json({ error: 'Missing applicationId or status' }, { status: 400 });
    }

    const application = await db.application.findUnique({
      where: { id: applicationId },
      include: {
        candidate: true,
        job: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (application.job.organizationId !== session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updatedApp = await db.application.update({
      where: { id: applicationId },
      data: { status },
    });

    // Handle status change side-effects (Email alerts / DB logs)
    if (status === 'SHORTLISTED') {
      // Trigger AI screening session automatically
      const existingScreening = await db.screening.findFirst({
        where: { applicationId },
      });

      if (!existingScreening) {
        // Generate screening questions based on job description
        const { generateScreeningQuestions } = await import('@/lib/ai/screener');
        const questions = generateScreeningQuestions(application.job.title, application.job.description);

        await db.screening.create({
          data: {
            applicationId,
            status: 'PENDING',
            questions: {
              create: questions.map((q) => ({
                questionText: q.questionText,
                expectedPoints: q.expectedPoints,
              })),
            },
          },
        });
      }

      await notifyCandidateShortlisted(
        application.candidate.name,
        application.candidate.email,
        application.candidate.id,
        application.job.title
      );
    } else if (status === 'REJECTED') {
      await notifyCandidateRejected(
        application.candidate.name,
        application.candidate.email,
        application.candidate.id,
        application.job.title
      );
    }

    await db.auditLog.create({
      data: {
        userId: session.id,
        action: 'APPLICATION_STAGE_CHANGE',
        details: `Application ${applicationId} stage updated to ${status} for ${application.candidate.name}`,
      },
    });

    return NextResponse.json({ success: true, application: updatedApp });
  } catch (error: any) {
    console.error('Update candidate stage error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
