#!/usr/bin/env node
/**
 * Draws the fallback illustrations used when a story has no generated image
 * (Gemini timeout or outage, a missing file, or the community poll slot,
 * which never gets one). Same flat pop-art look as the Gemini illustrations:
 * solid ground, thick black outlines, pixel checker corners, confetti.
 *
 * One-off: run `node scripts/make-fallbacks.mjs`, then `node scripts/optimize-images.mjs`
 * to make the 320w / 640w / 1024w WebP variants. Output is committed, so the
 * build never depends on this script.
 */
import fs from 'node:fs';
import sharp from 'sharp';

const OUT = 'public/images/fallback';
const K = '#141414', CREAM = '#F7F3EA', YELLOW = '#FFE04D', PINK = '#FF7AB6', PURPLE = '#7C5CFC', ORANGE = '#FF7A45';

function checker(corner, size = 36, n = 7) {
  let out = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const tr = corner === 'tr';
      if (tr ? c < r : c > r) continue;
      const x = tr ? 1024 - n * size + c * size : c * size;
      const y = tr ? r * size : 1024 - n * size + r * size;
      out += `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${(r + c) % 2 ? CREAM : K}"/>`;
    }
  }
  return out;
}

const confetti = `
  <g stroke="${K}" stroke-width="12" stroke-linecap="round" fill="none">
    <path d="M250 150h44M272 128v44"/><path d="M800 720h44M822 698v44"/><path d="M130 610h44M152 588v44"/>
  </g>
  <polygon points="860,190 892,246 828,246" fill="${K}"/>
  <polygon points="170,840 196,884 144,884" fill="${YELLOW}" stroke="${K}" stroke-width="8"/>
  <circle cx="880" cy="440" r="16" fill="${CREAM}" stroke="${K}" stroke-width="8"/>
  <circle cx="110" cy="330" r="14" fill="${YELLOW}" stroke="${K}" stroke-width="8"/>
  <circle cx="640" cy="900" r="14" fill="${K}"/>`;

const G = {
  news: `<rect x="232" y="300" width="560" height="460" fill="${CREAM}"/><rect x="232" y="300" width="560" height="110" fill="${YELLOW}"/>
    <path d="M292 490h440M292 570h440M292 650h260" fill="none"/>`,
  commentary: `<path d="M232 300h560v340H500L360 760V640H232z" fill="${CREAM}"/>
    <g fill="${K}" stroke="none"><circle cx="392" cy="470" r="28"/><circle cx="512" cy="470" r="28"/><circle cx="632" cy="470" r="28"/></g>`,
  tip: `<path d="M512 260a190 190 0 0 1 100 352v88H412v-88A190 190 0 0 1 512 260z" fill="${CREAM}"/>
    <path d="M432 770h160M512 210V150M360 270l-40-40M664 270l40-40M300 410h-60M724 410h60" fill="none"/>`,
  myth: `<circle cx="512" cy="520" r="230" fill="${CREAM}"/><path d="M350 690L674 350" stroke-width="44" fill="none"/>`,
  'community-1': `<path d="M200 300h400v250H330l-90 90v-90H200z" fill="${CREAM}"/>
    <path d="M424 460h400v250H784v90l-90-90H424z" fill="${YELLOW}"/>
    <g fill="${K}" stroke="none"><circle cx="300" cy="425" r="22"/><circle cx="400" cy="425" r="22"/><circle cx="500" cy="425" r="22"/></g>
    <path d="M540 590l60 60 120-130" fill="none" stroke-width="30"/>`,
  'community-2': `<rect x="170" y="400" width="320" height="220" rx="110" fill="${PINK}"/><rect x="534" y="400" width="320" height="220" rx="110" fill="${CREAM}"/>
    <circle cx="290" cy="510" r="34" fill="${K}" stroke="none"/><circle cx="734" cy="510" r="34" fill="${PURPLE}"/>
    <circle cx="512" cy="510" r="70" fill="${K}"/><path d="M490 488l-26 22 26 22M534 488l26 22-26 22" stroke="${CREAM}" stroke-width="12" fill="none"/>`,
  'community-3': `<path d="M170 770h684" fill="none"/>
    <rect x="210" y="570" width="120" height="200" fill="${CREAM}"/><rect x="380" y="430" width="120" height="340" fill="${PINK}"/>
    <rect x="550" y="510" width="120" height="260" fill="${CREAM}"/><rect x="720" y="630" width="120" height="140" fill="${CREAM}"/>
    <circle cx="440" cy="330" r="66" fill="${YELLOW}"/><path d="M410 330l26 26 46-54" fill="none" stroke-width="22"/>`,
  column: `<rect x="272" y="260" width="480" height="530" fill="${CREAM}"/>
    <path d="M332 350h360" stroke-width="40" fill="none"/><path d="M332 450h360M332 520h360M332 590h240" fill="none"/>
    <circle cx="512" cy="250" r="38" fill="${YELLOW}"/>`,
};

const BG = {
  news: PURPLE, commentary: PINK, tip: YELLOW, myth: ORANGE,
  'community-1': PINK, 'community-2': PURPLE, 'community-3': YELLOW, column: PURPLE,
};

fs.mkdirSync(OUT, { recursive: true });
for (const [name, glyph] of Object.entries(G)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <rect width="1024" height="1024" fill="${BG[name]}"/>${checker('tr')}${checker('bl')}${confetti}
    <g stroke="${K}" stroke-width="26" stroke-linejoin="round" stroke-linecap="round">${glyph}</g></svg>`;
  await sharp(Buffer.from(svg)).png().toFile(`${OUT}/${name}.png`);
  console.log('  wrote', `${OUT}/${name}.png`);
}
