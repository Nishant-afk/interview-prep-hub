// Manifest of available sections and their question counts: /api/questions/index.json
import type { APIRoute } from 'astro';
import { questionCounts } from '../../../lib/questions';

export const GET: APIRoute = () =>
  new Response(JSON.stringify(questionCounts()), { headers: { 'Content-Type': 'application/json' } });
