#!/usr/bin/env node
// Validates every src/data/questions/<section>.json:
//  - JSON parses and matches the zod schema (src/lib/question-schema.mjs)
//  - file name == "section" field, and section is a known quiz section
//  - ids are unique across ALL files and start with "<section>-<topic>-"
//  - topic has a matching page src/content/docs/<section>/<topic>.md(x)
//  - readMore (if set) points at an existing page
// Prints a per-section summary with difficulty mix. Exit code 1 on any error.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { QuestionFileSchema } from '../src/lib/question-schema.mjs';
import { QUIZ_SECTIONS } from '../src/lib/sections.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const qDir = join(root, 'src', 'data', 'questions');
const docsDir = join(root, 'src', 'content', 'docs');
const strictTopics = !process.argv.includes('--allow-missing-pages');

const errors = [];
const warnings = [];
const seen = new Map();
const summary = [];

function pageExists(rel) {
  const clean = rel.replace(/^\/|\/$/g, '');
  return ['.md', '.mdx'].some((ext) => existsSync(join(docsDir, clean + ext))) ||
    ['index.md', 'index.mdx'].some((f) => existsSync(join(docsDir, clean, f)));
}

const files = existsSync(qDir) ? readdirSync(qDir).filter((f) => f.endsWith('.json')) : [];
const known = new Set(QUIZ_SECTIONS.map((s) => s.id));

for (const file of files) {
  // "<section>.json" or "<section>.<part>.json" (large sections may split their bank).
  const section = basename(file, '.json').split('.')[0];
  const path = join(qDir, file);
  let data;
  try {
    data = JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    errors.push(`${file}: invalid JSON (${e.message})`);
    continue;
  }
  const parsed = QuestionFileSchema.safeParse(data);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const where = issue.path.length ? issue.path.join('.') : '(root)';
      const qid = issue.path[0] === 'questions' ? data.questions?.[issue.path[1]]?.id : undefined;
      errors.push(`${file}: ${where}${qid ? ` [${qid}]` : ''}: ${issue.message}`);
    }
    continue;
  }
  const { questions } = parsed.data;
  if (parsed.data.section !== section) errors.push(`${file}: "section" is "${parsed.data.section}" but file name says "${section}"`);
  if (!known.has(section)) errors.push(`${file}: unknown quiz section "${section}" (see src/lib/sections.mjs)`);

  const mix = { easy: 0, medium: 0, hard: 0 };
  const unreviewed = questions.filter((q) => !q.reviewed).length;
  for (const q of questions) {
    mix[q.difficulty]++;
    if (seen.has(q.id)) errors.push(`${file}: duplicate id ${q.id} (also in ${seen.get(q.id)})`);
    seen.set(q.id, file);
    if (!q.id.startsWith(`${section}-${q.topic}-`))
      errors.push(`${file}: id ${q.id} should start with "${section}-${q.topic}-"`);
    if (!pageExists(`${section}/${q.topic}`)) {
      (strictTopics ? errors : warnings).push(`${file}: [${q.id}] topic "${q.topic}" has no page at src/content/docs/${section}/${q.topic}.mdx`);
    }
    if (q.readMore && !pageExists(q.readMore.split('#')[0]))
      errors.push(`${file}: [${q.id}] readMore "${q.readMore}" does not match a page`);
    const correctText = q.answer.map((a) => q.options[a]);
    const longest = Math.max(...q.options.map((o) => o.length));
    if (q.type === 'single' && correctText[0].length === longest && longest > 2 * Math.min(...q.options.map((o) => o.length)) + 40)
      warnings.push(`${file}: [${q.id}] correct option is much longer than the others (gives the answer away)`);
  }
  summary.push({ section, total: questions.length, ...mix, unreviewed });
}

if (summary.length) {
  console.log('\nQuestion bank');
  console.table(summary);
  console.log(`Total: ${summary.reduce((n, s) => n + s.total, 0)} questions in ${summary.length} section(s)`);
}
for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
if (errors.length) {
  console.error(`\n${errors.length} error(s). Fix them before building.`);
  process.exit(1);
}
console.log(`\nOK${warnings.length ? ` with ${warnings.length} warning(s)` : ''}.`);
