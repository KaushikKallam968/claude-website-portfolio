import { defineConfig } from 'astro/config';

// The public address, for canonical and social-image links (LinkedIn previews). SITE_URL overrides it; the
// fallback is the site's own domain (see docs/publishing.md). www is the primary; the bare domain redirects to it.
export default defineConfig({
  site: process.env.SITE_URL || 'https://www.kkportfolio.xyz',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  devToolbar: { enabled: false },
});
