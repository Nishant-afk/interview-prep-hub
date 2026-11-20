import { describe, expect, it } from 'vitest';
import { isCorrect, pickQuestions, pickWeighted, rng, score, shuffle, formatDuration } from '../src/lib/quiz';
import type { Question } from '../src/lib/types';

function q(id: string, extra: Partial<Question> = {}): Question {
  return {
    id,
    section: 'csharp',
    topic: 't',
    difficulty: 'easy',
    type: 'single',
    question: 'question?',
    options: ['a', 'b', 'c', 'd'],
    answer: [1],
    explanation: 'because reasons long enough',
    ...extra,
  };
}

describe('rng / shuffle', () => {
  it('is deterministic for the same seed', () => {
    const a = shuffle([1, 2, 3, 4, 5, 6, 7, 8], rng(42));
    const b = shuffle([1, 2, 3, 4, 5, 6, 7, 8], rng(42));
    expect(a).toEqual(b);
  });
  it('keeps all elements and does not mutate input', () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input, rng(7));
    expect(out.slice().sort()).toEqual([1, 2, 3, 4, 5]);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });
  it('produces values in [0,1)', () => {
    const r = rng(1);
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('isCorrect', () => {
  it('single answer', () => {
    expect(isCorrect({ answer: [1] }, [1])).toBe(true);
    expect(isCorrect({ answer: [1] }, [2])).toBe(false);
    expect(isCorrect({ answer: [1] }, [])).toBe(false);
  });
  it('multi answer requires the exact set, order-independent', () => {
    expect(isCorrect({ answer: [0, 2] }, [2, 0])).toBe(true);
    expect(isCorrect({ answer: [0, 2] }, [0])).toBe(false);
    expect(isCorrect({ answer: [0, 2] }, [0, 2, 3])).toBe(false);
  });
});

describe('pickQuestions', () => {
  const pool = [q('a', { difficulty: 'easy', topic: 'x' }), q('b', { difficulty: 'hard', topic: 'x' }), q('c', { difficulty: 'hard', topic: 'y' })];
  it('filters by difficulty and topic', () => {
    expect(pickQuestions(pool, { count: 10, difficulty: 'hard' }, rng(1)).map((x) => x.id).sort()).toEqual(['b', 'c']);
    expect(pickQuestions(pool, { count: 10, topic: 'x' }, rng(1)).map((x) => x.id).sort()).toEqual(['a', 'b']);
  });
  it('respects count and onlyIds', () => {
    expect(pickQuestions(pool, { count: 2 }, rng(1))).toHaveLength(2);
    expect(pickQuestions(pool, { count: 5, onlyIds: new Set(['c']) }, rng(1)).map((x) => x.id)).toEqual(['c']);
  });
});

describe('pickWeighted', () => {
  const mk = (s: string, n: number) => Array.from({ length: n }, (_, i) => q(`${s}-t-${String(i).padStart(3, '0')}`, { section: s }));
  it('follows weights and fills the remainder when a section runs short', () => {
    const by = { a: mk('a', 100), b: mk('b', 100), c: mk('c', 2) };
    const out = pickWeighted(by, { a: 50, b: 25, c: 25 }, 40, rng(3));
    expect(out).toHaveLength(40);
    const count = (s: string) => out.filter((x) => x.section === s).length;
    expect(count('c')).toBe(2);
    expect(count('a')).toBeGreaterThan(count('b'));
    expect(new Set(out.map((x) => x.id)).size).toBe(40);
  });
  it('returns everything when the bank is smaller than count', () => {
    const out = pickWeighted({ a: mk('a', 3) }, { a: 1 }, 10, rng(1));
    expect(out).toHaveLength(3);
  });
  it('ignores zero-weight sections', () => {
    const out = pickWeighted({ a: mk('a', 5), b: mk('b', 5) }, { a: 1, b: 0 }, 10, rng(1));
    expect(out.every((x) => x.section === 'a')).toBe(true);
  });
});

describe('score', () => {
  it('computes totals and per-topic breakdown', () => {
    const qs = [q('a', { topic: 'x' }), q('b', { topic: 'x' }), q('c', { topic: 'y' })];
    const s = score(qs, { a: { chosen: [1], correct: true }, b: { chosen: [0], correct: false } });
    expect(s).toMatchObject({ correct: 1, total: 3, pct: 33 });
    expect(s.byTopic['csharp/x']).toMatchObject({ correct: 1, total: 2 });
    expect(s.byTopic['csharp/y']).toMatchObject({ correct: 0, total: 1 });
  });
});

describe('formatDuration', () => {
  it('formats m:ss', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(75)).toBe('1:15');
    expect(formatDuration(2700)).toBe('45:00');
  });
});
