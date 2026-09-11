import { NextRequest, NextResponse } from 'next/server';
import { withPortalAuth } from '@/lib/auth';
import { InstitutionMember } from '@/models/institutionMember';
import { User } from '@/models/user';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return withPortalAuth(req, async (ctx) => {
    const members = await InstitutionMember.find({ institutionId: ctx.institutionId })
      .populate('userId', 'name email image role')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      members,
      currentRole: ctx.role,
    });
  });
}

export async function POST(req: NextRequest) {
  return withPortalAuth(req, async (ctx) => {
    // Only Head of TPC or Admin Observer can add team members
    if (ctx.role !== 'head' && ctx.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only the Head of TPC can invite or assign team coordinators.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { email, role = 'coordinator', department = '' } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid user email is required' }, { status: 400 });
    }

    let user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      user = await User.create({
        name: email.split('@')[0],
        email: email.trim().toLowerCase(),
        emailVerified: false,
        role: 'user',
      });
    }

    const existing = await InstitutionMember.findOne({
      institutionId: ctx.institutionId,
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
      institutionId: ctx.institutionId,
      userId: user._id,
      role,
      department: department.trim(),
      status: 'active',
      invitedBy: ctx.userId,
    });

    return NextResponse.json({ member }, { status: 201 });
  });
}

export async function DELETE(req: NextRequest) {
  return withPortalAuth(req, async (ctx) => {
    if (ctx.role !== 'head' && ctx.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only the Head of TPC can remove team members.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json({ error: 'memberId is required' }, { status: 400 });
    }

    await InstitutionMember.findOneAndDelete({
      _id: memberId,
      institutionId: ctx.institutionId,
    });

    return NextResponse.json({ success: true, message: 'Member removed from campus team' });
  });
}
