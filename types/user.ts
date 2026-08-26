export type UserRole = 'admin' | 'user';

export interface IUserProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: UserRole;
  disabled?: boolean;
  createdAt?: string;
  lastSeenAt?: string;
}

export interface UserStats {
  grandTotalProblems: number;
  grandTotalCompleted: number;
  grandPct: number;
  totalPatternProblems: number;
  completedPatternProblems: number;
  difficultyMix: Record<'Easy' | 'Medium' | 'Hard', { total: number; completed: number }>;
  patternBreakdown: Array<{
    title: string;
    slug: string;
    total: number;
    completed: number;
    pct: number;
  }>;
  nonStandard: { total: number; completed: number };
  cp: { total: number; completed: number };
  revisionCount: number;
  notesCount: number;
}
