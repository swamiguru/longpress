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
