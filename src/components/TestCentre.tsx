import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { AnswerRecord, Attempt, Difficulty, Progress, Question } from '../lib/types';
import { formatDuration, isCorrect, newSeed, pickQuestions, pickWeighted, rng, score, shuffle } from '../lib/quiz';
import {
  PROGRESS_EVENT,
  addAttempt,
  clearAttempts,
  exportJson,
  importJson,
  load,
  uid,
  weakQuestionIds,
} from '../lib/progress';
import { withBase } from '../lib/paths';
import { QuestionCard } from './quiz/QuestionCard';

export interface SectionInfo {
  id: string;
  label: string;
  short: string;
  weight: number;
  count: number;
}

interface Props {
  sections: SectionInfo[];
  /** "section/topic" -> page title, for readable breakdowns. */
  topicTitles: Record<string, string>;
}

type Mode = 'section' | 'mock' | 'weak';
type View = 'setup' | 'run' | 'results' | 'history';

interface Session {
  mode: Mode;
  section: string;
  seed: number;
  questions: Question[];
  optionOrder: Record<string, number[]>;
  chosen: Record<string, number[]>;
  flagged: Record<string, boolean>;
  current: number;
  startedAt: number;
  /** Seconds; 0 = untimed. */
  timeLimit: number;
  finishedAt?: number;
  /** When reviewing a past attempt, results are read-only and not saved again. */
  review?: boolean;
}

const MOCK_COUNT = 40;
const MOCK_MINUTES = 45;

const questionCache = new Map<string, Promise<Question[]>>();
function fetchSection(section: string): Promise<Question[]> {
  if (!questionCache.has(section)) {
    const p = fetch(withBase(`/api/questions/${section}.json`))
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<Question[]>;
      })
      .catch((e) => {
        questionCache.delete(section);
        throw e;
      });
    questionCache.set(section, p);
  }
  return questionCache.get(section)!;
}

async function fetchMany(sections: string[]): Promise<Record<string, Question[]>> {
  const entries = await Promise.all(sections.map(async (s) => [s, await fetchSection(s)] as const));
  return Object.fromEntries(entries);
}

function useProgress(): Progress {
  const [p, setP] = useState<Progress>(() => load());
  useEffect(() => {
    const on = () => setP(load());
    window.addEventListener(PROGRESS_EVENT, on);
    window.addEventListener('storage', on);
    return () => {
      window.removeEventListener(PROGRESS_EVENT, on);
      window.removeEventListener('storage', on);
    };
  }, []);
  return p;
}

