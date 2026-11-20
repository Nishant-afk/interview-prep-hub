import { useEffect, useState } from 'preact/hooks';
import type { Progress } from '../lib/types';
import { PROGRESS_EVENT, emptyProgress, load, weakQuestionIds } from '../lib/progress';
import { withBase } from '../lib/paths';

export interface SectionTopics {
  id: string;
  label: string;
  topics: { id: string; title: string; importance?: string }[];
}

/** Home-page dashboard: per-section study progress, test stats, and the next topic to read. */
export default function ProgressWidget({ sections }: { sections: SectionTopics[] }) {
  const [p, setP] = useState<Progress>(emptyProgress);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setP(load());
    sync();
    setReady(true);
    window.addEventListener(PROGRESS_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(PROGRESS_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const totalTopics = sections.reduce((n, s) => n + s.topics.length, 0);
  const doneTopics = sections.reduce((n, s) => n + s.topics.filter((t) => p.topicsDone[t.id]).length, 0);
  const attempts = p.attempts;
  const avg = attempts.length ? Math.round(attempts.reduce((n, a) => n + (a.total ? a.score / a.total : 0), 0) / attempts.length * 100) : null;
  const weak = weakQuestionIds(p).size;
  const last7 = attempts.filter((a) => Date.now() - Date.parse(a.startedAt) < 7 * 864e5).length;

  // Next topic: first unstudied high-importance topic, else first unstudied topic, in section order.
  const all = sections.flatMap((s) => s.topics.map((t) => ({ ...t, section: s.label })));
  const next = all.find((t) => !p.topicsDone[t.id] && t.importance === 'high') ?? all.find((t) => !p.topicsDone[t.id]);

  return (
    <div class="ip-dash not-content" data-ready={ready}>
      <div class="ip-stats">
        <Stat label="Topics studied" value={`${doneTopics} / ${totalTopics}`} />
        <Stat label="Tests taken" value={String(attempts.length)} sub={`${last7} in the last 7 days`} />
        <Stat label="Average score" value={avg === null ? '–' : `${avg}%`} />
        <Stat label="Weak questions" value={String(weak)} href={weak ? withBase('/test/?mode=weak') : undefined} sub={weak ? 'Drill them →' : undefined} />
      </div>

      {next && (
        <a class="ip-next" href={withBase(`/${next.id}/`)}>
          <span class="ip-muted ip-small">Up next · {next.section}</span>
          <strong>{next.title} →</strong>
        </a>
      )}

      <table class="ip-table ip-sections">
        <tbody>
          {sections
            .filter((s) => s.topics.length)
            .map((s) => {
              const done = s.topics.filter((t) => p.topicsDone[t.id]).length;
              const pct = Math.round((done / s.topics.length) * 100);
              return (
                <tr key={s.id}>
                  <td>
                    <a href={withBase(`/${s.id}/`)}>{s.label}</a>
                  </td>
                  <td class="ip-small">
                    {done}/{s.topics.length}
                  </td>
                  <td class="ip-bar-col">
                    <span class="ip-bar">
                      <span class="ip-bar-fill is-good" style={{ width: `${pct}%` }} />
                    </span>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
      <p class="ip-muted ip-small">Progress is stored in this browser only. Use Export in the Test Centre history to move it to another device.</p>
    </div>
  );
}

function Stat({ label, value, sub, href }: { label: string; value: string; sub?: string; href?: string }) {
  const body = (
    <>
      <span class="ip-stat-value">{value}</span>
      <span class="ip-stat-label">{label}</span>
      {sub && <span class="ip-muted ip-small">{sub}</span>}
    </>
  );
  return href ? (
    <a class="ip-stat" href={href}>
      {body}
    </a>
  ) : (
    <div class="ip-stat">{body}</div>
  );
}
