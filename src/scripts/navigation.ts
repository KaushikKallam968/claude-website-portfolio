import { originFromState, type Origin } from '../lib/origin';
import { KEYS, session } from '../lib/store';
import { record, elapsed } from './notes';

/**
 * Before leaving for a Case, hand its Origin to the Case page. The Case page moves it into its own
 * history entry (see adoptOrigin), so reloading keeps it and a later visit from a shared link does not.
 */
export function rememberOrigins() {
  document.addEventListener('click', (ev) => {
    const a = (ev.target as Element).closest<HTMLAnchorElement>('a[data-case-link]');
    if (!a) return;
    const caseId = a.dataset.caseLink!;
    const fromCase = Boolean(document.body.dataset.caseId);
    const inWorkIndex = Boolean(a.closest('[data-work-index]'));
    const origin: Origin | null = fromCase
      ? null
      : inWorkIndex
        ? { kind: 'selected-work', entryId: caseId, scrollY: Math.round(scrollY) }
        : { kind: 'chapter', chapterId: a.dataset.originChapter!, entryId: caseId, scrollY: Math.round(scrollY) };
    if (origin) session.set(KEYS.origin(caseId), { origin });
    else session.remove(KEYS.origin(caseId));
    record({ type: 'open', t: elapsed(), id: caseId, title: a.dataset.observeLabel ?? a.textContent?.trim() ?? caseId });
  });
}

/** On a Case page: take the Origin handed over by the previous page, or keep the one this entry already has. */
export function adoptOrigin(caseId: string): Origin | null {
  const own = originFromState(history.state);
  if (own) return own;
  const handed = originFromState(session.get(KEYS.origin(caseId), null));
  session.remove(KEYS.origin(caseId));
  if (handed) history.replaceState({ ...(history.state ?? {}), origin: handed }, '');
  return handed;
}

/** Put the reader back where Return promised: scroll position, then focus on the Entry or Chapter heading. */
export function restoreIfPending() {
  const pending = session.get<{ scrollY: number | null; focusId: string } | null>(KEYS.restore, null);
  session.remove(KEYS.restore);
  if (!pending) return;
  if (pending.scrollY !== null) scrollTo({ top: pending.scrollY, behavior: 'instant' as ScrollBehavior });
  const el = document.getElementById(pending.focusId);
  if (!el) return;
  el.focus({ preventScroll: true });
  const r = el.getBoundingClientRect();
  if (r.bottom < 0 || r.top > innerHeight) el.scrollIntoView({ block: 'center' });
}

/** A page restored from the back-forward cache runs no scripts again; restore focus when it is shown. */
export function restoreOnPageShow() {
  addEventListener('pageshow', (e) => {
    if ((e as PageTransitionEvent).persisted) restoreIfPending();
  });
}

/**
 * Summaries and Research in Development expand in place. The text is in the HTML for readers without
 * scripts; scripts collapse it behind its button.
 */
export function wireDisclosures() {
  document.querySelectorAll<HTMLButtonElement>('[data-more-toggle]').forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute('aria-controls')!);
    if (!panel) return;
    panel.hidden = true;
    btn.hidden = false;
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
      if (open || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      panel.animate(
        [
          { opacity: 0, clipPath: 'inset(0 0 100% 0)' },
          { opacity: 1, clipPath: 'inset(0 0 0% 0)' },
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
      const focusInBar = Boolean(document.activeElement?.closest('.top'));
      root.classList.toggle('nav-hidden', y > last && y > 400 && !focusInBar);
      last = y;
    },
    { passive: true },
  );
}

/**
 * Live updates (clocks, the readout) can be paused from the top bar, and stay paused for the visit.
 * WCAG 2.2.2: auto-updating content needs a way to stop it.
 */
export function wireLivePause() {
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-live-pause]');
  const root = document.documentElement;
  const sync = () => {
    const paused = root.classList.contains('live-paused');
    buttons.forEach((btn) => {
      btn.setAttribute('aria-pressed', String(paused));
      btn.textContent = paused ? 'Resume live' : 'Pause live';
    });
  };
  if (session.get(KEYS.livePaused, false)) root.classList.add('live-paused');
  sync();
  buttons.forEach((btn) =>
    btn.addEventListener('click', () => {
      root.classList.toggle('live-paused');
      session.set(KEYS.livePaused, root.classList.contains('live-paused'));
      sync();
    }),
  );
}

export const livePaused = () => document.documentElement.classList.contains('live-paused');
