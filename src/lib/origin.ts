/** Where a Case was opened from, stored in history.state so Return can restore it. */
export type Origin =
  | { kind: 'chapter'; chapterId: string; entryId: string; scrollY: number }
  | { kind: 'selected-work'; entryId: string; scrollY: number }
  | { kind: 'case'; caseId: string };

export interface CaseRef {
  id: string;
  chapterId: string;
  chapterTitle: string;
}

export interface ReturnTarget {
  href: string;
  label: string;
  focusId: string;
  scrollY: number | null;
}

export function returnTargetFor(caseRef: CaseRef, origin: Origin | null): ReturnTarget {
  if (origin?.kind === 'chapter') {
    return {
      href: `/#${origin.entryId}`,
      label: `Back to ${caseRef.chapterTitle}`,
      focusId: `entry-${origin.entryId}`,
      scrollY: origin.scrollY,
    };
  }
  if (origin?.kind === 'selected-work') {
    return {
      href: `/work/#${origin.entryId}`,
      label: 'Back to selected work',
      focusId: `work-${origin.entryId}`,
      scrollY: origin.scrollY,
    };
  }
  // A shared link or a related Case: Back belongs to the browser, Return offers the Case's Chapter.
  return {
    href: `/#${caseRef.chapterId}`,
    label: `Explore ${caseRef.chapterTitle}`,
    focusId: `chapter-${caseRef.chapterId}`,
    scrollY: null,
  };
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const isText = (v: unknown): v is string => typeof v === 'string' && v.length > 0;
const isY = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;

/** Reads the Origin the site wrote into history.state; anything else (other scripts, old shapes) is ignored. */
export function originFromState(state: unknown): Origin | null {
  if (!isObject(state) || !isObject(state.origin)) return null;
  const o = state.origin;
  if (o.kind === 'chapter' && isText(o.chapterId) && isText(o.entryId) && isY(o.scrollY)) {
    return { kind: 'chapter', chapterId: o.chapterId, entryId: o.entryId, scrollY: o.scrollY };
  }
  if (o.kind === 'selected-work' && isText(o.entryId) && isY(o.scrollY)) {
    return { kind: 'selected-work', entryId: o.entryId, scrollY: o.scrollY };
  }
  if (o.kind === 'case' && isText(o.caseId)) return { kind: 'case', caseId: o.caseId };
  return null;
}
