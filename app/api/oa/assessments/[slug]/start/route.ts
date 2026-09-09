import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Assessment, AssessmentSubmission } from '@/models';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getUserEntitlement } from '@/lib/entitlements';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();
    const { slug } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Please sign in to start the assessment' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const assessment = await Assessment.findOne({ slug });
    if (!assessment) {
      return NextResponse.json(
        { success: false, message: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Check entitlement
    if (assessment.isProOnly) {
      const entitlement = await getUserEntitlement(userId);
      if (!entitlement.isPro) {
        return NextResponse.json(
          {
            success: false,
            code: 'UPGRADE_REQUIRED',
            message: 'This company assessment requires BigO Pro or an OA Season Pass.',
          },
          { status: 403 }
        );
      }
    }

    let isRetake = false;
    try {
      const body = await req.json();
      if (body?.retake) isRetake = true;
    } catch {
      // Empty body is acceptable
    }

    // Look for existing in_progress submission
    let submission = await AssessmentSubmission.findOne({
      userId,
      assessmentId: assessment._id,
      status: 'in_progress',
    });

    if (submission && !isRetake) {
      // Check if session has expired beyond duration + 2 minute grace period
      const startTime = new Date(submission.startedAt).getTime();
      const totalDurationMs = assessment.durationMinutes * 60 * 1000;
      if (Date.now() - startTime > totalDurationMs + 120_000) {
        submission.status = 'completed';
        await submission.save();
        return NextResponse.json({
          success: false,
          alreadyCompleted: true,
          submissionId: String(submission._id),
          message: 'Assessment time limit has expired.',
        });
      }
    }

    // If no in_progress session and not explicitly retaking, check for existing completed submission
    if (!submission && !isRetake) {
      const completedSubmission = await AssessmentSubmission.findOne({
        userId,
        assessmentId: assessment._id,
        status: 'completed',
      }).sort({ submittedAt: -1, createdAt: -1 });

      if (completedSubmission) {
        return NextResponse.json({
          success: false,
          alreadyCompleted: true,
          submissionId: String(completedSubmission._id),
          message: 'You have already completed this assessment.',
        });
      }
    }

    if (!submission) {
      submission = await AssessmentSubmission.create({
        userId,
        assessmentId: assessment._id,
        status: 'in_progress',
        startedAt: new Date(),
        maxScore: (assessment.problems || []).reduce((acc: number, p: any) => acc + (p.score || 50), 0),
        problemResults: (assessment.problems || []).map((p: any) => ({
          problemId: p.id,
          code: p.starterCode?.cpp || '',
          language: 'cpp',
          passedTestCases: 0,
          totalTestCases: (p.testCases || []).length,
          score: 0,
          timeSpentSeconds: 0,
          status: 'wrong_answer',
        })),
        telemetryTimeline: [
          {
            timestamp: new Date(),
            type: 'fullscreen_exit',
            details: 'Assessment session initialized',
          },
        ],
      });
    }

    const savedCodes: Record<string, { code: string; language: string }> = {};
    if (submission.problemResults && submission.problemResults.length > 0) {
      submission.problemResults.forEach((pr: any) => {
        if (pr.code) {
          savedCodes[pr.problemId] = {
            code: pr.code,
            language: pr.language || 'cpp',
          };
        }
      });
    }

    return NextResponse.json({
      success: true,
      submissionId: String(submission._id),
      startedAt: submission.startedAt,
      durationMinutes: assessment.durationMinutes,
      savedCodes,
      assessment: {
        id: String(assessment._id),
        title: assessment.title,
        slug: assessment.slug,
        company: assessment.company,
        role: assessment.role,
        durationMinutes: assessment.durationMinutes,
        passingScore: assessment.passingScore,
        problems: (assessment.problems || []).map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          difficulty: p.difficulty,
          score: p.score,
          patternTag: p.patternTag,
          starterCode: p.starterCode,
          visibleTestCases: (p.testCases || [])
            .filter((tc: any) => !tc.isHidden)
            .map((tc: any) => ({
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              explanation: tc.explanation,
            })),
          totalTestCaseCount: (p.testCases || []).length,
        })),
      },
    });
  } catch (error: any) {
    console.error('Error starting assessment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to start assessment' },
      { status: 500 }
    );
  }
}
