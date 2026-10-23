#!/usr/bin/env node
/**
 * One-off importer: builtbyswami src/content/social/*.json
 *   -> longpress  src/content/daily/YYYY-MM-DD.md
 *
 * Usage:  node scripts/import-roundup.mjs <path-to-builtbyswami-repo> [--dry]
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { fitDescription } from '../src/lib/text/description.mjs';

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
// Cards land under public/images/daily/<date>/ - the tree scripts/optimize-images.mjs
// walks, so each one gets 320w and 640w WebP variants and ResponsiveImage can
// pick the right file. public/social/ was outside that tree and served raw PNGs.
const CARDS_OUT = 'public/images/daily';
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

/**
 * Source links for one post, from either shape the generator may emit:
 *   sources: [{ label, url }]  (or bare URL strings)   and/or   source: "url"
 * Only absolute http(s) URLs survive, de-duplicated, capped at 6. Anything else
 * is dropped rather than guessed at: a wrong link is worse than no link.
 */
function normSources(p) {
  const raw = [...(Array.isArray(p.sources) ? p.sources : []), ...(p.source ? [p.source] : [])];
  const seen = new Set();
  const out = [];
  for (const r of raw) {
    const o = typeof r === 'string' ? { url: r } : r || {};
    let u;
    try { u = new URL(String(o.url || '').trim()); } catch { continue; }
    if (!/^https?:$/.test(u.protocol) || seen.has(u.href)) continue;
    seen.add(u.href);
    out.push({ label: o.label ? String(o.label).replace(/\s+/g, ' ').trim().slice(0, 60) : '', url: u.href });
  }
  return out.slice(0, 6);
}

/** Meta description, <=160, cut at a sentence or clause. See src/lib/text/description.mjs. */
function meta(text = '', cap = 160) {
  return fitDescription(text, cap);
}

/** YAML block scalar - safest way to emit prose we do not control. */
function block(key, text, indent) {
  const pad = ' '.repeat(indent);
  const lines = String(text).replace(/\r/g, '').split('\n').map((l) => l.trimEnd());
  return `${pad}${key}: >-\n` + lines.map((l) => `${pad}  ${l}`).join('\n');
}

function quote(s) { return JSON.stringify(String(s)); }

/** 'india' | 'global' | null. Anything else from the generator is dropped, not guessed. */
function normRegion(r) {
  const s = String(r || '').trim().toLowerCase();
  return s === 'india' || s === 'global' ? s : null;
}
const tapStats = new Map();
const regionStats = new Map();

const files = readdirSync(SRC).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

let written = 0, skipped = 0;
const illusStats = new Map();
const sourceStats = new Map();
/** Per-issue count of items carrying a question + answer (AEO/GEO framing). */
const aeoStats = new Map();
const kinds = new Map();
const warnings = [];

/**
 * Art a human added by hand to an already-published brief.
 *
 * These files are generated: every run rewrites all of them from the source
 * JSON. So a diagram someone hand-authored into a brief - the Windows God Mode
 * SVG on 2026-09-12, for instance - is silently deleted by the next sync unless
 * it is read back first. Anything the JSON does not supply a card for keeps
 * whatever the file already had.
 */
function existingArt(date) {
  const art = new Map();
  const file = join(OUT, `${date}.md`);
  if (!existsSync(file)) return art;
  let slot = null;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const isSlot = line.match(/^ {2}- slot: (\d+)\s*$/);
    if (isSlot) { slot = isSlot[1]; continue; }
    const kv = line.match(/^ {4}(image|imageAlt|imageCaption): (.+)$/);
    if (kv && slot) {
      if (!art.has(slot)) art.set(slot, []);
      art.get(slot).push(`    ${kv[1]}: ${kv[2]}`);
    }
  }
  return art;
}

