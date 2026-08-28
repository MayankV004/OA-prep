import { Schema, model, models, type Types } from 'mongoose';

export interface IUserContestHistory {
  userId: Types.ObjectId;
  platform: 'codeforces' | 'leetcode' | 'codechef' | 'atcoder';
  contestId: string;
  contestName: string;
  contestUrl: string;
  contestDate: Date;
  rank: number;
  totalParticipants?: number;
  problemsSolved?: number;
  totalProblems?: number;
  oldRating: number;
  newRating: number;
  ratingDelta: number; // e.g. +72 or -15
  unsolvedProblems?: Array<{ title: string; url: string; index?: string; rating?: number }>;
  createdAt: Date;
  updatedAt: Date;
}

const userContestHistorySchema = new Schema<IUserContestHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    platform: { type: String, enum: ['codeforces', 'leetcode', 'codechef', 'atcoder'], required: true, index: true },
    contestId: { type: String, required: true, index: true },
    contestName: { type: String, required: true },
    contestUrl: { type: String, required: true },
    contestDate: { type: Date, required: true, index: true },
    rank: { type: Number, required: true },
    totalParticipants: { type: Number },
    problemsSolved: { type: Number },
    totalProblems: { type: Number },
    oldRating: { type: Number, required: true },
    newRating: { type: Number, required: true },
    ratingDelta: { type: Number, required: true },
    unsolvedProblems: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
        index: { type: String },
        rating: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

// Idempotent uniqueness: candidate can only have 1 record per contest per platform
userContestHistorySchema.index({ userId: 1, platform: 1, contestId: 1 }, { unique: true });
userContestHistorySchema.index({ userId: 1, contestDate: -1 });
userContestHistorySchema.index({ platform: 1, contestDate: -1 });

export const UserContestHistory =
  models.UserContestHistory ||
  model<IUserContestHistory>('UserContestHistory', userContestHistorySchema, 'user_contest_histories');
