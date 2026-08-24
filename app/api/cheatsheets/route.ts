import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { Cheatsheet } from '@/models';
import { cheatSheetWriteSchema } from '@/lib/zod';
import { recordActivity } from '@/lib/activity';
import dbConnect from '@/lib/db';

export async function GET(req: NextRequest) {
  return withAuth(req, async () => {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const query: any = {};
    if (searchParams.get('tag')) query.tags = searchParams.get('tag');
    if (searchParams.get('subjectId')) query.subjectId = searchParams.get('subjectId');

    const cheatsheets = await Cheatsheet.find(query).sort({ updatedAt: -1 });
    return Response.json(cheatsheets);
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async ({ userId, role }) => {
    await dbConnect();
    if (role !== 'admin') {
      throw { status: 403, message: 'Forbidden: Only administrators can create cheat sheets' };
    }

    const body = await req.json();
    const parsed = cheatSheetWriteSchema.parse(body);

    if (!parsed.slug) {
      (parsed as any).slug = parsed.title!.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    }

    const created = await Cheatsheet.create({ ...parsed, userId });
    recordActivity({
      actorId: userId,
      targetUserId: userId,
      kind: 'cheatsheet.created',
      entity: { type: 'cheatsheet', id: created._id.toString(), title: created.title },
      metadata: { slug: created.slug },
    });
    return Response.json(created, { status: 201 });
  });
}
