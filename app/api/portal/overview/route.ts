import { NextRequest, NextResponse } from 'next/server';
import { withPortalAuth } from '@/lib/auth';
import { Institution } from '@/models/institution';
import { CohortDrive } from '@/models/cohortDrive';
import { AssessmentSubmission } from '@/models/assessmentSubmission';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return withPortalAuth(req, async (ctx) => {
    const institution = await Institution.findById(ctx.institutionId).lean();
    if (!institution) {
      return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
    }

    const [drives, liveDrivesCount, upcomingDrives] = await Promise.all([
      CohortDrive.find({ institutionId: ctx.institutionId }).lean(),
      CohortDrive.countDocuments({ institutionId: ctx.institutionId, status: 'live' }),
      CohortDrive.find({ institutionId: ctx.institutionId, status: { $in: ['scheduled', 'live'] } })
        .populate('assessmentId', 'title')
        .sort({ startsAt: 1 })
        .limit(3)
        .lean(),
    ]);

    // Count submissions under all assessments used in drives
    const assessmentIds = drives.map((d: any) => d.assessmentId).filter(Boolean);
    const totalAssessed = await AssessmentSubmission.countDocuments({
      assessmentId: { $in: assessmentIds },
      status: 'completed',
    });

    const flaggedIncidents = await AssessmentSubmission.countDocuments({
      assessmentId: { $in: assessmentIds },
      integrityVerdict: { $in: ['flagged', 'suspicious'] },
    });

    return NextResponse.json({
      institution: {
        id: institution._id,
        name: institution.name,
        slug: institution.slug,
        domain: institution.domain,
        totalSeats: institution.totalSeats,
        usedSeats: institution.usedSeats,
        licenseValidUntil: institution.licenseValidUntil,
        status: institution.status,
      },
      currentRole: ctx.role,
      isSuperAdminObserver: ctx.isSuperAdminObserver,
      metrics: {
        totalDrives: drives.length,
        liveDrivesCount,
        totalAssessed,
        flaggedIncidents,
        seatsRemaining: Math.max(0, institution.totalSeats - institution.usedSeats),
      },
      upcomingDrives,
    });
  });
}
