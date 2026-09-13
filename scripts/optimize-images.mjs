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
    if (file.includes('-480w.') || file.includes('-800w.') || file.includes('-1200w.') || file.includes('-320w.') || file.includes('-640w.')) {
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

async function main() {
  console.log('Optimizing responsive images...');
  await processDir('public/images/stories', STORY_SIZES);
  await processDir('public/images/daily', DAILY_SIZES);
  // Known Issue illustrations are square, same as Daily Five card art.
  await processDir('public/images/known-issue', DAILY_SIZES);
  console.log('Responsive image optimization complete.');
}

main().catch((err) => {
  console.error('Image optimization failed:', err);
  // Don't fail the build if image optimization encounters an issue
  process.exit(0);
});
