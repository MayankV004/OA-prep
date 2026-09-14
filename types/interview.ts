export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard';
export type FlashcardStatus = 'unseen' | 'learning' | 'reviewing' | 'mastered';

export interface InterviewQuestion {
  _id: string;
  question: string;
  answer: string;
  subjectId: string;
  subject?: string;
  topic?: string;
  difficulty?: QuestionDifficulty;
  tags?: string[];
  companyTags?: string[];
  keyPoints?: string[];
  isSystem?: boolean;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;

  // Merged user progress (if authenticated)
  status?: FlashcardStatus;
  confidence?: number;
  bookmarked?: boolean;
  timesReviewed?: number;
  lastReviewedAt?: string;
  nextReviewAt?: string;
  userNotes?: string;
}

export interface InterviewFilterOptions {
  subject?: string;
  topic?: string;
  difficulty?: QuestionDifficulty | 'All';
  company?: string;
  search?: string;
  scope?: 'all' | 'curated' | 'mine' | 'bookmarked' | 'due';
}

export interface SubjectFlashcardStats {
  subjectId: string;
  slug: string;
  name: string;
  totalQuestions: number;
  masteredCount: number;
  learningCount: number;
  reviewingCount: number;
  unseenCount: number;
  bookmarkedCount: number;
  dueCount: number;
  masteryPercentage: number;
}