export default function TestCentre({ sections, topicTitles }: Props) {
  const available = sections.filter((s) => s.count > 0);
  const progress = useProgress();
  const [view, setView] = useState<View>('setup');
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Setup form state (initialised from ?section=&mode=).
  const [mode, setMode] = useState<Mode>('section');
  const [section, setSection] = useState<string>(available[0]?.id ?? '');
  const [count, setCount] = useState(20);
  const [difficulty, setDifficulty] = useState<Difficulty | 'any'>('any');
  const [timed, setTimed] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const s = params.get('section');
    const m = params.get('mode') as Mode | null;
    if (s && available.some((a) => a.id === s)) setSection(s);
    if (m === 'mock' || m === 'weak' || m === 'section') setMode(m);
    if (params.get('view') === 'history') setView('history');
  }, []);

  const weakIds = useMemo(() => weakQuestionIds(progress), [progress]);
  const label = (id: string) => sections.find((s) => s.id === id)?.label ?? id;

  function begin(questions: Question[], m: Mode, sec: string, seed: number, timeLimit: number) {
    if (!questions.length) {
      setError('No questions match these filters yet.');
      return;
    }
    const rand = rng(seed ^ 0x9e3779b9);
    const optionOrder: Record<string, number[]> = {};
    for (const q of questions) optionOrder[q.id] = shuffle(q.options.map((_, i) => i), rand);
    setError(null);
    setSession({
      mode: m,
      section: sec,
      seed,
      questions,
      optionOrder,
      chosen: {},
      flagged: {},
      current: 0,
      startedAt: Date.now(),
      timeLimit,
    });
    setView('run');
    window.scrollTo({ top: 0 });
  }

  async function start() {
    setLoading(true);
    setError(null);
    try {
      const seed = newSeed();
      const rand = rng(seed);
      if (mode === 'section') {
        const pool = await fetchSection(section);
        const qs = pickQuestions(pool, { count, difficulty }, rand);
        begin(qs, 'section', section, seed, timed ? Math.round(qs.length * 75) : 0);
      } else if (mode === 'mock') {
        const by = await fetchMany(available.map((s) => s.id));
        const weights = Object.fromEntries(available.map((s) => [s.id, s.weight]));
        const qs = pickWeighted(by, weights, MOCK_COUNT, rand, difficulty);
        begin(qs, 'mock', 'mixed', seed, timed ? MOCK_MINUTES * 60 : 0);
      } else {
        const by = await fetchMany(available.map((s) => s.id));
        const pool = Object.values(by).flat();
        const qs = pickQuestions(pool, { count, onlyIds: weakIds }, rand);
        begin(qs, 'weak', 'mixed', seed, 0);
      }
    } catch (e) {
      setError(`Could not load questions (${(e as Error).message}).`);
    } finally {
      setLoading(false);
    }
  }

  function finish(s: Session) {
    const finishedAt = Date.now();
    const answers: Record<string, AnswerRecord> = {};
    for (const q of s.questions) {
      const chosen = s.chosen[q.id] ?? [];
      answers[q.id] = { chosen, correct: isCorrect(q, chosen), flagged: !!s.flagged[q.id] };
    }
    if (!s.review) {
      const sc = Object.values(answers).filter((a) => a.correct).length;
      const attempt: Attempt = {
        id: uid(),
        mode: s.mode,
        section: s.section,
        startedAt: new Date(s.startedAt).toISOString(),
        durationSec: Math.round((finishedAt - s.startedAt) / 1000),
        score: sc,
        total: s.questions.length,
        seed: s.seed,
        order: s.questions.map((q) => q.id),
        optionOrder: s.optionOrder,
        answers,
      };
      addAttempt(attempt);
    }
    setSession({ ...s, finishedAt });
    setView('results');
    window.scrollTo({ top: 0 });
  }

  async function reviewAttempt(a: Attempt) {
    setLoading(true);
    try {
      const prefixes = new Set(a.order.map((id) => sections.find((s) => id.startsWith(`${s.id}-`))?.id).filter(Boolean) as string[]);
      const by = await fetchMany([...prefixes].filter((s) => available.some((x) => x.id === s)));
      const all = new Map(Object.values(by).flat().map((q) => [q.id, q]));
      const questions = a.order.map((id) => all.get(id)).filter(Boolean) as Question[];
      if (!questions.length) {
        setError('The questions from this attempt no longer exist in the bank.');
        return;
      }
      const chosen: Record<string, number[]> = {};
      const flagged: Record<string, boolean> = {};
      for (const [id, rec] of Object.entries(a.answers)) {
        chosen[id] = rec.chosen;
        if (rec.flagged) flagged[id] = true;
      }
      const optionOrder: Record<string, number[]> = {};
      for (const q of questions) optionOrder[q.id] = a.optionOrder[q.id] ?? q.options.map((_, i) => i);
      const startedAt = Date.parse(a.startedAt);
      setSession({
        mode: a.mode === 'topic' ? 'section' : a.mode,
        section: a.section,
        seed: a.seed,
        questions,
        optionOrder,
        chosen,
        flagged,
        current: 0,
        startedAt,
        timeLimit: 0,
        finishedAt: startedAt + a.durationSec * 1000,
        review: true,
      });
      setView('results');
      window.scrollTo({ top: 0 });
    } catch (e) {
      setError(`Could not load questions (${(e as Error).message}).`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div class="ip-tc not-content">
      <nav class="ip-tabs" aria-label="Test centre">
        <button type="button" class={view === 'setup' || view === 'run' ? 'is-active' : ''} onClick={() => setView(session && !session.finishedAt ? 'run' : 'setup')}>
          {session && !session.finishedAt ? 'Current test' : 'New test'}
        </button>
        {session?.finishedAt && (
          <button type="button" class={view === 'results' ? 'is-active' : ''} onClick={() => setView('results')}>
            Results
          </button>
        )}
        <button type="button" class={view === 'history' ? 'is-active' : ''} onClick={() => setView('history')}>
          History ({progress.attempts.length})
        </button>
      </nav>

      {error && <div class="ip-alert">{error}</div>}

      {view === 'setup' && (
        <Setup
          available={available}
          mode={mode}
          setMode={setMode}
          section={section}
          setSection={setSection}
          count={count}
          setCount={setCount}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          timed={timed}
          setTimed={setTimed}
          weakCount={weakIds.size}
          loading={loading}
          onStart={start}
        />
      )}

      {view === 'run' && session && !session.finishedAt && (
        <Runner session={session} setSession={setSession} onFinish={finish} sectionLabel={label} />
      )}

      {view === 'results' && session?.finishedAt && (
        <Results
          session={session}
          topicTitles={topicTitles}
          sectionLabel={label}
          onRetryWrong={() => {
            const wrong = session.questions.filter((q) => !isCorrect(q, session.chosen[q.id] ?? []));
            begin(wrong, 'weak', 'mixed', newSeed(), 0);
          }}
          onNew={() => {
            setSession(null);
            setView('setup');
          }}
        />
      )}

      {view === 'history' && <History progress={progress} sectionLabel={label} onReview={reviewAttempt} loading={loading} />}
    </div>
  );
}

/* ---------------------------------- Setup --------------------------------- */

function Setup(p: {
  available: SectionInfo[];
  mode: Mode;
  setMode: (m: Mode) => void;
  section: string;
  setSection: (s: string) => void;
  count: number;
  setCount: (n: number) => void;
  difficulty: Difficulty | 'any';
  setDifficulty: (d: Difficulty | 'any') => void;
  timed: boolean;
  setTimed: (b: boolean) => void;
  weakCount: number;
  loading: boolean;
  onStart: () => void;
}) {
  const total = p.available.reduce((n, s) => n + s.count, 0);
  if (!p.available.length) return <div class="ip-empty">The question bank is empty. Add questions under src/data/questions.</div>;
  return (
    <div class="ip-setup">
      <fieldset class="ip-modes">
        <legend>Mode</legend>
        <ModeCard id="section" cur={p.mode} set={p.setMode} title="Section test" desc="Pick one section, choose count and difficulty." />
        <ModeCard
          id="mock"
          cur={p.mode}
          set={p.setMode}
          title="Mock interview test"
          desc={`${MOCK_COUNT} mixed questions weighted toward .NET and Angular, ${MOCK_MINUTES}-minute timer.`}
        />
        <ModeCard
          id="weak"
          cur={p.mode}
          set={p.setMode}
          title={`Weak areas (${p.weakCount})`}
          desc="Only questions you got wrong the last time you saw them."
          disabled={p.weakCount === 0}
        />
      </fieldset>

      <div class="ip-form-row">
        {p.mode === 'section' && (
          <label>
            Section
            <select value={p.section} onChange={(e) => p.setSection((e.target as HTMLSelectElement).value)}>
              {p.available.map((s) => (
                <option value={s.id} key={s.id}>
                  {s.label} ({s.count})
                </option>
              ))}
            </select>
          </label>
        )}
        {p.mode !== 'mock' && (
          <label>
            Questions
            <select value={p.count} onChange={(e) => p.setCount(Number((e.target as HTMLSelectElement).value))}>
              {[5, 10, 20, 30, 50].map((n) => (
                <option value={n} key={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}
        {p.mode !== 'weak' && (
          <label>
            Difficulty
            <select value={p.difficulty} onChange={(e) => p.setDifficulty((e.target as HTMLSelectElement).value as Difficulty | 'any')}>
              <option value="any">Any</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
        )}
        {p.mode !== 'weak' && (
          <label class="ip-check">
            <input type="checkbox" checked={p.timed} onChange={(e) => p.setTimed((e.target as HTMLInputElement).checked)} />
            Timer {p.mode === 'section' ? '(75 s per question)' : `(${MOCK_MINUTES} min)`}
          </label>
        )}
      </div>

      <button type="button" class="ip-btn ip-btn-primary" onClick={p.onStart} disabled={p.loading || (p.mode === 'weak' && p.weakCount === 0)}>
        {p.loading ? 'Loading…' : 'Start test'}
      </button>
      <p class="ip-muted ip-small">
        {total} questions in the bank. Keyboard during a test: 1-6 choose, N / P next / previous, F flag.
      </p>
    </div>
  );
}

function ModeCard(p: { id: Mode; cur: Mode; set: (m: Mode) => void; title: string; desc: string; disabled?: boolean }) {
  return (
    <label class={`ip-mode ${p.cur === p.id ? 'is-active' : ''} ${p.disabled ? 'is-disabled' : ''}`}>
      <input type="radio" name="ip-mode" checked={p.cur === p.id} disabled={p.disabled} onChange={() => p.set(p.id)} />
      <strong>{p.title}</strong>
      <span class="ip-muted">{p.desc}</span>
    </label>
  );
}

/* ---------------------------------- Runner -------------------------------- */

function Runner(p: {
  session: Session;
  setSession: (s: Session) => void;
  onFinish: (s: Session) => void;
  sectionLabel: (id: string) => string;
}) {
  const s = p.session;
  const q = s.questions[s.current];
  const [now, setNow] = useState(Date.now());
  const sessionRef = useRef(s);
  sessionRef.current = s;

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const elapsed = Math.floor((now - s.startedAt) / 1000);
  const remaining = s.timeLimit ? Math.max(0, s.timeLimit - elapsed) : null;

  useEffect(() => {
    if (remaining === 0) p.onFinish(sessionRef.current);
  }, [remaining === 0]);

  const go = (i: number) => p.setSession({ ...s, current: Math.max(0, Math.min(s.questions.length - 1, i)) });
  const choose = (c: number[]) => p.setSession({ ...s, chosen: { ...s.chosen, [q.id]: c } });
  const toggleFlag = () => p.setSession({ ...s, flagged: { ...s.flagged, [q.id]: !s.flagged[q.id] } });

  const unanswered = s.questions.filter((x) => !(s.chosen[x.id]?.length)).length;
  const submit = () => {
    const msg = unanswered ? `${unanswered} question(s) unanswered. Submit anyway?` : 'Submit the test?';
    if (confirm(msg)) p.onFinish(s);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || e.ctrlKey || e.metaKey || e.altKey) return;
      const cur = sessionRef.current;
      const question = cur.questions[cur.current];
      const n = Number(e.key);
      if (n >= 1 && n <= 6) {
        const order = cur.optionOrder[question.id];
        const opt = order[n - 1];
        if (opt === undefined) return;
        const prev = cur.chosen[question.id] ?? [];
        const next = question.type === 'multi' ? (prev.includes(opt) ? prev.filter((c) => c !== opt) : [...prev, opt]) : [opt];
        p.setSession({ ...cur, chosen: { ...cur.chosen, [question.id]: next } });
      } else if (e.key === 'n' || e.key === 'ArrowRight') {
        p.setSession({ ...cur, current: Math.min(cur.questions.length - 1, cur.current + 1) });
      } else if (e.key === 'p' || e.key === 'ArrowLeft') {
        p.setSession({ ...cur, current: Math.max(0, cur.current - 1) });
      } else if (e.key === 'f') {
        p.setSession({ ...cur, flagged: { ...cur.flagged, [question.id]: !cur.flagged[question.id] } });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div class="ip-runner">
      <div class="ip-runbar">
        <span>
          <strong>{s.mode === 'mock' ? 'Mock test' : s.mode === 'weak' ? 'Weak areas' : p.sectionLabel(s.section)}</strong>
          <span class="ip-muted"> · {s.questions.length - unanswered}/{s.questions.length} answered</span>
        </span>
        <span class={`ip-timer ${remaining !== null && remaining < 60 ? 'is-low' : ''}`}>
          {remaining !== null ? `⏱ ${formatDuration(remaining)} left` : `⏱ ${formatDuration(elapsed)}`}
        </span>
      </div>

      <div class="ip-palette" aria-label="Question palette">
        {s.questions.map((x, i) => (
          <button
            type="button"
            key={x.id}
            class={`ip-pal ${i === s.current ? 'is-current' : ''} ${s.chosen[x.id]?.length ? 'is-answered' : ''} ${s.flagged[x.id] ? 'is-flagged' : ''}`}
            onClick={() => go(i)}
            title={s.flagged[x.id] ? 'Flagged' : s.chosen[x.id]?.length ? 'Answered' : 'Unanswered'}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <QuestionCard
        q={q}
        index={s.current}
        total={s.questions.length}
        optionOrder={s.optionOrder[q.id]}
        chosen={s.chosen[q.id] ?? []}
        onChoose={choose}
        revealed={false}
        flagged={!!s.flagged[q.id]}
        onToggleFlag={toggleFlag}
      />

      <div class="ip-runnav">
        <button type="button" class="ip-btn ip-btn-ghost" onClick={() => go(s.current - 1)} disabled={s.current === 0}>
          ← Previous
        </button>
        {s.current < s.questions.length - 1 ? (
          <button type="button" class="ip-btn" onClick={() => go(s.current + 1)}>
            Next →
          </button>
        ) : (
          <button type="button" class="ip-btn ip-btn-primary" onClick={submit}>
            Submit
          </button>
        )}
        {s.current < s.questions.length - 1 && (
          <button type="button" class="ip-btn ip-btn-ghost ip-push-right" onClick={submit}>
            Submit test
          </button>
        )}
      </div>
    </div>
  );
}

/* --------------------------------- Results -------------------------------- */

function Results(p: {
  session: Session;
  topicTitles: Record<string, string>;
  sectionLabel: (id: string) => string;
  onRetryWrong: () => void;
  onNew: () => void;
}) {
  const s = p.session;
  const answers: Record<string, AnswerRecord> = {};
  for (const q of s.questions) {
    const chosen = s.chosen[q.id] ?? [];
    answers[q.id] = { chosen, correct: isCorrect(q, chosen) };
  }
  const sc = score(s.questions, answers);
  const [filter, setFilter] = useState<'wrong' | 'all' | 'flagged'>('wrong');
  const wrongCount = sc.total - sc.correct;
  const list = s.questions.filter((q) =>
    filter === 'all' ? true : filter === 'flagged' ? s.flagged[q.id] : !answers[q.id].correct,
  );
  const topics = Object.entries(sc.byTopic).sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total);
  const verdict = sc.pct >= 80 ? 'Interview ready on this set.' : sc.pct >= 60 ? 'Close. Revise the weak topics below.' : 'Needs revision. Re-read the weak topics, then retry.';

  return (
    <div class="ip-results">
      <div class="ip-scorebox">
        <div class={`ip-score ${sc.pct >= 80 ? 'is-good' : sc.pct >= 60 ? 'is-ok' : 'is-bad'}`}>{sc.pct}%</div>
        <div>
          <div>
            <strong>
              {sc.correct} / {sc.total}
            </strong>{' '}
            correct in {formatDuration(Math.round(((s.finishedAt ?? Date.now()) - s.startedAt) / 1000))}
          </div>
          <div class="ip-muted">{verdict}</div>
          {s.review && <div class="ip-muted ip-small">Reviewing a past attempt.</div>}
        </div>
      </div>

      <h3>By topic</h3>
      <table class="ip-table">
        <thead>
          <tr>
            <th>Topic</th>
            <th>Score</th>
            <th class="ip-bar-col"></th>
          </tr>
        </thead>
        <tbody>
          {topics.map(([key, t]) => {
            const pct = Math.round((t.correct / t.total) * 100);
            return (
              <tr key={key}>
                <td>
                  <a href={withBase(`/${t.section}/${t.topic}/`)}>{p.topicTitles[key] ?? t.topic}</a>
                  <span class="ip-muted ip-small"> · {p.sectionLabel(t.section)}</span>
                </td>
                <td>
                  {t.correct}/{t.total}
                </td>
                <td class="ip-bar-col">
                  <span class="ip-bar">
                    <span class={`ip-bar-fill ${pct >= 80 ? 'is-good' : pct >= 60 ? 'is-ok' : 'is-bad'}`} style={{ width: `${pct}%` }} />
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div class="ip-actions">
        {wrongCount > 0 && (
          <button type="button" class="ip-btn ip-btn-primary" onClick={p.onRetryWrong}>
            Retry the {wrongCount} wrong
          </button>
        )}
        <button type="button" class="ip-btn" onClick={p.onNew}>
          New test
        </button>
      </div>

      <h3>Answers</h3>
      <div class="ip-seg">
        {(['wrong', 'flagged', 'all'] as const).map((f) => (
          <button type="button" key={f} class={filter === f ? 'is-active' : ''} onClick={() => setFilter(f)}>
            {f === 'wrong' ? `Wrong (${wrongCount})` : f === 'flagged' ? `Flagged (${Object.values(s.flagged).filter(Boolean).length})` : `All (${sc.total})`}
          </button>
        ))}
      </div>
      {list.length === 0 && <p class="ip-muted">Nothing here.</p>}
      {list.map((q) => (
        <QuestionCard
          key={q.id}
          q={q}
          index={s.questions.indexOf(q)}
          total={s.questions.length}
          optionOrder={s.optionOrder[q.id]}
          chosen={s.chosen[q.id] ?? []}
          onChoose={() => {}}
          revealed
        />
      ))}
    </div>
  );
}

/* --------------------------------- History -------------------------------- */

function History(p: { progress: Progress; sectionLabel: (id: string) => string; onReview: (a: Attempt) => void; loading: boolean }) {
  const attempts = p.progress.attempts.slice().sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const fileRef = useRef<HTMLInputElement>(null);

  const bySection: Record<string, { pcts: number[] }> = {};
  for (const a of p.progress.attempts.slice().sort((x, y) => x.startedAt.localeCompare(y.startedAt))) {
    const key = a.mode === 'mock' ? 'mock' : a.mode === 'weak' ? 'weak' : a.section;
    (bySection[key] ??= { pcts: [] }).pcts.push(a.total ? Math.round((a.score / a.total) * 100) : 0);
  }

  const download = () => {
    const blob = new Blob([exportJson(p.progress)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `interview-prep-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const onImport = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      importJson(await file.text());
      alert('Progress imported and merged.');
    } catch (err) {
      alert(`Import failed: ${(err as Error).message}`);
    }
    (e.target as HTMLInputElement).value = '';
  };

  return (
    <div class="ip-history">
      <div class="ip-actions">
        <button type="button" class="ip-btn" onClick={download}>
          Export progress
        </button>
        <button type="button" class="ip-btn" onClick={() => fileRef.current?.click()}>
          Import progress
        </button>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={onImport} />
        {attempts.length > 0 && (
          <button
            type="button"
            class="ip-btn ip-btn-ghost ip-push-right"
            onClick={() => confirm('Delete all test history? Topic progress is kept.') && clearAttempts()}
          >
            Clear history
          </button>
        )}
      </div>

      {Object.keys(bySection).length > 0 && (
        <>
          <h3>Trend (last 10 per area)</h3>
          <table class="ip-table">
            <thead>
              <tr>
                <th>Area</th>
                <th>Attempts</th>
                <th>Average</th>
                <th>Last 10</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(bySection).map(([k, v]) => {
                const avg = Math.round(v.pcts.reduce((a, b) => a + b, 0) / v.pcts.length);
                return (
                  <tr key={k}>
                    <td>{k === 'mock' ? 'Mock tests' : k === 'weak' ? 'Weak-area drills' : p.sectionLabel(k)}</td>
                    <td>{v.pcts.length}</td>
                    <td>{avg}%</td>
                    <td>
                      <span class="ip-spark">
                        {v.pcts.slice(-10).map((x, i) => (
                          <span key={i} class={`ip-spark-bar ${x >= 80 ? 'is-good' : x >= 60 ? 'is-ok' : 'is-bad'}`} style={{ height: `${Math.max(8, x)}%` }} title={`${x}%`} />
                        ))}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      <h3>Attempts</h3>
      {attempts.length === 0 && <p class="ip-muted">No attempts yet. Take a test or a topic quiz.</p>}
      {attempts.length > 0 && (
        <table class="ip-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Type</th>
              <th>Score</th>
              <th>Time</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {attempts.slice(0, 100).map((a) => (
              <tr key={a.id}>
                <td>{new Date(a.startedAt).toLocaleString()}</td>
                <td>
                  {a.mode === 'mock' ? 'Mock' : a.mode === 'weak' ? 'Weak areas' : p.sectionLabel(a.section)}
                  {a.topic && <span class="ip-muted ip-small"> · {a.topic}</span>}
                </td>
                <td>
                  {a.score}/{a.total}
                </td>
                <td>{formatDuration(a.durationSec)}</td>
                <td>
                  <button type="button" class="ip-link" disabled={p.loading} onClick={() => p.onReview(a)}>
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
