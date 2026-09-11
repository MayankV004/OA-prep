import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withRole } from '@/lib/auth';
import { Institution } from '@/models/institution';
import { InstitutionMember } from '@/models/institutionMember';
import { CohortDrive } from '@/models/cohortDrive';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return withRole(req, 'admin', async () => {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();
    const status = searchParams.get('status')?.trim();

    const query: Record<string, any> = {};
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { domain: { $regex: q, $options: 'i' } },
        { slug: { $regex: q, $options: 'i' } },
      ];
    }
    if (status && status !== 'all') {
      query.status = status;
    }

    const institutions = await Institution.find(query).sort({ createdAt: -1 }).lean();

    // Enrich each institution with member count & active drive count
    const enriched = await Promise.all(
      institutions.map(async (inst: any) => {
        const [memberCount, driveCount, liveDrivesCount] = await Promise.all([
          InstitutionMember.countDocuments({ institutionId: inst._id, status: 'active' }),
          CohortDrive.countDocuments({ institutionId: inst._id }),
          CohortDrive.countDocuments({ institutionId: inst._id, status: 'live' }),
        ]);

        return {
          ...inst,
          memberCount,
          driveCount,
          liveDrivesCount,
        };
      })
    );

    // Summary statistics
    const totalInstitutions = enriched.length;
    const activeInstitutions = enriched.filter((i) => i.status === 'active').length;
    const totalSeatsAllocated = enriched.reduce((sum, i) => sum + (i.totalSeats || 0), 0);
    const totalSeatsUsed = enriched.reduce((sum, i) => sum + (i.usedSeats || 0), 0);

    return NextResponse.json({
      institutions: enriched,
      metrics: {
        totalInstitutions,
        activeInstitutions,
        totalSeatsAllocated,
        totalSeatsUsed,
      },
    });
  });
}

export async function POST(req: NextRequest) {
  return withRole(req, 'admin', async (session) => {
    await connectDB();

    const body = await req.json().catch(() => ({}));
    const { name, domain, totalSeats, licenseValidUntil, logoUrl } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Campus name is required' }, { status: 400 });
    }

    const baseSlug = (body.slug || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let counter = 1;
    while (await Institution.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const seats = Number(totalSeats) || 100;
    const validUntil = licenseValidUntil ? new Date(licenseValidUntil) : new Date(Date.now() + 365 * 86400000);

    const institution = await Institution.create({
      name: name.trim(),
      slug,
      domain: (domain || '').trim().toLowerCase(),
      logoUrl: logoUrl || '',
      totalSeats: seats,
      usedSeats: 0,
      licenseValidUntil: validUntil,
      status: 'active',
      createdById: session?.userId,
    });

    return NextResponse.json({ institution }, { status: 201 });
  });
}
