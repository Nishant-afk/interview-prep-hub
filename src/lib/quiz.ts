import type { AnswerRecord, Difficulty, Question } from './types';

/** Deterministic PRNG (mulberry32) so an attempt can be replayed in review. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function newSeed(): number {
  return Math.floor(Math.random() * 2 ** 31);
}

/** Fisher-Yates shuffle returning a new array. */
export function shuffle<T>(items: readonly T[], rand: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export interface PickOptions {
  count: number;
  difficulty?: Difficulty | 'any';
  topic?: string;
  /** Restrict to these question ids (weak-areas mode). */
  onlyIds?: Set<string>;
}

export function pickQuestions(pool: readonly Question[], opts: PickOptions, rand: () => number): Question[] {
  const filtered = pool.filter(
    (q) =>
      (!opts.topic || q.topic === opts.topic) &&
      (!opts.difficulty || opts.difficulty === 'any' || q.difficulty === opts.difficulty) &&
      (!opts.onlyIds || opts.onlyIds.has(q.id)),
  );
  return shuffle(filtered, rand).slice(0, Math.max(0, opts.count));
}

/**
 * Picks a mixed set across sections using integer weights. Sections with fewer
 * questions than their share give their remainder to the others.
 */
export function pickWeighted(
  bySection: Record<string, Question[]>,
  weights: Record<string, number>,
  count: number,
  rand: () => number,
  difficulty: Difficulty | 'any' = 'any',
): Question[] {
  const pools: Record<string, Question[]> = {};
  for (const [s, qs] of Object.entries(bySection)) {
    const p = qs.filter((q) => difficulty === 'any' || q.difficulty === difficulty);
    if (p.length && (weights[s] ?? 0) > 0) pools[s] = shuffle(p, rand);
  }
  const sections = Object.keys(pools);
  const totalWeight = sections.reduce((sum, s) => sum + weights[s], 0);
  if (!totalWeight) return [];

  const take: Record<string, number> = {};
  let assigned = 0;
  for (const s of sections) {
    take[s] = Math.min(pools[s].length, Math.floor((count * weights[s]) / totalWeight));
    assigned += take[s];
  }
  // Distribute the remainder round-robin, heaviest weights first.
  const order = sections.slice().sort((a, b) => weights[b] - weights[a]);
  while (assigned < count) {
    let progressed = false;
    for (const s of order) {
      if (assigned >= count) break;
      if (take[s] < pools[s].length) {
        take[s]++;
        assigned++;
        progressed = true;
      }
    }
    if (!progressed) break;
  }
  const picked = sections.flatMap((s) => pools[s].slice(0, take[s]));
  return shuffle(picked, rand);
}

export function isCorrect(q: Pick<Question, 'answer'>, chosen: readonly number[]): boolean {
  if (chosen.length !== q.answer.length) return false;
  const set = new Set(q.answer);
  return chosen.every((c) => set.has(c));
}

export interface TopicScore {
  correct: number;
  total: number;
  section: string;
  topic: string;
}

export function score(questions: readonly Question[], answers: Record<string, AnswerRecord>) {
  let correct = 0;
  const byTopic: Record<string, TopicScore> = {};
  for (const q of questions) {
    const key = `${q.section}/${q.topic}`;
    byTopic[key] ??= { correct: 0, total: 0, section: q.section, topic: q.topic };
    byTopic[key].total++;
    if (answers[q.id]?.correct) {
      correct++;
      byTopic[key].correct++;
    }
  }
  const total = questions.length;
  return { correct, total, pct: total ? Math.round((correct / total) * 100) : 0, byTopic };
}

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
