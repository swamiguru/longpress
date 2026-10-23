#!/usr/bin/env node
/**
 * Re-derive the `description` line of every brief from its own `intro`, using
 * the same rule as the importer. Needed once, because the old rule cut at a
 * word and added an ellipsis. Later syncs regenerate the same values.
 *
 * Usage: node scripts/backfill-descriptions.mjs [--dry]
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fitDescription } from '../src/lib/text/description.mjs';

const DIR = 'src/content/daily';
const DRY = process.argv.includes('--dry');
let changed = 0, kept = 0, noIntro = 0, ellipsis = 0;

for (const f of readdirSync(DIR).filter((n) => n.endsWith('.md')).sort()) {
  const path = `${DIR}/${f}`;
  const src = readFileSync(path, 'utf8');
  const lines = src.split('\n');
  const end = lines.indexOf('---', 1);
  const di = lines.findIndex((l, i) => i < end && l.startsWith('description: '));
  const ii = lines.findIndex((l, i) => i < end && l.startsWith('intro: '));
  if (di < 0 || ii < 0) { noIntro++; continue; }
  const body = [];
  for (let i = ii + 1; i < end && /^\s+/.test(lines[i]); i++) body.push(lines[i].trim());
  const intro = body.join(' ').replace(/\s+/g, ' ').trim();
  const next = `description: ${JSON.stringify(fitDescription(intro))}`;
  if (next.endsWith('…"')) ellipsis++;
  if (lines[di] === next) { kept++; continue; }
  lines[di] = next;
  changed++;
  if (!DRY) writeFileSync(path, lines.join('\n'));
}
console.log(`descriptions: ${changed} changed, ${kept} unchanged, ${noIntro} without intro, ${ellipsis} still end in an ellipsis`);
