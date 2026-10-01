import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** A Case: a full reading page for one substantial piece of work. See GLOSSARY.md. */
const cases = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cases' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    context: z.string(),
    question: z.string(),
    /** What Kaushik personally did (GLOSSARY: Contribution). The Chapter and figure come from the Journey. */
    contribution: z.string(),
    team: z.string().optional(),
    timeline: z.string(),
    methods: z.array(z.string()),
    outcome: z.string(),
    /** The kind of outcome, so a recommendation never reads as a measured result. */
    outcomeType: z.enum(['Delivered capability', 'Recommendations', 'Recommendations, used', 'Recommendation, implementation reported', 'Launched, now paused']),
    status: z.string(),
    shows: z.array(z.string()),
    cannotShow: z.array(z.string()),
    draft: z.boolean().default(false),
  }),
});

export const collections = { cases };
