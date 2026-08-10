import { Schema, model, models } from 'mongoose';

const cheatsheetSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    body: { type: String, default: '' },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Group' },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

cheatsheetSchema.index({ userId: 1, slug: 1 }, { unique: true });
cheatsheetSchema.index({ userId: 1, tags: 1 });
cheatsheetSchema.index({ title: 'text', body: 'text' });

export const Cheatsheet = models.Cheatsheet || model('Cheatsheet', cheatsheetSchema);
