import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Assessment, AssessmentSubmission } from '@/models';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getUserEntitlement } from '@/lib/entitlements';

export async function GET(req: Request) {
  try {
    await dbConnect();

    // Check auth session optionally
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id;
    let entitlement = null;

    if (userId) {
      entitlement = await getUserEntitlement(userId);
    }

    const assessments = await Assessment.find({})
      .select('title slug company role description durationMinutes passingScore isProOnly difficulty problems.id problems.title problems.difficulty problems.score problems.patternTag createdAt')
      .sort({ isProOnly: 1, createdAt: 1 })
      .lean();

    // Fetch user submissions if authenticated
    let userSubmissionsMap: Record<string, any> = {};
    if (userId) {
      const submissions = await AssessmentSubmission.find({
        userId,
        status: 'completed',
      })
        .sort({ createdAt: -1 })
        .lean();

      for (const sub of submissions) {
        const key = String(sub.assessmentId);
        if (!userSubmissionsMap[key]) {
          userSubmissionsMap[key] = {
            submissionId: String(sub._id),
            totalScore: sub.totalScore,
            maxScore: sub.maxScore,
            passed: sub.passed,
            percentile: sub.percentile,
            cheatingRiskPercentage: sub.cheatingRiskPercentage,
            submittedAt: sub.submittedAt,
          };
        }
      }
    }

    const payload = assessments.map((assessment: any) => {
      const pastSubmission = userSubmissionsMap[String(assessment._id)] || null;
      const isLocked = assessment.isProOnly && !entitlement?.isPro;

      return {
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
        problemCount: assessment.problems?.length || 0,
        problemSummaries: (assessment.problems || []).map((p: any) => ({
          id: p.id,
          title: p.title,
          difficulty: p.difficulty,
          score: p.score,
          patternTag: p.patternTag,
        })),
        pastSubmission,
      };
    });

    return NextResponse.json({
      success: true,
      assessments: payload,
      isPro: Boolean(entitlement?.isPro),
    });
  } catch (error: any) {
    console.error('Error fetching assessments catalog:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load assessments catalog' },
      { status: 500 }
    );
  }
}
