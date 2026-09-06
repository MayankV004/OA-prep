import { Schema, model, models, type Document, type Types } from 'mongoose';

export type SubmissionStatus = 'in_progress' | 'completed' | 'abandoned';
export type IntegrityVerdict = 'clean' | 'suspicious' | 'flagged';

export interface ITelemetryEvent {
  timestamp: Date;
  type:
    | 'tab_switch'
    | 'paste'
    | 'fullscreen_exit'
    | 'window_blur'
    | 'attempted_paste_blocked'
    | 'no_face_detected'
    | 'multiple_faces'
    | 'gaze_diverted'
    | 'voice_detected'
    | 'camera_disabled'
    | 'mic_disabled'
    | 'prohibited_object_detected';
  details?: string;
  snapshotUrl?: string;
}

export interface IProblemResult {
  problemId: string;
  code: string;
  language: string;
  passedTestCases: number;
  totalTestCases: number;
  score: number;
  timeSpentSeconds: number;
  status: 'accepted' | 'partial' | 'wrong_answer' | 'time_limit_exceeded';
}

export interface IPatternDiagnostic {
  patternTag: string;
  verdict: 'mastered' | 'needs_practice' | 'failed';
  recommendation: string;
}

export interface IAssessmentSubmission extends Document {
  userId: Types.ObjectId;
  assessmentId: Types.ObjectId;
  status: SubmissionStatus;
  startedAt: Date;
  submittedAt?: Date;
  timeSpentSeconds: number;
  // Proctor Integrity & Cheating Telemetry
  tabSwitchCount: number;
  timeAwaySeconds: number;
  pasteCount: number;
  largePasteDetected: boolean;
  pasteAttemptsBlocked: number;
  keystrokesCount: number;
  // Media & Biometrics Proctoring
  cameraEnabled: boolean;
  micEnabled: boolean;
  faceAbsenceCount: number;
  multipleFacesCount: number;
  gazeDivertedCount: number;
  voiceInterruptionCount: number;
  prohibitedObjectCount: number;
  // Candidate Baseline Selfie for Identity Continuity
  baselineSelfieUrl?: string;
  // Verdict & AI Activity Forensic Narrative
  cheatingRiskPercentage: number;
  integrityVerdict: IntegrityVerdict;
  activityAnalysisNarrative?: string;
  telemetryTimeline: ITelemetryEvent[];
  // Scoring
  totalScore: number;
  maxScore: number;
  passed: boolean;
  percentile: number;
  problemResults: IProblemResult[];
  patternDiagnostic: IPatternDiagnostic[];
  createdAt: Date;
  updatedAt: Date;
}

const telemetryEventSchema = new Schema<ITelemetryEvent>(
  {
    timestamp: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: [
        'tab_switch',
        'paste',
        'fullscreen_exit',
        'window_blur',
        'attempted_paste_blocked',
        'no_face_detected',
        'multiple_faces',
        'gaze_diverted',
        'voice_detected',
        'camera_disabled',
        'mic_disabled',
        'prohibited_object_detected',
      ],
      required: true,
    },
    details: { type: String, default: '' },
    snapshotUrl: { type: String },
  },
  { _id: false }
);

const problemResultSchema = new Schema<IProblemResult>(
  {
    problemId: { type: String, required: true },
    code: { type: String, default: '' },
    language: { type: String, default: 'cpp' },
    passedTestCases: { type: Number, default: 0 },
    totalTestCases: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    timeSpentSeconds: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['accepted', 'partial', 'wrong_answer', 'time_limit_exceeded'],
      default: 'wrong_answer',
    },
  },
  { _id: false }
);

const patternDiagnosticSchema = new Schema<IPatternDiagnostic>(
  {
    patternTag: { type: String, required: true },
    verdict: {
      type: String,
      enum: ['mastered', 'needs_practice', 'failed'],
      default: 'needs_practice',
    },
    recommendation: { type: String, required: true },
  },
  { _id: false }
);

const assessmentSubmissionSchema = new Schema<IAssessmentSubmission>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment', required: true, index: true },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned'],
      default: 'in_progress',
      index: true,
    },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    timeSpentSeconds: { type: Number, default: 0 },
    // Proctoring & Anti-Cheat
    tabSwitchCount: { type: Number, default: 0 },
    timeAwaySeconds: { type: Number, default: 0 },
    pasteCount: { type: Number, default: 0 },
    largePasteDetected: { type: Boolean, default: false },
    pasteAttemptsBlocked: { type: Number, default: 0 },
    keystrokesCount: { type: Number, default: 0 },
    // Media & Biometrics Proctoring
    cameraEnabled: { type: Boolean, default: false },
    micEnabled: { type: Boolean, default: false },
    faceAbsenceCount: { type: Number, default: 0 },
    multipleFacesCount: { type: Number, default: 0 },
    gazeDivertedCount: { type: Number, default: 0 },
    voiceInterruptionCount: { type: Number, default: 0 },
    baselineSelfieUrl: { type: String, default: '' },
    cheatingRiskPercentage: { type: Number, default: 0 },
    integrityVerdict: {
      type: String,
      enum: ['clean', 'suspicious', 'flagged'],
      default: 'clean',
    },
    activityAnalysisNarrative: { type: String, default: '' },
    telemetryTimeline: [telemetryEventSchema],
    // Score & Diagnostics
    totalScore: { type: Number, default: 0 },
    maxScore: { type: Number, default: 100 },
    passed: { type: Boolean, default: false },
    percentile: { type: Number, default: 50 },
    problemResults: [problemResultSchema],
    patternDiagnostic: [patternDiagnosticSchema],
  },
  { timestamps: true }
);

assessmentSubmissionSchema.index({ userId: 1, assessmentId: 1, createdAt: -1 });

export const AssessmentSubmission =
  models.AssessmentSubmission ||
  model<IAssessmentSubmission>('AssessmentSubmission', assessmentSubmissionSchema, 'assessment_submissions');
