import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withRole } from '@/lib/auth';
import { CohortDrive } from '@/models/cohortDrive';
import { AssessmentSubmission } from '@/models/assessmentSubmission';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return withRole(req, 'admin', async () => {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'all';

    const query: Record<string, any> = {};
    if (status !== 'all') {
      query.status = status;
    }

    const drives = await CohortDrive.find(query)
      .populate('institutionId', 'name slug domain')
      .populate('assessmentId', 'title passingPercentage timeLimitMinutes')
      .sort({ startsAt: -1 })
      .lean();

    // Enrich with submission telemetry
    const enriched = await Promise.all(
      drives.map(async (drive: any) => {
        if (!drive.assessmentId) {
          return { ...drive, activeSubmissions: 0, completedSubmissions: 0, flaggedSubmissions: 0 };
        }

        const [activeCount, completedCount, flaggedCount] = await Promise.all([
          AssessmentSubmission.countDocuments({
            assessmentId: drive.assessmentId._id,
            status: 'in_progress',
          }),
          AssessmentSubmission.countDocuments({
            assessmentId: drive.assessmentId._id,
            status: 'completed',
          }),
          AssessmentSubmission.countDocuments({
            assessmentId: drive.assessmentId._id,
            integrityVerdict: { $in: ['flagged', 'suspicious'] },
          }),
        ]);

        return {
          ...drive,
          activeSubmissions: activeCount,
          completedSubmissions: completedCount,
          flaggedSubmissions: flaggedCount,
        };
      })
    );

    const now = new Date();
    const liveCount = enriched.filter((d) => d.status === 'live').length;
    const scheduledCount = enriched.filter((d) => d.status === 'scheduled').length;
    const totalAssessed = enriched.reduce((acc, d) => acc + (d.completedSubmissions || 0), 0);

    return NextResponse.json({
      drives: enriched,
      metrics: {
        liveCount,
        scheduledCount,
        totalAssessed,
        totalDrives: enriched.length,
      },
    });
  });
}

export async function PATCH(req: NextRequest) {
  return withRole(req, 'admin', async () => {
    await connectDB();

    const body = await req.json().catch(() => ({}));
    const { driveId, status, durationMinutes } = body;

    if (!driveId) {
      return NextResponse.json({ error: 'driveId is required' }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (status && ['scheduled', 'live', 'completed', 'cancelled'].includes(status)) {
      updates.status = status;
    }
    if (durationMinutes !== undefined) {
      updates.durationMinutes = Math.max(10, Number(durationMinutes));
    }

    const updated = await CohortDrive.findByIdAndUpdate(
      driveId,
      { $set: updates },
      { new: true }
    )
      .populate('institutionId', 'name')
      .populate('assessmentId', 'title');

    return NextResponse.json({ drive: updated });
  });
}
