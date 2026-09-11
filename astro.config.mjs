import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { serializeWithLastmod } from './src/lib/seo/lastmod.mjs';

const SITE = 'https://longpress.news';

export default defineConfig({
  site: SITE,
  trailingSlash: 'never',
  integrations: [
    react(),
    sitemap({
      // Drafts never reach /dist, so nothing to filter there. This only keeps
      // machine-readable endpoints out of a list meant for indexable pages.
      filter: (page) => !/\/(rss\.xml|ads\.txt)$/.test(page),
      serialize: serializeWithLastmod(SITE),
    }),
  ],
  build: { format: 'file' },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  // Passthrough Vite config - same stack you already know.
  vite: {},
});
