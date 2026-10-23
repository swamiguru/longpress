/**
 * Meta description for a brief, at most `cap` characters, never cut mid-phrase.
 * Order of preference:
 *   1. the whole text, if it fits
 *   2. the last full sentence that fits
 *   3. the last comma-separated clause that fits (ends with a full stop)
 *   4. a word boundary with an ellipsis, only if nothing better is long enough
 * Dependency-free so the importer and the backfill script can both use it.
 */
export function fitDescription(text = '', cap = 160) {
  const t = String(text).replace(/\s+/g, ' ').trim();
  if (t.length <= cap) return t;
  const floor = Math.floor(cap * 0.5);
  const window = t.slice(0, cap);

  // 2. last sentence end inside the window
  const sentenceEnds = [...window.matchAll(/[.!?](?=\s|$)/g)].map((m) => m.index + 1);
  const s = sentenceEnds.filter((i) => i >= floor).pop();
  if (s) return window.slice(0, s);

  // 3. last comma or semicolon inside the window, dropping the dangling clause
  const comma = Math.max(window.lastIndexOf(','), window.lastIndexOf(';'));
  if (comma >= floor) return window.slice(0, comma).replace(/[\s;:\-–—]+$/, '') + '.';

  // 4. last resort: word boundary
  const cut = t.slice(0, cap - 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.\-—]+$/, '') + '…';
}
