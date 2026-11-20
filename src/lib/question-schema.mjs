// Zod schema for question bank files: src/data/questions/<section>.json
// Shared by scripts/validate-questions.mjs and the site at build time.
import { z } from 'zod';

export const QuestionSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+-\d{3}$/, 'id must look like <section>-<topic>-<nnn>'),
    topic: z.string().regex(/^[a-z0-9-]+$/),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    type: z.enum(['single', 'multi']),
    question: z.string().min(10),
    code: z.string().optional(),
    codeLang: z.string().optional(),
    options: z.array(z.string().min(1)).min(2).max(6),
    answer: z.array(z.number().int().nonnegative()).min(1),
    explanation: z.string().min(20),
    optionNotes: z.array(z.string().nullable()).optional(),
    readMore: z.string().optional(),
    reviewed: z.boolean().optional(),
  })
  .strict()
  .superRefine((q, ctx) => {
    if (q.answer.some((a) => a >= q.options.length))
      ctx.addIssue({ code: 'custom', message: 'answer index out of range' });
    if (new Set(q.answer).size !== q.answer.length)
      ctx.addIssue({ code: 'custom', message: 'duplicate answer index' });
    if (q.type === 'single' && q.answer.length !== 1)
      ctx.addIssue({ code: 'custom', message: 'single-type question must have exactly one answer' });
    if (q.type === 'multi' && q.answer.length < 2)
      ctx.addIssue({ code: 'custom', message: 'multi-type question must have 2+ answers' });
    if (q.optionNotes && q.optionNotes.length !== q.options.length)
      ctx.addIssue({ code: 'custom', message: 'optionNotes length must equal options length' });
    if (q.code && !q.codeLang)
      ctx.addIssue({ code: 'custom', message: 'codeLang required when code is present' });
    if (new Set(q.options.map((o) => o.trim().toLowerCase())).size !== q.options.length)
      ctx.addIssue({ code: 'custom', message: 'duplicate options' });
  });

export const QuestionFileSchema = z
  .object({
    section: z.string(),
    version: z.number().int().positive(),
    questions: z.array(QuestionSchema),
  })
  .strict();
