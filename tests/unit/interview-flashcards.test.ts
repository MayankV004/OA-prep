import { describe, it, expect } from 'vitest';
import { questionWriteSchema, questionProgressUpdateSchema } from '@/lib/zod';

describe('Interview Questions & Flashcards Zod Schemas', () => {
  it('validates a valid question write payload', () => {
    const payload = {
      subjectId: '507f1f77bcf86cd799439011',
      question: 'Explain the difference between Process and Thread',
      answer: 'A process is an execution unit with independent memory...',
      difficulty: 'Easy',
      companyTags: ['Google', 'Amazon'],
      tags: ['OS', 'Concurrency'],
      keyPoints: ['Process has own memory', 'Threads share memory'],
      isSystem: true,
    };

    const result = questionWriteSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.difficulty).toBe('Easy');
      expect(result.data.companyTags).toEqual(['Google', 'Amazon']);
      expect(result.data.isSystem).toBe(true);
    }
  });

  it('defaults difficulty to Medium when omitted', () => {
    const payload = {
      subjectId: '507f1f77bcf86cd799439011',
      question: 'What is B+ Tree?',
    };

    const result = questionWriteSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.difficulty).toBe('Medium');
    }
  });

  it('rejects invalid difficulty levels', () => {
    const payload = {
      subjectId: '507f1f77bcf86cd799439011',
      question: 'What is B+ Tree?',
      difficulty: 'SuperHard',
    };

    const result = questionWriteSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('validates progress update payloads', () => {
    const validPayloads = [
      { status: 'mastered', confidence: 4, bookmarked: true },
      { confidence: 1 },
      { bookmarked: false },
      { status: 'learning', userNotes: 'Review again tomorrow' },
    ];

    for (const p of validPayloads) {
      const res = questionProgressUpdateSchema.safeParse(p);
      expect(res.success).toBe(true);
    }
  });

  it('rejects out of bounds confidence scores', () => {
    const invalidPayload = {
      confidence: 5, // max is 4
    };

    const res = questionProgressUpdateSchema.safeParse(invalidPayload);
    expect(res.success).toBe(false);
  });
});

describe('Spaced Repetition (SRS) Intervals Calculation', () => {
  function calculateNextInterval(confidence: number): { days: number; status: string } {
    switch (confidence) {
      case 1:
        return { days: 1, status: 'learning' };
      case 2:
        return { days: 3, status: 'learning' };
      case 3:
        return { days: 7, status: 'reviewing' };
      case 4:
        return { days: 21, status: 'mastered' };
      default:
        return { days: 1, status: 'learning' };
    }
  }

  it('computes correct intervals based on user confidence rating', () => {
    expect(calculateNextInterval(1)).toEqual({ days: 1, status: 'learning' });
    expect(calculateNextInterval(2)).toEqual({ days: 3, status: 'learning' });
    expect(calculateNextInterval(3)).toEqual({ days: 7, status: 'reviewing' });
    expect(calculateNextInterval(4)).toEqual({ days: 21, status: 'mastered' });
  });
});
