import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Astro 5+ content layer. If `npm create astro` gave you v4, this file lives at
 * src/content/config.ts instead, and collections use `type: 'content'` with no loader.
 */

const ITEM_KINDS = [
  'commentary', 'news', 'tip', 'comparison',
  'myth-buster', 'hot-take', 'known-issue', 'community', 'security', 'ai',
] as const;

/** One item inside a daily brief. */
const briefItem = z
  .object({
    slot: z.number().int().min(1),
    kind: z.enum(ITEM_KINDS),
    heading: z.string().min(3),
    /** Full text - use ONLY when this item is not promoted to its own page. */
    body: z.string().optional(),
    /** Slug of the standalone story this item points at. */
    story: z.string().optional(),
    /** Two-line teaser - required when `story` is set. */
    teaser: z.string().optional(),
    source: z.string().url().optional(),
  })
  .refine((i) => Boolean(i.body) !== Boolean(i.story), {
    message:
      'Full text lives in exactly one place: set EITHER body (stays in the brief) ' +
      'OR story (promoted to its own page), never both and never neither.',
  })
  .refine((i) => !i.story || Boolean(i.teaser), {
    message: 'A promoted item needs a teaser - the brief links, it does not repeat the text.',
  });

const daily = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/daily' }),
  schema: z.object({
    date: z.coerce.date(),
    title: z.string(),
    description: z.string().max(160),
    items: z.array(briefItem).min(1),
    draft: z.boolean().default(false),
  }),
});

const stories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/stories' }),
  schema: z.object({
    /**
     * Explicit and permanent. Never derived from the title at build time -
     * slugify() strips non-Latin, and a headline must be rewritable
     * without moving the URL.
     */
    slug: z.string(),
    title: z.string(),
    description: z.string().max(160),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    category: z.enum(['known-issue', 'explainer', 'comparison', 'news', 'tip']),
    topics: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { daily, stories };
