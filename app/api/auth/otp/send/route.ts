import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import { OTPVerification, User } from '@/models';
import { sendOTPEmail } from '@/lib/email';
import { z } from 'zod';

const sendOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { email, name } = sendOtpSchema.parse(body);

    const cleanEmail = email.toLowerCase().trim();

    // Check rate limit: 60s cooldown between OTP requests
    const existing = await OTPVerification.findOne({ email: cleanEmail });
    if (existing) {
      const updatedAt = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
      const cooldownRemaining = Math.ceil((60000 - (Date.now() - updatedAt)) / 1000);
      if (cooldownRemaining > 0) {
        return NextResponse.json(
          { error: { message: `Please wait ${cooldownRemaining} seconds before requesting a new code.` } },
          { status: 429 }
        );
      }
    }

    // Lookup user to get display name if omitted
    let userName = name;
    if (!userName) {
      const user = await User.findOne({ email: cleanEmail });
      userName = user?.name || 'User';
    }

    // Generate secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes TTL

    // Upsert OTP record
    await OTPVerification.findOneAndUpdate(
      { email: cleanEmail },
      { otpHash, expiresAt, attempts: 0 },
      { upsert: true, returnDocument: 'after' }
    );

    // Send OTP email
    await sendOTPEmail({
      to: cleanEmail,
      userName,
      otp,
      expiresInMinutes: 10,
    });

    return NextResponse.json({ success: true, message: 'Verification code sent to your email.' });
  } catch (err: any) {
    console.error('Error sending OTP:', err);
    const message = err.errors?.[0]?.message || err.message || 'Failed to send verification code';
    return NextResponse.json({ error: { message } }, { status: 400 });
  }
}
