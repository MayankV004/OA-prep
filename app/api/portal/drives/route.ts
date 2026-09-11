import { NextRequest, NextResponse } from 'next/server';
import { withPortalAuth } from '@/lib/auth';
import { CohortDrive } from '@/models/cohortDrive';
import { Assessment } from '@/models/assessment';
import { AssessmentSubmission } from '@/models/assessmentSubmission';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return withPortalAuth(req, async (ctx) => {
    const drives = await CohortDrive.find({ institutionId: ctx.institutionId })
      .populate('assessmentId', 'title passingPercentage timeLimitMinutes')
      .sort({ startsAt: -1 })
      .lean();

    // Enrich with live/completed submission counts
    const enriched = await Promise.all(
      drives.map(async (d: any) => {
        if (!d.assessmentId) {
          return { ...d, activeSubmissions: 0, completedSubmissions: 0, flaggedSubmissions: 0 };
        }

        const [activeSubmissions, completedSubmissions, flaggedSubmissions] = await Promise.all([
          AssessmentSubmission.countDocuments({
            assessmentId: d.assessmentId._id,
            status: 'in_progress',
          }),
          AssessmentSubmission.countDocuments({
            assessmentId: d.assessmentId._id,
            status: 'completed',
          }),
          AssessmentSubmission.countDocuments({
            assessmentId: d.assessmentId._id,
            integrityVerdict: { $in: ['flagged', 'suspicious'] },
          }),
        ]);

        return {
          ...d,
          activeSubmissions,
          completedSubmissions,
          flaggedSubmissions,
        };
      })
    );

    // Fetch published assessments from library for the "Create Drive" dropdown
    const availableAssessments = await Assessment.find({ status: 'published' })
      .select('title timeLimitMinutes passingPercentage')
      .sort({ title: 1 })
      .lean();

    return NextResponse.json({
      drives: enriched,
      availableAssessments,
    });
  });
}

export async function POST(req: NextRequest) {
  return withPortalAuth(req, async (ctx) => {
    if (ctx.role === 'invigilator') {
      return NextResponse.json(
        { error: 'Invigilators have read-only monitoring access and cannot schedule drives.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      title,
      assessmentId,
      startsAt,
      endsAt,
      durationMinutes,
      strictProctoring = true,
      allowedEmailDomains = [],
      accessCode = '',
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Placement drive title is required' }, { status: 400 });
    }
    if (!assessmentId) {
      return NextResponse.json({ error: 'Assessment selection is required' }, { status: 400 });
    }
    if (!startsAt || !endsAt) {
      return NextResponse.json({ error: 'Start and end times are required' }, { status: 400 });
    }

    const drive = await CohortDrive.create({
      institutionId: ctx.institutionId,
      assessmentId,
      title: title.trim(),
      startsAt: new Date(startsAt),
      endsAt: new Date(endsAt),
      durationMinutes: Math.max(10, Number(durationMinutes) || 90),
      strictProctoring: Boolean(strictProctoring),
      allowedEmailDomains: Array.isArray(allowedEmailDomains) ? allowedEmailDomains : [],
      accessCode: accessCode.trim(),
      status: 'scheduled',
      createdById: ctx.userId,
    });

    return NextResponse.json({ drive }, { status: 201 });
  });
}
