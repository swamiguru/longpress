#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const STORY_SIZES = [
  { suffix: '480w', width: 480, height: 270 },
  { suffix: '800w', width: 800, height: 450 },
  { suffix: '1200w', width: 1200, height: 675 },
];

const DAILY_SIZES = [
  { suffix: '320w', width: 320, height: 320 },
  { suffix: '640w', width: 640, height: 640 },
  // 1024w matches the Gemini illustrations' native output size (see
  // make_card.py) -- the brief's full-width square treatment (added
  // Sept 2026) needs a variant past 640w or it upscales on desktop.
  { suffix: '1024w', width: 1024, height: 1024 },
];

async function processDir(dir, sizeConfigs) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    // Recurse: the daily importer files cards under public/images/daily/<date>/
    // so one folder does not end up holding thousands of loose files.
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      await processDir(path.join(dir, file), sizeConfigs);
      continue;
    }
    // Skip generated variants
    // Any -<n>w. file is a generated variant (incl. the -fit-<n>w body variants).
    if (/-\d+w\./.test(file)) {
      continue;
    }

    const ext = path.extname(file).toLowerCase();
    if (!['.svg', '.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
      continue;
    }

    const baseName = path.basename(file, ext);
    const inputPath = path.join(dir, file);

    for (const config of sizeConfigs) {
      const outputPath = path.join(dir, `${baseName}-${config.suffix}.webp`);
      // Only generate if not already generated or source is newer
      let shouldGenerate = false;
      if (!fs.existsSync(outputPath)) {
        shouldGenerate = true;
      } else {
        const inMtime = fs.statSync(inputPath).mtimeMs;
        const outMtime = fs.statSync(outputPath).mtimeMs;
        if (inMtime > outMtime) shouldGenerate = true;
      }

      if (shouldGenerate) {
        try {
          const pipeline = ext === '.svg'
            ? sharp(fs.readFileSync(inputPath))
            : sharp(inputPath);

          await pipeline
            .resize(config.width, config.height, { fit: 'cover' })
            .webp({ quality: 85, effort: 4 })
            .toFile(outputPath);

          console.log(`  ✓ Generated ${path.relative(process.cwd(), outputPath)} (${config.width}x${config.height})`);
        } catch (err) {
          console.warn(`  ! Failed to optimize ${file} for ${config.suffix}:`, err.message);
        }
      }
    }
  }
}

/**
 * Width-only variants for pictures used inside an article body (markdown
 * images). The 16:9 variants above are cover-cropped for cards, which would cut
 * a portrait screenshot in half, so body images get their own: same aspect
 * ratio, 800 wide and up to 1600 wide, never enlarged. src/lib/markdown/rehype-images.mjs
 * picks them up and adds srcset, width and height.
 */
const FIT_WIDTHS = [800, 1600];
/** Every local picture a markdown body uses: ![alt](/images/...). */
function bodyImageRefs() {
  const refs = new Set();
  for (const dir of ['src/content/stories']) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.md'))) {
      const md = fs.readFileSync(path.join(dir, f), 'utf8');
      for (const m of md.matchAll(/!\[[^\]]*\]\((\/images\/[^)\s]+\.(?:png|jpe?g|webp))\)/gi)) refs.add(m[1]);
    }
  }
  return [...refs];
}

async function processFit() {
  for (const ref of bodyImageRefs()) {
    const input = path.join('public', ref);
    if (!fs.existsSync(input) || /-\d+w\.webp$/.test(ref)) continue;
    const dir = path.dirname(input);
    const file = path.basename(input);
    const base = path.basename(file, path.extname(file));
    let meta;
    try { meta = await sharp(input).metadata(); } catch { continue; }
    // 800 wide, plus the largest of (native width, 1600) above that.
    const widths = meta.width ? [...new Set(FIT_WIDTHS.map((w) => Math.min(w, meta.width)))].filter((w) => w >= 400) : [];
    for (const w of widths) {
      const out = path.join(dir, `${base}-fit-${w}w.webp`);
      if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(input).mtimeMs) continue;
      try {
        await sharp(input).resize({ width: w, withoutEnlargement: true }).webp({ quality: 82, effort: 4 }).toFile(out);
        console.log(`  ✓ Generated ${path.relative(process.cwd(), out)} (${w}w)`);
      } catch (err) {
        console.warn(`  ! Failed body variant for ${file}:`, err.message);
      }
    }
  }
}

async function main() {
  console.log('Optimizing responsive images...');
  await processDir('public/images/stories', STORY_SIZES);
  await processDir('public/images/daily', DAILY_SIZES);
  // Known Issue illustrations are square, same as Daily Five card art.
  await processDir('public/images/known-issue', DAILY_SIZES);
  // Fallback illustrations (scripts/make-fallbacks.mjs) are square too.
  await processDir('public/images/fallback', DAILY_SIZES);
  // Article-body pictures in Known Issue columns keep their own shape.
  await processFit();
  console.log('Responsive image optimization complete.');
}

main().catch((err) => {
  console.error('Image optimization failed:', err);
  // Don't fail the build if image optimization encounters an issue
  process.exit(0);
});
