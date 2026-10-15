import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withRole } from '@/lib/auth';
import { Group, Taxonomy } from '@/models';
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
    return NextResponse.json(group, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRole(req, 'admin', async ({ userId }) => {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const parsed = groupUpdateSchema.parse(body);

    if (parsed.name) parsed.name = parsed.name.trim();
    if (parsed.slug) {
      parsed.slug = parsed.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }
    if (parsed.description) parsed.description = parsed.description.trim();

    // Check duplicate slug if slug or kind is changing
    if (parsed.slug) {
      const existing = await Group.findOne({
        _id: { $ne: id },
        slug: parsed.slug,
        kind: parsed.kind || (await Group.findById(id).select('kind').lean())?.kind,
      });
      if (existing) {
        throw { status: 400, message: 'A subject or track with this slug already exists.' };
      }
    }

    const updated = await Group.findByIdAndUpdate(id, parsed, { new: true });
    if (!updated) throw { status: 404, message: 'Subject not found' };

    // Sync to Taxonomy model if subject
    if (updated.kind === 'subject') {
      await Taxonomy.updateOne(
        { kind: 'subject', slug: updated.slug },
        { $set: { name: updated.name }, $setOnInsert: { kind: 'subject', slug: updated.slug } },
        { upsert: true }
      );
    }

    recordActivity({
      actorId: userId,
      targetUserId: userId,
      kind: 'admin.taxonomy.updated',
      entity: { type: 'group', id: updated._id.toString(), title: updated.name },
      metadata: { changedFields: Object.keys(parsed) },
    });

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

    // Sync delete to Taxonomy model if subject
    if (group.kind === 'subject') {
      await Taxonomy.deleteOne({ kind: 'subject', slug: group.slug });
    }

    recordActivity({
      actorId: userId,
      targetUserId: userId,
      kind: 'admin.taxonomy.deleted',
      entity: { type: 'group', id: group._id.toString(), title: group.name },
      metadata: { kind: group.kind, slug: group.slug },
    });

    return new Response(null, { status: 204 });
  });
}
