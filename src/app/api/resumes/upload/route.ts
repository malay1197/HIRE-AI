import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { parseResumeFile } from '@/lib/ai/parser';
import { matchCandidateToJob } from '@/lib/ai/matcher';
import { notifyCandidateApplied } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const jobId = formData.get('jobId') as string | null;

    if (!file || !jobId) {
      return NextResponse.json({ error: 'Missing file or jobId' }, { status: 400 });
    }

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds limit (5MB)' }, { status: 400 });
    }

    // Check file type: pdf/docx
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') {
      return NextResponse.json({ error: 'Invalid file format. Only PDF and DOCX are allowed.' }, { status: 400 });
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // AI Parse
    const parsed = await parseResumeFile(file.name, buffer);

    // Fetch target job requirements
    const job = await db.job.findUnique({
      where: { id: jobId },
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
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Create or update Candidate record
    let candidate = null;
    if (session.role === 'CANDIDATE') {
      candidate = await db.candidate.findUnique({
        where: { userId: session.id },
      });
    }

    if (!candidate) {
      candidate = await db.candidate.findUnique({
        where: { email: parsed.email },
      });
    }

    if (!candidate) {
      candidate = await db.candidate.create({
        data: {
          name: parsed.name,
          email: parsed.email,
          phone: parsed.phone,
          location: parsed.location,
          yearsOfExperience: parsed.yearsOfExperience,
          skills: parsed.skills.join(','),
          education: JSON.stringify(parsed.education[0] || {}),
          experience: JSON.stringify(parsed.experience),
          projects: JSON.stringify(parsed.projects),
          certifications: JSON.stringify(parsed.certifications),
          resumeUrl: `/uploads/${file.name}`,
          userId: session.role === 'CANDIDATE' ? session.id : undefined,
        },
      });
    } else if (session.role === 'CANDIDATE' && !candidate.userId) {
      // Link existing candidate profile by email to this registered user account
      candidate = await db.candidate.update({
        where: { id: candidate.id },
        data: {
          userId: session.id,
          // Overwrite with newly parsed data
          name: parsed.name,
          phone: parsed.phone,
          location: parsed.location,
          yearsOfExperience: parsed.yearsOfExperience,
          skills: parsed.skills.join(','),
          education: JSON.stringify(parsed.education[0] || {}),
          experience: JSON.stringify(parsed.experience),
          projects: JSON.stringify(parsed.projects),
          certifications: JSON.stringify(parsed.certifications),
          resumeUrl: `/uploads/${file.name}`,
        },
      });
    }

    // Check if application already exists for this job
    const existingApp = await db.application.findFirst({
      where: {
        jobId,
        candidateId: candidate.id,
      },
    });

    if (existingApp) {
      return NextResponse.json({ error: 'Candidate has already applied for this job.' }, { status: 400 });
    }

    // AI Match Scoring
    const jobRequirements = {
      title: job.title,
      skills: job.skills.split(','),
      experienceRequired: job.experienceRequired,
      education: job.education,
    };

    const candidateProfile = {
      name: candidate.name,
      skills: parsed.skills,
      yearsOfExperience: candidate.yearsOfExperience || 0,
      education: candidate.education || '',
      experienceText: parsed.experience.map(e => `${e.role} at ${e.company}: ${e.description}`).join(' '),
    };

    const match = matchCandidateToJob(candidateProfile, jobRequirements);

    // Create application
    const application = await db.application.create({
      data: {
        jobId,
        candidateId: candidate.id,
        status: 'APPLIED',
        matchScore: match.matchScore,
        matchExplanation: match.matchExplanation,
        matchedSkills: match.matchedSkills.join(','),
        missingSkills: match.missingSkills.join(','),
        relevantExperience: match.relevantExperience,
        potentialConcerns: match.potentialConcerns,
        recommendation: match.recommendation,
      },
    });

    // Notify Recruiter
    const recruiterUser = job.organization.users[0] || session;
    await notifyCandidateApplied(
      candidate.name,
      job.title,
      recruiterUser.email,
      recruiterUser.id
    );

    await db.auditLog.create({
      data: {
        userId: session.id,
        action: 'RESUME_UPLOAD_MATCH',
        details: `Uploaded CV for ${candidate.name}. Fit: ${match.matchScore}% - ${match.recommendation}`,
      },
    });

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      match,
      candidate: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        skills: parsed.skills,
      },
    });
  } catch (error: any) {
    console.error('Resume upload error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
