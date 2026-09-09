import { Schema, model, models, type Document } from 'mongoose';
import type { CheckoutPlanKey } from '@/lib/payments/types';

export interface IPricingPlan extends Document {
  planKey: CheckoutPlanKey;
  name: string;
  badge?: string;
  priceUsd: number;
  period: 'month' | 'year' | '75_days';
  mode: 'subscription' | 'payment';
  description: string;
  features: string[];
  aiCredits: number;
  isActive: boolean;
  stripePriceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const pricingPlanSchema = new Schema<IPricingPlan>(
  {
    planKey: {
      type: String,
      required: true,
      unique: true,
      enum: ['pro_monthly', 'pro_annual', 'oa_pass'],
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    badge: {
      type: String,
      default: '',
      trim: true,
    },
    priceUsd: {
      type: Number,
      required: true,
      min: 0,
    },
    period: {
      type: String,
      enum: ['month', 'year', '75_days'],
      required: true,
    },
    mode: {
      type: String,
      enum: ['subscription', 'payment'],
      required: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    features: {
      type: [String],
      default: [],
    },
    aiCredits: {
      type: Number,
      default: 100,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    stripePriceId: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const PricingPlan =
  models.PricingPlan || model<IPricingPlan>('PricingPlan', pricingPlanSchema, 'pricing_plans');
