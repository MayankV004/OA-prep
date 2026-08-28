import { Schema, model, models, type Types } from 'mongoose';

export interface IContestAlertLog {
  userId: Types.ObjectId;
  contestId: Types.ObjectId;
  leadTime: string; // '24h' | '2h' | '30m' | 'weekly_digest' | 'test'
  sentAt: Date;
  status: 'SENT' | 'FAILED';
  emailId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const contestAlertLogSchema = new Schema<IContestAlertLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    contestId: { type: Schema.Types.ObjectId, ref: 'Contest', required: true, index: true },
    leadTime: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['SENT', 'FAILED'], default: 'SENT' },
    emailId: { type: String },
  },
  { timestamps: true }
);

// Idempotency barrier: prevent duplicate alert sending for the exact same user, contest and leadTime
contestAlertLogSchema.index({ userId: 1, contestId: 1, leadTime: 1 }, { unique: true });

// Auto-cleanup after 30 days via TTL index
contestAlertLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const ContestAlertLog =
  models.ContestAlertLog ||
  model<IContestAlertLog>('ContestAlertLog', contestAlertLogSchema, 'contest_alert_logs');
