import { NextRequest } from 'next/server';
import { withRole } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Feedback } from '@/models/feedback';

export async function GET(req: NextRequest) {
  return withRole(req, 'admin', async () => {
    await dbConnect();
    const searchParams = req.nextUrl.searchParams;

    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (type && type !== 'all') {
      filter.type = type;
    }
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (severity && severity !== 'all') {
      filter.severity = severity;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    const [items, total, pendingCount, bugCount, feedbackCount] = await Promise.all([
      Feedback.find(filter)
        .populate('userId', 'name email image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Feedback.countDocuments(filter),
      Feedback.countDocuments({ status: 'pending' }),
      Feedback.countDocuments({ type: 'bug' }),
      Feedback.countDocuments({ type: 'feedback' }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      stats: {
        total,
        pendingCount,
        bugCount,
        feedbackCount,
      },
    };
  });
}
