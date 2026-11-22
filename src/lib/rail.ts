/**
 * Items for the story rail ("Keep reading" on Known Issue, "More in Fine Print").
 * Same ranking the old Related Articles block used (same category, shared
 * topics, newest), plus one cross-pillar slot: a topic-matched Fine Print piece
 * takes slot 3 when there is one. Titles, dates and URLs come from the content
 * collections at build time, so a rewritten headline never leaves a stale link.
 */
import { getCollection } from 'astro:content';
import { getResponsiveImage } from './images';
import { getArticleReadingTime } from './readingTime';

export type RailTone = 'ki' | 'daily' | 'fp';
export interface RailItem {
  href: string;
  title: string;
  kicker: string;
  meta: string;
  tone: RailTone;
  img?: { src: string; srcset?: string; sizes?: string; width: number; height: number };
  imgAlt: string;
}

const short = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const RAIL_SIZES = '(min-width: 1080px) 300px, 96px';

function storyImg(d: any): RailItem['img'] | undefined {
  const src = d.image ?? d.heroImage;
  if (!src) return undefined;
  const r = getResponsiveImage(src, { aspectRatio: d.image ? '1/1' : '16/9', customSizes: RAIL_SIZES });
  return { src: r.src, srcset: r.srcset, sizes: r.sizes, width: r.width, height: r.height };
}

function fpImg(d: any): RailItem['img'] | undefined {
  const hero: string | undefined = d.heroImage;
  if (!hero) return undefined;
  const small = hero.replace(/\.webp$/, '-800w.webp');
  return { src: small, width: 800, height: 450, sizes: RAIL_SIZES };
}

export async function railForStory(opts: {
  currentSlug: string;
  currentCategory: string;
  currentTopics: string[];
  exclude: string[];
}): Promise<RailItem[]> {
  const { currentSlug, currentCategory, currentTopics, exclude } = opts;
  const stories = await getCollection('stories', ({ data }) => !data.draft);
  const scored = stories
    .filter((s) => s.data.slug !== currentSlug && !exclude.includes(s.data.slug))
    .map((s) => {
      let score = s.data.category === currentCategory ? 100 : 0;
      score += (s.data.topics ?? []).filter((t: string) => currentTopics.includes(t)).length * 15;
      score += (s.data.published?.getTime() ?? 0) / 1e12;
      return { s, score };
    })
    .sort((a, b) => b.score - a.score);

  const toItem = (s: (typeof stories)[number]): RailItem => ({
    href: `/${s.data.slug}`,
    title: s.data.title,
    kicker: s.data.category === 'known-issue' ? 'Known Issue' : s.data.category.replace(/-/g, ' '),
    meta: getArticleReadingTime(s).text,
    tone: s.data.category === 'known-issue' ? 'ki' : 'daily',
    img: storyImg(s.data),
    imgAlt: '',
  });

  const items = scored.slice(0, 3).map((x) => toItem(x.s));

  // Cross-pillar slot: the best topic-matched Fine Print piece replaces slot 3.
  const fp = await getCollection('finePrint', ({ data }) => !data.draft);
  const match = fp
    .map((p) => ({ p, shared: (p.data.topics ?? []).filter((t: string) => currentTopics.includes(t)).length }))
    .filter((x) => x.shared > 0)
    .sort((a, b) => b.shared - a.shared || b.p.data.published.valueOf() - a.p.data.published.valueOf())[0];
  if (match) {
    const fpItem: RailItem = {
      href: `/fine-print/${match.p.data.slug}`,
      title: match.p.data.title,
      kicker: 'Fine Print',
      meta: `Last checked ${short.format(match.p.data.lastChecked)}`,
      tone: 'fp',
      img: fpImg(match.p.data),
      imgAlt: '',
    };
    if (items.length >= 3) items[2] = fpItem;
    else items.push(fpItem);
  }
  return items;
}

export function railForFinePrint(others: any[]): RailItem[] {
  return others.slice(0, 3).map((o) => ({
    href: `/fine-print/${o.data.slug}`,
    title: o.data.title,
    kicker: o.data.category,
    meta: `Last checked ${short.format(o.data.lastChecked)}`,
    tone: 'fp' as const,
    img: fpImg(o.data),
    imgAlt: '',
  }));
}
