import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://longpress.news',
  trailingSlash: 'never',
  integrations: [react(), sitemap()],
  build: { format: 'file' },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  // Passthrough Vite config - same stack you already know.
  vite: {},
});
