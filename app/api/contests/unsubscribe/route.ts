import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ContestSubscription } from '@/models/contestSubscription';
import { env } from '@/lib/config';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const action = searchParams.get('action'); // 'resubscribe' or default 'unsubscribe'
  const appUrl = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!token) {
    return new NextResponse('Invalid or missing unsubscribe token.', { status: 400 });
  }

  await connectDB();
  const sub = await ContestSubscription.findOne({ unsubscribeToken: token });

  if (!sub) {
    return new NextResponse('Invalid or expired subscription link.', { status: 404 });
  }

  if (action === 'resubscribe') {
    sub.enabled = true;
    await sub.save();
  } else {
    sub.enabled = false;
    await sub.save();
  }

  const isEnabled = sub.enabled;
  const title = isEnabled ? 'Contest Alerts Re-enabled' : 'Unsubscribed from Contest Alerts';
  const subtitle = isEnabled
    ? `You will receive contest reminders at ${sub.email}.`
    : `You will no longer receive contest alert emails at ${sub.email}.`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - BigO</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #09090b;
      color: #fafafa;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .card {
      background-color: #18181b;
      border: 1px solid #27272a;
      border-radius: 24px;
      padding: 40px;
      max-width: 480px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .icon {
      font-size: 44px;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.03em;
      margin: 0 0 8px 0;
    }
    p {
      font-size: 14px;
      color: #a1a1aa;
      line-height: 1.6;
      margin: 0 0 24px 0;
    }
    .btn {
      display: inline-block;
      padding: 12px 24px;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.15s ease;
      cursor: pointer;
    }
    .btn-primary {
      background-color: #e11d48;
      color: #ffffff;
      margin-right: 8px;
    }
    .btn-secondary {
      background-color: #27272a;
      color: #fafafa;
      border: 1px solid #3f3f46;
    }
    .btn:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
    .footer {
      margin-top: 32px;
      font-size: 12px;
      color: #71717a;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${isEnabled ? '🔔' : '🔕'}</div>
    <h1>${title}</h1>
    <p>${subtitle}</p>
    <div>
      ${
        isEnabled
          ? `<a href="${appUrl}/cp/contests" class="btn btn-primary">Go to Contest Radar →</a>`
          : `<a href="/api/contests/unsubscribe?token=${token}&action=resubscribe" class="btn btn-primary">Re-enable Alerts</a>
             <a href="${appUrl}/cp/contests" class="btn btn-secondary">Manage Settings</a>`
      }
    </div>
    <div class="footer">
      BigO Platform &bull; Competitive Programming Radar
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

// RFC 8058: One-Click Unsubscribe POST
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  await connectDB();
  const sub = await ContestSubscription.findOne({ unsubscribeToken: token });
  if (sub) {
    sub.enabled = false;
    await sub.save();
  }

  return NextResponse.json({ success: true, message: 'Unsubscribed successfully' });
}
