import { Schema, model, models } from 'mongoose';

export interface IFeedback {
  _id?: string;
  userId?: Schema.Types.ObjectId | string;
  email: string;
  name?: string;
  type: 'bug' | 'feedback';
  title: string;
  description: string;
  category?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  pageUrl?: string;
  userAgent?: string;
  ip?: string;
  status: 'pending' | 'in_review' | 'resolved' | 'dismissed';
  adminNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    email: { type: String, required: true, trim: true, lowercase: true },
    name: { type: String, trim: true },
    type: { type: String, enum: ['bug', 'feedback'], required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, default: 'other', trim: true },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    pageUrl: { type: String, trim: true },
    userAgent: { type: String, trim: true },
    ip: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'in_review', 'resolved', 'dismissed'],
      default: 'pending',
    },
    adminNotes: { type: String, trim: true },
  },
  { timestamps: true }
);

feedbackSchema.index({ userId: 1, createdAt: -1 });
feedbackSchema.index({ ip: 1, createdAt: -1 });
feedbackSchema.index({ status: 1, createdAt: -1 });
feedbackSchema.index({ type: 1, createdAt: -1 });

export const Feedback = models.Feedback || model<IFeedback>('Feedback', feedbackSchema);
