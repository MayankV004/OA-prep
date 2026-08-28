import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Contest } from '@/models/contest';
import { syncContests, getMockUpcomingContests } from '@/lib/contests/aggregator';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get('platform');
    const status = searchParams.get('status') || 'UPCOMING,RUNNING';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

    const statusArray = status.split(',').map((s) => s.trim().toUpperCase());

    const filter: Record<string, unknown> = {
      status: { $in: statusArray },
    };

    if (platform && platform !== 'all') {
      filter.platform = platform.toLowerCase();
    }

    let contests = await Contest.find(filter)
      .sort({ startTime: 1 })
      .limit(limit)
      .lean();

    // If database is empty, seed initial contests
    if (contests.length === 0) {
      await syncContests().catch(console.error);
      contests = await Contest.find(filter)
        .sort({ startTime: 1 })
        .limit(limit)
        .lean();

      if (contests.length === 0) {
        // Fallback to in-memory mock if DB sync couldn't reach APIs
        contests = getMockUpcomingContests() as any;
      }
    }

    return NextResponse.json({
      success: true,
      count: contests.length,
      contests,
    });
  } catch (error: any) {
    console.error('Failed to fetch contests:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch contests' },
      { status: 500 }
    );
  }
}
