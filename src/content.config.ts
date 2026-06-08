import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const writeups = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './content/writeups' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional().default(''),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    platform: z.string().optional().default(''),
    category: z.string().optional().default(''),
    difficulty: z.enum(['easy', 'medium', 'hard', 'insane']).optional(),
    draft: z.boolean().default(false),
    starred: z.boolean().default(false).optional(),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './content/notes' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional().default(''),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    category: z.string().optional().default(''),
    draft: z.boolean().default(false),
    starred: z.boolean().default(false).optional(),
  }),
});

export const collections = { writeups, notes };
