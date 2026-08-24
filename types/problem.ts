export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type ProblemKind = 'pattern' | 'nonstandard' | 'cp';

export interface BaseProblem {
  _id: string;
  userId: string;
  title: string;
  name?: string;
  url: string;
  link?: string;
  difficulty: Difficulty;
  completed: boolean;
  completedAt?: string;
  notes?: string;
  userNotes?: string;
  revision?: boolean;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PatternProblem extends BaseProblem {
  kind: 'pattern';
  pattern: string;
  variation?: string;
}

export interface NonStandardProblem extends BaseProblem {
  kind: 'nonstandard';
  bucket: string;
}

export interface CpProblem extends BaseProblem {
  kind: 'cp';
  platform?: string;
  contest?: string;
  rating?: number;
}

export type Problem = PatternProblem | NonStandardProblem | CpProblem | BaseProblem;

export interface ProblemWritePayload {
  title: string;
  url: string;
  difficulty: Difficulty;
  kind: ProblemKind;
  pattern?: string;
  variation?: string;
  bucket?: string;
  platform?: string;
  contest?: string;
  rating?: number;
  tags?: string[];
  notes?: string;
}

export interface ProgressGroupStat {
  group: string;
  total: number;
  completed: number;
}
