// Emits one static JSON file per section at build time, e.g. /api/questions/csharp.json.
// The Test Centre island fetches these lazily so pages don't inline the whole bank.
import type { APIRoute, GetStaticPaths } from 'astro';
import { allQuestionsBySection } from '../../../lib/questions';

export const getStaticPaths: GetStaticPaths = () =>
  Object.keys(allQuestionsBySection()).map((section) => ({ params: { section } }));

export const GET: APIRoute = ({ params }) => {
  const questions = allQuestionsBySection()[params.section as string] ?? [];
  return new Response(JSON.stringify(questions), { headers: { 'Content-Type': 'application/json' } });
};
