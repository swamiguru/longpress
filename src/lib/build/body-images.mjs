/**
 * Astro integration: sizes the pictures inside markdown bodies after the build.
 *
 * Known Issue columns put pictures in their markdown as ![alt](/images/...).
 * Those render as bare <img> with no width or height, so the page jumps when
 * they load, and some are full-size PNGs (icloud-5gb-free-tier-full.png is
 * 1.7 MB). Astro 7's default markdown processor (Satteri) does not run rehype
 * plugins, so this works on the built HTML instead. For every local
 * <img src="/images/..."> without a width it adds:
 *   - width and height read from the file
 *   - srcset and sizes from the width-only variants scripts/optimize-images.mjs
 *     makes (<name>-fit-<w>w.webp), with the 800w variant as the src
 *   - loading="lazy" and decoding="async" where missing
 * Anything it cannot measure is left as it was.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const SIZES = '(max-width: 760px) 100vw, 720px';
const PUBLIC = path.join(process.cwd(), 'public');

function htmlFiles(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) htmlFiles(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const metaCache = new Map();
function meta(src) {
  if (!metaCache.has(src)) {
    const file = path.join(PUBLIC, src);
    metaCache.set(src, fs.existsSync(file) ? sharp(file).metadata().catch(() => null) : Promise.resolve(null));
  }
  return metaCache.get(src);
}

function variantsOf(src) {
  const dir = path.join(PUBLIC, path.dirname(src));
  const base = path.basename(src).replace(/\.[a-z0-9]+$/i, '');
  const pre = `${base}-fit-`;
  return fs.readdirSync(dir)
    .filter((f) => f.startsWith(pre) && /^\d+w\.webp$/.test(f.slice(pre.length)))
    .map((f) => ({ url: `${path.posix.dirname(src)}/${f}`, w: Number(f.slice(pre.length).replace('w.webp', '')) }))
    .sort((a, b) => a.w - b.w);
}

async function fixTag(tag) {
  if (/\swidth=/.test(tag) || /\ssrcset=/i.test(tag)) return tag;
  const src = tag.match(/\ssrc="(\/images\/[^"]+)"/)?.[1];
  if (!src || /\.svg$/i.test(src)) return tag;
  const path0 = decodeURI(src);
  const m = await meta(path0);
  if (!m?.width || !m?.height) return tag;
  let attrs = ` width="${m.width}" height="${m.height}"`;
  if (!/\sloading=/.test(tag)) attrs += ' loading="lazy"';
  if (!/\sdecoding=/.test(tag)) attrs += ' decoding="async"';
  let out = tag;
  const v = variantsOf(path0);
  if (v.length) {
    const fallback = (v.find((x) => x.w >= 800) ?? v[v.length - 1]).url;
    attrs += ` srcset="${v.map((x) => `${x.url} ${x.w}w`).join(', ')}" sizes="${SIZES}"`;
    out = out.replace(`src="${src}"`, `src="${fallback}"`);
  }
  return out.replace(/^<img/, `<img${attrs}`);
}

export default function bodyImages() {
  return {
    name: 'longpress:body-images',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        let pages = 0, imgs = 0;
        for (const file of htmlFiles(root)) {
          const html = fs.readFileSync(file, 'utf8');
          const tags = html.match(/<img\b[^>]*>/g);
          if (!tags) continue;
          let next = html, changed = 0;
          for (const tag of new Set(tags)) {
            const fixed = await fixTag(tag);
            if (fixed !== tag) { next = next.split(tag).join(fixed); changed++; }
          }
          if (changed) { fs.writeFileSync(file, next); pages++; imgs += changed; }
        }
        logger.info(`body images: sized ${imgs} picture(s) on ${pages} page(s)`);
      },
    },
  };
}
