import { NextRequest } from 'next/server';
import { withRole } from '@/lib/auth';
import { Taxonomy, Group } from '@/models';
import { taxonomyWriteSchema } from '@/lib/zod';
import { recordActivity } from '@/lib/activity';
import dbConnect from '@/lib/db';

export async function GET(req: NextRequest) {
  return withRole(req, 'admin', async () => {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const kind = searchParams.get('kind');
    
    // Auto-sync any Subject Groups into Taxonomy collection so they always appear in Taxonomies
    if (!kind || kind === 'all' || kind === 'subject') {
      const subjectGroups = await Group.find({ kind: 'subject' }).lean();
      for (const g of subjectGroups) {
        await Taxonomy.updateOne(
          { kind: 'subject', slug: g.slug },
          { $setOnInsert: { kind: 'subject', name: g.name, slug: g.slug } },
          { upsert: true }
        );
      }
    }

    const query: any = {};
    if (kind && kind !== 'all') query.kind = kind;
    
    return await Taxonomy.find(query).sort({ order: 1 });
  });
}

export async function POST(req: NextRequest) {
  return withRole(req, 'admin', async ({ userId }) => {
    await dbConnect();
    
    const body = await req.json();
    const parsed = taxonomyWriteSchema.parse(body);

    // Auto-generate slug if missing
    if (!parsed.slug) {
      parsed.slug = parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }

    const created = await Taxonomy.create(parsed);

    // Sync subject taxonomy to Group model as well
    if (parsed.kind === 'subject') {
      await Group.updateOne(
        { kind: 'subject', slug: parsed.slug },
        { $setOnInsert: { kind: 'subject', name: parsed.name, slug: parsed.slug } },
        { upsert: true }
      );
    }

    await recordActivity({
      actorId: userId,
      targetUserId: userId,
      kind: 'admin.taxonomy.created',
      entity: { type: 'taxonomy', id: created._id.toString(), title: created.name },
      metadata: { kind: created.kind }
    });

    return created;
  });
}
