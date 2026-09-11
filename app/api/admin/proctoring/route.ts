import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withRole } from '@/lib/auth';
import { AssessmentSubmission } from '@/models/assessmentSubmission';
// Ensure models are registered for populate
import '@/models/user';
import '@/models/assessment';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return withRole(req, 'admin', async () => {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const verdict = searchParams.get('verdict') || 'all';
    const minRisk = Number(searchParams.get('minRisk') || 0);
    const search = searchParams.get('search')?.trim() || '';
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 50)));
    const skip = Math.max(0, Number(searchParams.get('skip') || 0));

    const filter: Record<string, any> = {};

    if (verdict && verdict !== 'all') {
      filter.integrityVerdict = verdict;
    }

    if (minRisk > 0) {
      filter.cheatingRiskPercentage = { $gte: minRisk };
    }

    const [submissions, total, flaggedCount, suspiciousCount, cleanCount] = await Promise.all([
      AssessmentSubmission.find(filter)
        .populate('userId', 'name email image')
        .populate('assessmentId', 'title company difficulty slug durationMinutes')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AssessmentSubmission.countDocuments(filter),
      AssessmentSubmission.countDocuments({ integrityVerdict: 'flagged' }),
      AssessmentSubmission.countDocuments({ integrityVerdict: 'suspicious' }),
      AssessmentSubmission.countDocuments({ integrityVerdict: 'clean' }),
    ]);

    // Client-side text search fallback if search parameter is provided
    let filteredSubmissions = submissions;
    if (search) {
      const q = search.toLowerCase();
      filteredSubmissions = submissions.filter((sub: any) => {
        const userName = sub.userId?.name?.toLowerCase() || '';
        const userEmail = sub.userId?.email?.toLowerCase() || '';
        const oaTitle = sub.assessmentId?.title?.toLowerCase() || '';
        const company = sub.assessmentId?.company?.toLowerCase() || '';
        return (
          userName.includes(q) ||
          userEmail.includes(q) ||
          oaTitle.includes(q) ||
          company.includes(q)
        );
      });
    }

    return NextResponse.json({
      data: filteredSubmissions,
      stats: {
        total,
        flaggedCount,
        suspiciousCount,
        cleanCount,
      },
    });
  });
}
