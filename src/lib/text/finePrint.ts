/**
 * Fine Print inline markers. The text fields are plain strings with two
 * markers and nothing else:
 *   [^n]       -> superscript link to source n (#fp-src-n)
 *   ==text==   -> highlighter sweep
 * Everything is HTML-escaped first, so frontmatter can never inject markup.
 */
const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) => ESC[c]);
}

export function fpInline(text: string, sourceCount = 99): string {
  return escapeHtml(text)
    .replace(/==(.+?)==/g, '<span class="fp-hl">$1</span>')
    .replace(/\[\^(\d{1,2})\]/g, (m, n) =>
      Number(n) >= 1 && Number(n) <= sourceCount
        ? `<a class="fp-fn" href="#fp-src-${n}" aria-label="Source ${n}">${n}</a>`
        : '',
    );
}

/** Same text with the markers removed - for teasers, meta and search. */
export function fpPlain(text: string): string {
  return String(text).replace(/==(.+?)==/g, '$1').replace(/\[\^\d{1,2}\]/g, '');
}

export const FP_STATUS: Record<string, { label: string; tone: 'ink' | 'yellow' | 'outline' }> = {
  'no-change': { label: 'No change', tone: 'ink' },
  'you-pay': { label: 'You pay', tone: 'yellow' },
  act: { label: 'Act now', tone: 'yellow' },
  check: { label: 'Check', tone: 'outline' },
};
