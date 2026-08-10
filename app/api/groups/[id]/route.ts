import { NextRequest } from 'next/server';
import { withRole } from '@/lib/auth';
import { Group } from '@/models';
import { groupUpdateSchema } from '@/lib/zod';
import { recordActivity } from '@/lib/activity';
import dbConnect from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRole(req, 'admin', async ({ userId }) => {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const parsed = groupUpdateSchema.parse(body);
    const updated = await Group.findByIdAndUpdate(id, parsed, { new: true });
    if (!updated) throw { status: 404, message: 'Group not found' };
    return updated;
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRole(req, 'admin', async ({ userId }) => {
    await dbConnect();
    const { id } = await params;
    const force = new URL(req.url).searchParams.get('force') === 'true';
    const group = await Group.findById(id);
    if (!group) throw { status: 404, message: 'Group not found' };
    await Group.findByIdAndDelete(id);
    return Response.json(null, { status: 204 });
  });
}
