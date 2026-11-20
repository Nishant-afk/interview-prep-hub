import type { JSX } from 'preact';

/**
 * Renders the small subset of Markdown used in question text:
 * `inline code`, **bold**, and line breaks. Everything else is plain text,
 * so no HTML from the JSON is ever injected.
 */
export function RichText({ text, as = 'span' }: { text: string; as?: 'span' | 'p' | 'div' }) {
  const Tag = as as unknown as (props: { class?: string; children: unknown }) => JSX.Element;
  const lines = text.split('\n');
  return (
    <Tag class="ip-rich">
      {lines.map((line, li) => (
        <>
          {li > 0 && <br />}
          {renderInline(line)}
        </>
      ))}
    </Tag>
  );
}

function renderInline(line: string) {
  const parts = line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((p, i) => {
    if (p.startsWith('`') && p.endsWith('`')) return <code key={i}>{p.slice(1, -1)}</code>;
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
    return p;
  });
}

export function CodeSnippet({ code, lang }: { code: string; lang?: string }) {
  return (
    <div class="ip-code" data-lang={lang}>
      {lang && <span class="ip-code-lang">{lang}</span>}
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
