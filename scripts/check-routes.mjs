#!/usr/bin/env node
/**
 * Pre-build gate. Dependency-free: reads frontmatter with a narrow regex
 * rather than pulling in a YAML parser.
 *
 * Wire into package.json:  "prebuild": "node scripts/check-routes.mjs"
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { checkRoutes } from '../src/lib/routing/check.mjs';

const STORIES = 'src/content/stories';
const DAILY = 'src/content/daily';

function frontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return m ? m[1] : '';
}

function field(fm, name) {
  const m = fm.match(new RegExp(`^${name}:\\s*["']?(.+?)["']?\\s*$`, 'm'));
  return m ? m[1].trim() : undefined;
}

function mdFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true })
    .filter((f) => typeof f === 'string' && f.endsWith('.md'))
    .map((f) => join(dir, f));
}

// --- 1. Slug validity and collisions (blocking) ---------------------------
const entries = mdFiles(STORIES).map((path) => {
  const fm = frontmatter(readFileSync(path, 'utf8'));
  return { slug: field(fm, 'slug'), source: path };
});
checkRoutes(entries);

// --- 2. Known Issue rolling rate (warn only, like the slot-5 linter) -----
const briefs = mdFiles(DAILY)
  .map((path) => ({ path, text: readFileSync(path, 'utf8') }))
  .sort((a, b) => (a.path < b.path ? 1 : -1));

const hasOpinion = (t) =>
  /kind:\s*["']?(hot-take|myth-buster|known-issue)["']?/.test(t);
const rate = (n) => {
  const window = briefs.slice(0, n);
  if (!window.length) return null;
  const hit = window.filter((b) => hasOpinion(b.text)).length;
  return `${hit}/${window.length} (${Math.round((hit / window.length) * 100)}%)`;
};

const r7 = rate(7);
const r30 = rate(30);
if (r7) console.log(`  Known Issue rate - last 7: ${r7} | last 30: ${r30}`);
if (briefs.length && !hasOpinion(briefs[0].text)) {
  console.warn('  ! Latest brief carries no Hot Take or Myth-Buster.');
}

// --- 3. Illustration coverage on the latest brief (warn only) -------------
// 21 Sept: every image in a brief silently fell back to the headline-baked
// social card (card_N.png) for a full day because nothing printed at build
// time when illustration generation failed upstream. import-roundup.mjs no
// longer falls back to card_N.png at all (illustration or no image), so this
// can't recur as a wrong-image bug -- but a slot with NO image is still worth
// flagging loudly, the same way the opinion rate is, so a bad Gemini day gets
// noticed same-morning instead of by a screenshot.
if (briefs.length) {
  const latest = briefs[0];
  const slots = [...latest.text.matchAll(/^ {2}- slot: (\d+)/gm)].map((m) => m[1]);
  const withImage = [...latest.text.matchAll(/^ {4}image: /gm)].length;
  const withoutImage = slots.length - withImage;
  // The community/poll slot never gets one by design -- don't cry wolf over
  // exactly one missing image on a brief that has that slot.
  if (withoutImage > 1 || (withoutImage === 1 && !/kind:\s*["']?community["']?/.test(latest.text))) {
    console.warn(`  ! Latest brief: ${withoutImage}/${slots.length} slot(s) shipped with no illustration (Gemini failure or missing mirror -- check the automation clone's public/social/<date>/ for illustration_N.png).`);
  }
}
