import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { Topic, Cheatsheet, Activity } from '@/models';
import dbConnect from '@/lib/db';

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    await dbConnect();

    const [topics, cheatsheets, activities] = await Promise.all([
      Topic.find({ userId }).select('-__v -userId'),
      Cheatsheet.find({ userId }).select('-__v -userId'),
      Activity.find({ targetUserId: userId }).select('-__v -targetUserId -actorId'),
    ]);

    const data = {
      exportedAt: new Date().toISOString(),
      topics,
      cheatsheets,
      activities,
    };

    return new Response(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="bigo-export.json"',
      },
    });
  });
}
