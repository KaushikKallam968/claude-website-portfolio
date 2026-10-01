import type { APIRoute } from 'astro';

// Everything is open to crawlers; the sitemap names the pages. The address comes from `site` in astro.config.mjs.
export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', site).href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
