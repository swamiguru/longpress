import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const ITEM_KINDS = [
  'commentary', 'news', 'tip', 'comparison',
  'myth-buster', 'hot-take', 'known-issue', 'community', 'security', 'ai',
] as const;

const REGIONS = ['india', 'global'] as const;

/**
 * A Tap: the quick hit under the Daily Five. One headline, at most one line
 * of context, one source. No card, no four-part analysis - a tap, not a
 * long press.
 */
const tap = z.object({
  region: z.enum(REGIONS).optional(),
  headline: z.string().min(3),
  line: z.string().optional(),
  source: z.object({ label: z.string().optional(), url: z.string().url() }).optional(),
});

/** One item inside a daily brief. */
const briefItem = z
  .object({
    slot: z.number().int().min(1),
    kind: z.enum(ITEM_KINDS),
    /** Where the story is centred. Drives the India chip; older issues have none. */
    region: z.enum(REGIONS).optional(),
    heading: z.string().min(3),
    /** Full text - use ONLY when this item is not promoted to its own page. */
    body: z.string().optional(),
    /** Slug of the standalone story this item points at. */
    story: z.string().optional(),
    /** Two-line teaser - required when `story` is set. */
    teaser: z.string().optional(),
    /** Legacy single link. Prefer `sources`; both render, de-duplicated. */
    source: z.string().url().optional(),
    /**
     * Where the claims in this item come from. Pages the generator actually
     * opened that run, never URLs reconstructed from memory. Rendered as a
     * Sources row under the item. Inline [label](url) links in the prose cite
     * a specific claim; this row lists everything the item rests on.
     */
    sources: z
      .array(z.object({ label: z.string().optional(), url: z.string().url() }))
      .max(6)
      .optional(),
    /** Square social card or diagram for this item, e.g. /images/daily/card_1.webp */
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    imageCaption: z.string().optional(),

    /**
     * The press-and-hold structure. Optional, but when present this is what
     * separates the brief from an aggregator: not just what happened, but
     * what was broken, what changed, what the catch is, and what it means.
     */
    problem: z.string().optional(),
    breakthrough: z.string().optional(),
    catch: z.string().optional(),
    forYou: z.string().optional(),

    /**
     * Answer-first framing for search and AI answer engines (AEO/GEO audit,
     * 12 Oct 2026). `question` is the literal query a reader would type or
     * ask a chatbot; `answer` is a 30-50 word standalone answer shown right
     * under it as "In one line"; `qa` is 2-3 visible follow-up questions.
     * Rendered as plain visible text with question-shaped headings. No
     * FAQPage schema on purpose: Google limits those rich results, and the
     * visible text is what gets extracted anyway.
     */
    question: z.string().min(8).optional(),
    answer: z.string().optional(),
    qa: z.array(z.object({ q: z.string().min(8), a: z.string().min(20) })).max(4).optional(),
  })
  .refine((i) => !i.question || Boolean(i.answer), {
    message: 'A question needs its answer: set `answer` whenever `question` is set.',
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
    /** Byline - defaults to Swami Guru so the archive carries it without editing 60+ back issues. */
    author: z.string().default('Swami Guru'),
    /** Meta description - hard capped so it does not truncate in results. */
    description: z.string().max(160),
    /** The full standfirst, shown on the page. No length limit. */
    intro: z.string().optional(),
    items: z.array(briefItem).min(1),
    /** Quick hits under the five. Optional: issues before 12 Oct 2026 have none. */
    taps: z.array(tap).max(8).optional(),
    draft: z.boolean().default(false),
  }),
});

