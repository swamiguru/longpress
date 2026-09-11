// Route segments the site owns. A story slug may never equal one of these.
export const RESERVED_ROOT = new Set([
  'daily', 'archive', 'known-issue', 'topics', 'tags', 'about',
  'search', 'feed', 'api', 'assets', 'static', 'admin', 'preview',
  'rss.xml', 'sitemap.xml', 'sitemap-index.xml', 'robots.txt',
  'ads.txt', 'favicon.ico', 'manifest.webmanifest', '404', '500',
]);

// Nothing may START with these.
export const RESERVED_PREFIXES = ['daily/', 'topics/', 'api/', '_', '.'];

const SHAPE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_LIKE = /^\d{4}-\d{2}(-\d{2})?$/;
const NUMERIC = /^\d+$/;

export function validateSlug(slug) {
  const bad = (reason) => ({ ok: false, reason });
  if (typeof slug !== 'string' || !slug) return bad('missing slug');
  if (slug.length < 3) return bad('too short (min 3)');
  if (slug.length > 80) return bad('too long (max 80)');
  if (!SHAPE.test(slug)) return bad('must be lowercase a-z, 0-9, single hyphens');
  if (NUMERIC.test(slug)) return bad('purely numeric slugs are reserved');
  if (DATE_LIKE.test(slug)) return bad('date-shaped - that namespace is /daily');
  if (RESERVED_ROOT.has(slug)) return bad(`"${slug}" is a reserved route`);
  for (const p of RESERVED_PREFIXES) {
    if (slug.startsWith(p)) return bad(`reserved prefix "${p}"`);
  }
  return { ok: true };
}

// Suggestion for the editor only. Never the stored value:
// this strips non-Latin, so a Devanagari headline collapses to hyphens.
export function slugify(title) {
  return title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’‘"“”]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '');
}
