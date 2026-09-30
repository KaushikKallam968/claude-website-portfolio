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
});
