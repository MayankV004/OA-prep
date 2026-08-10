import { Schema, model, models } from 'mongoose';

const problemSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    completed: { type: Boolean, default: false, index: true },
    completedAt: { type: Date },
    notes: { type: String, default: '' },
    tags: [{ type: String }],
  },
  { timestamps: true, discriminatorKey: 'kind' }
);

// Indexes defined in schema.md
problemSchema.index({ userId: 1, kind: 1, pattern: 1 }, { partialFilterExpression: { kind: 'pattern' } });
problemSchema.index({ userId: 1, kind: 1, bucket: 1 }, { partialFilterExpression: { kind: 'nonstandard' } });
problemSchema.index({ userId: 1, kind: 1, platform: 1, contest: 1 }, { partialFilterExpression: { kind: 'cp' } });
problemSchema.index({ userId: 1, kind: 1, completed: 1 });
problemSchema.index({ userId: 1, completedAt: -1 });
problemSchema.index({ userId: 1, difficulty: 1 });
problemSchema.index({ userId: 1, tags: 1 });
problemSchema.index({ title: 'text', notes: 'text' }, { weights: { title: 5, notes: 1 } });

export const Problem = models.Problem || model('Problem', problemSchema);

export const PatternProblem = models.PatternProblem || (Problem.discriminators?.pattern || Problem.discriminator(
  'pattern',
  new Schema({ pattern: { type: String, required: true }, variation: { type: String, default: 'General' } })
));

export const NonStandardProblem = models.NonStandardProblem || (Problem.discriminators?.nonstandard || Problem.discriminator(
  'nonstandard',
  new Schema({ bucket: { type: String, required: true } })
));

export const CpProblem = models.CpProblem || (Problem.discriminators?.cp || Problem.discriminator(
  'cp',
  new Schema({ platform: { type: String }, contest: { type: String }, rating: { type: Number } })
));
