import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProblem {
  _id?: mongoose.Types.ObjectId;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  platform: string;
  link: string;
  priority?: string;
  company_tags?: string[];
}

export interface IVariation {
  _id?: mongoose.Types.ObjectId;
  variation: string;
  description: string;
  important_details: string[];
  template_code: string;
  other_relevant_details?: string;
  problems: IProblem[];
}

export interface IPattern extends Document {
  title: string;
  slug: string;
  description: string;
  important_details?: string[];
  other_relevant_details?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  useCases?: string[];
  concept?: string;
  templateCode?: string;
  explanation?: string;
  variations: IVariation[];
  createdAt: Date;
  updatedAt: Date;
}

const problemSchema = new Schema<IProblem>({
  name: { type: String, required: true },
  difficulty: { type: String, required: true, enum: ['Easy', 'Medium', 'Hard'] },
  platform: { type: String, required: true },
  link: { type: String },
  priority: { type: String },
  company_tags: [{ type: String }]
});

const variationSchema = new Schema<IVariation>({
  variation: { type: String, required: true },
  description: { type: String },
  important_details: [{ type: String }],
  template_code: { type: String },
  other_relevant_details: { type: String },
  problems: [problemSchema]
});

const patternSchema = new Schema<IPattern>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    important_details: [{ type: String }],
    other_relevant_details: { type: String },
    timeComplexity: { type: String, default: '' },
    spaceComplexity: { type: String, default: '' },
    useCases: [{ type: String }],
    concept: { type: String, default: '' },
    templateCode: { type: String, default: '' },
    explanation: { type: String, default: '' },
    variations: [variationSchema],
  },
  { timestamps: true }
);

export const Pattern: Model<IPattern> = mongoose.models.Pattern || mongoose.model<IPattern>('Pattern', patternSchema);
