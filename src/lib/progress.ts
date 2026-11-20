import type { Attempt, FlashcardState, Progress } from './types';

export const STORAGE_KEY = 'ip.progress.v1';
export const PROGRESS_EVENT = 'ip-progress-changed';
const MAX_ATTEMPTS = 300;

export function emptyProgress(): Progress {
  return { version: 1, topicsDone: {}, attempts: [], flashcards: {}, bookmarks: [] };
}

/** Minimal storage interface so tests can pass an in-memory implementation. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function browserStore(): KeyValueStore | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

export function normalize(raw: unknown): Progress {
  const p = emptyProgress();
  if (!raw || typeof raw !== 'object') return p;
  const r = raw as Partial<Progress>;
  if (r.topicsDone && typeof r.topicsDone === 'object') p.topicsDone = { ...r.topicsDone };
  if (Array.isArray(r.attempts))
    p.attempts = r.attempts.filter((a) => a && typeof a.id === 'string' && a.answers && typeof a.answers === 'object');
  if (r.flashcards && typeof r.flashcards === 'object') p.flashcards = { ...r.flashcards };
  if (Array.isArray(r.bookmarks)) p.bookmarks = r.bookmarks.filter((b) => typeof b === 'string');
  return p;
}

export function load(s: KeyValueStore | null = browserStore()): Progress {
  if (!s) return emptyProgress();
  try {
    const raw = s.getItem(STORAGE_KEY);
    return raw ? normalize(JSON.parse(raw)) : emptyProgress();
  } catch {
    return emptyProgress();
  }
}

export function save(p: Progress, s: KeyValueStore | null = browserStore()): void {
  if (!s) return;
  s.setItem(STORAGE_KEY, JSON.stringify(p));
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(PROGRESS_EVENT));
}

export function update(fn: (p: Progress) => void, s: KeyValueStore | null = browserStore()): Progress {
  const p = load(s);
  fn(p);
  save(p, s);
  return p;
}

export function addAttempt(a: Attempt, s: KeyValueStore | null = browserStore()): Progress {
  return update((p) => {
    p.attempts.push(a);
    if (p.attempts.length > MAX_ATTEMPTS) p.attempts.splice(0, p.attempts.length - MAX_ATTEMPTS);
  }, s);
}

export function setTopicDone(topicId: string, done: boolean, s: KeyValueStore | null = browserStore()): Progress {
  return update((p) => {
    if (done) p.topicsDone[topicId] = new Date().toISOString();
    else delete p.topicsDone[topicId];
  }, s);
}

export function setFlashcard(id: string, state: FlashcardState, s: KeyValueStore | null = browserStore()): Progress {
  return update((p) => {
    p.flashcards[id] = state;
  }, s);
}

export function clearAttempts(s: KeyValueStore | null = browserStore()): Progress {
  return update((p) => {
    p.attempts = [];
  }, s);
}

/** Question ids whose most recent answer was wrong. */
export function weakQuestionIds(p: Progress): Set<string> {
  const latest = new Map<string, boolean>();
  const sorted = p.attempts.slice().sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  for (const a of sorted) for (const [id, rec] of Object.entries(a.answers)) latest.set(id, rec.correct);
  return new Set([...latest].filter(([, ok]) => !ok).map(([id]) => id));
}

export function exportJson(p: Progress): string {
  return JSON.stringify(p, null, 2);
}

/** Merges an exported file into current progress: union of attempts by id, newest topicsDone wins. */
export function importJson(json: string, s: KeyValueStore | null = browserStore()): Progress {
  const incoming = normalize(JSON.parse(json));
  return update((p) => {
    const ids = new Set(p.attempts.map((a) => a.id));
    for (const a of incoming.attempts) if (!ids.has(a.id)) p.attempts.push(a);
    p.attempts.sort((a, b) => a.startedAt.localeCompare(b.startedAt));
    for (const [k, v] of Object.entries(incoming.topicsDone)) if (!p.topicsDone[k] || p.topicsDone[k] < v) p.topicsDone[k] = v;
    Object.assign(p.flashcards, incoming.flashcards);
    p.bookmarks = [...new Set([...p.bookmarks, ...incoming.bookmarks])];
  }, s);
}

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
