import { Schema, model, models, type Document, type Types } from 'mongoose';

export type PlanType = 'free' | 'pro_monthly' | 'pro_annual' | 'oa_pass' | 'campus';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'expired' | 'trialing';
export type PaymentProvider = 'stripe' | 'mock';

export interface ISubscription extends Document {
  userId: Types.ObjectId;
  plan: PlanType;
  status: SubscriptionStatus;
  provider: PaymentProvider;
  customerId: string;
  subscriptionId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  aiCreditsQuota: number;
  aiCreditsUsed: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    plan: {
      type: String,
      enum: ['free', 'pro_monthly', 'pro_annual', 'oa_pass', 'campus'],
      default: 'free',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'expired', 'trialing'],
      default: 'active',
      required: true,
    },
    provider: {
      type: String,
      enum: ['stripe', 'mock'],
      default: 'stripe',
      required: true,
    },
    customerId: { type: String, default: '' },
    subscriptionId: { type: String, default: '' },
    currentPeriodStart: { type: Date, default: Date.now },
    currentPeriodEnd: { type: Date, default: () => new Date(Date.now() + 365 * 100 * 24 * 60 * 60 * 1000) }, // Free tier lasts indefinitely
    cancelAtPeriodEnd: { type: Boolean, default: false },
    aiCreditsQuota: { type: Number, default: 10 },
    aiCreditsUsed: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1 });
subscriptionSchema.index({ customerId: 1 });
subscriptionSchema.index({ subscriptionId: 1 });

export const Subscription = models.Subscription || model<ISubscription>('Subscription', subscriptionSchema, 'subscription');
