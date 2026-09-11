import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const briefs = await getCollection('daily', ({ data }) => !data.draft);
  const stories = await getCollection('stories', ({ data }) => !data.draft);

  const items = [
    ...briefs.map((b) => ({
      title: b.data.title,
      description: b.data.description,
      pubDate: b.data.date,
      link: `/daily/${b.id.replace(/\.md$/, '')}`,
    })),
    ...stories.map((s) => ({
      title: s.data.title,
      description: s.data.description,
      pubDate: s.data.published,
      link: `/${s.data.slug}`,
    })),
  ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: 'Long Press',
    description: 'The tech stories that mattered, with an honest take.',
    site: context.site,
    items,
  });
}
