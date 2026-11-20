import type { Question } from '../../lib/types';
import { withBase } from '../../lib/paths';
import { CodeSnippet, RichText } from './RichText';

export interface QuestionCardProps {
  q: Question;
  index: number;
  total: number;
  /** Display order of options (indexes into q.options). */
  optionOrder: number[];
  chosen: number[];
  onChoose: (chosen: number[]) => void;
  /** When true, answers are locked and correctness + explanation are shown. */
  revealed: boolean;
  flagged?: boolean;
  onToggleFlag?: () => void;
}

const LETTERS = 'ABCDEF';

export function QuestionCard(props: QuestionCardProps) {
  const { q, index, total, optionOrder, chosen, onChoose, revealed, flagged, onToggleFlag } = props;
  const multi = q.type === 'multi';

  const toggle = (opt: number) => {
    if (revealed) return;
    if (multi) onChoose(chosen.includes(opt) ? chosen.filter((c) => c !== opt) : [...chosen, opt]);
    else onChoose([opt]);
  };

  return (
    <div class="ip-qcard" data-revealed={revealed}>
      <div class="ip-qhead">
        <span class="ip-qnum">
          Q{index + 1}
          <span class="ip-muted"> / {total}</span>
        </span>
        <span class={`ip-pill ip-diff-${q.difficulty}`}>{q.difficulty}</span>
        {multi && <span class="ip-pill ip-pill-multi">select all that apply</span>}
        {onToggleFlag && (
          <button type="button" class={`ip-flag ${flagged ? 'is-on' : ''}`} onClick={onToggleFlag} title="Flag for review (F)">
            {flagged ? '⚑ Flagged' : '⚐ Flag'}
          </button>
        )}
      </div>

      <RichText text={q.question} as="p" />
      {q.code && <CodeSnippet code={q.code} lang={q.codeLang} />}

      <ul class="ip-options" role={multi ? 'group' : 'radiogroup'}>
        {optionOrder.map((opt, i) => {
          const selected = chosen.includes(opt);
          const isAnswer = q.answer.includes(opt);
          let state = '';
          if (revealed) state = isAnswer ? 'correct' : selected ? 'wrong' : '';
          const note = revealed ? q.optionNotes?.[opt] : null;
          return (
            <li key={opt}>
              <button
                type="button"
                role={multi ? 'checkbox' : 'radio'}
                aria-checked={selected}
                class={`ip-option ${selected ? 'is-selected' : ''} ${state ? `is-${state}` : ''}`}
                onClick={() => toggle(opt)}
                disabled={revealed}
              >
                <span class="ip-letter">{LETTERS[i]}</span>
                <span class="ip-option-text">
                  <RichText text={q.options[opt]} />
                  {note && (
                    <span class="ip-option-note">
                      <RichText text={note} />
                    </span>
                  )}
                </span>
                {revealed && isAnswer && <span class="ip-mark">✓</span>}
                {revealed && selected && !isAnswer && <span class="ip-mark">✗</span>}
              </button>
            </li>
          );
        })}
      </ul>

      {revealed && (
        <div class="ip-explanation">
          <strong>Explanation. </strong>
          <RichText text={q.explanation} />
          {q.readMore && (
            <div class="ip-readmore">
              <a href={withBase(q.readMore)}>Read the topic →</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
