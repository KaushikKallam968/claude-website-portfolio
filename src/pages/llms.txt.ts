import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { closing } from '../data/journey';
import { llmsText } from '../lib/seo';

// A plain-text guide for AI search engines (the llms.txt convention). Cases come from the collection, so a new
// Case is listed without touching this file.
export const GET: APIRoute = async ({ site }) => {
  const cases = (await getCollection('cases')).sort((a, b) => a.data.order - b.data.order);
  const body = llmsText(site!, cases.map((c) => ({ id: c.id, title: c.data.title, question: c.data.question })), closing);
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
