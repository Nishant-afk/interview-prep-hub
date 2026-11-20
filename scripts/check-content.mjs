#!/usr/bin/env node
// Fast content checks without a full Astro build. Safe to run in parallel.
//   node scripts/check-content.mjs                 # all pages
//   node scripts/check-content.mjs src/content/docs/csharp   # a folder or specific files
// Checks:
//  - front matter is valid YAML with title (+ description) and known enum values
//  - MDX compiles with the same compiler Astro uses (satteri)
//  - every ```mermaid block parses (mermaid renders client-side, so the build would NOT catch these)
//  - every fenced code block has a language
//  - relative markdown links point at existing pages
//  - <QuizBlock section/topic> matches the file location and has questions
//  - topic pages contain the standard headings (warning only)
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname, resolve, sep, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mdxToJs } from 'satteri';
import YAML from 'yaml';
import { JSDOM } from 'jsdom';
import { SECTION_IDS, QUIZ_SECTIONS } from '../src/lib/sections.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const docsDir = join(root, 'src', 'content', 'docs');
const qDir = join(root, 'src', 'data', 'questions');

// Mermaid needs a DOM to load.
const dom = new JSDOM('<!doctype html><html><body></body></html>');
Object.assign(globalThis, { window: dom.window, document: dom.window.document, DOMParser: dom.window.DOMParser, Element: dom.window.Element });
const mermaid = (await import('mermaid')).default;

function walk(p) {
  if (!existsSync(p)) return [];
  if (statSync(p).isFile()) return /\.mdx?$/.test(p) ? [p] : [];
  return readdirSync(p).flatMap((f) => walk(join(p, f)));
}

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const files = (args.length ? args.map((a) => resolve(a)) : [docsDir]).flatMap(walk);

// All page routes, e.g. "csharp/async-await", "csharp", "" (home).
const routes = new Set(
  walk(docsDir).map((f) =>
    relative(docsDir, f).split(sep).join('/').replace(/\.mdx?$/, '').replace(/(^|\/)index$/, ''),
  ),
);

const questionTopics = {};
for (const f of existsSync(qDir) ? readdirSync(qDir).filter((x) => x.endsWith('.json')) : []) {
  try {
    const data = JSON.parse(readFileSync(join(qDir, f), 'utf8'));
    questionTopics[data.section] ??= new Map();
    for (const q of data.questions ?? []) questionTopics[data.section].set(q.topic, (questionTopics[data.section].get(q.topic) ?? 0) + 1);
  } catch {
    /* validate-questions reports JSON errors */
  }
}

const quizSections = new Set(QUIZ_SECTIONS.map((s) => s.id));
const KNOWN_LANGS = new Set([
  'csharp', 'cs', 'ts', 'typescript', 'js', 'javascript', 'json', 'sql', 'html', 'css', 'scss', 'bash', 'sh', 'powershell', 'ps1',
  'yaml', 'yml', 'dockerfile', 'docker', 'xml', 'text', 'txt', 'plaintext', 'http', 'diff', 'ini', 'toml', 'mermaid', 'md', 'markdown',
  'mdx', 'tsx', 'jsx', 'shell', 'console', 'graphql', 'proto', 'protobuf', 'nginx', 'razor', 'cshtml', 'python', 'py', 'java', 'go', 'c', 'cpp',
]);

let errors = 0;
let warnings = 0;
const err = (f, m) => (errors++, console.error(`error ${relative(root, f)}: ${m}`));
const warn = (f, m) => (warnings++, console.warn(`warn  ${relative(root, f)}: ${m}`));

