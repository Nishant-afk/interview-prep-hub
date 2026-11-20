export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  /** Section id, injected when loading (not stored per-question in JSON). */
  section: string;
  topic: string;
  difficulty: Difficulty;
  type: 'single' | 'multi';
  question: string;
  code?: string;
  codeLang?: string;
  options: string[];
  answer: number[];
  explanation: string;
  optionNotes?: (string | null)[];
  /** Site-relative path without base, e.g. "/csharp/async-await/". */
  readMore?: string;
  reviewed?: boolean;
}

export interface AnswerRecord {
  chosen: number[];
  correct: boolean;
  flagged?: boolean;
}

export interface Attempt {
  id: string;
  mode: 'topic' | 'section' | 'mock' | 'weak';
  /** Section id for topic/section mode, 'mixed' otherwise. */
  section: string;
  topic?: string;
  startedAt: string;
  durationSec: number;
  score: number;
  total: number;
  seed: number;
  /** Question ids in the order shown. */
  order: string[];
  /** Option order per question (indexes into original options). */
  optionOrder: Record<string, number[]>;
  answers: Record<string, AnswerRecord>;
}

export interface FlashcardState {
  box: number;
  due: string;
}

export interface Progress {
  version: 1;
  topicsDone: Record<string, string>;
  attempts: Attempt[];
  flashcards: Record<string, FlashcardState>;
  bookmarks: string[];
}
