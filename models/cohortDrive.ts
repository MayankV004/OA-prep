import { Schema, model, models, Document, Types } from 'mongoose';

export type CohortDriveStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';

export interface ICohortDrive extends Document {
  institutionId: Types.ObjectId;
  assessmentId: Types.ObjectId;
  title: string;
  description?: string;
  startsAt: Date;
  endsAt: Date;
  durationMinutes: number;
  strictProctoring: boolean;
  allowedEmailDomains: string[];
  accessCode?: string;
  status: CohortDriveStatus;
  createdById?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const cohortDriveSchema = new Schema<ICohortDrive>(
  {
    institutionId: {
      type: Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
      index: true,
    },
    assessmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    startsAt: { type: Date, required: true, index: true },
    endsAt: { type: Date, required: true, index: true },
    durationMinutes: { type: Number, required: true, default: 90, min: 10 },
    strictProctoring: { type: Boolean, default: true },
    allowedEmailDomains: { type: [String], default: [] },
    accessCode: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
    createdById: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

cohortDriveSchema.index({ institutionId: 1, status: 1 });
cohortDriveSchema.index({ startsAt: 1, endsAt: 1 });

export const CohortDrive =
  models.CohortDrive || model<ICohortDrive>('CohortDrive', cohortDriveSchema);
