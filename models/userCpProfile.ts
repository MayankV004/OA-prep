import { Schema, model, models, type Types } from 'mongoose';

export interface IUserCpProfile {
  userId: Types.ObjectId;
  codeforces?: {
    handle: string;
    rating: number;
    maxRating: number;
    rank: string;
    avatar?: string;
    lastSyncedAt: Date;
  };
  leetcode?: {
    username: string;
    rating: number;
    globalRanking: number;
    topPercentage: number;
    attendedContestsCount: number;
    badge?: string;
    lastSyncedAt: Date;
  };
  codechef?: {
    handle: string;
    rating: number;
    stars: string; // e.g. "3★"
    globalRank: number;
    division: string;
    lastSyncedAt: Date;
  };
  atcoder?: {
    handle: string;
    rating: number;
    highestRating: number;
    color: string;
    lastSyncedAt: Date;
  };
  compositeScore: number; // Aggregate strength score (0 - 100)
  createdAt: Date;
  updatedAt: Date;
}

const userCpProfileSchema = new Schema<IUserCpProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    codeforces: {
      handle: { type: String, trim: true },
      rating: { type: Number, default: 0 },
      maxRating: { type: Number, default: 0 },
      rank: { type: String },
      avatar: { type: String },
      lastSyncedAt: { type: Date },
    },
    leetcode: {
      username: { type: String, trim: true },
      rating: { type: Number, default: 0 },
      globalRanking: { type: Number, default: 0 },
      topPercentage: { type: Number, default: 0 },
      attendedContestsCount: { type: Number, default: 0 },
      badge: { type: String },
      lastSyncedAt: { type: Date },
    },
    codechef: {
      handle: { type: String, trim: true },
      rating: { type: Number, default: 0 },
      stars: { type: String },
      globalRank: { type: Number, default: 0 },
      division: { type: String },
      lastSyncedAt: { type: Date },
    },
    atcoder: {
      handle: { type: String, trim: true },
      rating: { type: Number, default: 0 },
      highestRating: { type: Number, default: 0 },
      color: { type: String },
      lastSyncedAt: { type: Date },
    },
    compositeScore: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

export const UserCpProfile =
  models.UserCpProfile || model<IUserCpProfile>('UserCpProfile', userCpProfileSchema, 'user_cp_profiles');
