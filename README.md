# Interview Prep Hub

Personal interview preparation site for a **3–4 year .NET + Angular SDE**: concepts with diagrams and code, interview Q&A, system design, DSA, and an MCQ test centre with progress tracking.

Static site built with [Astro](https://astro.build) + [Starlight](https://starlight.astro.build), Preact islands for the quiz, Mermaid for diagrams. Hosted free on GitHub Pages.

## Run locally

```bash
npm install
npm run dev        # http://localhost:4321/interview-prep-hub/
```

Other scripts:

| Command | What it does |
|---------|--------------|
| `npm run build` | Production build into `dist/` (includes Pagefind search index) |
| `npm run preview` | Serve the production build locally |
| `npm run validate` | Validate the question bank (`src/data/questions/*.json`) |
| `npm test` | Vitest in watch mode (`npx vitest --run` for a single run) |
| `npm run check` | validate + tests + build, the same as CI |

## Project layout

```
src/content/docs/<section>/*.mdx   topic pages (one per topic)
src/data/questions/<section>.json  MCQ bank per section
src/components/                    Quiz, TestCentre, Flashcards, ProgressWidget, MarkDone (Preact) + Astro wrappers
src/lib/                           quiz logic, progress storage, schema, section list
scripts/validate-questions.mjs     question bank validator (runs in CI)
tests/                             Vitest unit + component tests
.github/workflows/deploy.yml       build, test and deploy to GitHub Pages
```

See [AUTHORING.md](AUTHORING.md) for how to write topics and questions, and [PLAN.md](PLAN.md) for the full content plan.

## Deploy to GitHub Pages

1. Create a GitHub repo named `interview-prep-hub` (public).
2. Settings → Pages → Source: **GitHub Actions**.
3. Push `main`. The workflow derives the URL from the repo, so the site appears at `https://<username>.github.io/interview-prep-hub/`.

## Notes

- Progress (studied topics, test history, flashcards) is stored in browser `localStorage`. Export/import it from Test Centre → History.
- `astro` is pinned to 7.4.1 because later 7.4.x releases require Node ≥ 22.23.4 and this machine has 22.23.2. After upgrading Node, run `npm i astro@latest`.