for (const file of files) {
  const src = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const rel = relative(docsDir, file).split(sep).join('/');
  const route = rel.replace(/\.mdx?$/, '').replace(/(^|\/)index$/, '');
  const [section, ...rest] = route.split('/');
  const isTopic = SECTION_IDS.includes(section) && rest.length > 0;

  // Front matter
  const fm = src.match(/^---\n([\s\S]*?)\n---\n/);
  let data = {};
  if (!fm) err(file, 'missing front matter');
  else {
    try {
      data = YAML.parse(fm[1]) ?? {};
    } catch (e) {
      err(file, `front matter YAML: ${e.message.split('\n')[0]}`);
    }
    if (!data.title) err(file, 'front matter: title is required');
    if (!data.description) warn(file, 'front matter: description is missing');
    if (data.importance && !['high', 'medium', 'low'].includes(data.importance)) err(file, `importance must be high|medium|low`);
    if (data.difficulty && !['easy', 'medium', 'hard'].includes(data.difficulty)) err(file, `difficulty must be easy|medium|hard`);
  }
  const body = fm ? src.slice(fm[0].length) : src;

  // MDX compile
  if (file.endsWith('.mdx')) {
    try {
      mdxToJs(body);
    } catch (e) {
      const m = String(e.message).match(/^(\d+):(\d+)/);
      const line = m ? Number(m[1]) + (fm ? fm[0].split('\n').length - 1 : 0) : '?';
      err(file, `MDX (line ~${line}): ${String(e.message).split('\n')[0]}`);
    }
  }

  // Code fences
  const fenceRe = /^([ \t]*)(`{3,}|~{3,})([^\n`]*)\n([\s\S]*?)\n\1\2[ \t]*$/gm;
  let m;
  while ((m = fenceRe.exec(body))) {
    const lang = m[3].trim().split(/\s+/)[0];
    if (!lang) warn(file, `code block without a language: "${m[4].split('\n')[0].slice(0, 50)}"`);
    else if (!KNOWN_LANGS.has(lang.toLowerCase())) warn(file, `unusual code language "${lang}"`);
    if (lang === 'mermaid') {
      try {
        await mermaid.parse(m[4]);
      } catch (e) {
        err(file, `mermaid: ${String(e.message ?? e).split('\n').slice(0, 2).join(' | ')} (diagram starts "${m[4].split('\n')[0]}")`);
      }
    }
  }

  // Relative links
  const prose = body.replace(fenceRe, '');
  const linkRe = /\]\(([^)\s]+)\)|href="([^"]+)"/g;
  while ((m = linkRe.exec(prose))) {
    const href = (m[1] ?? m[2]).split('#')[0];
    if (!href || /^[a-z]+:/i.test(href) || href.startsWith('mailto:')) continue;
    if (href.startsWith('/')) {
      warn(file, `absolute link "${href}" ignores the base path; use a relative link`);
      continue;
    }
    if (href.includes('?')) continue;
    // Page URL is /<route>/ so relative links resolve from that directory.
    const target = posix.normalize(posix.join('/', route, href)).replace(/^\/|\/$/g, '');
    if (!routes.has(target)) err(file, `broken link "${href}" (resolves to /${target}/)`);
  }

  // Quiz blocks
  const quizRe = /<QuizBlock\s+([^>]*)\/>/g;
  let hasQuiz = false;
  while ((m = quizRe.exec(body))) {
    hasQuiz = true;
    const s = m[1].match(/section="([^"]+)"/)?.[1];
    const t = m[1].match(/topic="([^"]+)"/)?.[1];
    if (s !== section) err(file, `QuizBlock section="${s}" should be "${section}"`);
    if (t && t !== rest.join('/')) err(file, `QuizBlock topic="${t}" should be "${rest.join('/')}"`);
    const n = questionTopics[s]?.get(t) ?? 0;
    if (n === 0) err(file, `QuizBlock has no questions (add ${s}-${t}-001.. to src/data/questions/${s}.json)`);
    else if (n < 5) warn(file, `only ${n} question(s) for this topic; aim for 6-10`);
  }

  // Standard headings on topic pages
  if (isTopic && !data.noProgress && section !== 'behavioral' && section !== 'revision') {
    for (const h of ['## Why it matters in interviews', '## Interview Q&A', '## Pitfalls']) {
      if (!body.includes(h)) warn(file, `missing heading "${h}"`);
    }
    if (quizSections.has(section) && !hasQuiz) warn(file, 'topic page has no <QuizBlock>');
  }
}

console.log(`\nChecked ${files.length} page(s): ${errors} error(s), ${warnings} warning(s).`);
process.exit(errors ? 1 : 0);
