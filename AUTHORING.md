# Authoring Guide

How to add topics and questions. The fully-worked reference page is
[`src/content/docs/csharp/async-await.mdx`](src/content/docs/csharp/async-await.mdx) with its questions in
[`src/data/questions/csharp.json`](src/data/questions/csharp.json). Copy its shape.

## 1. Topic pages

Location: `src/content/docs/<section>/<topic>.mdx` (one file per topic, kebab-case file name = topic id).
Section ids: `csharp, aspnet, data, angular, web, dsa, system-design, microservices, patterns, fundamentals, security, testing-devops, behavioral, revision` (see `src/lib/sections.mjs`).

### Front matter

```yaml
---
title: Async/Await Deep Dive            # quote it if it contains a colon
description: One line, shown on the section card and in search.
sidebar:
  order: 8                              # position inside the section
  badge: { text: Hot, variant: danger } # only for importance: high
importance: high                        # high | medium | low  (how often it is asked)
difficulty: medium                      # easy | medium | hard
estimatedMinutes: 30
tags: [async, task]
---
```

### Body: same headings on every page

```mdx
import { Tabs, TabItem, Aside } from '@astrojs/starlight/components';
import QuizBlock from '~/components/QuizBlock.astro';

## Why it matters in interviews
## Core idea              (### sub-headings as needed, diagrams, comparison tables)
## Code                   (C# first; <Tabs syncKey="lang"> with C# / TypeScript where both apply)
## Interview Q&A          (5-10 <details><summary>Question</summary> answer </details>)
## Pitfalls               (<Aside type="caution"> bullet list </Aside>)
## Related                (2-4 relative links)
## Quick quiz             (<QuizBlock section="csharp" topic="async-await" />)
```

Pages that have no MCQs (behavioral, revision, cheat sheets) omit the quiz section and add `noProgress: true` when they are tools rather than study topics.

### Rules

- **Length:** about 800-1800 words of prose per page. Split bigger topics.
- **Code:** every fence has a language (`csharp`, `ts`, `sql`, `html`, `scss`, `bash`, `yaml`, `json`, `dockerfile`). Max ~40 lines per block. Must compile/run: modern C# (.NET 8-10 idioms, primary constructors, file-scoped namespaces) and modern Angular (standalone, signals, `inject()`, new control flow `@if/@for`).
- **Links between pages are relative**, because the site is served under a base path:
  - same section: `[Threading](../threading/)`
  - other section: `[Middleware](../../aspnet/middleware-pipeline/)`
  - never `/csharp/...` absolute links in markdown.
- **Cloud:** Azure first, AWS equivalent in brackets, e.g. "Azure Service Bus (AWS: SQS/SNS)".
- **Diagrams:** Mermaid fenced blocks (`flowchart`, `sequenceDiagram`, `classDiagram`, `erDiagram`, `stateDiagram-v2`). Quote labels that contain punctuation: `A["GET /orders (cached)"]`. Use `<br/>` for line breaks in labels.

### MDX gotchas (these break the build)

- A bare `<` or `{` in prose is parsed as JSX. Put generics and braces in backticks: `` `List<T>` ``, `` `{ id }` ``. Inside fenced code blocks it is fine.
- Inside `<details>` / `<TabItem>` / `<Aside>`, leave a **blank line** after the opening tag and before the closing tag when the content is markdown (lists, code fences, paragraphs).
- HTML comments `<!-- -->` are not allowed in MDX. Use `{/* comment */}`.
- Front matter strings containing `:` must be quoted.

## 2. Questions

Location: `src/data/questions/<section>.json`

```json
{
  "section": "csharp",
  "version": 1,
  "questions": [
    {
      "id": "csharp-async-await-001",
      "topic": "async-await",
      "difficulty": "medium",
      "type": "single",
      "question": "Text. `inline code` and **bold** are allowed.",
      "code": "optional code block",
      "codeLang": "csharp",
      "options": ["A", "B", "C", "D"],
      "answer": [2],
      "explanation": "Why the answer is right (teaches, 1-4 sentences).",
      "optionNotes": ["why A is wrong", "why B is wrong", null, "why D is wrong"],
      "readMore": "/csharp/async-await/"
    }
  ]
}
```

- `id` = `<section>-<topic>-<nnn>`, unique, numbered per topic from 001.
- `topic` must equal an existing page file name in that section. `readMore` = `/<section>/<topic>/` (absolute, no base path; the app adds it).
- `type: "single"` has exactly one answer; `type: "multi"` has two or more and the question says "(Select all that apply)".
- 4 options normally. No "all of the above" / "none of the above". The correct option must not be noticeably longer than the others. Vary the correct position.
- Difficulty: **easy** = definition/recall, **medium** = applied scenario or "what does this code do", **hard** = internals, subtle trade-offs, tricky output.
- Aim for **6-10 questions per topic**, mixing difficulties.
- `reviewed: true` is set only by the owner after checking the answer.

## 3. Check before committing

```bash
npm run validate   # schema, unique ids, topic pages exist, readMore resolves
npx vitest --run   # unit + component tests
npm run build      # MDX/Mermaid errors show up here
```
