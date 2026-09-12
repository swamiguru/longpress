#!/usr/bin/env node
/**
 * One-off importer: builtbyswami src/content/social/*.json
 *   -> longpress  src/content/daily/YYYY-MM-DD.md
 *
 * Usage:  node scripts/import-roundup.mjs <path-to-builtbyswami-repo> [--dry]
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const SRC_REPO = process.argv[2];
const DRY = process.argv.includes('--dry');
if (!SRC_REPO) { console.error('usage: node scripts/import-roundup.mjs <builtbyswami-repo> [--dry]'); process.exit(1); }

const SRC = join(resolve(SRC_REPO), 'src/content/social');
const OUT = 'src/content/daily';
// The roundup writes its cards to <repo>/public/social/<date>/card_N.png and
// puts that same path in each post's `image`. Copy them across so the path
// resolves on this domain instead of pointing at a site that no longer serves
// them.
const CARDS_SRC = join(resolve(SRC_REPO), 'public/social');
const CARDS_OUT = 'public/social';
// Every card made before this date carries the old @builtbyswami wordmark and
// the cyan palette. Pulling those in would put the wrong brand on all 61
// archived briefs, so the archive stays text-only and cards start from the
// first day the generator produces Long Press artwork. Move this date if the
// cutover slips; drop it entirely once nothing old is left to worry about.
const CARDS_FROM = '2026-09-13';

/**
 * 46 distinct pillar strings collapse to 10 kinds.
 * ORDER MATTERS: opinion is tested before news, because "News / Hot Take"
 * contains both words. Matching "news" first is exactly the bug the site
 * audit found in normalizeCategory - it is why Hot Take read 6 and News
 * read 58 when slot 1 had carried a point of view every single day.
 */
function toKind(pillar = '') {
  const s = pillar.toLowerCase();
  if (s.includes('myth')) return 'myth-buster';
  if (s.includes('hot take')) return 'hot-take';
  if (s.includes('commentary')) return 'commentary';
  if (s.includes('tip') || s.includes('quick-win')) return 'tip';
  if (s.includes('comparison')) return 'comparison';
  if (s.includes('community') || s.includes('poll')) return 'community';
  if (s.includes('security') || s.includes('privacy')) return 'security';
  if (s.startsWith('ai ') || s.includes('ai tool') || s.includes('ai update') ||
      s.includes('ai workflow') || s.includes('ai spotlight')) return 'ai';
  return 'news';
}

/** Trim to <=160 at a word boundary, for the meta description. */
function meta(text = '', cap = 160) {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= cap) return t;
  const cut = t.slice(0, cap - 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.\-—]+$/, '') + '…';
}

/** YAML block scalar - safest way to emit prose we do not control. */
function block(key, text, indent) {
  const pad = ' '.repeat(indent);
  const lines = String(text).replace(/\r/g, '').split('\n').map((l) => l.trimEnd());
  return `${pad}${key}: >-\n` + lines.map((l) => `${pad}  ${l}`).join('\n');
}

function quote(s) { return JSON.stringify(String(s)); }

const files = readdirSync(SRC).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

let written = 0, skipped = 0;
const kinds = new Map();
const warnings = [];

for (const file of files) {
  const d = JSON.parse(readFileSync(join(SRC, file), 'utf8'));
  const date = d.date || file.replace('.json', '');
  const posts = (d.posts || []).slice().sort((a, b) => Number(a.n) - Number(b.n));
  if (!posts.length) { warnings.push(`${date}: no posts, skipped`); skipped++; continue; }

  const lines = ['---'];
  lines.push(`date: ${date}`);
  lines.push(`title: ${quote(d.title || `The Daily Five - ${date}`)}`);
  lines.push(`description: ${quote(meta(d.intro || d.title || ''))}`);
  if (d.intro) lines.push(block('intro', d.intro, 0));
  lines.push('items:');

  posts.forEach((p, i) => {
    const kind = toKind(p.pillar);
    kinds.set(kind, (kinds.get(kind) || 0) + 1);
    const heading = p.hook || p.pillar || `Item ${i + 1}`;
    if (!p.hook) warnings.push(`${date} slot ${p.n}: no hook, fell back to pillar`);

    lines.push(`  - slot: ${Number(p.n) || i + 1}`);
    lines.push(`    kind: ${kind}`);
    lines.push(`    heading: ${quote(heading)}`);
    lines.push(block('body', p.body || heading, 4));
    // Only emit the card if the file is really there. A frontmatter path to a
    // missing image fails the build, and a missing card is normal: the
    // community/poll slot never gets one.
    if (date >= CARDS_FROM && p.image
        && existsSync(join(resolve(SRC_REPO), 'public', p.image.replace(/^\//, '')))) {
      lines.push(`    image: ${quote(p.image)}`);
    }
    for (const [src, dest] of [['problem','problem'],['breakthrough','breakthrough'],['catch','catch'],['forYou','forYou']]) {
      if (p[src]) lines.push(block(dest, p[src], 4));
    }
  });

  lines.push('draft: false');
  lines.push('---');
  lines.push('');

  const out = join(OUT, `${date}.md`);
  if (!DRY) {
    writeFileSync(out, lines.join('\n'));
    // File by file rather than cpSync: cpSync copies mode and timestamps too,
    // and the mounted filesystem this runs on from the Mac rejects that with
    // EACCES. A plain read-then-write is portable and all we need.
    const cards = join(CARDS_SRC, date);
    if (date >= CARDS_FROM && existsSync(cards)) {
      const dest = join(CARDS_OUT, date);
      mkdirSync(dest, { recursive: true });
      for (const card of readdirSync(cards)) {
        const from = join(cards, card);
        if (statSync(from).isFile()) writeFileSync(join(dest, card), readFileSync(from));
      }
    }
  }
  written++;
}

console.log(`\n  ${DRY ? '[dry run] would write' : 'wrote'} ${written} briefs to ${OUT}  (skipped ${skipped})`);
console.log(`  kind distribution:`);
for (const [k, v] of [...kinds].sort((a, b) => b[1] - a[1])) console.log(`     ${String(v).padStart(4)}  ${k}`);
const opinion = (kinds.get('hot-take') || 0) + (kinds.get('myth-buster') || 0) + (kinds.get('known-issue') || 0);
console.log(`  opinion items: ${opinion} across ${written} issues`);
if (warnings.length) { console.log(`\n  warnings (${warnings.length}):`); warnings.forEach((w) => console.log(`     ! ${w}`)); }