for (const file of files) {
  const d = JSON.parse(readFileSync(join(SRC, file), 'utf8'));
  const date = d.date || file.replace('.json', '');
  const posts = (d.posts || []).slice().sort((a, b) => Number(a.n) - Number(b.n));
  if (!posts.length) { warnings.push(`${date}: no posts, skipped`); skipped++; continue; }

  const keepArt = existingArt(date);

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
    const region = normRegion(p.region);
    if (region) lines.push(`    region: ${region}`);
    lines.push(`    heading: ${quote(heading)}`);
    lines.push(block('body', p.body || heading, 4));
    // Only emit the card if the file is really there. A frontmatter path to a
    // missing image fails the build, and a missing card is normal: the
    // community/poll slot never gets one.
    const slotKey = String(Number(p.n) || i + 1);
    // The generator writes p.image as .../card_N.png -- headline baked in,
    // meant for social. The site already renders the real headline as text,
    // so a second copy inside the picture is redundant there; use ONLY the
    // text-free illustration_N.png that make_card.py writes alongside every
    // card. 21 Sept: this used to fall back to the headline-baked card_N.png
    // whenever illustration generation failed upstream (Gemini timeout/outage,
    // a broken mirror step, etc.) -- and it silently did exactly that for all
    // 5 slots on 2026-09-21, shipping "Bots Are Moving Into WhatsApp"-style
    // baked titles to the homepage and brief. That's a worse failure mode
    // than no image at all, since it violates the one thing this field exists
    // to guarantee (an illustration, never a second copy of the headline).
    // So: illustration or nothing. Never the card. Pure naming convention on
    // this side -- nothing upstream has to know.
    const illusRel = p.image && /\/card_(\d+)\.[^/.]+$/.test(p.image)
      ? p.image.replace(/\/card_(\d+)\.([^/.]+)$/, '/illustration_$1.$2')
      : null;
    const illusExists = illusRel && existsSync(join(resolve(SRC_REPO), 'public', illusRel.replace(/^\//, '')));
    const chosenImage = illusExists ? illusRel : null;
    // Only worth flagging from CARDS_FROM onward -- before that date an image
    // was never expected (see CARDS_FROM above), so warning about a missing
    // illustration on the old cyan-branded archive is just noise.
    // Count generated illustrations per issue for the run summary. The homepage
    // draws a stock fallback for any slot without one (see index.astro), so a
    // Gemini failure never leaves a hole, but it should never go unnoticed either.
    // The community slot never gets an illustration by design, so it is not counted.
    if (date >= CARDS_FROM && kind !== 'community') {
      const s = illusStats.get(date) || { ok: 0, total: 0 };
      s.total++;
      if (illusExists) s.ok++;
      illusStats.set(date, s);
    }
    if (!illusExists && p.image && date >= CARDS_FROM) {
      warnings.push(`${date} slot ${slotKey}: no text-free illustration_${slotKey} -- image omitted, not falling back to the headline-baked card`);
    }
    if (date >= CARDS_FROM && chosenImage
        && existsSync(join(resolve(SRC_REPO), 'public', chosenImage.replace(/^\//, '')))) {
      lines.push(`    image: ${quote(`/images/daily/${date}/${basename(chosenImage)}`)}`);
      const alt = keepArt.get(slotKey)?.filter((l) => !l.startsWith('    image:'));
      if (alt?.length) lines.push(...alt);
    } else if (keepArt.has(slotKey)) {
      lines.push(...keepArt.get(slotKey));
    }
    for (const [src, dest] of [['problem','problem'],['breakthrough','breakthrough'],['catch','catch'],['forYou','forYou']]) {
      if (p[src]) lines.push(block(dest, p[src], 4));
    }
    // Answer-first framing (AEO/GEO audit, 12 Oct). Question and answer travel
    // together: a question with no answer is dropped rather than shipped bare,
    // and markdown links are stripped because these are quoted standalone.
    const plain = (s) => String(s || '').replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '$1').replace(/\s+/g, ' ').trim();
    const q = plain(p.question), a = plain(p.answer);
    if (q.length >= 8 && a) {
      lines.push(`    question: ${quote(q)}`);
      lines.push(block('answer', a, 4));
    } else if (q || a) {
      warnings.push(`${date} slot ${slotKey}: question/answer incomplete -- both dropped`);
    }
    const qa = (Array.isArray(p.qa) ? p.qa : [])
      .map((x) => ({ q: plain(x && x.q), a: plain(x && x.a) }))
      .filter((x) => x.q.length >= 8 && x.a.length >= 20)
      .slice(0, 4);
    if (qa.length) {
      lines.push('    qa:');
      for (const x of qa) {
        lines.push(`      - q: ${quote(x.q)}`);
        lines.push(`        a: ${quote(x.a)}`);
      }
    }
    if (kind !== 'community') {
      const as = aeoStats.get(date) || { ok: 0, total: 0 };
      as.total++;
      if (q.length >= 8 && a) as.ok++;
      aeoStats.set(date, as);
    }
    const sources = normSources(p);
    if (sources.length) {
      lines.push('    sources:');
      for (const s of sources) {
        lines.push(s.label ? `      - label: ${quote(s.label)}` : `      - url: ${quote(s.url)}`);
        if (s.label) lines.push(`        url: ${quote(s.url)}`);
      }
    }
    // Same bookkeeping as illustrations: the run summary says how many items
    // carried a source, so a generator that stops emitting them is noticed.
    // The community/poll slot is never expected to cite anything.
    if (kind !== 'community') {
      const st = sourceStats.get(date) || { ok: 0, total: 0 };
      st.total++;
      if (sources.length) st.ok++;
      sourceStats.set(date, st);
    }
  });

  // Taps: the quick hits under the five. Each needs a headline; a source is
  // kept only if it is an absolute http(s) URL, same rule as item sources.
  const taps = (Array.isArray(d.taps) ? d.taps : [])
    .filter((t) => t && typeof t.headline === 'string' && t.headline.trim().length >= 3)
    .slice(0, 8);
  if (taps.length) {
    lines.push('taps:');
    for (const t of taps) {
      lines.push(`  - headline: ${quote(t.headline.trim())}`);
      const r = normRegion(t.region);
      if (r) lines.push(`    region: ${r}`);
      if (t.line) lines.push(`    line: ${quote(String(t.line).trim())}`);
      const src = t.source && typeof t.source === 'object' ? t.source : (typeof t.source === 'string' ? { url: t.source } : null);
      if (src && /^https?:\/\/\S+$/.test(String(src.url || ''))) {
        lines.push('    source:');
        if (src.label) lines.push(`      label: ${quote(src.label)}`);
        lines.push(`      url: ${quote(src.url)}`);
      } else {
        warnings.push(`${date} tap "${t.headline.slice(0, 40)}": no valid source`);
      }
    }
  }
  tapStats.set(date, taps.length);
  regionStats.set(date, posts.filter((p) => normRegion(p.region) === 'india').length);

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
const latestIllus = [...illusStats.keys()].sort().pop();
if (latestIllus) {
  const { ok, total } = illusStats.get(latestIllus);
  console.log(`  illustrations ${latestIllus}: ${ok}/${total} generated, ${total - ok} fallback${total - ok ? '  <-- Gemini fell short, check the run' : ''}`);
}
const latestSrc = [...sourceStats.keys()].sort().pop();
if (latestSrc) {
  const { ok, total } = sourceStats.get(latestSrc);
  console.log(`  sources ${latestSrc}: ${ok}/${total} items cited${ok === 0 ? '  <-- the generator is not emitting sources (see claude/longpress-source-links.md)' : ok < total ? '  <-- some items have no source' : ''}`);
}
const latestDate = [...tapStats.keys()].sort().pop();
if (latestDate) {
  const indiaN = regionStats.get(latestDate) || 0;
  console.log(`  india-led ${latestDate}: ${indiaN}/5 items${indiaN < 2 ? '  <-- below the India quota of 2' : ''}`);
  console.log(`  taps ${latestDate}: ${tapStats.get(latestDate)}`);
}
const latestAeo = [...aeoStats.keys()].sort().pop();
if (latestAeo) {
  const { ok, total } = aeoStats.get(latestAeo);
  console.log(`  answer-first ${latestAeo}: ${ok}/${total} items with question + answer${ok < total ? '  <-- some items have no question/answer' : ''}`);
}
if (warnings.length) { console.log(`\n  warnings (${warnings.length}):`); warnings.forEach((w) => console.log(`     ! ${w}`)); }
