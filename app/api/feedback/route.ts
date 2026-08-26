import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import { Feedback } from '@/models/feedback';
import { auth } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { sendFeedbackNotificationEmail } from '@/lib/email';

const feedbackSchema = z.object({
  type: z.enum(['bug', 'feedback']),
  title: z.string().min(3, 'Title must be at least 3 characters').max(150),
  description: z.string().min(10, 'Description must be at least 10 characters').max(3000),
  category: z.string().optional().default('other'),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
  email: z.string().email('Invalid email address').optional(),
  name: z.string().optional(),
  pageUrl: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const session = await auth.api.getSession({ headers: req.headers });
    const ip = getClientIp(req);
    const userId = session?.user?.id;

    // 1. Upstash Redis Rate Limit Check (24h window, 5 max)
    const rateLimitKey = userId ? `user:${userId}` : `ip:${ip}`;
    const rlResult = await checkRateLimit(req, {
      windowMs: 24 * 60 * 60 * 1000, // 24 hours
      max: 5,
      keyPrefix: `feedback:${rateLimitKey}`,
    });

    if (!rlResult.success) {
      return (
        rlResult.response ||
        NextResponse.json(
          {
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Rate limit exceeded. You can submit up to 5 bug reports/feedback per day.',
            },
          },
          { status: 429 }
        )
      );
    }

    // 2. Fallback DB Count Check (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dbFilter = userId ? { userId } : { ip };

    const countInLast24h = await Feedback.countDocuments({
      ...dbFilter,
      createdAt: { $gte: twentyFourHoursAgo },
    });

    if (countInLast24h >= 5) {
      return NextResponse.json(
        {
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'You have reached the maximum limit of 5 submissions per day. Please try again tomorrow.',
          },
        },
        { status: 429 }
      );
    }

    // 3. Parse payload
    const body = await req.json();
    const parsed = feedbackSchema.parse(body);

    const reporterEmail = parsed.email || session?.user?.email;
    if (!reporterEmail) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Email address is required' } },
        { status: 400 }
      );
    }

    const reporterName = parsed.name || session?.user?.name;
    const userAgent = req.headers.get('user-agent') || undefined;

    // 4. Create Feedback document
    const feedbackDoc = await Feedback.create({
      userId: userId || undefined,
      email: reporterEmail,
      name: reporterName,
      type: parsed.type,
      title: parsed.title,
      description: parsed.description,
      category: parsed.category,
      severity: parsed.type === 'bug' ? parsed.severity : undefined,
      pageUrl: parsed.pageUrl,
      userAgent,
      ip,
      status: 'pending',
    });

    // 5. Send Admin Notification Email (asynchronously)
    sendFeedbackNotificationEmail({
      type: parsed.type,
      title: parsed.title,
      description: parsed.description,
      reporterEmail,
      reporterName,
      category: parsed.category,
      severity: parsed.severity,
      pageUrl: parsed.pageUrl,
    }).catch((err) => {
      console.error('Failed to trigger admin feedback notification email:', err);
    });

    const remainingToday = Math.max(0, 5 - (countInLast24h + 1));

    return NextResponse.json(
      {
        success: true,
        message: 'Feedback submitted successfully',
        feedback: feedbackDoc,
        remainingToday,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: error.issues[0]?.message || 'Invalid form data',
            details: error.issues,
          },
        },
        { status: 400 }
      );
    }

    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: error.message || 'Failed to submit feedback' } },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const session = await auth.api.getSession({ headers: req.headers });
    const ip = getClientIp(req);
    const userId = session?.user?.id;

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dbFilter = userId ? { userId } : { ip };

    const countInLast24h = await Feedback.countDocuments({
      ...dbFilter,
      createdAt: { $gte: twentyFourHoursAgo },
    });

    const remainingToday = Math.max(0, 5 - countInLast24h);

    let mySubmissions: any[] = [];
    if (userId) {
      mySubmissions = await Feedback.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
    }

    return NextResponse.json({
      usedToday: countInLast24h,
      limitToday: 5,
      remainingToday,
      submissions: mySubmissions,
    });
  } catch (error: any) {
    console.error('Error fetching feedback stats:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch feedback stats' } },
      { status: 500 }
    );
  }
}
