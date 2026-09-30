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
    // The row that was clicked becomes the Case page: the next page opens out of its outline.
    const row = a.closest('.entry, .row') ?? a;
    const r = row.getBoundingClientRect();
    session.set(KEYS.expandFrom, { top: r.top, right: innerWidth - r.right, bottom: innerHeight - r.bottom, left: r.left });
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
}

/**
 * A whole Entry or Selected Work row opens its Case, while its text stays selectable: a click anywhere on the
 * row follows the row's link unless it landed on another control or the reader was selecting text. Modified
 * clicks open a new tab, as a link would. Keyboard users reach the link itself.
 */
export function wireRowLinks() {
  document.addEventListener('click', (ev) => {
    if (ev.defaultPrevented || ev.button !== 0) return;
    const target = ev.target as Element;
    if (target.closest('a, button, summary, input, label, [data-notes]')) return;
    const row = target.closest<HTMLElement>('.entry, .row');
    const link = row?.querySelector<HTMLAnchorElement>('.entry__link, .row__link');
    if (!link) return;
    if (String(getSelection() ?? '').trim()) return;
    if (ev.metaKey || ev.ctrlKey || ev.shiftKey) {
      window.open(link.href, '_blank', 'noopener');
      return;
    }
    link.click();
  });
}
