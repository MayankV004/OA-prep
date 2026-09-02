import mongoose from 'mongoose';
import { dbConnect } from '@/lib/db';
import { Subscription, type ISubscription, type PlanType, type SubscriptionStatus } from '@/models/subscription';
import { User } from '@/models/user';
import { withAuth } from '@/lib/auth';

export interface UserEntitlement {
  isPro: boolean;
  plan: PlanType;
  status: SubscriptionStatus;
  expiresAt: Date | null;
  cancelAtPeriodEnd: boolean;
  aiCreditsQuota: number;
  aiCreditsUsed: number;
  aiCreditsRemaining: number;
  customerId?: string;
  isAdmin: boolean;
}

export async function getUserEntitlement(userId: string): Promise<UserEntitlement> {
  await dbConnect();
  const db = mongoose.connection.db;

  const idQueries: any[] = [{ _id: userId }];
  if (mongoose.Types.ObjectId.isValid(userId)) {
    idQueries.push({ _id: new mongoose.Types.ObjectId(userId) });
  }
  idQueries.push({ id: userId });

  const userDoc: any = db ? await db.collection('user').findOne({ $or: idQueries }) : null;
  const isAdmin = userDoc?.role === 'admin';
  const targetId = userDoc?._id || (mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId);

  const sub = await Subscription.findOne({
    $or: [{ userId: targetId }, { userId }],
  }).lean<ISubscription | null>();

  if (!sub) {
    return {
      isPro: false,
      plan: 'free',
      status: 'active',
      expiresAt: null,
      cancelAtPeriodEnd: false,
      aiCreditsQuota: 10,
      aiCreditsUsed: 0,
      aiCreditsRemaining: 10,
      isAdmin,
    };
  }

  const isExpired = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) < new Date() : false;
  const isPaidPlan = ['pro_monthly', 'pro_annual', 'oa_pass', 'campus'].includes(sub.plan);
  const isPro = isPaidPlan && sub.status === 'active' && !isExpired;

  const quota = sub.aiCreditsQuota ?? 10;
  const used = sub.aiCreditsUsed ?? 0;

  return {
    isPro,
    plan: isExpired ? 'free' : sub.plan,
    status: isExpired ? 'expired' : sub.status,
    expiresAt: sub.currentPeriodEnd || null,
    cancelAtPeriodEnd: Boolean(sub.cancelAtPeriodEnd),
    aiCreditsQuota: quota,
    aiCreditsUsed: used,
    aiCreditsRemaining: Math.max(0, quota - used),
    customerId: sub.customerId,
    isAdmin,
  };
}

export async function requirePro(userId: string): Promise<UserEntitlement> {
  const entitlement = await getUserEntitlement(userId);
  if (!entitlement.isPro) {
    throw {
      status: 403,
      code: 'UPGRADE_REQUIRED',
      message: 'Upgrade to BigO Pro to unlock this feature.',
    };
  }
  return entitlement;
}

/**
 * Route wrapper that ensures the authenticated user has an active Pro subscription or Admin role
 */
export function withPro<T>(
  req: Request,
  fn: (ctx: { userId: string; role: 'admin' | 'user'; entitlement: UserEntitlement }) => Promise<T>
) {
  return withAuth(req, async (ctx) => {
    const entitlement = await requirePro(ctx.userId);
    return fn({ ...ctx, entitlement });
  });
}
