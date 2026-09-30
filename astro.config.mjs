import { defineConfig } from 'astro/config';

// The public address is set when the site is published (SITE_URL); until then canonical and social image
// tags are left out rather than pointing at a domain nobody owns yet.
export default defineConfig({
  site: process.env.SITE_URL || undefined,
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  devToolbar: { enabled: false },
});
