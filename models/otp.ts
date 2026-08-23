import { Schema, model, models } from 'mongoose';

const otpVerificationSchema = new Schema(
  {
    email: { type: String, required: true, index: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, expires: 0 }, // MongoDB TTL index auto-deletes expired documents
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);


export const OTPVerification =
  models.OTPVerification || model('OTPVerification', otpVerificationSchema);
