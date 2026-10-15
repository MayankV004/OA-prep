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
    const groups = await Group.find(query).sort({ order: 1 }).lean();
    return Response.json(groups, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  });
}

export async function POST(req: NextRequest) {
  return withRole(req, 'admin', async ({ userId }) => {
    await dbConnect();
    const body = await req.json();
    const parsed = groupWriteSchema.parse(body);

    const rawSlug = (parsed.slug?.trim() || parsed.name.trim());
    const slug = rawSlug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!slug) {
      throw { status: 400, message: 'A valid name or slug is required' };
    }

    parsed.slug = slug;
    parsed.name = parsed.name.trim();
    if (parsed.description) parsed.description = parsed.description.trim();

    // Check duplicate slug for this kind
    const existing = await Group.findOne({ kind: parsed.kind, slug: parsed.slug });
    if (existing) {
      throw { status: 400, message: `A ${parsed.kind === 'subject' ? 'subject' : 'track'} with this name or slug already exists.` };
    }

    const created = await Group.create(parsed);

    // Sync subject to Taxonomy model as well
    if (parsed.kind === 'subject') {
      await Taxonomy.updateOne(
        { kind: 'subject', slug: parsed.slug },
        { $set: { name: parsed.name }, $setOnInsert: { kind: 'subject', slug: parsed.slug } },
        { upsert: true }
      );
    }

    recordActivity({
      actorId: userId,
      targetUserId: userId,
      kind: 'admin.taxonomy.created',
      entity: { type: 'group', id: created._id.toString(), title: created.name },
      metadata: { kind: created.kind },
    });

    return created;
  });
}
