/**
 * Fallback illustrations (public/images/fallback, drawn by scripts/make-fallbacks.mjs).
 * Used when a story has no generated illustration: a Gemini timeout or outage,
 * a missing file, or the community poll slot, which never gets one.
 * NEVER the headline-baked card_N, which would print the title twice under an overlay.
 */
const FALLBACK_BY_KIND: Record<string, string> = {
  commentary: 'commentary',
  'hot-take': 'commentary',
  'known-issue': 'commentary',
  'myth-buster': 'myth',
  tip: 'tip',
};
const dayNumber = (d: Date) => Math.floor(d.getTime() / 86_400_000);

export function fallbackFor(kind: string, date: Date): string {
  // Community rotates through three images by date, so it never repeats two days running.
  if (kind === 'community') return `/images/fallback/community-${(dayNumber(date) % 3) + 1}.png`;
  return `/images/fallback/${FALLBACK_BY_KIND[kind] ?? 'news'}.png`;
}
