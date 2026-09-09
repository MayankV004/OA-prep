import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { Subscription, type PlanType } from '@/models/subscription';
import { PromoCode } from '@/models/promoCode';
import { recordActivity } from '@/lib/activity';
import { getDynamicPlans } from '@/lib/payments/pricingService';
import { type CheckoutPlanKey } from '@/lib/payments/types';
import { format } from 'date-fns';
import mongoose from 'mongoose';
import { z } from 'zod';

const grantProSchema = z.object({
  userId: z.string().min(1),
  action: z.enum(['grant', 'revoke']),
  plan: z.enum(['pro_monthly', 'pro_annual', 'oa_pass', 'free']).optional().default('pro_monthly'),
  durationDays: z.number().min(1).max(3650).optional().default(30),
});

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ role }) => {
    if (role !== 'admin') throw { status: 403, message: 'Forbidden' };
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const planFilter = searchParams.get('plan') || 'all';

    // Aggregate counts
    const now = new Date();
    const activeSubFilter: any = {
      status: 'active',
      plan: { $ne: 'free' },
      currentPeriodEnd: { $gt: now },
    };

    const [
      totalActiveSubscribers,
      proMonthlyCount,
      proAnnualCount,
      oaPassCount,
      totalPromos,
      promoAgg,
      allPaidSubs,
      dynamicPlans,
    ] = await Promise.all([
      Subscription.countDocuments(activeSubFilter),
      Subscription.countDocuments({ ...activeSubFilter, plan: 'pro_monthly' }),
      Subscription.countDocuments({ ...activeSubFilter, plan: 'pro_annual' }),
      Subscription.countDocuments({ ...activeSubFilter, plan: 'oa_pass' }),
      PromoCode.countDocuments(),
      PromoCode.aggregate([
        {
          $group: {
            _id: null,
            totalRedemptions: { $sum: '$redemptionCount' },
          },
        },
      ]),
      Subscription.find({ plan: { $ne: 'free' } }).lean(),
      getDynamicPlans(),
    ]);

    const totalRedemptions = promoAgg[0]?.totalRedemptions || 0;

    // Calculate total revenue and MRR in dollars
    let totalRevenueUsd = 0;
    const days = 30;
    const revenueByDay: Record<string, number> = {};
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));

    let preWindowTotal = 0;

    for (const sub of allPaidSubs as any[]) {
      const planKey = sub.plan as CheckoutPlanKey;
      const defaultPrice = dynamicPlans[planKey]?.priceUsd ?? (sub.plan === 'pro_annual' ? 119 : sub.plan === 'oa_pass' ? 39 : 19);
      const paidPrice = typeof sub.metadata?.paidPriceUsd === 'number' ? sub.metadata.paidPriceUsd : defaultPrice;

      totalRevenueUsd += paidPrice;

      const subDate = new Date(sub.createdAt || now);
      if (subDate < startDate) {
        preWindowTotal += paidPrice;
      } else {
        const dateKey = format(subDate, 'yyyy-MM-dd');
        revenueByDay[dateKey] = (revenueByDay[dateKey] || 0) + paidPrice;
      }
    }

    const proMonthlyPrice = dynamicPlans.pro_monthly?.priceUsd ?? 19;
    const proAnnualPrice = dynamicPlans.pro_annual?.priceUsd ?? 119;
    const mrrUsd = Math.round((proMonthlyCount * proMonthlyPrice) + (proAnnualCount * (proAnnualPrice / 12)));

    // Generate 30-day cumulative and daily revenue progression
    let runningCumulative = preWindowTotal;
    const revenueTrend = [];

    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const key = format(d, 'yyyy-MM-dd');
      const dayRev = revenueByDay[key] || 0;
      runningCumulative += dayRev;

      revenueTrend.push({
        date: key,
        revenue: dayRev,
        cumulativeRevenue: runningCumulative,
      });
    }

    // Fetch subscription rows
    const listQuery: any = {};
    if (planFilter !== 'all') {
      listQuery.plan = planFilter;
    }

    const subscriptions = await Subscription.find(listQuery)
      .sort({ updatedAt: -1 })
      .limit(100)
      .populate('userId', 'name email')
      .lean();

    const rows = subscriptions.map((sub: any) => ({
      _id: String(sub._id),
      userId: sub.userId ? String(sub.userId._id || sub.userId) : null,
      userName: sub.userId?.name || 'Unknown User',
      userEmail: sub.userId?.email || '—',
      plan: sub.plan,
      status: sub.status,
      provider: sub.provider,
      currentPeriodStart: sub.currentPeriodStart,
      currentPeriodEnd: sub.currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      aiCreditsQuota: sub.aiCreditsQuota,
      aiCreditsUsed: sub.aiCreditsUsed,
      promoCode: sub.metadata?.promoCode || null,
      paidPriceUsd: sub.metadata?.paidPriceUsd ?? null,
      grantedByAdmin: Boolean(sub.metadata?.grantedByAdmin),
      updatedAt: sub.updatedAt,
    }));

    return {
      stats: {
        totalActiveSubscribers,
        proMonthlyCount,
        proAnnualCount,
        oaPassCount,
        totalPromos,
        totalRedemptions,
        totalRevenueUsd,
        mrrUsd,
        revenueTrend,
      },
      data: rows,
    };
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async ({ userId: adminId, role }) => {
    if (role !== 'admin') throw { status: 403, message: 'Forbidden' };
    await dbConnect();

    const body = await req.json();
    const { userId, action, plan, durationDays } = grantProSchema.parse(body);

    const targetObjectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    const now = new Date();

    if (action === 'revoke') {
      const updated = await Subscription.findOneAndUpdate(
        { userId: targetObjectId },
        {
          $set: {
            plan: 'free',
            status: 'canceled',
            currentPeriodEnd: now,
            cancelAtPeriodEnd: false,
            metadata: {
              revokedByAdmin: true,
              revokedAt: now,
              adminId,
            },
          },
        },
        { new: true }
      );

      recordActivity({
        actorId: adminId,
        targetUserId: userId,
        kind: 'subscription_upgraded',
        entity: {
          type: 'subscription',
          id: userId,
          title: 'Subscription Revoked by Admin',
        },
      });

      return { success: true, message: 'Pro access revoked.', subscription: updated };
    }

    // Action: grant
    const periodEnd = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const credits = plan === 'pro_annual' ? 1500 : plan === 'oa_pass' ? 250 : 100;

    const updated = await Subscription.findOneAndUpdate(
      { userId: targetObjectId },
      {
        $set: {
          userId: targetObjectId,
          plan: plan as PlanType,
          status: 'active',
          provider: 'mock',
          customerId: `admin_granted_${userId}`,
          subscriptionId: `admin_grant_${Date.now()}`,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
          aiCreditsQuota: credits,
          aiCreditsUsed: 0,
          metadata: {
            grantedByAdmin: true,
            grantedAt: now,
            durationDays,
            adminId,
          },
        },
      },
      { upsert: true, new: true }
    );

    recordActivity({
      actorId: adminId,
      targetUserId: userId,
      kind: 'subscription_upgraded',
      entity: {
        type: 'subscription',
        id: userId,
        title: `Pro Access (${plan}) Granted by Admin`,
      },
    });

    return {
      success: true,
      message: `Pro access (${plan}) granted for ${durationDays} days.`,
      subscription: updated,
    };
  });
}
