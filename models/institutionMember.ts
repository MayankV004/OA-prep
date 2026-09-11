import { Schema, model, models, Document, Types } from 'mongoose';

export type InstitutionRole = 'head' | 'coordinator' | 'invigilator';
export type MemberStatus = 'active' | 'invited' | 'revoked';

export interface IInstitutionMember extends Document {
  institutionId: Types.ObjectId;
  userId: Types.ObjectId;
  role: InstitutionRole;
  department?: string;
  status: MemberStatus;
  invitedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const institutionMemberSchema = new Schema<IInstitutionMember>(
  {
    institutionId: {
      type: Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['head', 'coordinator', 'invigilator'],
      default: 'coordinator',
      required: true,
    },
    department: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['active', 'invited', 'revoked'],
      default: 'active',
      index: true,
    },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

institutionMemberSchema.index({ institutionId: 1, userId: 1 }, { unique: true });
institutionMemberSchema.index({ institutionId: 1, role: 1 });

export const InstitutionMember =
  models.InstitutionMember ||
  model<IInstitutionMember>('InstitutionMember', institutionMemberSchema);
