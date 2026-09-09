import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Assessment, AssessmentSubmission } from '@/models';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { generateActivityAnalysis } from '@/lib/proctor/activity-analyzer';
import { executeTestCases } from '@/lib/runner/judge0';
import { SupportedLanguage } from '@/lib/runner/types';

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
        { success: false, message: 'Unauthorized' },
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

    const body = await req.json();
    const { submissionId, solutions = [], telemetry = {} } = body;

    let submission = null;
    if (submissionId) {
      submission = await AssessmentSubmission.findOne({
        _id: submissionId,
        userId,
      });
    }

    if (!submission) {
      submission = await AssessmentSubmission.findOne({
        userId,
        assessmentId: assessment._id,
        status: 'in_progress',
      }).sort({ createdAt: -1 });
    }

    if (!submission) {
      return NextResponse.json(
        { success: false, message: 'No active assessment session found' },
        { status: 400 }
      );
    }

    // Idempotent guard: If already graded, return saved results without re-running Judge0 or AI analyzer
    if (submission.status === 'completed') {
      return NextResponse.json({
        success: true,
        submissionId: String(submission._id),
        totalScore: submission.totalScore,
        maxScore: submission.maxScore,
        passed: submission.passed,
        percentile: submission.percentile,
        cheatingRiskPercentage: submission.cheatingRiskPercentage,
        integrityVerdict: submission.integrityVerdict,
        patternDiagnostics: submission.patternDiagnostic,
      });
    }

    // 1. Grade each problem using Judge0 execution engine
    const problemResults: any[] = [];
    const patternDiagnostics: any[] = [];
    let totalScore = 0;
    const maxScore = (assessment.problems || []).reduce((acc: number, p: any) => acc + (p.score || 50), 0);

    for (const problem of assessment.problems || []) {
      const sol = solutions.find((s: any) => s.problemId === problem.id);
      const code = sol?.code?.trim() || '';
      const language = (sol?.language || 'cpp') as SupportedLanguage;
      const timeSpent = sol?.timeSpentSeconds || 0;
      const testCases = problem.testCases || [];
      const totalTestCases = testCases.length;
      const starter = (problem.starterCode?.[language] || '').trim();

      let passedTestCases = 0;
      let status: 'accepted' | 'partial' | 'wrong_answer' | 'time_limit_exceeded' = 'wrong_answer';

      if (!code || code === starter) {
        passedTestCases = 0;
        status = 'wrong_answer';
      } else {
        // Execute against all test cases (visible + hidden)
        const execResponse = await executeTestCases(
          code,
          language,
          testCases.map((tc: any) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isHidden: tc.isHidden,
            explanation: tc.explanation,
          })),
          problem.patternTag,
          starter
        );

        passedTestCases = execResponse.passedCount;

        const hasTle = execResponse.results.some((r) => r.statusId === 5);
        if (hasTle) {
          status = 'time_limit_exceeded';
        } else if (passedTestCases === totalTestCases && totalTestCases > 0) {
          status = 'accepted';
        } else if (passedTestCases > 0) {
          status = 'partial';
        } else {
          status = 'wrong_answer';
        }
      }

      const problemScore = Math.round((passedTestCases / Math.max(1, totalTestCases)) * (problem.score || 50));
      totalScore += problemScore;

      problemResults.push({
        problemId: problem.id,
        code,
        language,
        passedTestCases,
        totalTestCases,
        score: problemScore,
        timeSpentSeconds: timeSpent,
        status,
      });

      // Pattern Diagnostic recommendation
      if (passedTestCases === totalTestCases) {
        patternDiagnostics.push({
          patternTag: problem.patternTag,
          verdict: 'mastered',
          recommendation: `Solid execution of ${problem.patternTag}. All edge cases and boundary limits satisfied.`,
        });
      } else if (passedTestCases > 0) {
        patternDiagnostics.push({
          patternTag: problem.patternTag,
          verdict: 'needs_practice',
          recommendation: `Passed initial cases on ${problem.patternTag} but failed on hidden constraint bounds. Practice variation edge cases in the DSA section.`,
        });
      } else {
        patternDiagnostics.push({
          patternTag: problem.patternTag,
          verdict: 'failed',
          recommendation: `Could not formulate optimal approach for ${problem.patternTag}. Revisit the core template and variations on the BigO Roadmap.`,
        });
      }
    }

    // 2. Multi-Modal Proctor Integrity & Cheating Probability Calculation
    const tabSwitchCount = Number(telemetry.tabSwitchCount) || 0;
    const timeAwaySeconds = Number(telemetry.timeAwaySeconds) || 0;
    const pasteCount = Number(telemetry.pasteCount) || 0;
    const largePasteDetected = Boolean(telemetry.largePasteDetected);
    const pasteAttemptsBlocked = Number(telemetry.pasteAttemptsBlocked) || 0;
    const keystrokesCount = Number(telemetry.keystrokesCount) || 0;

    // Biometrics Telemetry
    const cameraEnabled = Boolean(telemetry.cameraEnabled);
    const micEnabled = Boolean(telemetry.micEnabled);
    const faceAbsenceCount = Number(telemetry.faceAbsenceCount) || 0;
    const multipleFacesCount = Number(telemetry.multipleFacesCount) || 0;
    const gazeDivertedCount = Number(telemetry.gazeDivertedCount) || 0;
    const voiceInterruptionCount = Number(telemetry.voiceInterruptionCount) || 0;

    // Multi-signal Cheating Risk Score formula
    let penalty = 0;
    penalty += tabSwitchCount * 12;                                          // Tab exits
    penalty += Math.round(timeAwaySeconds * 0.4);                             // Seconds outside test window
    penalty += pasteAttemptsBlocked * 10;                                    // Blocked clipboard attempts
    penalty += (largePasteDetected ? 35 : Math.max(0, pasteCount - 2) * 8); // Any unprevented pastes
    penalty += faceAbsenceCount * 15;                                        // Stepping away from camera
    penalty += multipleFacesCount * 25;                                      // Extra people detected in room
    penalty += gazeDivertedCount * 8;                                        // Looking away >3s (off-screen gaze)
    penalty += voiceInterruptionCount * 8;                                   // Speaking / conversational speech
    if (!cameraEnabled) penalty += 25;                                       // Refusing camera stream

    const cheatingRiskPercentage = Math.min(100, Math.max(0, Math.round(penalty)));

    let integrityVerdict: 'clean' | 'suspicious' | 'flagged' = 'clean';
    if (cheatingRiskPercentage >= 45) {
      integrityVerdict = 'flagged';
    } else if (cheatingRiskPercentage >= 15) {
      integrityVerdict = 'suspicious';
    }

    // Calculate Percentile Score (dynamic curve based on score vs company cut-off)
    const scoreRatio = totalScore / Math.max(1, maxScore);
    const percentile = Math.min(99, Math.max(15, Math.round(scoreRatio * 85 + (totalScore >= assessment.passingScore ? 12 : 0))));
    const passed = totalScore >= assessment.passingScore;

    const submittedAt = new Date();
    const timeSpentSeconds = Math.round((submittedAt.getTime() - new Date(submission.startedAt).getTime()) / 1000);

    // 3. Generate AI Forensic Activity Analysis Narrative
    let activityAnalysisNarrative = '';
    try {
      activityAnalysisNarrative = await generateActivityAnalysis({
        assessmentTitle: assessment.title,
        company: assessment.company,
        totalScore,
        maxScore,
        timeSpentSeconds,
        tabSwitchCount,
        timeAwaySeconds,
        pasteAttemptsBlocked,
        keystrokesCount,
        cameraEnabled,
        micEnabled,
        faceAbsenceCount,
        multipleFacesCount,
        gazeDivertedCount,
        voiceInterruptionCount,
        cheatingRiskPercentage,
        integrityVerdict,
        problems: problemResults.map((pr) => {
          const prob = assessment.problems.find((p: any) => p.id === pr.problemId);
          return {
            title: prob?.title || pr.problemId,
            patternTag: prob?.patternTag || 'DSA',
            score: pr.score,
            passedTestCases: pr.passedTestCases,
            totalTestCases: pr.totalTestCases,
            timeSpentSeconds: pr.timeSpentSeconds,
            status: pr.status,
          };
        }),
        timeline: telemetry.timeline || [],
      });
    } catch (analysisErr) {
      console.error('Error generating activity analysis narrative:', analysisErr);
    }

    // 4. Persist submission
    submission.status = 'completed';
    submission.submittedAt = submittedAt;
    submission.timeSpentSeconds = timeSpentSeconds;
    submission.tabSwitchCount = tabSwitchCount;
    submission.timeAwaySeconds = timeAwaySeconds;
    submission.pasteCount = pasteCount;
    submission.largePasteDetected = largePasteDetected;
    submission.pasteAttemptsBlocked = pasteAttemptsBlocked;
    submission.keystrokesCount = keystrokesCount;
    submission.cameraEnabled = cameraEnabled;
    submission.micEnabled = micEnabled;
    submission.faceAbsenceCount = faceAbsenceCount;
    submission.multipleFacesCount = multipleFacesCount;
    submission.gazeDivertedCount = gazeDivertedCount;
    submission.voiceInterruptionCount = voiceInterruptionCount;
    submission.baselineSelfieUrl = telemetry.baselineSelfieUrl || submission.baselineSelfieUrl || '';
    submission.cheatingRiskPercentage = cheatingRiskPercentage;
    submission.integrityVerdict = integrityVerdict;
    submission.activityAnalysisNarrative = activityAnalysisNarrative;
    submission.telemetryTimeline = telemetry.timeline || [];
    submission.totalScore = totalScore;
    submission.maxScore = maxScore;
    submission.passed = passed;
    submission.percentile = percentile;
    submission.problemResults = problemResults;
    submission.patternDiagnostic = patternDiagnostics;

    await submission.save();

    return NextResponse.json({
      success: true,
      submissionId: String(submission._id),
      totalScore,
      maxScore,
      passed,
      percentile,
      cheatingRiskPercentage,
      integrityVerdict,
      patternDiagnostics,
    });
  } catch (error: any) {
    console.error('Error submitting assessment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to evaluate assessment submission' },
      { status: 500 }
    );
  }
}
