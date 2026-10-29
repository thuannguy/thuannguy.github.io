import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Posts keep their Jekyll file names (YYYY-M-D-slug.md); the id is the file name
// without extension, so post URLs keep their original case.
const blog = defineCollection({
  loader: glob({
    pattern: '*.md',
    base: './src/content/blog',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).nullish().transform((t) => t ?? []),
    image: z.string().optional(),
    published: z.boolean().optional(),
  }),
});

export const collections = { blog };
