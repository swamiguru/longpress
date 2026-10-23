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
 * Briefs before the cards existed (before 13 Sept 2026) have no folder, so they
 * get their headline card from scripts/og/brief-cards.py; null only if that is
 * missing too, which falls back to the site default.
 */
export function pickBriefLead(date) {
  const dir = publicFile(`images/daily/${date}`);
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter((f) => !/-\d+w\./.test(f));
    const pick = (re) => files.filter((f) => re.test(f)).sort(nth(re))[0];
    const hit = pick(/^illustration_(\d+)\.(?:png|jpe?g|webp)$/i) ?? pick(/^card_(\d+)\.(?:png|jpe?g|webp)$/i);
    if (hit) return `/images/daily/${date}/${hit}`;
  }
  const card = `/images/daily-cards/${date}.png`;
  return fs.existsSync(publicFile(card)) ? card : null;
}

/**
 * The share image for one Daily Five story (/daily/<date>/<slot>): the item's
 * own illustration, else its headline card from scripts/og/brief-cards.py,
 * else the brief's lead. Returns a site-relative path or null.
 */
export function pickItemImage(date, slot, itemImage) {
  // SVG is not a share image anywhere (WhatsApp, X, LinkedIn, Facebook), so an SVG item uses its card.
  if (itemImage && !/\.svg$/i.test(itemImage) && fs.existsSync(publicFile(itemImage))) return itemImage;
  const card = `/images/daily-cards/${date}-${slot}.png`;
  if (fs.existsSync(publicFile(card))) return card;
  return pickBriefLead(date);
}

/** Aspect-ratio variants Google asks for in Article structured data (16x9, 4x3, 1x1). */
export const OG_VARIANTS = [
  { key: '16x9', w: 1200, h: 675 },
  { key: '4x3', w: 1200, h: 900 },
  { key: '1x1', w: 1200, h: 1200 },
];

/** /og/foo.jpg -> /og/foo-16x9.jpg */
export function ogVariantName(src, key) {
  return ogNameFor(src).replace(/\.jpg$/, `-${key}.jpg`);
}
