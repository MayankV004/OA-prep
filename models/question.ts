import { Schema, model, models } from 'mongoose';

const questionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    question: { type: String, required: true },
    answer: { type: String, default: '' },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

questionSchema.index({ userId: 1, subjectId: 1 });
questionSchema.index({ question: 'text', answer: 'text' });

export const Question = models.Question || model('Question', questionSchema);
