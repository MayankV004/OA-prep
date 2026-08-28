import { Schema, model, models } from 'mongoose';

export type ContestPlatform = 'leetcode' | 'codeforces' | 'codechef' | 'atcoder' | 'hackerearth';
export type ContestStatus = 'UPCOMING' | 'RUNNING' | 'COMPLETED';

export interface IContest {
  externalId: string;
  platform: ContestPlatform;
  name: string;
  url: string;
  startTime: Date;
  endTime: Date;
  durationSeconds: number;
  status: ContestStatus;
  raw?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const contestSchema = new Schema<IContest>(
  {
    externalId: { type: String, required: true, unique: true, index: true },
    platform: {
      type: String,
      enum: ['leetcode', 'codeforces', 'codechef', 'atcoder', 'hackerearth'],
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true },
    durationSeconds: { type: Number, required: true },
    status: {
      type: String,
      enum: ['UPCOMING', 'RUNNING', 'COMPLETED'],
      default: 'UPCOMING',
      index: true,
    },
    raw: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Compound indexes for high performance querying
contestSchema.index({ status: 1, startTime: 1 });
contestSchema.index({ platform: 1, startTime: 1 });
contestSchema.index({ startTime: 1, endTime: 1 });

export const Contest = models.Contest || model<IContest>('Contest', contestSchema, 'contests');
