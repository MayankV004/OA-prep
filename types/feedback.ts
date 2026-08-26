export type FeedbackType = 'bug' | 'feedback';
export type FeedbackSeverity = 'low' | 'medium' | 'high' | 'critical';
export type FeedbackStatus = 'pending' | 'in_review' | 'resolved' | 'dismissed';

export interface IFeedback {
  _id?: string;
  userId?: any;
  email: string;
  name?: string;
  type: FeedbackType;
  title: string;
  description: string;
  category?: string;
  severity?: FeedbackSeverity;
  pageUrl?: string;
  userAgent?: string;
  ip?: string;
  status: FeedbackStatus;
  adminNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FeedbackSubmissionPayload {
  type: FeedbackType;
  title: string;
  description: string;
  category?: string;
  severity?: FeedbackSeverity;
  email?: string;
  name?: string;
  pageUrl?: string;
}

export interface FeedbackItemDTO {
  _id: string;
  type: FeedbackType;
  title: string;
  description: string;
  category?: string;
  severity?: FeedbackSeverity;
  email: string;
  name?: string;
  pageUrl?: string;
  userAgent?: string;
  ip?: string;
  status: FeedbackStatus;
  adminNotes?: string;
  createdAt: string;
  userId?: { _id: string; name: string; email: string };
}

export interface FeedbackStats {
  total: number;
  pendingCount: number;
  bugCount: number;
  feedbackCount: number;
}
