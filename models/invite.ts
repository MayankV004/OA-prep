import { Schema, model, models } from 'mongoose';

const inviteSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true },
    name: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    tokenHash: { type: String, required: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'revoked', 'expired'],
      default: 'pending',
    },
    sentAt: { type: Date, required: true, default: Date.now },
    expiresAt: { type: Date, required: true },
    acceptedAt: { type: Date },
  },
  { timestamps: true }
);

inviteSchema.index({ email: 1, status: 1 });
inviteSchema.index({ tokenHash: 1 }, { unique: true });
inviteSchema.index({ expiresAt: 1 });

export const Invite = models.Invite || model('Invite', inviteSchema);
