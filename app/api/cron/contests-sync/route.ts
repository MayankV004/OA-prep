import { NextRequest, NextResponse } from 'next/server';
import { syncContests } from '@/lib/contests/aggregator';
import { env } from '@/lib/config';

export async function GET(req: NextRequest) {
  return handleSync(req);
}

export async function POST(req: NextRequest) {
  return handleSync(req);
}

async function handleSync(req: NextRequest) {
  // Authorization check for cron endpoint
  const authHeader = req.headers.get('authorization');
  const cronSecret = env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Check if Upstash signature or standard dev request
    const isDev = process.env.NODE_ENV !== 'production';
    if (!isDev) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const startTime = Date.now();
    const result = await syncContests();
    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: 'Contests synced successfully',
      durationMs,
      result,
    });
  } catch (error: any) {
    console.error('Cron contests-sync failed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Contest sync failed' },
      { status: 500 }
    );
  }
}
