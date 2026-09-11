import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withRole } from '@/lib/auth';
import { AssessmentSubmission } from '@/models/assessmentSubmission';
import '@/models/user';
import '@/models/assessment';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRole(req, 'admin', async () => {
    await connectDB();
    const { id } = await params;

    const submission = await AssessmentSubmission.findById(id)
      .populate('userId', 'name email image role')
      .populate('assessmentId', 'title company difficulty slug durationMinutes passingScore')
      .lean();

    if (!submission) {
      return NextResponse.json(
        { error: { message: 'Submission not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: submission });
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRole(req, 'admin', async () => {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const allowedVerdicts = ['clean', 'suspicious', 'flagged'];
    if (body.integrityVerdict && !allowedVerdicts.includes(body.integrityVerdict)) {
      return NextResponse.json(
        { error: { message: 'Invalid integrity verdict' } },
        { status: 400 }
      );
    }

    const updateFields: Record<string, any> = {};
    if (body.integrityVerdict) updateFields.integrityVerdict = body.integrityVerdict;
    if (typeof body.cheatingRiskPercentage === 'number') {
      updateFields.cheatingRiskPercentage = Math.min(100, Math.max(0, body.cheatingRiskPercentage));
    }
    if (body.adminNotes) {
      updateFields.activityAnalysisNarrative = body.adminNotes;
    }

    const updated = await AssessmentSubmission.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    )
      .populate('userId', 'name email image')
      .populate('assessmentId', 'title company difficulty slug')
      .lean();

    if (!updated) {
      return NextResponse.json(
        { error: { message: 'Submission not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updated });
  });
}
