import { NextRequest, NextResponse } from 'next/server';
import { withPortalAuth } from '@/lib/auth';
import { CohortDrive } from '@/models/cohortDrive';
import { AssessmentSubmission } from '@/models/assessmentSubmission';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return withPortalAuth(req, async (ctx) => {
    const { searchParams } = new URL(req.url);
    const driveId = searchParams.get('driveId');

    const driveQuery: Record<string, any> = { institutionId: ctx.institutionId };
    if (driveId && driveId !== 'all') {
      driveQuery._id = driveId;
    }

    const drives = await CohortDrive.find(driveQuery)
      .populate('assessmentId', 'title passingPercentage')
      .lean();

    const assessmentMap = new Map<string, any>();
    drives.forEach((d: any) => {
      if (d.assessmentId?._id) {
        assessmentMap.set(d.assessmentId._id.toString(), {
          driveTitle: d.title,
          passingPercentage: d.assessmentId.passingPercentage || 60,
        });
      }
    });

    const assessmentIds = Array.from(assessmentMap.keys());
    if (assessmentIds.length === 0) {
      return NextResponse.json({ results: [], drives: [] });
    }

    const submissions = await AssessmentSubmission.find({
      assessmentId: { $in: assessmentIds },
      status: 'completed',
    })
      .populate('userId', 'name email college')
      .sort({ scorePercentage: -1, totalScore: -1 })
      .lean();

    const formatted = submissions.map((s: any, idx: number) => {
      const meta = assessmentMap.get(s.assessmentId.toString()) || {};
      const passingScore = meta.passingPercentage || 60;
      const passed = (s.scorePercentage || 0) >= passingScore;

      return {
        rank: idx + 1,
        id: s._id,
        candidateName: s.userId?.name || 'Anonymous Candidate',
        candidateEmail: s.userId?.email || 'N/A',
        college: s.userId?.college || '',
        driveTitle: meta.driveTitle || 'General Drive',
        scorePercentage: s.scorePercentage || 0,
        totalScore: s.totalScore || 0,
        passed,
        durationSeconds: s.durationSeconds || 0,
        integrityVerdict: s.integrityVerdict || 'clean',
        cheatingRiskPercentage: s.cheatingRiskPercentage || 0,
        submittedAt: s.completedAt || s.createdAt,
      };
    });

    return NextResponse.json({
      results: formatted,
      drives: drives.map((d: any) => ({ id: d._id, title: d.title })),
    });
  });
}
