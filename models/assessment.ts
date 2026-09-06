import { Schema, model, models, type Document, type Types } from 'mongoose';

export interface ITestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  explanation?: string;
}

export interface IAssessmentProblem {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  score: number;
  patternTag: string;
  starterCode: {
    cpp: string;
    python: string;
    java: string;
  };
  testCases: ITestCase[];
}

export interface IAssessment extends Document {
  title: string;
  slug: string;
  company: string;
  role: string;
  description: string;
  durationMinutes: number;
  passingScore: number;
  isProOnly: boolean;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  problems: IAssessmentProblem[];
  companyInstructions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const testCaseSchema = new Schema<ITestCase>(
  {
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false },
    explanation: { type: String, default: '' },
  },
  { _id: false }
);

const assessmentProblemSchema = new Schema<IAssessmentProblem>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    score: { type: Number, required: true, default: 50 },
    patternTag: { type: String, required: true },
    starterCode: {
      cpp: { type: String, default: '' },
      python: { type: String, default: '' },
      java: { type: String, default: '' },
    },
    testCases: [testCaseSchema],
  },
  { _id: false }
);

const assessmentSchema = new Schema<IAssessment>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    company: { type: String, required: true, index: true },
    role: { type: String, required: true },
    description: { type: String, required: true },
    durationMinutes: { type: Number, required: true, default: 60 },
    passingScore: { type: Number, required: true, default: 70 },
    isProOnly: { type: Boolean, default: true, index: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    problems: [assessmentProblemSchema],
    companyInstructions: [{ type: String }],
  },
  { timestamps: true }
);

export const Assessment = models.Assessment || model<IAssessment>('Assessment', assessmentSchema, 'assessments');
