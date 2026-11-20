import { describe, expect, it } from 'vitest';
import { QuestionSchema } from '../src/lib/question-schema.mjs';

const base = {
  id: 'csharp-async-await-001',
  topic: 'async-await',
  difficulty: 'medium',
  type: 'single',
  question: 'What does ConfigureAwait(false) do?',
  options: ['a', 'b', 'c', 'd'],
  answer: [1],
  explanation: 'It skips capturing the synchronization context.',
};

describe('QuestionSchema', () => {
  it('accepts a valid question', () => {
    expect(QuestionSchema.safeParse(base).success).toBe(true);
  });
  it('rejects out-of-range answers', () => {
    expect(QuestionSchema.safeParse({ ...base, answer: [4] }).success).toBe(false);
  });
  it('rejects single questions with two answers and multi with one', () => {
    expect(QuestionSchema.safeParse({ ...base, answer: [0, 1] }).success).toBe(false);
    expect(QuestionSchema.safeParse({ ...base, type: 'multi' }).success).toBe(false);
  });
  it('requires codeLang with code', () => {
    expect(QuestionSchema.safeParse({ ...base, code: 'x' }).success).toBe(false);
    expect(QuestionSchema.safeParse({ ...base, code: 'x', codeLang: 'csharp' }).success).toBe(true);
  });
  it('rejects unknown fields and bad ids', () => {
    expect(QuestionSchema.safeParse({ ...base, extra: 1 }).success).toBe(false);
    expect(QuestionSchema.safeParse({ ...base, id: 'Bad Id' }).success).toBe(false);
  });
  it('rejects mismatched optionNotes and duplicate options', () => {
    expect(QuestionSchema.safeParse({ ...base, optionNotes: [null] }).success).toBe(false);
    expect(QuestionSchema.safeParse({ ...base, options: ['a', 'A', 'b', 'c'] }).success).toBe(false);
  });
});
