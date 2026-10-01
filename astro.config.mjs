import { defineConfig } from 'astro/config';

// The public address, for canonical and social-image links (LinkedIn previews). SITE_URL overrides it; the
// fallback is where the site is published today (see docs/publishing.md), to change with a custom domain.
export default defineConfig({
  site: process.env.SITE_URL || 'https://website-nu-five-41.vercel.app',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  devToolbar: { enabled: false },
});
