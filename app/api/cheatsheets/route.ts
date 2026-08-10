import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { Cheatsheet } from '@/models';
import { cheatSheetWriteSchema } from '@/lib/zod';
import { recordActivity } from '@/lib/activity';
import dbConnect from '@/lib/db';

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId, role }) => {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('userId') === 'me' || !searchParams.get('userId')
      ? userId
      : searchParams.get('userId')!;
    if (targetUserId !== userId && role !== 'admin') throw { status: 403, message: 'Forbidden' };

    const query: any = { userId: targetUserId };
    if (searchParams.get('tag')) query.tags = searchParams.get('tag');
    if (searchParams.get('subjectId')) query.subjectId = searchParams.get('subjectId');

    const cheatsheets = await Cheatsheet.find(query).sort({ updatedAt: -1 });
    return cheatsheets;
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async ({ userId, role }) => {
    await dbConnect();
    const body = await req.json();
    const parsed = cheatSheetWriteSchema.parse(body);
    const targetUserId = new URL(req.url).searchParams.get('userId') || userId;
    if (targetUserId !== userId && role !== 'admin') throw { status: 403, message: 'Forbidden' };

    if (!parsed.slug) {
      (parsed as any).slug = parsed.title!.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    }

    const created = await Cheatsheet.create({ ...parsed, userId: targetUserId });
    await recordActivity({
      actorId: userId,
      targetUserId,
      kind: 'cheatsheet.created',
      entity: { type: 'cheatsheet', id: created._id.toString(), title: created.title },
      metadata: { slug: created.slug },
    });
    return Response.json(created, { status: 201 });
  });
}
