import { originFromState, type Origin } from '../lib/origin';
import { record, elapsed } from './notes';

/** Remembers where a Case was opened from, so its Return link can bring the reader back to the same place. */
export function rememberOrigins() {
  document.addEventListener('click', (ev) => {
    const a = (ev.target as Element).closest<HTMLAnchorElement>('a[data-case-link]');
    if (!a) return;
    const caseId = a.dataset.caseLink!;
    const chapterId = a.dataset.originChapter;
    const workList = a.closest('[data-work-index]');
    const fromCase = document.body.dataset.caseId;
    const origin: Origin = fromCase
      ? { kind: 'case', caseId: fromCase }
      : workList
        ? { kind: 'selected-work', entryId: caseId, scrollY: Math.round(scrollY) }
        : { kind: 'chapter', chapterId: chapterId!, entryId: caseId, scrollY: Math.round(scrollY) };
    try {
      sessionStorage.setItem(`kk:origin:${caseId}`, JSON.stringify({ origin }));
    } catch {
      /* the Case falls back to its own Chapter */
    }
    record({ type: 'open', t: elapsed(), id: caseId, title: a.dataset.observeLabel ?? a.textContent?.trim() ?? caseId });
  });
}

/** On a Case page: read the stored Origin. */
export function storedOrigin(caseId: string): Origin | null {
  try {
    return originFromState(JSON.parse(sessionStorage.getItem(`kk:origin:${caseId}`) ?? 'null'));
  } catch {
    return null;
  }
}

/** On arrival at a page with a pending restore (Return from a Case without history), put the reader back. */
export function restoreIfPending() {
  let pending: { scrollY: number | null; focusId: string } | null = null;
  try {
    pending = JSON.parse(sessionStorage.getItem('kk:restore') ?? 'null');
    sessionStorage.removeItem('kk:restore');
  } catch {
    pending = null;
  }
  if (!pending) return;
  if (pending.scrollY !== null) scrollTo({ top: pending.scrollY, behavior: 'instant' as ScrollBehavior });
  const el = document.getElementById(pending.focusId);
  el?.focus({ preventScroll: pending.scrollY !== null });
}

/** "Read the summary" style entries expand in place. */
export function wireDisclosures() {
  document.querySelectorAll<HTMLButtonElement>('[data-more-toggle]').forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute('aria-controls')!);
    if (!panel) return;
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      if (open) {
        panel.hidden = true;
        return;
      }
      panel.hidden = false;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      panel.animate(
        [
          { opacity: 0, transform: 'translateY(12px)', clipPath: 'inset(0 0 100% 0)' },
          { opacity: 1, transform: 'none', clipPath: 'inset(0 0 0% 0)' },
        ],
        { duration: 700, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      );
    });
  });
}

/** The top bar steps aside while reading down and returns when scrolling up. */
export function wireTopBar() {
  const root = document.documentElement;
  let last = scrollY;
  addEventListener(
    'scroll',
    () => {
      const y = scrollY;
      root.classList.toggle('scrolled', y > 8);
      const down = y > last && y > 400;
      root.classList.toggle('nav-hidden', down && !root.contains(document.activeElement?.closest('.top') ?? null));
      last = y;
    },
    { passive: true },
  );
}
