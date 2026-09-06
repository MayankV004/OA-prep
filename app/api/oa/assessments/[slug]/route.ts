import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Assessment, AssessmentSubmission } from '@/models';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getUserEntitlement } from '@/lib/entitlements';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();
    const { slug } = await params;

    const assessment = await Assessment.findOne({ slug }).lean();
    if (!assessment) {
      return NextResponse.json(
        { success: false, message: 'Assessment not found' },
        { status: 404 }
      );
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const userId = session?.user?.id;
    let entitlement = null;

    if (userId) {
      entitlement = await getUserEntitlement(userId);
    }

    const isLocked = assessment.isProOnly && !entitlement?.isPro;

    // Check for an existing in-progress or past submission
    let activeSubmission = null;
    let latestCompletedSubmission = null;

    if (userId) {
      const active = await AssessmentSubmission.findOne({
        userId,
        assessmentId: assessment._id,
        status: 'in_progress',
      }).lean();

      if (active) {
        activeSubmission = {
          submissionId: String(active._id),
          startedAt: active.startedAt,
          timeSpentSeconds: active.timeSpentSeconds,
        };
      }

      const completed = await AssessmentSubmission.findOne({
        userId,
        assessmentId: assessment._id,
        status: 'completed',
      })
        .sort({ createdAt: -1 })
        .lean();

      if (completed) {
        latestCompletedSubmission = {
          submissionId: String(completed._id),
          totalScore: completed.totalScore,
          maxScore: completed.maxScore,
          passed: completed.passed,
          cheatingRiskPercentage: completed.cheatingRiskPercentage,
          submittedAt: completed.submittedAt,
        };
      }
    }

    // Mask hidden testcases before sending to client
    const safeProblems = (assessment.problems || []).map((p: any) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      difficulty: p.difficulty,
      score: p.score,
      patternTag: p.patternTag,
      starterCode: p.starterCode,
      // Only include visible testcases for preview / client test execution
      visibleTestCases: (p.testCases || [])
        .filter((tc: any) => !tc.isHidden)
        .map((tc: any) => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          explanation: tc.explanation,
        })),
      totalTestCaseCount: (p.testCases || []).length,
    }));

    return NextResponse.json({
      success: true,
      assessment: {
        id: String(assessment._id),
        title: assessment.title,
        slug: assessment.slug,
        company: assessment.company,
        role: assessment.role,
        description: assessment.description,
        durationMinutes: assessment.durationMinutes,
        passingScore: assessment.passingScore,
        isProOnly: assessment.isProOnly,
        isLocked,
        difficulty: assessment.difficulty,
        companyInstructions: assessment.companyInstructions || [],
        problems: safeProblems,
      },
      activeSubmission,
      latestCompletedSubmission,
      isPro: Boolean(entitlement?.isPro),
    });
  } catch (error: any) {
    console.error('Error fetching assessment detail:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load assessment' },
      { status: 500 }
    );
  }
}