const stories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/stories' }),
  schema: z.object({
    /** Explicit and permanent. Never derived from the title at build time. */
    slug: z.string(),
    title: z.string(),
    /** Byline - defaults to Swami Guru, same as the daily brief. */
    author: z.string().default('Swami Guru'),
    description: z.string().max(160),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    category: z.enum(['known-issue', 'explainer', 'comparison', 'news', 'tip']),
    topics: z.array(z.string()).default([]),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
    heroImageCaption: z.string().optional(),

    /**
     * Square generated illustration (same Gemini pipeline and line-art style
     * as the Daily Five card art) -- distinct from heroImage, which is a
     * general-purpose 16:9 slot any story category can use. Rendered at 1:1
     * on the story page and reused as-is for the homepage thumbnail (lead
     * card and entry cards), same convention as briefItem.image.
     */
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    imageCaption: z.string().optional(),

    /**
     * The Known Issue column's four tenets, in reading order. Optional on
     * the schema so any story type could carry a verdict, but in practice
     * these are what make a known-issue piece read as the column rather
     * than a longer news item. Never flatten these into body prose - they
     * are the structure, not decoration.
     */
    /**
     * Year the problem started, e.g. 2014. Optional. When set, the homepage's
     * featured column shows "N years open" on its image. Leave it out and
     * nothing renders.
     */
    openSince: z.number().int().min(1990).optional(),
    /**
     * Date the problem was first reported or shipped, e.g. 2011-10-12.
     * Optional. On a Known Issue page it drives the "Open for N days"
     * counter in the head. Must be a real, checkable date. Without it the
     * head falls back to openSince (years), and without either the
     * strip is not rendered.
     */
    reportedOn: z.coerce.date().optional(),
    /** One line on what a reader can do about it today. Shown in the head strip. Optional. */
    workaround: z.string().optional(),

    /** "Not today's news." What's been true for months, and why this is worth saying now rather than at launch. */
    trigger: z.string().optional(),
    /** "Plain about the money." Who benefits from the thing staying broken - usually the part nobody prints. */
    whoBenefits: z.string().optional(),
    /** "The operator's read." The inside-the-job take a reporter without that background couldn't write. */
    operatorsRead: z.string().optional(),
    /** "A verdict." Buy, skip, or wait - never "it depends". */
    verdict: z.enum(['buy', 'skip', 'wait']).optional(),
    /** One or two sentences backing the verdict call. */
    verdictNote: z.string().optional(),

    /** Where the claims come from: primary pages first. Absolute http(s) URLs only. */
    sources: z.array(z.object({ label: z.string().optional(), url: z.string().url() })).max(12).optional(),

    draft: z.boolean().default(false),
  }),
});

/**
 * Fine Print - the third pillar. Plain-language explainers of the rules,
 * prices and services that change things for people in India, kept current.
 * Every block below is the format, not decoration: a piece without
 * "does this apply to you", rupee maths where money is involved, the
 * fine print and a change log is not a Fine Print piece.
 *
 * Inline markers in the text fields: [^n] links to source n, ==text== is
 * a highlighter sweep. Nothing else is interpreted; everything is escaped.
 */
const finePrint = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/fine-print' }),
  schema: z.object({
    /** Explicit and permanent: the URL is /fine-print/<slug>. */
    slug: z.string(),
    title: z.string(),
    /** Meta description - hard capped so it does not truncate in results. */
    description: z.string().max(160),
    /** Short beat label shown as the eyebrow, e.g. "Payments". */
    category: z.string(),
    author: z.string().default('Swami Guru'),
    published: z.coerce.date(),
    /** When the facts were last re-checked against the sources. Shown as a stamp. */
    lastChecked: z.coerce.date(),
    nextCheck: z.coerce.date().optional(),
    /** The whole answer in one sentence. */
    oneLine: z.string(),
    /**
     * Up to three numbers that carry the whole story, shown under the title.
     * Optional: a piece with no honest headline numbers leaves it out.
     * Each must appear in the body of the piece; never a figure only here.
     */
    keyFigures: z
      .array(
        z.object({
          big: z.string().max(12),
          label: z.string().max(70),
          /** Highlighter behind this one. At most one, usually the number the reader pays. */
          highlight: z.boolean().default(false),
        }),
      )
      .max(3)
      .optional(),
    /** "Does this apply to you?" - one row per kind of reader. */
    applies: z
      .array(
        z.object({
          who: z.string(),
          status: z.enum(['no-change', 'you-pay', 'act', 'check']),
          text: z.string(),
        }),
      )
      .min(1),
    /** The rule quoted from the primary document, beside the plain version. */
    rules: z
      .array(z.object({ quote: z.string(), plain: z.string() }))
      .default([]),
    /** Worked rupee examples. Optional for pieces with no money angle. */
    costs: z
      .object({
        /** Section heading; defaults to the payment framing. */
        title: z.string().default('What it costs, in rupees'),
        note: z.string().optional(),
        itemLabel: z.string().default('Payment'),
        ruleLabel: z.string().default('Rule'),
        payerLabel: z.string().default('Cost'),
        /** Closing line of the receipt, e.g. "You pay, on every line" / "Rs 0". Only when it is literally true. */
        footer: z.object({ label: z.string(), amount: z.string() }).optional(),
        rows: z
          .array(
            z.object({
              item: z.string(),
              rule: z.string(),
              amount: z.string(),
              highlight: z.boolean().default(false),
            }),
          )
          .min(1),
      })
      .optional(),
    steps: z.array(z.string()).default([]),
    /** The catches. The section the pillar is named after. */
    finePrint: z.array(z.string()).min(1),
    unknowns: z.array(z.string()).default([]),
    /** One paragraph of opinion. */
    take: z.string(),
    changelog: z.array(z.object({ date: z.coerce.date(), text: z.string() })).min(1),
    /** Numbered in order; [^1] in the text points at the first. Primary documents first. */
    sources: z.array(z.object({ label: z.string(), url: z.string().url() })).min(1).max(12),
    /** The Hindi long-form on @builtbyswami, when there is one. */
    video: z.object({ title: z.string(), url: z.string().url() }).optional(),
    topics: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { daily, stories, finePrint };
