import { NextRequest, NextResponse } from 'next/server';
import { withPortalAuth } from '@/lib/auth';
import { CohortDrive } from '@/models/cohortDrive';
import { AssessmentSubmission } from '@/models/assessmentSubmission';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  return withPortalAuth(req, async (ctx) => {
    const drive = await CohortDrive.findOne({
      _id: id,
      institutionId: ctx.institutionId,
    })
      .populate('assessmentId', 'title passingPercentage timeLimitMinutes')
      .lean();

    if (!drive) {
      return NextResponse.json({ error: 'Drive not found or access denied' }, { status: 404 });
    }

    const submissions = await AssessmentSubmission.find({
      assessmentId: drive.assessmentId?._id,
    })
      .populate('userId', 'name email image')
      .sort({ createdAt: -1 })
      .lean();

    const activeList = submissions.filter((s: any) => s.status === 'in_progress');
    const completedList = submissions.filter((s: any) => s.status === 'completed');
    const flaggedList = submissions.filter((s: any) =>
      ['flagged', 'suspicious'].includes(s.integrityVerdict)
    );

    return NextResponse.json({
      drive,
      metrics: {
        activeCount: activeList.length,
        completedCount: completedList.length,
        flaggedCount: flaggedList.length,
        totalCandidates: submissions.length,
      },
      submissions,
    });
  });
}

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  return withPortalAuth(req, async (ctx) => {
    if (ctx.role === 'invigilator') {
      return NextResponse.json(
        { error: 'Invigilators cannot alter drive status or durations.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { status, durationMinutes } = body;

    const updates: Record<string, any> = {};
    if (status && ['scheduled', 'live', 'completed', 'cancelled'].includes(status)) {
      updates.status = status;
    }
    if (durationMinutes !== undefined) {
      updates.durationMinutes = Math.max(10, Number(durationMinutes));
    }

    const updated = await CohortDrive.findOneAndUpdate(
      { _id: id, institutionId: ctx.institutionId },
      { $set: updates },
      { new: true }
    )
      .populate('assessmentId', 'title')
      .lean();

    if (!updated) {
      return NextResponse.json({ error: 'Drive not found' }, { status: 404 });
    }

    return NextResponse.json({ drive: updated });
  });
}
