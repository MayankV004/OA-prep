import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withRole } from '@/lib/auth';
import { Group } from '@/models';
import { groupUpdateSchema } from '@/lib/zod';
import { recordActivity } from '@/lib/activity';
import dbConnect from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async () => {
    await dbConnect();
    const { id } = await params;

    const isObjectId = Boolean(id.match(/^[0-9a-fA-F]{24}$/));
    const group = await Group.findOne({
      $or: [
        ...(isObjectId ? [{ _id: id }] : []),
        { slug: id },
      ],
    }).lean();

    if (!group) {
      return NextResponse.json({ error: { message: 'Subject not found' } }, { status: 404 });
    }
    return NextResponse.json(group);
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRole(req, 'admin', async ({ userId }) => {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const parsed = groupUpdateSchema.parse(body);
    const updated = await Group.findByIdAndUpdate(id, parsed, { new: true });
    if (!updated) throw { status: 404, message: 'Subject not found' };
    return NextResponse.json(updated);
  });
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return PATCH(req, ctx);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRole(req, 'admin', async ({ userId }) => {
    await dbConnect();
    const { id } = await params;
    const group = await Group.findById(id);
    if (!group) throw { status: 404, message: 'Subject not found' };
    await Group.findByIdAndDelete(id);
    return new Response(null, { status: 204 });
  });
}
