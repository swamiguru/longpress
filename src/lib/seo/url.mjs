// One canonical URL shape for the whole site: no .html, no /index, no trailing
// slash. `build.format: 'file'` makes Astro.url.pathname come out as
// "/about.html" and "/index.html" at build time, while Vercel (cleanUrls) serves
// and the sitemap lists "/about" and "/". Anything that publishes a URL (canonical,
// og:url, JSON-LD, share links) must go through here so they all agree.
// Dependency-free on purpose, like the rest of src/lib/seo.

export function cleanPath(pathname) {
  const p = String(pathname || '/')
    .replace(/\/index\.html$/, '/')
    .replace(/\.html$/, '')
    .replace(/(.)\/+$/, '$1');
  return p || '/';
}

export function canonicalUrl(pathname, site) {
  return new URL(cleanPath(pathname), site).href;
}

// Google's NewsArticle guidance caps `headline` at 110 characters. Longer ones
// are cut at a word boundary with an ellipsis. Page <title> and the visible h1
// are untouched; this only shapes the structured data.
export function headlineOf(title, max = 110) {
  const t = String(title || '').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const sp = cut.lastIndexOf(' ');
  return (sp > 60 ? cut.slice(0, sp) : cut).replace(/[\s,;:.\-]+$/, '') + '…';
}
