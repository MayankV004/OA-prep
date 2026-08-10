import { Schema, model, models } from 'mongoose';

const userSchema = new Schema(
  {
    // BetterAuth standard fields (name, email, emailVerified, image)
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Boolean, required: true, default: false },
    image: { type: String },

    // Additional fields mapped via BetterAuth
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    disabled: { type: Boolean, default: false },
    lastSeenAt: { type: Date },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// BetterAuth creates indexes itself, but defining them explicitly here for clarity
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ disabled: 1 });

export const User = models.User || model('User', userSchema, 'user');
