import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { keepCompounds } from './src/lib/format.ts';

/** Keeps compound words whole in a Case's prose. Text nodes only, so links, ids and attributes keep their plain hyphens. */
const keepCompoundsInText = {
  name: 'keep-compounds',
  text(node, ctx) {
    // Code is shown as written, however deep the highlighter nests its text.
    for (let up = ctx.parent(node); up; up = ctx.parent(up)) if (up.tagName === 'code' || up.tagName === 'pre') return;
    const value = keepCompounds(node.value);
    if (value !== node.value) ctx.replaceNode(node, { type: 'text', value });
  },
};

// The public address, for canonical and social-image links (LinkedIn previews). SITE_URL overrides it; the
// fallback is where the site is published today (see docs/publishing.md), to change with a custom domain.
export default defineConfig({
  site: process.env.SITE_URL || 'https://website-nu-five-41.vercel.app',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  markdown: { processor: satteri({ hastPlugins: [keepCompoundsInText] }) },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  devToolbar: { enabled: false },
});
