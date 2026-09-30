import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://kaushikkallam.com',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  devToolbar: { enabled: false },
});
