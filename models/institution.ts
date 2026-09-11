import { Schema, model, models, Document, Types } from 'mongoose';

export interface IInstitution extends Document {
  name: string;
  slug: string;
  domain: string;
  logoUrl?: string;
  totalSeats: number;
  usedSeats: number;
  licenseValidUntil: Date;
  status: 'active' | 'suspended' | 'expired';
  createdById?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const institutionSchema = new Schema<IInstitution>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    domain: { type: String, default: '', trim: true },
    logoUrl: { type: String, default: '' },
    totalSeats: { type: Number, required: true, default: 100, min: 1 },
    usedSeats: { type: Number, default: 0, min: 0 },
    licenseValidUntil: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year default
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'expired'],
      default: 'active',
      index: true,
    },
    createdById: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

institutionSchema.index({ slug: 1 });
institutionSchema.index({ status: 1 });
institutionSchema.index({ licenseValidUntil: 1 });

export const Institution =
  models.Institution || model<IInstitution>('Institution', institutionSchema);
