import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { AssessmentSubmission } from '@/models';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    await dbConnect();
    const { submissionId } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const submission = await AssessmentSubmission.findOne({
      _id: submissionId,
      userId,
    })
      .populate('assessmentId', 'title slug company role durationMinutes passingScore difficulty')
      .lean();

    if (!submission) {
      return NextResponse.json(
        { success: false, message: 'Submission report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      report: {
        submissionId: String(submission._id),
        status: submission.status,
        startedAt: submission.startedAt,
        submittedAt: submission.submittedAt,
        timeSpentSeconds: submission.timeSpentSeconds,
        assessment: submission.assessmentId,
        // Scoring
        totalScore: submission.totalScore,
        maxScore: submission.maxScore,
        passed: submission.passed,
        percentile: submission.percentile,
        problemResults: submission.problemResults || [],
        // Integrity & Cheating Telemetry
        integrity: {
          cheatingRiskPercentage: submission.cheatingRiskPercentage ?? 0,
          integrityVerdict: submission.integrityVerdict || 'clean',
          tabSwitchCount: submission.tabSwitchCount ?? 0,
          timeAwaySeconds: submission.timeAwaySeconds ?? 0,
          pasteCount: submission.pasteCount ?? 0,
          largePasteDetected: submission.largePasteDetected ?? false,
          pasteAttemptsBlocked: submission.pasteAttemptsBlocked ?? 0,
          keystrokesCount: submission.keystrokesCount ?? 0,
          cameraEnabled: submission.cameraEnabled ?? false,
          micEnabled: submission.micEnabled ?? false,
          faceAbsenceCount: submission.faceAbsenceCount ?? 0,
          multipleFacesCount: submission.multipleFacesCount ?? 0,
          gazeDivertedCount: submission.gazeDivertedCount ?? 0,
          voiceInterruptionCount: submission.voiceInterruptionCount ?? 0,
          activityAnalysisNarrative: submission.activityAnalysisNarrative || '',
          telemetryTimeline: submission.telemetryTimeline || [],
        },
        patternDiagnostic: submission.patternDiagnostic || [],
      },
    });
  } catch (error: any) {
    console.error('Error fetching submission report:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load report' },
      { status: 500 }
    );
  }
}
