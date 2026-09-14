import { Schema, model, models } from 'mongoose';

const questionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    isSystem: { type: Boolean, default: false, index: true },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
      index: true,
    },
    question: { type: String, required: true },
    answer: { type: String, default: '' },
    keyPoints: [{ type: String }],
    companyTags: [{ type: String }],
    tags: [{ type: String }],
  },
  { timestamps: true }
);

questionSchema.index({ subjectId: 1, isSystem: 1 });
questionSchema.index({ userId: 1, subjectId: 1 });
questionSchema.index({ companyTags: 1 });
questionSchema.index({ question: 'text', answer: 'text' });

export const Question = models.Question || model('Question', questionSchema);

