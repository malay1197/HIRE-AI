import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { notifyInterviewScheduled, notifyInterviewCancelled } from '@/lib/mailer';

// GET interviews and slots
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const jobId = url.searchParams.get('jobId');

    // Recruiter GET: list scheduled interviews and all slots
    if (session.role === 'RECRUITER' || session.role === 'ADMIN') {
      if (!session.organizationId) {
        return NextResponse.json({ error: 'Organization required' }, { status: 400 });
      }

      const interviews = await db.interview.findMany({
        where: {
          application: {
            job: {
              organizationId: session.organizationId,
            },
          },
        },
        include: {
          application: {
            include: {
              candidate: true,
              job: true,
            },
          },
        },
        orderBy: { date: 'asc' },
      });

      const slots = jobId
        ? await db.interviewSlot.findMany({ where: { jobId } })
        : [];

      return NextResponse.json({ success: true, interviews, slots });
    }

    // Candidate GET: list their own interviews and slots for their active application
    const candidate = await db.candidate.findUnique({
      where: { userId: session.id },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 });
    }

    const interviews = await db.interview.findMany({
      where: {
        application: {
          candidateId: candidate.id,
        },
      },
      include: {
        application: {
          include: {
            job: {
              include: {
                organization: true,
              },
            },
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    // Also fetch available slots for jobs the candidate has applied to (if status is SHORTLISTED/INTERVIEW)
    const activeApplications = await db.application.findMany({
      where: {
        candidateId: candidate.id,
        status: { in: ['SHORTLISTED', 'INTERVIEW', 'UNDER_REVIEW'] },
      },
      include: {
        job: true,
      },
    });

    const jobIds = activeApplications.map((a) => a.jobId);
    const availableSlots = await db.interviewSlot.findMany({
      where: {
        jobId: { in: jobIds },
        isBooked: false,
      },
      include: {
        job: true,
      },
    });

    return NextResponse.json({
      success: true,
      interviews,
      availableSlots,
      applications: activeApplications,
    });
  } catch (error: any) {
    console.error('Fetch interviews error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Book a slot (Candidate) or Create slots (Recruiter)
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Recruiter Flow: Configure new interview slot
    if (session.role === 'RECRUITER' || session.role === 'ADMIN') {
      const { jobId, date, time } = body;
      if (!jobId || !date || !time) {
        return NextResponse.json({ error: 'Missing slot details' }, { status: 400 });
      }

      const slot = await db.interviewSlot.create({
        data: {
          jobId,
          date: new Date(date),
          time,
          isBooked: false,
        },
      });

      return NextResponse.json({ success: true, slot });
    }

    // Candidate Flow: Book an existing slot
    const { slotId, applicationId, type, interviewerName } = body; // type: VIDEO | PHONE | IN_PERSON
    if (!slotId || !applicationId) {
      return NextResponse.json({ error: 'Missing booking details' }, { status: 400 });
    }

    const slot = await db.interviewSlot.findUnique({
      where: { id: slotId },
      include: { job: true },
    });

    if (!slot || slot.isBooked) {
      return NextResponse.json({ error: 'Slot is unavailable' }, { status: 400 });
    }

    const application = await db.application.findUnique({
      where: { id: applicationId },
      include: {
        candidate: true,
        job: {
          include: {
            organization: {
              include: {
                users: {
                  where: { role: 'RECRUITER' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Update slot status
    await db.interviewSlot.update({
      where: { id: slotId },
      data: {
        isBooked: true,
        applicationId,
      },
    });

    // Create interview record
    const intName = interviewerName || 'Technical Recruiter';
    const intType = type || 'VIDEO';

    const interview = await db.interview.create({
      data: {
        applicationId,
        interviewerName: intName,
        type: intType,
        date: slot.date,
        timeSlot: slot.time,
        status: 'SCHEDULED',
      },
    });

    // Advance application status to INTERVIEW
    await db.application.update({
      where: { id: applicationId },
      data: { status: 'INTERVIEW' },
    });

    // Trigger emails
    const recruiterUser = application.job.organization.users[0] || { email: 'recruiter@technova.demo', id: 'default' };
    const dateStr = new Date(slot.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    await notifyInterviewScheduled(
      application.candidate.name,
      application.candidate.email,
      application.candidate.id,
      recruiterUser.email,
      recruiterUser.id,
      application.job.title,
      intName,
      dateStr,
      slot.time,
      intType
    );

    await db.auditLog.create({
      data: {
        userId: session.id,
        action: 'INTERVIEW_SCHEDULED',
        details: `Interview scheduled for candidate ${application.candidate.name} on ${dateStr} - ${slot.time}`,
      },
    });

    return NextResponse.json({ success: true, interview });
  } catch (error: any) {
    console.error('Booking interview error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
