import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { evaluateAnswers } from '@/lib/ai/screener';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { screeningId, answers } = body; // answers: { questionId: string, answerText: string }[]

    if (!screeningId || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Missing screeningId or answers' }, { status: 400 });
    }

    const screening = await db.screening.findUnique({
      where: { id: screeningId },
      include: {
        questions: true,
        application: {
          include: {
            candidate: true,
            job: true,
          },
        },
      },
    });

    if (!screening) {
      return NextResponse.json({ error: 'Screening session not found' }, { status: 404 });
    }

    // Save individual answers and match them with expectations
    const questionTexts: string[] = [];
    const answerTexts: string[] = [];

    for (const ans of answers) {
      const qObj = screening.questions.find((q) => q.id === ans.questionId);
      if (qObj) {
        questionTexts.push(qObj.questionText);
        answerTexts.push(ans.answerText);
      }
    }

    // Run evaluation engine
    const evaluation = evaluateAnswers(questionTexts, answerTexts);

    // Save answers with individual analysis
    for (let i = 0; i < answers.length; i++) {
      const ans = answers[i];
      const evalObj = evaluation.questionEvaluations[i];

      if (evalObj) {
        await db.screeningAnswer.create({
          data: {
            questionId: ans.questionId,
            answerText: ans.answerText,
            technicalAnalysis: evalObj.technicalAnalysis,
            communicationAnalysis: evalObj.communicationAnalysis,
            experienceAnalysis: evalObj.experienceAnalysis,
            score: evalObj.score,
            explanation: evalObj.explanation,
          },
        });
      }
    }

    // Update screening record
    await db.screening.update({
      where: { id: screeningId },
      data: {
        status: 'COMPLETED',
        technicalScore: evaluation.technicalScore,
        communicationScore: evaluation.communicationScore,
        experienceScore: evaluation.experienceScore,
        overallScore: evaluation.overallScore,
        summary: evaluation.summary,
      },
    });

    // Advance application status to UNDER_REVIEW
    await db.application.update({
      where: { id: screening.applicationId },
      data: {
        status: 'UNDER_REVIEW',
      },
    });

    await db.auditLog.create({
      data: {
        userId: session.id,
        action: 'AI_SCREENING_COMPLETE',
        details: `Candidate ${screening.application.candidate.name} completed screening for ${screening.application.job.title}. Score: ${evaluation.overallScore}%`,
      },
    });

    return NextResponse.json({
      success: true,
      evaluation: {
        technicalScore: evaluation.technicalScore,
        communicationScore: evaluation.communicationScore,
        experienceScore: evaluation.experienceScore,
        overallScore: evaluation.overallScore,
        summary: evaluation.summary,
      },
    });
  } catch (error: any) {
    console.error('Screening evaluation error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
