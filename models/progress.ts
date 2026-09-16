import { Schema, model, models } from 'mongoose';

const userProgressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    problemId: { type: String, required: true, index: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    notes: { type: String, default: '' },
    revision: { type: Boolean, default: false },   // ⭐ Revision bookmark
    timesRevised: { type: Number, default: 0 },    // 🔄 Number of times user marked revised
    lastRevisedAt: { type: Date },                 // ⏱️ Last revision timestamp
    nextReviewAt: { type: Date, index: true },      // 📅 Spaced repetition target date
    revisionConfidence: {
      type: String,
      enum: ['struggled', 'good', 'mastered'],
      default: 'good',
    },
    userNotes: { type: String, default: '' },       // 📝 Per-problem markdown notes
  },
  { timestamps: true, strict: true }
);

// Compound index for fast lookup of a user's progress on a specific problem
userProgressSchema.index({ userId: 1, problemId: 1 }, { unique: true });
// Index for fast query of overdue/active revision items
userProgressSchema.index({ userId: 1, revision: 1, nextReviewAt: 1 });

export const UserProgress = models.UserProgress || model('UserProgress', userProgressSchema);
