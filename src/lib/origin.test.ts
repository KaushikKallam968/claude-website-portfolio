import { describe, expect, it } from 'vitest';
import { originFromState, returnTargetFor } from './origin';

const discord = { id: 'chegg-discord', chapterId: 'texas-career', chapterTitle: 'Texas: career' };

describe('returning from a Case', () => {
  it('goes back to the exact Entry in the Chapter it was opened from', () => {
    const origin = { kind: 'chapter', chapterId: 'texas-career', entryId: 'chegg-discord', scrollY: 4200 } as const;
    expect(returnTargetFor(discord, origin)).toEqual({
      href: '/#chegg-discord',
      label: 'Back to Texas: career',
      focusId: 'entry-chegg-discord',
      scrollY: 4200,
    });
  });

  it('goes back to the same Entry in Selected Work when opened from there', () => {
    const origin = { kind: 'selected-work', entryId: 'chegg-discord', scrollY: 900 } as const;
    expect(returnTargetFor(discord, origin)).toEqual({
      href: '/work/#chegg-discord',
      label: 'Back to selected work',
      focusId: 'work-chegg-discord',
      scrollY: 900,
    });
  });

  it("offers the Case's own Chapter when it was opened from a shared link", () => {
    expect(returnTargetFor(discord, null)).toEqual({
      href: '/#texas-career',
      label: 'Explore Texas: career',
      focusId: 'chapter-texas-career',
      scrollY: null,
    });
  });

  it('treats a Case opened from a related Case like a shared link, leaving Back to the browser', () => {
    const origin = { kind: 'case', caseId: 'chegg-mexico' } as const;
    expect(returnTargetFor(discord, origin)).toEqual(returnTargetFor(discord, null));
  });
});

describe('reading an Origin from history state', () => {
  it('recovers a chapter Origin written by the journey', () => {
    const state = { origin: { kind: 'chapter', chapterId: 'nyc', entryId: 'instrumentation', scrollY: 1800 } };
    expect(originFromState(state)).toEqual({ kind: 'chapter', chapterId: 'nyc', entryId: 'instrumentation', scrollY: 1800 });
  });

  it('ignores state it did not write', () => {
    expect(originFromState(null)).toBeNull();
    expect(originFromState({ origin: { kind: 'chapter', entryId: 42 } })).toBeNull();
    expect(originFromState({ somethingElse: true })).toBeNull();
    expect(originFromState('a string')).toBeNull();
  });
});
