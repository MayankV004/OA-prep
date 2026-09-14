import { Schema, model, models } from 'mongoose';

const userQuestionProgressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    status: {
      type: String,
      enum: ['unseen', 'learning', 'reviewing', 'mastered'],
      default: 'unseen',
      index: true,
    },
    confidence: { type: Number, min: 0, max: 4, default: 0 },
    bookmarked: { type: Boolean, default: false, index: true },
    timesReviewed: { type: Number, default: 0 },
    lastReviewedAt: { type: Date },
    nextReviewAt: { type: Date, index: true },
    userNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

userQuestionProgressSchema.index({ userId: 1, questionId: 1 }, { unique: true });
userQuestionProgressSchema.index({ userId: 1, subjectId: 1, status: 1 });
userQuestionProgressSchema.index({ userId: 1, subjectId: 1, bookmarked: 1 });

export const UserQuestionProgress =
  models.UserQuestionProgress || model('UserQuestionProgress', userQuestionProgressSchema);
