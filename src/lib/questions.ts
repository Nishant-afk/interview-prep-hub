// Build-time access to the question bank. Only import from .astro files or
// endpoints (server side); islands receive questions as props or fetch the
// static JSON produced by src/pages/api/questions/[section].json.ts.
import { QuestionFileSchema } from './question-schema.mjs';
import type { Question } from './types';

const files = import.meta.glob<{ default: unknown }>('../data/questions/*.json', { eager: true });

let cache: Record<string, Question[]> | null = null;

export function allQuestionsBySection(): Record<string, Question[]> {
  if (cache) return cache;
  const out: Record<string, Question[]> = {};
  for (const [path, mod] of Object.entries(files)) {
    const parsed = QuestionFileSchema.safeParse(mod.default);
    if (!parsed.success) {
      throw new Error(`Invalid question file ${path}: ${parsed.error.message}. Run "npm run validate" for details.`);
    }
    const { section, questions } = parsed.data;
    // A section may be split across "<section>.json" and "<section>.<part>.json".
    (out[section] ??= []).push(...questions.map((q) => ({ ...q, section }) as Question));
  }
  cache = out;
  return out;
}

export function questionsFor(section: string, topic?: string): Question[] {
  const qs = allQuestionsBySection()[section] ?? [];
  return topic ? qs.filter((q) => q.topic === topic) : qs;
}

export function questionCounts(): Record<string, number> {
  return Object.fromEntries(Object.entries(allQuestionsBySection()).map(([s, qs]) => [s, qs.length]));
}
