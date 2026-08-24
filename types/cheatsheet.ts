export interface Cheatsheet {
  _id: string;
  userId: string;
  title: string;
  slug: string;
  body?: string;
  subjectId?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCheatsheetPayload {
  title: string;
  slug?: string;
  body?: string;
  tags?: string[];
  subjectId?: string;
}

export interface UpdateCheatsheetPayload {
  title?: string;
  body?: string;
  tags?: string[];
  subjectId?: string;
}
