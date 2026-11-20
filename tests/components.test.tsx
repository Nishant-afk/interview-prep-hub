// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/preact';
import Quiz from '../src/components/Quiz';
import TestCentre from '../src/components/TestCentre';
import MarkDone from '../src/components/MarkDone';
import { STORAGE_KEY, load } from '../src/lib/progress';
import type { Question } from '../src/lib/types';

function q(n: number, extra: Partial<Question> = {}): Question {
  return {
    id: `csharp-async-await-${String(n).padStart(3, '0')}`,
    section: 'csharp',
    topic: 'async-await',
    difficulty: 'easy',
    type: 'single',
    question: `Question number ${n}?`,
    options: [`right ${n}`, `wrong a ${n}`, `wrong b ${n}`],
    answer: [0],
    explanation: `Explanation for question ${n} goes here.`,
    ...extra,
  };
}

beforeEach(() => localStorage.clear());
afterEach(() => cleanup());

describe('Quiz (inline)', () => {
  it('reveals explanation after checking and saves an attempt when all are answered', async () => {
    render(<Quiz questions={[q(1), q(2)]} section="csharp" topic="async-await" count={2} />);

    for (const n of [1, 2]) {
      fireEvent.click(screen.getByText(`right ${n}`));
    }
    const checks = screen.getAllByText('Check answer');
    expect(checks).toHaveLength(2);
    checks.forEach((b) => fireEvent.click(b));

    expect(screen.getByText(/Explanation for question 1/)).toBeTruthy();
    expect(screen.getByText(/Score: 2\/2/)).toBeTruthy();

    await waitFor(() => expect(load().attempts).toHaveLength(1));
    const a = load().attempts[0];
    expect(a).toMatchObject({ mode: 'topic', section: 'csharp', topic: 'async-await', score: 2, total: 2 });
  });

  it('marks a wrong answer as incorrect', () => {
    render(<Quiz questions={[q(1)]} section="csharp" topic="async-await" count={1} />);
    fireEvent.click(screen.getByText('wrong a 1'));
    fireEvent.click(screen.getByText('Check answer'));
    expect(screen.getByText(/Score: 0\/1/)).toBeTruthy();
    expect(document.querySelector('.ip-option.is-wrong')).toBeTruthy();
    expect(document.querySelector('.ip-option.is-correct')).toBeTruthy();
  });

  it('shows an empty state with no questions', () => {
    render(<Quiz questions={[]} section="csharp" />);
    expect(screen.getByText(/No questions for this topic yet/)).toBeTruthy();
  });
});

describe('TestCentre', () => {
  const bank = [q(1), q(2), q(3)];

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(bank), { status: 200, headers: { 'Content-Type': 'application/json' } })),
    );
    vi.stubGlobal('confirm', () => true);
    window.scrollTo = () => {};
  });
  afterEach(() => vi.unstubAllGlobals());

  const sections = [{ id: 'csharp', label: 'C# & .NET Runtime', short: 'C#', weight: 1, count: 3 }];

  it('runs a section test end to end and records history', async () => {
    render(<TestCentre sections={sections} topicTitles={{ 'csharp/async-await': 'Async/Await Deep Dive' }} />);
    fireEvent.click(screen.getByText('Start test'));

    await screen.findByText(/Q1/);
    // Answer every question with keyboard shortcut for the option holding "right".
    for (let i = 0; i < 3; i++) {
      const right = screen.getByText(/^right \d$/);
      fireEvent.click(right);
      if (i < 2) fireEvent.click(screen.getByText('Next →'));
    }
    fireEvent.click(screen.getByText('Submit'));

    await screen.findByText('100%');
    expect(screen.getByText('Async/Await Deep Dive')).toBeTruthy();
    const p = load();
    expect(p.attempts).toHaveLength(1);
    expect(p.attempts[0]).toMatchObject({ mode: 'section', section: 'csharp', score: 3, total: 3 });

    fireEvent.click(screen.getByText(/History \(1\)/));
    expect(screen.getByText('3/3')).toBeTruthy();
  });

  it('supports flagging and retrying wrong answers', async () => {
    render(<TestCentre sections={sections} topicTitles={{}} />);
    fireEvent.click(screen.getByText('Start test'));
    await screen.findByText(/Q1/);
    fireEvent.click(screen.getByText('⚐ Flag'));
    expect(screen.getByText('⚑ Flagged')).toBeTruthy();
    fireEvent.click(screen.getByText(/^wrong a \d$/));
    fireEvent.click(screen.getByText('Submit test'));

    await screen.findByText(/Retry the 3 wrong/);
    fireEvent.click(screen.getByText(/Retry the 3 wrong/));
    await screen.findByText(/Weak areas/);
  });

  it('shows the empty state when the bank is empty', () => {
    render(<TestCentre sections={[{ ...sections[0], count: 0 }]} topicTitles={{}} />);
    expect(screen.getByText(/question bank is empty/)).toBeTruthy();
  });
});

describe('MarkDone', () => {
  it('toggles topic completion in storage', async () => {
    render(<MarkDone topicId="csharp/async-await" />);
    fireEvent.click(await screen.findByText('Mark as studied'));
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).topicsDone['csharp/async-await']).toBeTruthy();
    await screen.findByText('✓ Studied');
    fireEvent.click(screen.getByText('✓ Studied'));
    expect(load().topicsDone['csharp/async-await']).toBeUndefined();
  });
});
