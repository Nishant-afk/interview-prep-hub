import { useEffect, useMemo, useState } from 'preact/hooks';
import type { AnswerRecord, Question } from '../lib/types';
import { isCorrect, newSeed, pickQuestions, rng, shuffle } from '../lib/quiz';
import { addAttempt, uid } from '../lib/progress';
import { withBase } from '../lib/paths';
import { QuestionCard } from './quiz/QuestionCard';

interface Props {
  questions: Question[];
  section: string;
  topic?: string;
  count?: number;
  title?: string;
}

/** Inline topic quiz: all questions on one card stack, check each, score saved to history. */
export default function Quiz({ questions, section, topic, count = 5, title = 'Quick quiz' }: Props) {
  const [seed, setSeed] = useState(newSeed);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [chosen, setChosen] = useState<Record<string, number[]>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  const { picked, optionOrder } = useMemo(() => {
    const rand = rng(seed);
    const picked = pickQuestions(questions, { count }, rand);
    const optionOrder: Record<string, number[]> = {};
    for (const q of picked) optionOrder[q.id] = shuffle(q.options.map((_, i) => i), rand);
    return { picked, optionOrder };
  }, [seed, questions, count]);

  const answeredCount = picked.filter((q) => revealed[q.id]).length;
  const correctCount = picked.filter((q) => revealed[q.id] && isCorrect(q, chosen[q.id] ?? [])).length;
  const done = picked.length > 0 && answeredCount === picked.length;

  useEffect(() => {
    if (!done || saved) return;
    const answers: Record<string, AnswerRecord> = {};
    for (const q of picked) answers[q.id] = { chosen: chosen[q.id] ?? [], correct: isCorrect(q, chosen[q.id] ?? []) };
    addAttempt({
      id: uid(),
      mode: 'topic',
      section,
      topic,
      startedAt: new Date(startedAt).toISOString(),
      durationSec: Math.round((Date.now() - startedAt) / 1000),
      score: correctCount,
      total: picked.length,
      seed,
      order: picked.map((q) => q.id),
      optionOrder,
      answers,
    });
    setSaved(true);
  }, [done, saved]);

  if (!questions.length) {
    return <div class="ip-quiz ip-empty">No questions for this topic yet.</div>;
  }

  const reset = () => {
    setSeed(newSeed());
    setStartedAt(Date.now());
    setChosen({});
    setRevealed({});
    setSaved(false);
  };

  const testHref = withBase(`/test/?section=${encodeURIComponent(section)}`);

  return (
    <section class="ip-quiz not-content">
      <header class="ip-quiz-head">
        <h3>{title}</h3>
        <span class="ip-muted">
          {answeredCount}/{picked.length} answered · {correctCount} correct
        </span>
      </header>

      {picked.map((q, i) => (
        <div key={`${seed}-${q.id}`} class="ip-quiz-item">
          <QuestionCard
            q={q}
            index={i}
            total={picked.length}
            optionOrder={optionOrder[q.id]}
            chosen={chosen[q.id] ?? []}
            onChoose={(c) => setChosen({ ...chosen, [q.id]: c })}
            revealed={!!revealed[q.id]}
          />
          {!revealed[q.id] && (
            <button
              type="button"
              class="ip-btn"
              disabled={!(chosen[q.id]?.length)}
              onClick={() => setRevealed({ ...revealed, [q.id]: true })}
            >
              Check answer
            </button>
          )}
        </div>
      ))}

      <footer class="ip-quiz-foot">
        {done && (
          <strong>
            Score: {correctCount}/{picked.length}
            {correctCount === picked.length ? ' 🎉' : ''}
          </strong>
        )}
        <button type="button" class="ip-btn ip-btn-ghost" onClick={reset}>
          {questions.length > count ? 'New set' : 'Retry'}
        </button>
        <a class="ip-btn ip-btn-ghost" href={testHref}>
          Full section test →
        </a>
      </footer>
    </section>
  );
}
