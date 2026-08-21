import { Schema, model, models } from 'mongoose';

const userProgressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    problemId: { type: String, required: true, index: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    notes: { type: String, default: '' },
    revision: { type: Boolean, default: false },   // ⭐ Revision bookmark
    userNotes: { type: String, default: '' },       // 📝 Per-problem markdown notes
  },
  { timestamps: true, strict: true }
);

// Compound index for fast lookup of a user's progress on a specific problem
userProgressSchema.index({ userId: 1, problemId: 1 }, { unique: true });

export const UserProgress = models.UserProgress || model('UserProgress', userProgressSchema);
