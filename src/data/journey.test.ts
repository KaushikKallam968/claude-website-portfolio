import { describe, expect, it } from 'vitest';
import { allEntries, allRoles, chapters, entryFor } from './journey';

/** Each Case's number, from its front matter: the "N" in "Case N of 5" and the order Next case follows. */
const caseOrder = Object.entries(import.meta.glob<string>('../content/cases/*.md', { query: '?raw', import: 'default', eager: true }))
  .map(([path, text]) => ({ id: path.split('/').pop()!.replace(/\.md$/, ''), order: Number(/^order:\s*(\d+)/m.exec(text)![1]) }))
  .sort((a, b) => a.order - b.order);

describe('the journey', () => {
  it('lists roles for the résumé most recent first, wherever a Chapter tells them', () => {
    expect(allRoles().map((r) => r.title)).toEqual([
      'Senior Quantitative UX Researcher',
      'Experience Research Senior Associate',
      'UX Researcher II, contractor',
      'UX Research intern',
      'Quantitative Consumer Insights intern',
    ]);
  });

  it('keeps Texas: career to JPMorganChase and the Chegg work together in Silicon Valley', () => {
    const texas = chapters.find((c) => c.id === 'texas-career')!;
    expect([...texas.roles, ...(texas.subsections ?? []).flatMap((s) => (s.role ? [s.role] : []))].map((r) => r.org)).toEqual(['JPMorganChase']);
    expect(entryFor('chegg-discord').chapter.id).toBe('silicon-valley');
    expect(entryFor('chegg-mexico').chapter.id).toBe('silicon-valley');
  });

  it('tells Silicon Valley newest first: the Chegg contract, then the summer before it', () => {
    const valley = chapters.find((c) => c.id === 'silicon-valley')!;
    expect(valley.work).toBe('Chegg Discord · Chegg Mexico');
    expect(valley.roles.map((r) => r.title)).toEqual(['UX Researcher II, contractor']);
    expect(valley.entries.map((e) => e.id)).toEqual(['chegg-discord']);
    expect(valley.subsections!.map((s) => s.heading)).toEqual(['Before that: the summer in Silicon Valley']);
    expect(valley.subsections![0].role?.title).toBe('UX Research intern');
    expect(valley.subsections![0].entries.map((e) => e.id)).toEqual(['chegg-mexico']);
  });

  it('meets the Entries newest first across the whole Journey', () => {
    expect(allEntries().map(({ entry }) => entry.id)).toEqual([
      'instrumentation',
      'ai-evaluation',
      'chase-entry-points',
      'chegg-discord',
      'chegg-mexico',
      'inspire-ad-creative',
      'watched',
    ]);
  });

  it('numbers the Cases in the order the Journey meets them', () => {
    const met = allEntries().filter(({ entry }) => entry.kind === 'case').map(({ entry }) => entry.id);
    expect(caseOrder.map((c) => c.id)).toEqual(met);
    expect(caseOrder.map((c) => c.order)).toEqual([1, 2, 3, 4, 5]);
    expect(caseOrder.map((c) => c.id)).toEqual(['instrumentation', 'chegg-discord', 'chegg-mexico', 'inspire-ad-creative', 'watched']);
  });

  it('tells the Inspire Brands Case in Atlanta and offers it from the internship on the résumé', () => {
    expect(entryFor('inspire-ad-creative').chapter.id).toBe('atlanta');
    const role = allRoles().find((r) => r.org === 'Inspire Brands')!;
    expect(role.more).toBe('/work/inspire-ad-creative/');
  });

  it('says where each piece of work was done, not only which Chapter tells it', () => {
    expect(entryFor('chegg-discord').where).toBe('Remote from Texas');
    expect(entryFor('chegg-mexico').where).toBe('Santa Clara County, California');
    expect(entryFor('inspire-ad-creative').where).toBe('Atlanta, Georgia');
    expect(entryFor('instrumentation').where).toBe('New York');
    // watched. is told in Singapore but was not made there, so it claims no place.
    expect(entryFor('watched').where).toBeUndefined();
  });
});
