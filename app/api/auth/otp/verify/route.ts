import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import { OTPVerification, User } from '@/models';
import { z } from 'zod';

const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'Verification code must be 6 digits'),
});

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { email, otp } = verifyOtpSchema.parse(body);

    const cleanEmail = email.toLowerCase().trim();

    const record = await OTPVerification.findOne({ email: cleanEmail });
    if (!record) {
      return NextResponse.json(
        { error: { message: 'Verification code expired or not found. Please request a new code.' } },
        { status: 400 }
      );
    }

    if (new Date() > record.expiresAt) {
      await OTPVerification.deleteOne({ email: cleanEmail });
      return NextResponse.json(
        { error: { message: 'Verification code has expired. Please request a new code.' } },
        { status: 400 }
      );
    }

    if (record.attempts >= 5) {
      await OTPVerification.deleteOne({ email: cleanEmail });
      return NextResponse.json(
        { error: { message: 'Too many failed attempts. Please request a new verification code.' } },
        { status: 400 }
      );
    }

    const inputHash = crypto.createHash('sha256').update(otp.trim()).digest('hex');

    if (inputHash !== record.otpHash) {
      record.attempts += 1;
      await record.save();
      const remaining = 5 - record.attempts;
      return NextResponse.json(
        { error: { message: `Incorrect verification code. ${remaining} attempts remaining.` } },
        { status: 400 }
      );
    }

    // OTP matches! Mark user as emailVerified = true
    const user = await User.findOne({ email: cleanEmail });
    if (user) {
      user.emailVerified = true;
      await user.save();
    }

    // Clean up OTP record
    await OTPVerification.deleteOne({ email: cleanEmail });

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'Email address verified successfully!',
    });
  } catch (err: any) {
    console.error('Error verifying OTP:', err);
    const message = err.errors?.[0]?.message || err.message || 'Failed to verify code';
    return NextResponse.json({ error: { message } }, { status: 400 });
  }
}
