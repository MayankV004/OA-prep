import { NextRequest } from 'next/server';
import { withRole } from '@/lib/auth';
import { Taxonomy } from '@/models';
import { taxonomyUpdateSchema } from '@/lib/zod';
import { recordActivity } from '@/lib/activity';
import dbConnect from '@/lib/db';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  return withRole(req, 'admin', async ({ userId }) => {
    await dbConnect();
    const { id } = await params;
    const taxonomy = await Taxonomy.findById(id);
    if (!taxonomy) throw { status: 404, message: 'Taxonomy not found' };

    const parsed = taxonomyUpdateSchema.parse(await req.json());
    Object.assign(taxonomy, parsed);
    await taxonomy.save();

    await recordActivity({
      actorId: userId,
      targetUserId: userId,
      kind: 'admin.taxonomy.updated',
      entity: { type: 'taxonomy', id: taxonomy._id.toString(), title: taxonomy.name },
      metadata: { changedFields: Object.keys(parsed) },
    });
    return taxonomy;
  });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  return withRole(req, 'admin', async ({ userId }) => {
    await dbConnect();
    const { id } = await params;
    const taxonomy = await Taxonomy.findById(id);
    if (!taxonomy) throw { status: 404, message: 'Taxonomy not found' };

    // Soft delete — archive instead of remove
    taxonomy.archived = true;
    await taxonomy.save();

    await recordActivity({
      actorId: userId,
      targetUserId: userId,
      kind: 'admin.taxonomy.archived',
      entity: { type: 'taxonomy', id: taxonomy._id.toString(), title: taxonomy.name },
      metadata: { kind: taxonomy.kind, name: taxonomy.name },
    });
    return Response.json(null, { status: 204 });
  });
}
