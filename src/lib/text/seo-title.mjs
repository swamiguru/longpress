/**
 * Fallback search title for a Daily Five brief whose source JSON has no
 * `seoTitle`. Brief headlines list three or four stories and run 70-100
 * characters; Google shows about 60. This keeps the leading stories whole,
 * cut at a list boundary, and never ends mid-phrase or with an ellipsis.
 *
 * Returns null when the title already fits (no seoTitle needed) or when no
 * clean cut exists (the layout then uses the full title).
 * Dependency-free so the importer and the backfill can share it.
 */
export function fitSeoTitle(title = '', cap = 60) {
  const t = String(title).replace(/\s+/g, ' ').trim();
  if (t.length <= cap) return null;
  const parts = t.split(/\s*[,;]\s+(?:and\s+|plus\s+)?|\s+(?:and|&|\+|plus)\s+|\s+[—–]\s+|:\s+/).filter(Boolean);
  let out = '';
  for (const p of parts) {
    const next = out ? `${out}, ${p}` : p;
    if (next.length > cap) break;
    out = next;
  }
  out = out.replace(/[\s,;:.\-–—]+$/, '');
  return out.length >= 20 ? out : null;
}
