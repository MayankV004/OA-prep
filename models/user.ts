import { Schema, model, models } from 'mongoose';

const userSchema = new Schema(
  {
    // BetterAuth standard fields (name, email, emailVerified, image)
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Boolean, required: true, default: false },
    image: { type: String, default: '' },

    // Additional profile fields
    bio: { type: String, default: '' },
    college: { type: String, default: '' },
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    portfolio: { type: String, default: '' },

    // Additional fields mapped via BetterAuth
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    disabled: { type: Boolean, default: false },
    lastSeenAt: { type: Date },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, strict: false }
);

// Indexes
userSchema.index({ role: 1 });
userSchema.index({ disabled: 1 });

export const User = models.User || model('User', userSchema, 'user');
