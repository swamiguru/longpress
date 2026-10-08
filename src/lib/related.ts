/**
 * Looks up "Previously on Long Press" links for one brief item or story.
 *
 * src/data/related.json holds ids and scores only (written by
 * scripts/related/related.mjs on the Mac). Titles, dates and URLs are resolved
 * here from the live content collections, so a rewritten headline never leaves
 * a stale link, and a deleted or drafted item simply drops out.
 *
 * If the file is missing the lookup returns nothing and pages build without
 * the block.
 */
import { getCollection } from 'astro:content';

type Link =
  | { type: 'daily'; date: string; n: number; score: number }
  | { type: 'story'; slug: string; score: number };

const files = import.meta.glob<{ default: { entries: Record<string, Link[]> } }>('../data/related.json', { eager: true });
const entries: Record<string, Link[]> = Object.values(files)[0]?.default?.entries ?? {};

export interface RelatedLink {
  href: string;
  title: string;
  /** "Known Issue", "Daily Five", or the story category. */
  tag: string;
  isColumn: boolean;
  date: Date;
}

let index: Promise<{
  briefs: Map<string, { title: string; date: Date }>;
  stories: Map<string, { title: string; date: Date; category: string }>;
}> | null = null;

function build() {
  return (async () => {
    const daily = await getCollection('daily', ({ data }) => !data.draft);
    const stories = await getCollection('stories', ({ data }) => !data.draft);
    const briefs = new Map<string, { title: string; date: Date }>();
    for (const b of daily) {
      const day = b.data.date.toISOString().slice(0, 10);
      for (const it of b.data.items) briefs.set(`${day}#${it.slot}`, { title: it.heading, date: b.data.date });
    }
    const st = new Map<string, { title: string; date: Date; category: string }>();
    for (const s of stories) st.set(s.data.slug, { title: s.data.title, date: s.data.published, category: s.data.category });
    return { briefs, stories: st };
  })();
}

export async function relatedFor(id: string): Promise<RelatedLink[]> {
  const links = entries[id];
  if (!links?.length) return [];
  index ??= build();
  const { briefs, stories } = await index;
  const out: RelatedLink[] = [];
  for (const l of links) {
    if (l.type === 'daily') {
      const b = briefs.get(`${l.date}#${l.n}`);
      if (b) out.push({ href: `/daily/${l.date}#story-${l.n}`, title: b.title, tag: 'Daily Five', isColumn: false, date: b.date });
    } else {
      const s = stories.get(l.slug);
      if (s) {
        const isColumn = s.category === 'known-issue';
        out.push({
          href: `/${l.slug}`,
          title: s.title,
          tag: isColumn ? 'Known Issue' : s.category.charAt(0).toUpperCase() + s.category.slice(1),
          isColumn,
          date: s.date,
        });
      }
    }
  }
  return out;
}
