/**
 * Shared Type Definitions for the Multi-Modal Proctoring Subsystem
 */

export type ProctorViolationType =
  | 'no_face_detected'
  | 'multiple_faces'
  | 'gaze_diverted'
  | 'voice_detected'
  | 'camera_disabled'
  | 'mic_disabled'
  | 'prohibited_object_detected';

export interface ProctorViolationEvent {
  type: ProctorViolationType;
  details: string;
}

export type GazeStatus = 'centered' | 'diverted' | 'no_face';

export type FaceStatus = 'verified' | 'partial' | 'absent' | 'multiple' | 'detecting';

export interface FaceAnalysisResult {
  inScreenPercent: number;
  faceStatus: FaceStatus;
  gazeStatus: GazeStatus;
  horizontalGazeRatio: number;
  isCovered: boolean;
  totalSkinPixels: number;
  boxWidth: number;
  boxHeight: number;
  centroidX: number;
  centroidY: number;
}

export interface PhoneAnalysisResult {
  isPhoneDetected: boolean;
  phoneScreenPixels: number;
  phoneDarkPixels: number;
  aspectRatio: number;
  boxWidth: number;
  boxHeight: number;
}

export type NeuralModelStatus = 'uninitialized' | 'loading' | 'ready' | 'fallback';

export interface FacialLandmarks {
  rightEye: [number, number];
  leftEye: [number, number];
  noseTip: [number, number];
  mouthCenter: [number, number];
  rightEar: [number, number];
  leftEar: [number, number];
}

export interface NeuralFaceResult {
  faceCount: number;
  inScreenPercent: number;
  faceStatus: FaceStatus;
  gazeStatus: GazeStatus;
  headYawRatio: number;
  headPitchRatio: number;
  isOccluded: boolean;
  boxWidth: number;
  boxHeight: number;
  centroidX: number;
  centroidY: number;
  landmarks?: FacialLandmarks;
}

export interface NeuralDetectedObject {
  label: string;
  score: number;
  bbox: [number, number, number, number];
}

export interface NeuralDeviceResult {
  isPhoneDetected: boolean;
  isMultiplePeopleDetected: boolean;
  isBookDetected: boolean;
  phoneScore: number;
  detectedObjects: NeuralDetectedObject[];
}

export interface IActivityAnalysisInput {
  assessmentTitle: string;
  company: string;
  totalScore: number;
  maxScore: number;
  timeSpentSeconds: number;
  tabSwitchCount: number;
  timeAwaySeconds: number;
  pasteAttemptsBlocked: number;
  keystrokesCount: number;
  cameraEnabled: boolean;
  micEnabled: boolean;
  faceAbsenceCount: number;
  multipleFacesCount: number;
  gazeDivertedCount: number;
  voiceInterruptionCount: number;
  cheatingRiskPercentage: number;
  integrityVerdict: 'clean' | 'suspicious' | 'flagged';
  problems: Array<{
    title: string;
    patternTag: string;
    score: number;
    passedTestCases: number;
    totalTestCases: number;
    timeSpentSeconds: number;
    status: string;
  }>;
  timeline: Array<{
    timestamp: Date | string;
    type: string;
    details?: string;
  }>;
}

export interface UploadResult {
  url: string;
  key: string;
  storage: 'r2' | 'data_fallback';
}
