import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        /** How often this topic comes up in interviews. */
        importance: z.enum(['high', 'medium', 'low']).optional(),
        difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
        estimatedMinutes: z.number().int().positive().optional(),
        tags: z.array(z.string()).optional(),
        /** Hide the "Mark as done" toggle (e.g. index or tool pages). */
        noProgress: z.boolean().optional(),
      }),
    }),
  }),
};
