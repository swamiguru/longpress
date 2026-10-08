// Inline source links inside brief prose.
//
// The generator writes plain strings into the daily JSON, and those strings are
// rendered as text, not markdown. To let a claim carry its own source, prose may
// contain [label](https://...) and nothing else. This is the whole syntax.
//
//   linkify()    HTML-escapes the text first, then turns only http(s) links
//                into anchors. Safe for set:html: nothing but the anchors this
//                function builds can become markup.
//   stripLinks() Reduces the same syntax to its label, for anywhere the text is
//                a plain string (excerpts, meta/share descriptions, word counts).
//
// Dependency-free on purpose, like the rest of src/lib.

const LINK = /\[([^\]\n]{1,120})\]\((https?:\/\/[^\s)]+)\)/g;

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function linkify(text) {
  if (text == null) return '';
  // Escape first, then match: URLs containing & arrive as &amp;, which is
  // exactly what belongs inside an href attribute.
  return esc(text).replace(
    LINK,
    (_m, label, url) => `<a href="${url}" rel="noopener" target="_blank">${label}</a>`,
  );
}

export function stripLinks(text) {
  if (text == null) return '';
  return String(text).replace(LINK, '$1');
}

/** "https://www.bloomberg.com/x" -> "bloomberg.com", for a source with no label. */
export function hostLabel(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
