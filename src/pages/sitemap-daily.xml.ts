/**
 * Second sitemap, for the Daily Five briefs only.
 *
 * sitemap-0.xml (from @astrojs/sitemap) now carries the evergreen pages:
 * stories, Fine Print, hubs and static pages. The 119+ dated briefs live here,
 * so Search Console reports the two groups separately and a brief that is not
 * indexed yet no longer clouds the numbers for the stories. The index file
 * (sitemap-index.xml) lists both. Same lastmod source as the main sitemap.
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { buildLastmodMap } from '../lib/seo/lastmod.mjs';

const SITE = 'https://longpress.news';

export const GET: APIRoute = async () => {
  const { map } = buildLastmodMap();
  const briefs = (await getCollection('daily', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
  const urls = briefs.map((b) => {
    const path = `/daily/${b.id.replace(/\.md$/, '')}`;
    const lastmod = map.get(path) ?? b.data.date.toISOString();
    return `<url><loc>${SITE}${path}</loc><lastmod>${lastmod}</lastmod></url>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
