import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withRole } from '@/lib/auth';
import { Institution } from '@/models/institution';
import { InstitutionMember } from '@/models/institutionMember';
import { User } from '@/models/user';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  return withRole(req, 'admin', async () => {
    await connectDB();

    const members = await InstitutionMember.find({ institutionId: id })
      .populate('userId', 'name email image role')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ members });
  });
}

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  return withRole(req, 'admin', async (session) => {
    await connectDB();

    const institution = await Institution.findById(id);
    if (!institution) {
      return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const { email, role = 'coordinator', department = '' } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid user email is required' }, { status: 400 });
    }

    // Find or create user record
    let user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      user = await User.create({
        name: email.split('@')[0],
        email: email.trim().toLowerCase(),
        emailVerified: false,
        role: 'user', // TPC members stay role: 'user', their access to portal is governed by InstitutionMember
      });
    }

    // Check if member already exists
    const existing = await InstitutionMember.findOne({
      institutionId: id,
      userId: user._id,
    });

    if (existing) {
      existing.role = role;
      existing.department = department;
      existing.status = 'active';
      await existing.save();
      return NextResponse.json({ member: existing, updated: true });
    }

    const member = await InstitutionMember.create({
      institutionId: id,
      userId: user._id,
      role,
      department: department.trim(),
      status: 'active',
      invitedBy: session?.userId,
    });

    return NextResponse.json({ member }, { status: 201 });
  });
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  return withRole(req, 'admin', async () => {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json({ error: 'memberId is required' }, { status: 400 });
    }

    await InstitutionMember.findOneAndDelete({ _id: memberId, institutionId: id });
    return NextResponse.json({ success: true, message: 'Member removed' });
  });
}
