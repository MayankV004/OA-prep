import { Schema, model, models } from 'mongoose';

const taxonomySchema = new Schema(
  {
    kind: {
      type: String,
      enum: ['pattern', 'bucket', 'platform', 'subject', 'advanced', 'difficulty'],
      required: true,
    },
    name: { type: String, required: true, maxlength: 80 },
    slug: { type: String, required: true },
    order: { type: Number, default: 0 },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

taxonomySchema.index({ kind: 1, slug: 1 }, { unique: true });
taxonomySchema.index({ kind: 1, order: 1 });
taxonomySchema.index({ kind: 1, archived: 1 });

export const Taxonomy = models.Taxonomy || model('Taxonomy', taxonomySchema);
