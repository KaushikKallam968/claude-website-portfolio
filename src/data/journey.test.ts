import { describe, expect, it } from 'vitest';
import { allRoles, chapters, entryFor } from './journey';

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
