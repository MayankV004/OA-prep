export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface InterviewQuestion {
  _id: string;
  question: string;
  answer: string;
  subject: string;
  topic?: string;
  difficulty?: QuestionDifficulty;
  tags?: string[];
  companyTags?: string[];
  createdAt?: string;
}

export interface InterviewFilterOptions {
  subject?: string;
  topic?: string;
  difficulty?: string;
  search?: string;
}
