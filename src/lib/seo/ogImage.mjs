// Resolves the image a page declares for sharing and Discover, plus its REAL
// dimensions. The layout used to hardcode 1200x630 for every image, which was
// simply wrong for the square illustrations and 16:9 hero images.
//
// Order: the generated 1200x630 version (public/og/, built by
// scripts/make-og-images.mjs) -> the original file, measured -> the site default.
import fs from 'node:fs';
import sharp from 'sharp';
import { OG_W, OG_H, ogNameFor, publicFile } from './og.mjs';

const DEFAULT_PATH = '/og-default.png';
const cache = new Map();

async function sizeOf(p) {
  if (cache.has(p)) return cache.get(p);
  let out = null;
  try {
    const m = await sharp(publicFile(p)).metadata();
    if (m.width && m.height) out = { width: m.width, height: m.height };
  } catch {
    out = null;
  }
  cache.set(p, out);
  return out;
}

/** @returns {Promise<{url: string, width?: number, height?: number}>} */
export async function resolveOgImage(image, site) {
  const abs = (p) => new URL(p, site).href;
  // Remote image: its size is unknown, so declare none rather than a wrong one.
  if (image && /^https?:\/\//i.test(image)) return { url: image };

  if (image) {
    const gen = ogNameFor(image);
    if (fs.existsSync(publicFile(gen))) return { url: abs(gen), width: OG_W, height: OG_H };
    if (fs.existsSync(publicFile(image))) {
      const s = await sizeOf(image);
      if (s) return { url: abs(image), ...s };
    }
  }
  return { url: abs(DEFAULT_PATH), width: OG_W, height: OG_H };
}
