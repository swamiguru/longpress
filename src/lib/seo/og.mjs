// Share / Discover image rules. Dependency-free ESM, shared by the build-time
// generator (scripts/make-og-images.mjs) and the layout, so both always agree
// on which file is "the image" for a page and where its 1200x630 version lives.
import fs from 'node:fs';
import path from 'node:path';

export const OG_W = 1200;
export const OG_H = 630;

/** Absolute path of a site-relative file under public/. */
export function publicFile(p) {
  return path.join(process.cwd(), 'public', String(p).replace(/^\/+/, ''));
}

/**
 * Where the generated 1200x630 version of a source image lives.
 * /images/known-issue/foo.png  ->  /og/images-known-issue-foo.jpg
 */
export function ogNameFor(src) {
  const slug = String(src)
    .replace(/^\/+/, '')
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return `/og/${slug}.jpg`;
}

const nth = (re) => (a, b) => Number(a.match(re)[1]) - Number(b.match(re)[1]);

/**
 * The one image that stands for a whole brief: the lead illustration, which is
 * text-free, else the lead card. Returns a site-relative path or null.
 * Briefs before the cards existed have no folder, so they get null and fall
 * back to the site default.
 */
export function pickBriefLead(date) {
  const dir = publicFile(`images/daily/${date}`);
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter((f) => !/-\d+w\./.test(f));
  const pick = (re) => files.filter((f) => re.test(f)).sort(nth(re))[0];
  const hit = pick(/^illustration_(\d+)\.(?:png|jpe?g|webp)$/i) ?? pick(/^card_(\d+)\.(?:png|jpe?g|webp)$/i);
  return hit ? `/images/daily/${date}/${hit}` : null;
}
