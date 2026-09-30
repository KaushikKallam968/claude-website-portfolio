import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// The pages a search engine should list: the journey, selected work, each Case and the résumé. The 404 is left out.
// Cases come from the collection, so a new Case is listed without touching this file.
export const GET: APIRoute = async ({ site }) => {
  const cases = (await getCollection('cases')).sort((a, b) => a.data.order - b.data.order);
  const paths = ['/', '/work/', ...cases.map((c) => `/work/${c.id}/`), '/resume/'];
  const urls = paths.map((p) => `  <url><loc>${new URL(p, site).href}</loc></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
