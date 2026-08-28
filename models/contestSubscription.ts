import { Schema, model, models, type Types } from 'mongoose';
import crypto from 'crypto';
import type { ContestPlatform } from './contest';

export type ContestLeadTime = '24h' | '2h' | '30m';

export interface IContestSubscription {
  userId: Types.ObjectId;
  email: string;
  enabled: boolean;
  platforms: ContestPlatform[];
  leadTimes: ContestLeadTime[];
  weeklyDigest: boolean;
  timezone: string;
  unsubscribeToken: string;
  createdAt: Date;
  updatedAt: Date;
}

const contestSubscriptionSchema = new Schema<IContestSubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    enabled: { type: Boolean, default: true, index: true },
    platforms: {
      type: [String],
      enum: ['leetcode', 'codeforces', 'codechef', 'atcoder', 'hackerearth'],
      default: ['leetcode', 'codeforces', 'codechef', 'atcoder'],
    },
    leadTimes: {
      type: [String],
      enum: ['24h', '2h', '30m'],
      default: ['2h', '30m'],
    },
    weeklyDigest: { type: Boolean, default: true },
    timezone: { type: String, default: 'Asia/Kolkata' },
    unsubscribeToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => crypto.randomBytes(24).toString('hex'),
    },
  },
  { timestamps: true }
);

contestSubscriptionSchema.index({ enabled: 1, platforms: 1 });

export const ContestSubscription =
  models.ContestSubscription ||
  model<IContestSubscription>('ContestSubscription', contestSubscriptionSchema, 'contest_subscriptions');
