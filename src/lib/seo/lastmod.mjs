/**
 * lastmod for the sitemap, derived from content — no dependencies.
 *
 * Google largely ignores <priority> and <changefreq>, but it does read
 * <lastmod> when the value is honest. So: every URL gets the date of the
 * content behind it, and the pages that are rebuilt every morning (home,
 * the archives, the column and topic hubs) get the newest issue's date.
 */
import fs from 'node:fs';
import path from 'node:path';

const DAILY_DIR = 'src/content/daily';
const STORIES_DIR = 'src/content/stories';

const iso = (d) => new Date(d).toISOString();
const read = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.md')) : []);

/** Front matter is small and flat here; a scanner beats pulling in a parser. */
function frontmatter(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const block = raw.split('---')[1] ?? '';
  const out = {};
  for (const line of block.split('\n')) {
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.+)$/);
    if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

export function buildLastmodMap(root = process.cwd()) {
  const map = new Map();
  const dailyDates = [];

  for (const f of read(path.join(root, DAILY_DIR))) {
    const date = frontmatter(path.join(root, DAILY_DIR, f)).date ?? f.replace(/\.md$/, '');
    if (!/^\d{4}-\d{2}-\d{2}/.test(date)) continue;
    dailyDates.push(date);
    map.set(`/daily/${f.replace(/\.md$/, '')}`, iso(date));
  }

  const storyDates = [];
  for (const f of read(path.join(root, STORIES_DIR))) {
    const fm = frontmatter(path.join(root, STORIES_DIR, f));
    if (fm.draft === 'true' || !fm.slug) continue;
    const date = fm.updated ?? fm.published;
    if (!date) continue;
    storyDates.push(date);
    map.set(`/${fm.slug}`, iso(date));
  }

  // Newest content on the site. The rolling pages inherit it.
  const newest = [...dailyDates, ...storyDates].sort().pop();
  const fallback = newest ? iso(newest) : new Date().toISOString();

  // Archive index pages: dated by the newest issue they contain.
  for (const d of dailyDates) {
    const [y, m] = d.split('-');
    for (const key of [`/daily/${y}`, `/daily/${y}/${m}`]) {
      if (!map.has(key) || map.get(key) < iso(d)) map.set(key, iso(d));
    }
  }

  return { map, fallback };
}

/**
 * Pages with no content date of their own that still change every morning,
 * because a new issue reflows them.
 */
const ROLLING = (pathname) =>
  pathname === '/' ||
  pathname === '/daily' ||
  pathname === '/known-issue' ||
  pathname.startsWith('/topics/');

/**
 * @astrojs/sitemap `serialize`. Rolling pages inherit the newest-content date.
 * A page with neither — /about — gets no lastmod at all: a wrong date repeated
 * every deploy is how Google learns to ignore the field on a domain.
 */
export function serializeWithLastmod(site) {
  const { map, fallback } = buildLastmodMap();
  const origin = new URL(site).origin;

  return (item) => {
    if (!item.url.startsWith(origin)) return item;
    const pathname = new URL(item.url).pathname.replace(/\/$/, '') || '/';
    const lastmod = map.get(pathname) ?? (ROLLING(pathname) ? fallback : undefined);
    if (lastmod) item.lastmod = lastmod;
    return item;
  };
}
