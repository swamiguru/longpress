import { validateSlug } from './slugs.mjs';

/**
 * entries: [{ slug, source }] - source is the file path, for the error message.
 * Blocks the build. A colliding slug is a broken URL, not a style nit.
 */
export function checkRoutes(entries) {
  const seen = new Map();
  const errors = [];

  for (const { slug, source } of entries) {
    const v = validateSlug(slug);
    if (!v.ok) { errors.push(`${source}: ${v.reason}`); continue; }
    if (seen.has(slug)) {
      errors.push(`${source}: duplicate slug "${slug}" (also ${seen.get(slug)})`);
      continue;
    }
    seen.set(slug, source);
  }

  if (errors.length) {
    console.error('\n  Routing check FAILED\n' +
      errors.map((e) => '   x ' + e).join('\n') + '\n');
    process.exit(1);
  }
  console.log(`  Routing check passed - ${entries.length} slugs, 0 collisions`);
}
