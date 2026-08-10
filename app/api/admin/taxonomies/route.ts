import { NextRequest } from 'next/server';
import { withRole } from '@/lib/auth';
import { Taxonomy } from '@/models';
import { taxonomyWriteSchema } from '@/lib/zod';
import { recordActivity } from '@/lib/activity';
import dbConnect from '@/lib/db';

export async function GET(req: NextRequest) {
  return withRole(req, 'admin', async () => {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const kind = searchParams.get('kind');
    
    const query: any = {};
    if (kind) query.kind = kind;
    
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
