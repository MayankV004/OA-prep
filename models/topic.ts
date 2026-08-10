import { Schema, model, models } from 'mongoose';

const topicSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

topicSchema.index({ userId: 1, groupId: 1 });
topicSchema.index({ title: 'text', body: 'text' }, { weights: { title: 5, body: 1 } });

export const Topic = models.Topic || model('Topic', topicSchema);
