import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { Problem, Topic, Cheatsheet, Activity } from '@/models';
import dbConnect from '@/lib/db';

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    await dbConnect();

    const [problems, topics, cheatsheets, activities] = await Promise.all([
      Problem.find({ userId }).select('-__v -userId'),
      Topic.find({ userId }).select('-__v -userId'),
      Cheatsheet.find({ userId }).select('-__v -userId'),
      Activity.find({ actorId: userId }).select('-__v -actorId'),
    ]);

    const data = {
      exportedAt: new Date().toISOString(),
      problems,
      topics,
      cheatsheets,
      activities,
    };

    return new Response(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="placementdeck-export.json"',
      },
    });
  });
}
