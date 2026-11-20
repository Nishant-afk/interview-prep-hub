// Build-time helpers that combine the docs collection with the question bank.
import { getCollection } from 'astro:content';
import { SECTIONS } from './sections.mjs';
import { questionCounts } from './questions';
import type { SectionInfo } from '../components/TestCentre';
import type { SectionTopics } from '../components/ProgressWidget';

export function sectionInfos(): SectionInfo[] {
  const counts = questionCounts();
  return SECTIONS.filter((s) => s.quiz).map((s) => ({
    id: s.id,
    label: s.label,
    short: s.short,
    weight: s.weight,
    count: counts[s.id] ?? 0,
  }));
}

export async function sectionTopics(): Promise<SectionTopics[]> {
  const docs = await getCollection('docs');
  return SECTIONS.map((s) => ({
    id: s.id,
    label: s.label,
    topics: docs
      .filter((d) => d.id.startsWith(`${s.id}/`) && !d.data.noProgress && d.data.template !== 'splash')
      .sort((a, b) => (a.data.sidebar?.order ?? 999) - (b.data.sidebar?.order ?? 999) || a.id.localeCompare(b.id))
      .map((d) => ({ id: d.id, title: d.data.title, importance: d.data.importance })),
  }));
}

/** "section/topic" -> title for every topic page. */
export async function topicTitles(): Promise<Record<string, string>> {
  const docs = await getCollection('docs');
  return Object.fromEntries(docs.filter((d) => d.id.includes('/')).map((d) => [d.id, d.data.title]));
}
