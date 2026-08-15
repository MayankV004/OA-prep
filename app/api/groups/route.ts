import { NextRequest } from 'next/server';
import { withAuth, withRole } from '@/lib/auth';
import { Group, Taxonomy } from '@/models';
import { groupWriteSchema } from '@/lib/zod';
import { recordActivity } from '@/lib/activity';
import dbConnect from '@/lib/db';

export async function GET(req: NextRequest) {
  return withAuth(req, async () => {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const kind = searchParams.get('kind');
    const query: any = {};
    if (kind) query.kind = kind;
    const groups = await Group.find(query).sort({ order: 1 });
    return groups;
  });
}

export async function POST(req: NextRequest) {
  return withRole(req, 'admin', async ({ userId }) => {
    await dbConnect();
    const body = await req.json();
    const parsed = groupWriteSchema.parse(body);
    if (!parsed.slug) {
      (parsed as any).slug = parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    const created = await Group.create(parsed);

    // Sync subject to Taxonomy model as well
    if (parsed.kind === 'subject') {
      await Taxonomy.updateOne(
        { kind: 'subject', slug: (parsed as any).slug },
        { $setOnInsert: { kind: 'subject', name: parsed.name, slug: (parsed as any).slug } },
        { upsert: true }
      );
    }

    await recordActivity({
      actorId: userId,
      targetUserId: userId,
      kind: 'admin.taxonomy.created',
      entity: { type: 'group', id: created._id.toString(), title: created.name },
      metadata: { kind: created.kind },
    });
    return created;
  });
}
