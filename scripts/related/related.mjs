#!/usr/bin/env node
/**
 * Previously on Long Press: build-time related coverage.
 *
 * Embeds every brief item and every standalone story with a small open-source
 * model running on this machine, then writes src/data/related.json: for each
 * item, up to three earlier items or stories it resembles. Ids and scores only.
 * Titles are looked up by the site at build time, so a rewritten headline never
 * leaves a stale link.
 *
 *   node scripts/related/related.mjs            write src/data/related.json
 *   node scripts/related/related.mjs --report   print a calibration sample, write nothing
 *   node scripts/related/related.mjs --strict   exit non-zero on failure
 *
 * Runs on the Mac, not on Vercel. Its dependencies live in scripts/related/
 * and are never installed by the site build. Failure is not fatal: the
 * script warns, leaves the existing file alone and exits 0, so the brief
 * still publishes without links.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import YAML from 'yaml';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const OUT = join(ROOT, 'src', 'data', 'related.json');
const CACHE_DIR = join(HERE, '.cache');
const CACHE = join(CACHE_DIR, 'vectors.json');

const MODEL = 'Xenova/all-MiniLM-L6-v2';
// Calibrated 8 Oct 2026 against the 400-item archive by hand-reading pairs from every
// score band (node scripts/related/related.mjs --bands). Below 0.60 the matches were mostly
// shared format ("the AI prompt that...") or generic topic. 0.65-0.70 was clean. Column pages
// embed far more text than a brief item, so their genuine matches score a little lower.
// Re-run --bands and re-read before moving either number. A different model needs new numbers.
const THRESHOLD = { daily: 0.65, story: 0.60 };
const CAP = 3;
const SAME_STORY = 0.85; // two candidates this similar to each other count as one story
const SKIP_KINDS = new Set(['community']);
const args = new Set(process.argv.slice(2));
const strict = args.has('--strict');
const report = args.has('--report');
const thArg = process.argv.find((a) => a.startsWith('--threshold='));
const thOverride = thArg ? parseFloat(thArg.split('=')[1]) : null;
const thresholdFor = (type) => (thOverride ?? THRESHOLD[type]);
const threshold = thresholdFor('daily'); // used by the report's +/- marks

const iso = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10));
const plain = (s) =>
  String(s || '')
    .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '$1')
    .replace(/[*_`>#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

function parseMd(path) {
  const text = readFileSync(path, 'utf8');
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return null;
  return { data: YAML.parse(m[1]) || {}, body: m[2] || '' };
}

function mdFiles(dir) {
  const abs = join(ROOT, dir);
  if (!existsSync(abs)) return [];
  return readdirSync(abs).filter((f) => f.endsWith('.md')).map((f) => join(abs, f)).sort();
}

/** Every thing that can be linked to or from, oldest first. */
function loadDocs() {
  const docs = [];
  for (const path of mdFiles('src/content/daily')) {
    const p = parseMd(path);
    if (!p || p.data.draft) continue;
    const date = iso(p.data.date);
    for (const it of p.data.items || []) {
      if (SKIP_KINDS.has(it.kind)) continue;
      const text = plain(
        [it.heading, it.problem, it.breakthrough, it.catch, it.forYou, it.body, it.teaser].filter(Boolean).join('. ')
      );
      docs.push({ id: `daily:${date}#${it.slot}`, type: 'daily', date, n: it.slot, heading: it.heading, text });
    }
  }
  for (const path of mdFiles('src/content/stories')) {
    const p = parseMd(path);
    if (!p || p.data.draft || !p.data.slug) continue;
    const text = plain(
      [p.data.title, p.data.description, (p.data.topics || []).join(' '), p.data.trigger, p.body.slice(0, 1800)]
        .filter(Boolean)
        .join('. ')
    );
    docs.push({ id: `story:${p.data.slug}`, type: 'story', slug: p.data.slug, date: iso(p.data.published), heading: p.data.title, text });
  }
  return docs.sort((a, b) => (a.date === b.date ? (a.id < b.id ? -1 : 1) : a.date < b.date ? -1 : 1));
}

const sha = (s) => createHash('sha1').update(MODEL + '\n' + s).digest('hex').slice(0, 16);

function readCache() {
  try { return JSON.parse(readFileSync(CACHE, 'utf8')); } catch { return {}; }
}
function toVec(b64) {
  const buf = Buffer.from(b64, 'base64');
  return new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);
}

/** Vectors for every doc. Only text the cache has not seen is embedded. */
async function embedAll(docs) {
  const cache = readCache();
  const todo = docs.filter((d) => !cache[d.id] || cache[d.id].h !== sha(d.text));
  if (todo.length) {
    const { pipeline } = await import('@huggingface/transformers');
    const extract = await pipeline('feature-extraction', MODEL, { dtype: 'fp32' });
    for (let i = 0; i < todo.length; i += 16) {
      const batch = todo.slice(i, i + 16);
      const out = await extract(batch.map((d) => d.text), { pooling: 'mean', normalize: true });
      const dim = out.dims[1];
      batch.forEach((d, j) => {
        const v = Float32Array.from(out.data.slice(j * dim, (j + 1) * dim));
        cache[d.id] = { h: sha(d.text), v: Buffer.from(v.buffer).toString('base64') };
      });
    }
    mkdirSync(CACHE_DIR, { recursive: true });
    writeFileSync(CACHE, JSON.stringify(cache));
  }
  console.log(`related: ${docs.length} items, ${todo.length} newly embedded`);
  for (const d of docs) d.vec = toVec(cache[d.id].v);
}

