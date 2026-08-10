import { Schema, model, models } from 'mongoose';

const groupSchema = new Schema(
  {
    kind: {
      type: String,
      enum: ['subject', 'advanced'],
      required: true,
    },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

groupSchema.index({ kind: 1, slug: 1 }, { unique: true });
groupSchema.index({ kind: 1, order: 1 });

export const Group = models.Group || model('Group', groupSchema);
