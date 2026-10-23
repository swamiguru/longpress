import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { serializeWithLastmod } from './src/lib/seo/lastmod.mjs';
import { topicSitemapFilter } from './src/lib/seo/topics.mjs';
import bodyImages from './src/lib/build/body-images.mjs';

const indexableTopic = topicSitemapFilter();

const SITE = 'https://longpress.news';

export default defineConfig({
  site: SITE,
  trailingSlash: 'never',
  integrations: [
    // Width, height, srcset and lazy-loading for pictures in markdown bodies.
    bodyImages(),
    sitemap({
      // Drafts never reach /dist, so nothing to filter there. This only keeps
      // machine-readable endpoints out of a list meant for indexable pages.
      // Topic hubs under TOPIC_MIN_STORIES are noindex, so they are left out
      // here too (src/lib/seo/topics.mjs). /search is a utility page with no
      // content of its own, so it is noindex and out of the list as well. A noindex URL in the sitemap is a
      // conflicting signal.
      // Per-story share pages (/daily/<date>/<slot>) are noindex and canonical
      // to the brief, so they stay out too.
      filter: (page) =>
        !/\/(rss\.xml|ads\.txt|search)$/.test(page) &&
        !/\/daily\/\d{4}-\d{2}-\d{2}\/\d+$/.test(page) &&
        indexableTopic(page),
      serialize: serializeWithLastmod(SITE),
    }),
  ],
  build: { format: 'file' },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
});
