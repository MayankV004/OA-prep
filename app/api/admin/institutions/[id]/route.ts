import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withRole } from '@/lib/auth';
import { Institution } from '@/models/institution';
import { InstitutionMember } from '@/models/institutionMember';
import { CohortDrive } from '@/models/cohortDrive';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  return withRole(req, 'admin', async () => {
    await connectDB();

    const institution = await Institution.findById(id).lean();
    if (!institution) {
      return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
    }

    const [members, drives] = await Promise.all([
      InstitutionMember.find({ institutionId: id })
        .populate('userId', 'name email image role')
        .sort({ createdAt: -1 })
        .lean(),
      CohortDrive.find({ institutionId: id })
        .populate('assessmentId', 'title passingPercentage')
        .sort({ startsAt: -1 })
        .lean(),
    ]);

    return NextResponse.json({
      institution,
      members,
      drives,
    });
  });
}

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  return withRole(req, 'admin', async () => {
    await connectDB();

    const body = await req.json().catch(() => ({}));
    const updates: Record<string, any> = {};

    if (body.name) updates.name = body.name.trim();
    if (body.domain !== undefined) updates.domain = body.domain.trim().toLowerCase();
    if (body.totalSeats !== undefined) updates.totalSeats = Math.max(1, Number(body.totalSeats));
    if (body.usedSeats !== undefined) updates.usedSeats = Math.max(0, Number(body.usedSeats));
    if (body.licenseValidUntil) updates.licenseValidUntil = new Date(body.licenseValidUntil);
    if (body.status && ['active', 'suspended', 'expired'].includes(body.status)) {
      updates.status = body.status;
    }

    const updated = await Institution.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
    if (!updated) {
      return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
    }

    return NextResponse.json({ institution: updated });
  });
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  return withRole(req, 'admin', async () => {
    await connectDB();

    const institution = await Institution.findById(id);
    if (!institution) {
      return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
    }

    // Mark as suspended rather than hard deleting to preserve audit history
    institution.status = 'suspended';
    await institution.save();

    return NextResponse.json({ message: 'Institution suspended successfully', institution });
  });
}
