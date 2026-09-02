import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { getPaymentAdapter, type CheckoutPlanKey } from '@/lib/payments';
import { env } from '@/lib/config';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';
import { z } from 'zod';

const checkoutSchema = z.object({
  plan: z.enum(['pro_monthly', 'pro_annual', 'oa_pass']),
});

export async function POST(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    await dbConnect();
    const db = mongoose.connection.db;
    if (!db) throw { status: 500, message: 'Database connection failed' };

    const body = await req.json();
    const { plan } = checkoutSchema.parse(body);

    // Resolve user email
    const idQueries: any[] = [{ _id: userId }];
    if (mongoose.Types.ObjectId.isValid(userId)) {
      idQueries.push({ _id: new mongoose.Types.ObjectId(userId) });
    }
    idQueries.push({ id: userId });

    const userDoc: any = await db.collection('user').findOne({ $or: idQueries });
    if (!userDoc?.email) {
      throw { status: 404, message: 'User profile with valid email not found' };
    }

    const appUrl = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${appUrl}/dashboard?payment=success&plan=${plan}`;
    const cancelUrl = `${appUrl}/pricing?canceled=true`;

    const paymentAdapter = getPaymentAdapter();
    const session = await paymentAdapter.createCheckoutSession({
      userId: userDoc._id.toString(),
      userEmail: userDoc.email,
      plan: plan as CheckoutPlanKey,
      successUrl,
      cancelUrl,
    });

    return {
      success: true,
      url: session.url,
      provider: session.provider,
    };
  });
}
