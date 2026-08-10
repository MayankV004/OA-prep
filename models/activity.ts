import { Schema, model, models } from 'mongoose';

const activitySchema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    kind: { type: String, required: true },
    entity: {
      type: { type: String },
      id: { type: Schema.Types.ObjectId },
      title: { type: String },
    },
    metadata: { type: Schema.Types.Mixed, default: {} },
    ip: { type: String },
  },
  { timestamps: true }
);

activitySchema.index({ targetUserId: 1, createdAt: -1 });
activitySchema.index({ actorId: 1, createdAt: -1 });
activitySchema.index({ kind: 1, createdAt: -1 });

export const Activity = models.Activity || model('Activity', activitySchema);
