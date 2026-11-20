import { useEffect, useMemo, useState } from 'preact/hooks';
import type { FlashcardState, Question } from '../lib/types';
import { PROGRESS_EVENT, load, setFlashcard } from '../lib/progress';
import { newSeed, rng, shuffle } from '../lib/quiz';
import { withBase } from '../lib/paths';
import { CodeSnippet, RichText } from './quiz/RichText';
import type { SectionInfo } from './TestCentre';

/** Leitner boxes: box n is due again after INTERVAL_DAYS[n] days. */
const INTERVAL_DAYS = [0, 0, 1, 3, 7, 14, 30];
const MAX_BOX = INTERVAL_DAYS.length - 1;

function addDays(days: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function today(): string {
  return addDays(0);
}

export function nextState(prev: FlashcardState | undefined, grade: 'again' | 'good' | 'easy'): FlashcardState {
  const box = prev?.box ?? 1;
  const nb = grade === 'again' ? 1 : Math.min(MAX_BOX, box + (grade === 'easy' ? 2 : 1));
  return { box: nb, due: addDays(INTERVAL_DAYS[nb]) };
}

/** Flashcard drill built from the MCQ bank: front = question, back = correct answer + explanation. */
export default function Flashcards({ sections }: { sections: SectionInfo[] }) {
  const available = sections.filter((s) => s.count > 0);
  const [section, setSection] = useState(available[0]?.id ?? '');
  const [pool, setPool] = useState<Question[]>([]);
  const [cards, setCards] = useState<Record<string, FlashcardState>>({});
  const [flipped, setFlipped] = useState(false);
  const [seed, setSeed] = useState(newSeed);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setCards(load().flashcards);
    sync();
    window.addEventListener(PROGRESS_EVENT, sync);
    return () => window.removeEventListener(PROGRESS_EVENT, sync);
  }, []);

  useEffect(() => {
    if (!section) return;
    setError(null);
    fetch(withBase(`/api/questions/${section}.json`))
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((qs: Question[]) => setPool(qs))
      .catch((e) => setError(`Could not load questions (${e.message}).`));
  }, [section]);

  const t = today();
  const due = useMemo(() => {
    const d = pool.filter((q) => !cards[q.id] || cards[q.id].due <= t);
    // New cards after due reviews, both shuffled.
    const rand = rng(seed);
    const reviews = shuffle(d.filter((q) => cards[q.id]), rand);
    const fresh = shuffle(d.filter((q) => !cards[q.id]), rand);
    return [...reviews, ...fresh];
  }, [pool, cards, seed, t]);

  const card = due[0];
  const learned = pool.filter((q) => (cards[q.id]?.box ?? 0) >= 4).length;

  const grade = (g: 'again' | 'good' | 'easy') => {
    if (!card) return;
    setFlashcard(card.id, nextState(cards[card.id], g));
    setFlipped(false);
    if (g === 'again') setSeed(newSeed());
  };

  if (!available.length) return <div class="ip-empty">No questions yet.</div>;

  return (
    <div class="ip-flash not-content">
      <div class="ip-form-row">
        <label>
          Section
          <select
            value={section}
            onChange={(e) => {
              setSection((e.target as HTMLSelectElement).value);
              setFlipped(false);
            }}
          >
            {available.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <span class="ip-muted ip-small">
          {due.length} due today · {learned}/{pool.length} learned
        </span>
      </div>

      {error && <div class="ip-alert">{error}</div>}

      {!card && pool.length > 0 && <div class="ip-empty">All caught up for this section. Come back tomorrow or pick another section.</div>}

      {card && (
        <div class={`ip-card3d ${flipped ? 'is-flipped' : ''}`}>
          <div class="ip-qcard">
            <div class="ip-qhead">
              <span class="ip-muted ip-small">Box {cards[card.id]?.box ?? 'new'}</span>
              <span class={`ip-pill ip-diff-${card.difficulty}`}>{card.difficulty}</span>
            </div>
            <RichText text={card.question} as="p" />
            {card.code && <CodeSnippet code={card.code} lang={card.codeLang} />}

            {!flipped && (
              <button type="button" class="ip-btn ip-btn-primary" onClick={() => setFlipped(true)}>
                Show answer
              </button>
            )}

            {flipped && (
              <>
                <div class="ip-explanation">
                  <strong>Answer: </strong>
                  {card.answer.map((a, i) => (
                    <span key={a}>
                      {i > 0 && ' + '}
                      <RichText text={card.options[a]} />
                    </span>
                  ))}
                  <div style={{ marginTop: '0.5rem' }}>
                    <RichText text={card.explanation} />
                  </div>
                  {card.readMore && (
                    <div class="ip-readmore">
                      <a href={withBase(card.readMore)}>Read the topic →</a>
                    </div>
                  )}
                </div>
                <div class="ip-actions">
                  <button type="button" class="ip-btn ip-btn-bad" onClick={() => grade('again')}>
                    Again
                  </button>
                  <button type="button" class="ip-btn" onClick={() => grade('good')}>
                    Good
                  </button>
                  <button type="button" class="ip-btn ip-btn-done" onClick={() => grade('easy')}>
                    Easy
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
