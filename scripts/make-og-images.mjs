#!/usr/bin/env node
/**
 * Builds a 1200x630 share / Discover image for every page image that is not
 * already that size, into public/og/ (gitignored, regenerated on every build).
 *
 * Why: the square illustrations (1024x1024) and 16:9 hero images were being
 * declared as 1200x630 in og:image. A wrong width/height is worse than none,
 * and Discover wants large images. This makes the declaration true.
 *
 *   - 16:9-ish source  -> cover-cropped to 1200x630
 *   - square/portrait  -> the picture at full height over a darkened, blurred
 *                         copy of itself (text-free, nothing cropped out)
 *   - already 1200x630 -> skipped; the layout uses the original
 *
 * Which file stands for which page lives in src/lib/seo/og.mjs so the layout
 * and this script cannot disagree. Runs as part of `prebuild`.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { OG_W, OG_H, OG_VARIANTS, ogNameFor, ogVariantName, pickBriefLead, publicFile } from '../src/lib/seo/og.mjs';

const GROUND = '#17182E'; // midnight, the same ground as the share card
const VARIANT = /-\d+w\./;
const IMG = /\.(png|jpe?g|webp)$/i;

function listImages(dir) {
  const abs = publicFile(dir);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter((f) => IMG.test(f) && !VARIANT.test(f))
    .map((f) => `/${dir}/${f}`);
}

function sources() {
  const out = [
    ...listImages('images/known-issue'),
    ...listImages('images/stories'),
    ...listImages('images/fine-print'),
  ];
  const daily = publicFile('images/daily');
  if (fs.existsSync(daily)) {
    for (const d of fs.readdirSync(daily)) {
      const lead = /^\d{4}-\d{2}-\d{2}$/.test(d) ? pickBriefLead(d) : null;
      if (lead) out.push(lead);
    }
  }
  return out;
}

// Cover-crop when the source is close to the target shape, else the full picture
// over a darkened, blurred copy of itself (nothing cropped out, no stretching).
async function render(inFile, outFile, W, H, meta) {
  const aspect = meta.width / meta.height;
  const target = W / H;
  let pipeline;
  if (Math.abs(Math.log(aspect / target)) < 0.45) {
    pipeline = sharp(inFile).flatten({ background: GROUND }).resize(W, H, { fit: 'cover' });
  } else {
    const bg = await sharp(inFile)
      .flatten({ background: GROUND })
      .resize(W, H, { fit: 'cover' })
      .blur(30)
      .modulate({ brightness: 0.55, saturation: 0.9 })
      .toBuffer();
    const fg = await sharp(inFile)
      .flatten({ background: GROUND })
      .resize({ width: W, height: H, fit: 'inside' })
      .toBuffer();
    pipeline = sharp(bg).composite([{ input: fg, gravity: 'centre' }]);
  }
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  await pipeline.jpeg({ quality: 84, mozjpeg: true }).toFile(outFile);
}

const fresh = (outFile, inFile) => fs.existsSync(outFile) && fs.statSync(outFile).mtimeMs >= fs.statSync(inFile).mtimeMs;

async function make(src) {
  const inFile = publicFile(src);
  const meta = await sharp(inFile).metadata();
  if (!meta.width || !meta.height) return 'skipped';

  // Structured-data variants: Google asks for 16x9, 4x3 and 1x1 versions of an article's image.
  let madeVariant = false;
  for (const v of OG_VARIANTS) {
    const out = publicFile(ogVariantName(src, v.key));
    if (fresh(out, inFile)) continue;
    await render(inFile, out, v.w, v.h, meta);
    madeVariant = true;
  }

  const outFile = publicFile(ogNameFor(src));
  if (fresh(outFile, inFile)) return madeVariant ? 'made' : 'kept';
  if (meta.width === OG_W && meta.height === OG_H) return madeVariant ? 'made' : 'already-sized';
  await render(inFile, outFile, OG_W, OG_H, meta);
  return 'made';
}

async function main() {
  const counts = { made: 0, kept: 0, 'already-sized': 0, skipped: 0, failed: 0 };
  for (const src of sources()) {
    try {
      counts[await make(src)]++;
    } catch (err) {
      counts.failed++;
      console.warn(`  ! og image failed for ${src}: ${err.message}`);
    }
  }
  console.log(
    `og images: ${counts.made} made, ${counts.kept} up to date, ${counts['already-sized']} already 1200x630` +
      (counts.failed ? `, ${counts.failed} FAILED (those pages fall back to the original or the default)` : ''),
  );
}

// Never block a publish: a missing share image is a worse-looking card, not a broken site.
main().catch((err) => {
  console.warn(`og images: skipped (${err.message})`);
});
