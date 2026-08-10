import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { Problem } from '@/models';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId, role }) => {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const kind = searchParams.get('kind');
    const targetUserId = searchParams.get('userId') === 'me' || !searchParams.get('userId')
      ? userId
      : searchParams.get('userId')!;

    if (targetUserId !== userId && role !== 'admin') throw { status: 403, message: 'Forbidden' };
    if (!kind) throw { status: 400, message: 'kind parameter is required' };

    let groupField: string;
    if (kind === 'pattern') groupField = 'pattern';
    else if (kind === 'nonstandard') groupField = 'bucket';
    else if (kind === 'cp') groupField = 'platform';
    else throw { status: 400, message: 'Invalid kind' };

    const result = await Problem.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), kind } },
      {
        $group: {
          _id: `$${groupField}`,
          total: { $sum: 1 },
          completed: { $sum: { $cond: ['$completed', 1, 0] } },
        },
      },
      { $project: { group: '$_id', total: 1, completed: 1, _id: 0 } },
      { $sort: { group: 1 } },
    ]);

    return result;
  });
}
