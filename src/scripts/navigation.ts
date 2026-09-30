import { clockFormat } from './clock';
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
    // The row that was clicked becomes the Case page: the next page opens out of its outline, and only its
    // title travels to the Case's heading. Every other title stays part of the page, so none is left behind.
    const title = a.closest('.entry, .row')?.querySelector<HTMLElement>('.entry__link, .row__link');
    nameTravellingTitle(fromCase ? null : title ?? null, caseId);
    const row = a.closest('.entry, .row') ?? a;
    const r = row.getBoundingClientRect();
    session.set(KEYS.expandFrom, { top: r.top, right: innerWidth - r.right, bottom: innerHeight - r.bottom, left: r.left });
    record({ type: 'open', t: elapsed(), id: caseId, title: a.dataset.observeLabel ?? a.textContent?.trim() ?? caseId });
  });
}

let travelling: HTMLElement | null = null;

/**
 * Name the one title that travels in a page transition. Leaving a Case for another Case, nothing on this page
 * has a partner on the next, so the heading gives up its name and leaves with the page.
 */
function nameTravellingTitle(el: HTMLElement | null, caseId: string) {
  if (travelling) travelling.style.viewTransitionName = '';
  travelling = el;
  if (el) el.style.viewTransitionName = `case-${caseId}`;
  const heading = document.getElementById('case-title');
  if (heading && !el) heading.style.viewTransitionName = 'none';
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

/**
 * Back from a Case when the browser could not keep this page in its back-forward cache: it restores the scroll
 * but not focus. Focus returns to that Case's title if it is on screen, so the next Tab carries on from there
 * instead of starting over at the top of the page.
 */
export function restoreFocusOnBack() {
  const caseId = document.querySelector<HTMLElement>('main[data-case]')?.dataset.case;
  if (caseId) addEventListener('pagehide', () => session.set(KEYS.lastCase, caseId));
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  const last = session.get<string | null>(KEYS.lastCase, null);
  if (nav?.type !== 'back_forward' || !last || caseId) return;
  const run = () =>
    requestAnimationFrame(() => {
      const link = document.querySelector<HTMLElement>(`.entry__link[data-case-link="${last}"], .row__link[data-case-link="${last}"]`);
      const r = link?.getBoundingClientRect();
      if (!link || !r || r.bottom < 0 || r.top > innerHeight || document.activeElement !== document.body) return;
      link.focus({ preventScroll: true });
      session.remove(KEYS.lastCase);
    });
  if (document.readyState === 'complete') run();
  else addEventListener('load', run, { once: true });
}

/** A page restored from the back-forward cache runs no scripts again; restore focus when it is shown. */
export function restoreOnPageShow() {
  addEventListener('pageshow', (e) => {
    if (!(e as PageTransitionEvent).persisted) return;
    restoreIfPending();
    // Back from the Case: the heading's name was only for the way out (the way back is named in Base.astro).
    document.getElementById('case-title')?.style.removeProperty('view-transition-name');
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
  // A keyboard user tabbing into the bar brings it back, so focus never lands on something off screen.
  document.querySelector('.top')?.addEventListener('focusin', () => root.classList.remove('nav-hidden'));
  addEventListener(
    'scroll',
    () => {
      const y = scrollY;
      root.classList.toggle('scrolled', y > 8);
      const focusInBar = Boolean(document.activeElement?.closest('.top, .notes'));
      const notesOpen = root.classList.contains('notes-open');
      root.classList.toggle('nav-hidden', y > last && y > 400 && !focusInBar && !notesOpen);
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
  // Without scripts nothing moves, so the switch only appears once there is something to pause.
  buttons.forEach((btn) => {
    const p = btn.closest('p');
    if (p) p.hidden = false;
  });
  buttons.forEach((btn) =>
    btn.addEventListener('click', () => {
      root.classList.toggle('live-paused');
      session.set(KEYS.livePaused, root.classList.contains('live-paused'));
      sync();
    }),
  );
}

export const livePaused = () => document.documentElement.classList.contains('live-paused');

/**
 * The top bar's place and clock follow the Chapter being read, so scrolling back up always shows where in
 * the journey you are. Outside the Chapters it is New York, where Kaushik is now.
 */
export function wireTopWhere() {
  const where = document.querySelector<HTMLElement>('[data-top-where]');
  const sections = document.querySelectorAll<HTMLElement>('[data-chapter-section][data-tz]');
  if (!where || !sections.length) return;
  const place = where.querySelector<HTMLElement>('[data-top-place]')!;
  const clock = where.querySelector<HTMLElement>('[data-clock]')!;
  const home = { name: place.textContent ?? '', tz: clock.dataset.clock! };
  const inView = new Set<HTMLElement>();
  const show = (name: string, tz: string) => {
    if (clock.dataset.clock === tz && place.textContent === name) return;
    place.textContent = name;
    clock.dataset.clock = tz;
    clock.textContent = clockFormat(tz).format(new Date());
  };
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => (en.isIntersecting ? inView.add(en.target as HTMLElement) : inView.delete(en.target as HTMLElement)));
      const current = [...inView][0];
      if (current) show(current.dataset.place!, current.dataset.tz!);
      else show(home.name, home.tz);
    },
    { rootMargin: '-45% 0px -54% 0px' },
  );
  sections.forEach((s) => io.observe(s));
  // At the close, the top bar marks Contact as where you are rather than the Journey.
  const contact = document.getElementById('contact');
  if (contact) {
    new IntersectionObserver(([en]) => document.documentElement.classList.toggle('at-contact', en.isIntersecting), {
      rootMargin: '-45% 0px -54% 0px',
    }).observe(contact);
  }
}

/**
 * A whole Entry or Selected Work row opens its Case, while its text stays selectable: a click anywhere on the
 * row follows the row's link unless it landed on another control or the reader was selecting text. Modified
 * clicks open a new tab, as a link would. Keyboard users reach the link itself.
 */
export function wireRowLinks() {
  const selecting = () => Boolean(String(getSelection() ?? '').trim());
  let pending = 0;
  document.addEventListener('click', (ev) => {
    if (ev.defaultPrevented || ev.button !== 0) return;
    const target = ev.target as Element;
    if (target.closest('a, button, summary, input, label, [data-notes]')) return;
    const row = target.closest<HTMLElement>('.entry, .row');
    const link = row?.querySelector<HTMLAnchorElement>('.entry__link, .row__link');
    if (!link) return;
    // A double or triple click selects a word or a line; it never opens the Case.
    clearTimeout(pending);
    if (ev.detail > 1 || selecting()) return;
    if (ev.metaKey || ev.ctrlKey || ev.shiftKey) {
      window.open(link.href, '_blank', 'noopener');
      return;
    }
    // A mouse click waits a moment, so the first click of a double click can still become a selection.
    if ((ev as PointerEvent).pointerType !== 'mouse') {
      link.click();
      return;
    }
    pending = window.setTimeout(() => !selecting() && link.click(), 240);
  });
}
