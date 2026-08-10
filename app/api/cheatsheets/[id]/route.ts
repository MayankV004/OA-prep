import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { Cheatsheet } from '@/models';
import { cheatSheetUpdateSchema } from '@/lib/zod';
import { recordActivity } from '@/lib/activity';
import dbConnect from '@/lib/db';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  return withAuth(req, async ({ userId, role }) => {
    await dbConnect();
    const { id } = await params;
    const sheet = await Cheatsheet.findById(id);
    if (!sheet) throw { status: 404, message: 'Cheatsheet not found' };
    if (sheet.userId.toString() !== userId && role !== 'admin') throw { status: 403, message: 'Forbidden' };
    return sheet;
  });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  return withAuth(req, async ({ userId, role }) => {
    await dbConnect();
    const { id } = await params;
    const sheet = await Cheatsheet.findById(id);
    if (!sheet) throw { status: 404, message: 'Cheatsheet not found' };
    if (sheet.userId.toString() !== userId && role !== 'admin') throw { status: 403, message: 'Forbidden' };

    const parsed = cheatSheetUpdateSchema.parse(await req.json());
    const changedFields = Object.keys(parsed);
    Object.assign(sheet, parsed);
    await sheet.save();

    await recordActivity({
      actorId: userId,
      targetUserId: sheet.userId.toString(),
      kind: 'cheatsheet.updated',
      entity: { type: 'cheatsheet', id: sheet._id.toString(), title: sheet.title },
      metadata: { changedFields },
    });
    return sheet;
  });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  return withAuth(req, async ({ userId, role }) => {
    await dbConnect();
    const { id } = await params;
    const sheet = await Cheatsheet.findById(id);
    if (!sheet) throw { status: 404, message: 'Cheatsheet not found' };
    if (sheet.userId.toString() !== userId && role !== 'admin') throw { status: 403, message: 'Forbidden' };

    await sheet.deleteOne();
    await recordActivity({
      actorId: userId,
      targetUserId: sheet.userId.toString(),
      kind: 'cheatsheet.deleted',
      entity: { type: 'cheatsheet', id: sheet._id.toString() },
      metadata: { slug: sheet.slug },
    });
    return Response.json(null, { status: 204 });
  });
}
