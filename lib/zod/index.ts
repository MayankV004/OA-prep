import { z } from 'zod';

// --- Taxonomies ---
export const taxonomyWriteSchema = z.object({
  kind: z.enum(['pattern', 'bucket', 'platform', 'subject', 'advanced', 'difficulty']),
  name: z.string().min(1).max(80),
  slug: z.string().optional(),
  order: z.number().optional(),
});

export const taxonomyUpdateSchema = taxonomyWriteSchema.partial().extend({
  archived: z.boolean().optional(),
});

// --- Groups (Subjects / Advanced) ---
export const groupWriteSchema = z.object({
  kind: z.enum(['subject', 'advanced']),
  name: z.string().min(1),
  slug: z.string().optional(),
});

export const groupUpdateSchema = groupWriteSchema.partial();

// --- Topics ---
export const topicWriteSchema = z.object({
  groupId: z.string().min(1),
  title: z.string().min(1),
  body: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const topicUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  body: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// --- Problems ---
const problemBaseSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const patternProblemSchema = problemBaseSchema.extend({
  kind: z.literal('pattern'),
  pattern: z.string().min(1),
});

export const nonstandardProblemSchema = problemBaseSchema.extend({
  kind: z.literal('nonstandard'),
  bucket: z.string().min(1),
});

export const cpProblemSchema = problemBaseSchema.extend({
  kind: z.literal('cp'),
  platform: z.string().min(1),
  contest: z.string().optional(),
  rating: z.number().optional(),
});

export const problemWriteSchema = z.discriminatedUnion('kind', [
  patternProblemSchema,
  nonstandardProblemSchema,
  cpProblemSchema,
]);

export const problemUpdateSchema = problemBaseSchema.partial().extend({
  pattern: z.string().optional(),
  bucket: z.string().optional(),
  platform: z.string().optional(),
  contest: z.string().optional(),
  rating: z.number().optional(),
  completed: z.boolean().optional(),
});

// --- Questions ---
export const questionWriteSchema = z.object({
  subjectId: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const questionUpdateSchema = questionWriteSchema.partial().omit({ subjectId: true });

// --- Cheat Sheets ---
export const cheatSheetWriteSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  body: z.string().optional(),
  subjectId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const cheatSheetUpdateSchema = cheatSheetWriteSchema.partial();

// --- Search ---
export const searchQuerySchema = z.object({
  q: z.string().min(1),
  kind: z.enum(['all', 'problems', 'topics', 'cheatsheets', 'questions']).default('all'),
  scope: z.enum(['me', 'all']).default('me'),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// --- Admin & Invites ---
export const inviteWriteSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  role: z.enum(['admin', 'user']).optional(),
});

export const acceptInviteSchema = z.object({
  password: z.string().min(8),
});

export const roleUpdateSchema = z.object({
  role: z.enum(['admin', 'user']),
});

export const userUpdateSchema = z.object({
  name: z.string().optional(),
  disabled: z.boolean().optional(),
});
