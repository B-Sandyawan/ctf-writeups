import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const writeups = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './content/writeups' }),
  schema: z.object({
    title: z.string().catch('Untitled'),
    description: z.string().optional().catch(''),
    date: z.coerce.date().catch(() => new Date()),
    updated: z.coerce.date().optional().catch(undefined),
    tags: z.array(z.string()).catch([]),
    platform: z.string().optional().catch(''),
    category: z.string().optional().catch(''),
    difficulty: z.enum(['easy', 'medium', 'hard', 'insane']).optional().catch(undefined),
    draft: z.boolean().catch(false),
    starred: z.boolean().catch(false).optional(),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './content/notes' }),
  schema: z.object({
    title: z.string().catch('Untitled'),
    description: z.string().optional().catch(''),
    date: z.coerce.date().catch(() => new Date()),
    updated: z.coerce.date().optional().catch(undefined),
    tags: z.array(z.string()).catch([]),
    category: z.string().optional().catch(''),
    draft: z.boolean().catch(false),
    starred: z.boolean().catch(false).optional(),
  }),
});

export const collections = { writeups, notes };
