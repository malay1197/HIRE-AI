import fs from 'fs';
import path from 'path';
import { db } from './db';

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'emails.log');

function ensureLogFile() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

export async function sendEmail({
  toEmail,
  userId,
  subject,
  htmlContent,
  type = 'INFO',
}: {
  toEmail: string;
  userId?: string;
  subject: string;
  htmlContent: string;
  type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
}) {
  ensureLogFile();

  const logEntry = `[${new Date().toISOString()}] To: ${toEmail}\nSubject: ${subject}\nBody: ${htmlContent.replace(/<[^>]*>/g, '')}\n----------------------------------------\n`;
  fs.appendFileSync(LOG_FILE, logEntry);

  console.log(`[MOCK EMAIL SENT] To: ${toEmail} | Subject: ${subject}`);

  if (userId) {
    try {
      await db.notification.create({
        data: {
          userId,
          title: subject,
          message: htmlContent.replace(/<[^>]*>/g, '').substring(0, 250),
          type,
        },
      });
    } catch (e) {
      console.error('Failed to create in-app notification:', e);
    }
  }
}

export async function notifyCandidateApplied(candidateName: string, jobTitle: string, recruiterEmail: string, recruiterId: string) {
  await sendEmail({
    toEmail: recruiterEmail,
    userId: recruiterId,
    subject: `New Candidate Application: ${candidateName} for ${jobTitle}`,
    htmlContent: `
      <h3>New Application Received</h3>
      <p>Candidate <strong>${candidateName}</strong> has applied for the position of <strong>${jobTitle}</strong>.</p>
      <p>Log in to your Recruiter Dashboard to review their AI matching score and profile.</p>
    `,
    type: 'SUCCESS',
  });
}

export async function notifyCandidateShortlisted(candidateName: string, candidateEmail: string, candidateId: string, jobTitle: string) {
  await sendEmail({
    toEmail: candidateEmail,
    userId: candidateId,
    subject: `Application Shortlisted: ${jobTitle}`,
    htmlContent: `
      <h3>Congratulations, ${candidateName}!</h3>
      <p>Your application for <strong>${jobTitle}</strong> has been shortlisted by the recruitment team.</p>
      <p>The next step is a quick AI-powered screening session. Please log in to the Candidate Portal to start your screening.</p>
    `,
    type: 'SUCCESS',
  });
}

export async function notifyCandidateRejected(candidateName: string, candidateEmail: string, candidateId: string, jobTitle: string) {
  await sendEmail({
    toEmail: candidateEmail,
    userId: candidateId,
    subject: `Update on your application for ${jobTitle}`,
    htmlContent: `
      <p>Dear ${candidateName},</p>
      <p>Thank you for your interest in the <strong>${jobTitle}</strong> position. After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.</p>
      <p>We appreciate your time and wish you the best in your job search.</p>
    `,
    type: 'INFO',
  });
}

export async function notifyInterviewScheduled(
  candidateName: string,
  candidateEmail: string,
  candidateId: string,
  recruiterEmail: string,
  recruiterId: string,
  jobTitle: string,
  interviewerName: string,
  dateStr: string,
  timeSlot: string,
  type: string
) {
  // Notify Candidate
  await sendEmail({
    toEmail: candidateEmail,
    userId: candidateId,
    subject: `Interview Confirmed: ${jobTitle}`,
    htmlContent: `
      <h3>Interview Scheduled</h3>
      <p>Dear ${candidateName},</p>
      <p>Your interview for the <strong>${jobTitle}</strong> position has been scheduled.</p>
      <p><strong>Interviewer:</strong> ${interviewerName}</p>
      <p><strong>Date:</strong> ${dateStr}</p>
      <p><strong>Time:</strong> ${timeSlot}</p>
      <p><strong>Type:</strong> ${type}</p>
      <p>We look forward to speaking with you.</p>
    `,
    type: 'SUCCESS',
  });

  // Notify Recruiter/Interviewer
  await sendEmail({
    toEmail: recruiterEmail,
    userId: recruiterId,
    subject: `Interview Scheduled: ${candidateName} for ${jobTitle}`,
    htmlContent: `
      <h3>Interview Scheduled</h3>
      <p>An interview has been scheduled with <strong>${candidateName}</strong>.</p>
      <p><strong>Interviewer:</strong> ${interviewerName}</p>
      <p><strong>Date:</strong> ${dateStr}</p>
      <p><strong>Time:</strong> ${timeSlot}</p>
      <p><strong>Type:</strong> ${type}</p>
    `,
    type: 'INFO',
  });
}

export async function notifyInterviewCancelled(
  candidateName: string,
  candidateEmail: string,
  candidateId: string,
  recruiterEmail: string,
  recruiterId: string,
  jobTitle: string,
  dateStr: string,
  timeSlot: string
) {
  // Notify Candidate
  await sendEmail({
    toEmail: candidateEmail,
    userId: candidateId,
    subject: `Interview Cancelled: ${jobTitle}`,
    htmlContent: `
      <p>Dear ${candidateName},</p>
      <p>Your scheduled interview on <strong>${dateStr}</strong> at <strong>${timeSlot}</strong> for <strong>${jobTitle}</strong> has been cancelled.</p>
      <p>We will contact you shortly if we need to reschedule.</p>
    `,
    type: 'WARNING',
  });

  // Notify Recruiter
  await sendEmail({
    toEmail: recruiterEmail,
    userId: recruiterId,
    subject: `Interview Cancelled: ${candidateName} - ${jobTitle}`,
    htmlContent: `
      <p>The interview with <strong>${candidateName}</strong> scheduled for <strong>${dateStr}</strong> at <strong>${timeSlot}</strong> has been cancelled.</p>
    `,
    type: 'WARNING',
  });
}
