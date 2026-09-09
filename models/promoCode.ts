import { Schema, model, models, type Document, type Types } from 'mongoose';

export type PromoDiscountType = 'percentage' | 'fixed';

export interface IPromoCode extends Document {
  code: string;
  description?: string;
  discountType: PromoDiscountType;
  discountValue: number;
  applicablePlans: string[];
  maxRedemptions?: number;
  redemptionCount: number;
  expiresAt?: Date;
  isActive: boolean;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const promoCodeSchema = new Schema<IPromoCode>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    applicablePlans: {
      type: [String],
      default: ['all'],
    },
    maxRedemptions: {
      type: Number,
      default: null,
    },
    redemptionCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

promoCodeSchema.index({ code: 1, isActive: 1 });

export const PromoCode =
  models.PromoCode || model<IPromoCode>('PromoCode', promoCodeSchema, 'promo_codes');
