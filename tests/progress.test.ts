import { describe, expect, it } from 'vitest';
import {
  STORAGE_KEY,
  addAttempt,
  emptyProgress,
  exportJson,
  importJson,
  load,
  normalize,
  setTopicDone,
  weakQuestionIds,
  type KeyValueStore,
} from '../src/lib/progress';
import type { Attempt } from '../src/lib/types';

function memStore(): KeyValueStore & { data: Record<string, string> } {
  const data: Record<string, string> = {};
  return { data, getItem: (k) => data[k] ?? null, setItem: (k, v) => void (data[k] = v) };
}

function attempt(id: string, startedAt: string, answers: Attempt['answers']): Attempt {
  return { id, mode: 'section', section: 'csharp', startedAt, durationSec: 10, score: 0, total: 0, seed: 1, order: Object.keys(answers), optionOrder: {}, answers };
}

describe('progress storage', () => {
  it('returns empty progress for missing or corrupt data', () => {
    const s = memStore();
    expect(load(s)).toEqual(emptyProgress());
    s.data[STORAGE_KEY] = '{not json';
    expect(load(s)).toEqual(emptyProgress());
  });

  it('round-trips attempts and topic completion', () => {
    const s = memStore();
    addAttempt(attempt('1', '2026-11-01T00:00:00Z', { q1: { chosen: [0], correct: true } }), s);
    setTopicDone('csharp/async-await', true, s);
    const p = load(s);
    expect(p.attempts).toHaveLength(1);
    expect(p.topicsDone['csharp/async-await']).toBeTruthy();
    setTopicDone('csharp/async-await', false, s);
    expect(load(s).topicsDone['csharp/async-await']).toBeUndefined();
  });

  it('normalize drops malformed entries', () => {
    const p = normalize({ attempts: [null, { id: 1 }, attempt('ok', '2026-01-01', {})], bookmarks: ['a', 3] });
    expect(p.attempts.map((a) => a.id)).toEqual(['ok']);
    expect(p.bookmarks).toEqual(['a']);
  });
});

describe('weakQuestionIds', () => {
  it('uses the most recent answer for each question', () => {
    const p = emptyProgress();
    p.attempts = [
      attempt('2', '2026-11-02T00:00:00Z', { q1: { chosen: [1], correct: true }, q2: { chosen: [0], correct: false } }),
      attempt('1', '2026-11-01T00:00:00Z', { q1: { chosen: [0], correct: false }, q3: { chosen: [0], correct: false } }),
    ];
    expect([...weakQuestionIds(p)].sort()).toEqual(['q2', 'q3']);
  });
});

describe('export / import', () => {
  it('merges without duplicating attempts', () => {
    const a = memStore();
    addAttempt(attempt('1', '2026-11-01T00:00:00Z', {}), a);
    setTopicDone('csharp/x', true, a);
    const json = exportJson(load(a));

    const b = memStore();
    addAttempt(attempt('1', '2026-11-01T00:00:00Z', {}), b);
    addAttempt(attempt('2', '2026-11-03T00:00:00Z', {}), b);
    importJson(json, b);
    const merged = load(b);
    expect(merged.attempts.map((x) => x.id)).toEqual(['1', '2']);
    expect(merged.topicsDone['csharp/x']).toBeTruthy();
  });
});