const dot = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; };

/** Everything strictly earlier than d, best first. */
function candidatesFor(d, docs) {
  return docs
    .filter((c) => c.date < d.date)
    .map((c) => ({ c, score: dot(d.vec, c.vec) }))
    .sort((a, b) => b.score - a.score);
}

/** Top links: above threshold, one per issue, capped, with a slot kept for a standalone story. */
function pick(cands, th) {
  const pass = [];
  const seenIssue = new Set();
  for (const x of cands) {
    if (x.score < th) break;
    if (x.c.type === 'daily') {
      if (seenIssue.has(x.c.date)) continue;
      seenIssue.add(x.c.date);
    }
    // The archive repeats recurring stories (event dates, myth-busters). Three links to the
    // same story on three different days is one link's worth of information.
    if (pass.some((p) => dot(p.c.vec, x.c.vec) >= SAME_STORY)) continue;
    pass.push(x);
  }
  let top = pass.slice(0, CAP);
  if (!top.some((x) => x.c.type === 'story')) {
    const story = pass.find((x) => x.c.type === 'story');
    if (story) { if (top.length < CAP) top.push(story); else top[CAP - 1] = story; }
  }
  return top.sort((a, b) => b.score - a.score);
}

const link = (x) =>
  x.c.type === 'story'
    ? { type: 'story', slug: x.c.slug, score: +x.score.toFixed(2) }
    : { type: 'daily', date: x.c.date, n: x.c.n, score: +x.score.toFixed(2) };

/** Calibration aid: a seeded sample of (item, match) pairs from each score band, for hand-judging. */
function printBands(docs) {
  let seed = 7;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
  const bands = [[0.4, 0.45], [0.45, 0.5], [0.5, 0.55], [0.55, 0.6], [0.6, 0.65], [0.65, 0.7], [0.7, 0.8]];
  const pairs = [];
  for (const d of docs) for (const x of candidatesFor(d, docs).slice(0, 5)) pairs.push({ d, x });
  for (const [lo, hi] of bands) {
    const inBand = pairs.filter((p) => p.x.score >= lo && p.x.score < hi);
    console.log(`\n=== ${lo.toFixed(2)}-${hi.toFixed(2)}  (${inBand.length} pairs among the top 5 of every item)`);
    for (let i = 0; i < 4 && inBand.length; i++) {
      const p = inBand.splice(Math.floor(rnd() * inBand.length), 1)[0];
      console.log(`  ${p.x.score.toFixed(2)}  ${p.d.heading.slice(0, 62)}\n        -> ${p.x.c.heading.slice(0, 62)}`);
    }
  }
}

function printReport(docs) {
  const withPast = docs.filter((d) => docs.some((c) => c.date < d.date));
  const top1 = withPast.map((d) => candidatesFor(d, docs)[0].score).sort((a, b) => a - b);
  const q = (p) => top1[Math.min(top1.length - 1, Math.floor(p * top1.length))].toFixed(2);
  console.log(`\nbest-match score across ${top1.length} items: min ${q(0)} · p25 ${q(0.25)} · median ${q(0.5)} · p75 ${q(0.75)} · max ${q(0.999)}`);
  const stories = withPast.filter((d) => d.type === 'story');
  const dailies = withPast.filter((d) => d.type === 'daily');
  const step = Math.max(1, Math.floor(dailies.length / 14));
  const sample = [...stories, ...dailies.filter((_, i) => i % step === 0).slice(-14)];
  for (const d of sample) {
    console.log(`\n${d.id}  ${d.heading.slice(0, 90)}`);
    const cands = candidatesFor(d, docs).slice(0, 5);
    for (const x of cands) {
      const mark = x.score >= threshold ? '+' : ' ';
      console.log(`  ${mark} ${x.score.toFixed(2)}  ${x.c.id.padEnd(34)} ${x.c.heading.slice(0, 70)}`);
    }
  }
}

async function main() {
  // Never hold up a publish: if the model load or embedding hangs, give up and let the build ship.
  const watchdog = setTimeout(() => {
    console.warn('related: gave up after 3 minutes, building without new links.');
    process.exit(strict ? 1 : 0);
  }, 180000);
  watchdog.unref();
  const docs = loadDocs();
  await embedAll(docs);
  if (args.has('--bands')) { printBands(docs); return; }
  if (report) { printReport(docs); return; }
  const entries = {};
  let linked = 0;
  for (const d of docs) {
    if (d.type !== 'daily' && d.type !== 'story') continue;
    const top = pick(candidatesFor(d, docs), thresholdFor(d.type));
    if (top.length) { entries[d.id] = top.map(link); linked++; }
  }
  mkdirSync(dirname(OUT), { recursive: true });
  const file = { version: 1, model: MODEL, threshold: thOverride ?? THRESHOLD, entries };
  writeFileSync(OUT, JSON.stringify(file, null, 1) + '\n');
  console.log(`related: wrote ${Object.keys(entries).length} entries (${linked} of ${docs.length} items have links), thresholds ${JSON.stringify(file.threshold)}`);
}

main().catch((err) => {
  console.warn('related: skipped, building without new links.', err && err.message ? err.message : err);
  process.exit(strict ? 1 : 0);
});
