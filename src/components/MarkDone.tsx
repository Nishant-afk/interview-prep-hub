import { useEffect, useState } from 'preact/hooks';
import { PROGRESS_EVENT, load, setTopicDone } from '../lib/progress';

/** "Mark as done" toggle rendered in the footer of every topic page. */
export default function MarkDone({ topicId }: { topicId: string }) {
  const [doneAt, setDoneAt] = useState<string | undefined>(undefined);

  useEffect(() => {
    const sync = () => setDoneAt(load().topicsDone[topicId]);
    sync();
    window.addEventListener(PROGRESS_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(PROGRESS_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [topicId]);

  return (
    <div class="ip-markdone not-content">
      <button
        type="button"
        class={`ip-btn ${doneAt ? 'ip-btn-done' : 'ip-btn-primary'}`}
        aria-pressed={!!doneAt}
        onClick={() => setTopicDone(topicId, !doneAt)}
      >
        {doneAt ? '✓ Studied' : 'Mark as studied'}
      </button>
      {doneAt && <span class="ip-muted ip-small">on {new Date(doneAt).toLocaleDateString()} · click to undo</span>}
    </div>
  );
}
