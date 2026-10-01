import type Lenis from 'lenis';
import { clockFormat } from './clock';
import { originFromState, type Origin } from '../lib/origin';
import { KEYS, session } from '../lib/store';
import { record, elapsed, READING_LINE } from './notes';

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
    // On a Case, the words of "Next case: <title>" are that title; "Back to the first case" has none.
    const title = fromCase
      ? a.querySelector<HTMLElement>('.case__next-text')
      : a.closest('.entry, .row')?.querySelector<HTMLElement>('.entry__text, .row__text');
    nameTravellingTitle(title ?? null, caseId);
    const row = a.closest('.entry, .row') ?? a;
    const r = row.getBoundingClientRect();
    session.set(KEYS.expandFrom, { top: r.top, right: innerWidth - r.right, bottom: innerHeight - r.bottom, left: r.left });
    // The Case's own name, never the words of the link that led to it ("Next case: …").
    record({ type: 'open', t: elapsed(), id: caseId, title: a.dataset.caseTitle ?? caseId });
  });
}

let travelling: HTMLElement | null = null;

/**
 * Name the one title that travels in a page transition. Leaving a Case for another Case, the heading has no
 * partner on the next page, so it gives up its name and leaves with the page; the next Case's title words
 * (if the link has them) are what travel.
 */
function nameTravellingTitle(el: HTMLElement | null, caseId: string) {
  if (travelling) travelling.style.viewTransitionName = '';
  travelling = el;
  if (el) el.style.viewTransitionName = `case-${caseId}`;
  const heading = document.querySelector<HTMLElement>('.case__title-text');
  if (heading) heading.style.viewTransitionName = 'none';
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

/**
 * Put the reader back where Return promised: scroll position, then focus on the Entry or Chapter heading.
 * Says whether it did, so nothing else moves focus away from where the reader was put back.
 */
export function restoreIfPending(): boolean {
  const pending = session.get<{ scrollY: number | null; focusId: string } | null>(KEYS.restore, null);
  session.remove(KEYS.restore);
  if (!pending) return false;
  if (pending.scrollY !== null) scrollTo({ top: pending.scrollY, behavior: 'instant' as ScrollBehavior });
  const el = document.getElementById(pending.focusId);
  if (!el) return true;
  el.focus({ preventScroll: true });
  const r = el.getBoundingClientRect();
  if (r.bottom < 0 || r.top > innerHeight) el.scrollIntoView({ block: 'center' });
  // The bar is back on a new page, though it had stepped away when the Entry was opened: an Entry that was
  // up there now sits under it. A Chapter heading keeps the landing the page gave it.
  if (el.tabIndex >= 0) clearOfChrome(el);
  return true;
}

/**
 * Back from a Case when the browser could not keep this page in its back-forward cache: it restores the scroll
 * but not focus. Focus returns to the link that opened that Case (its title, or a Case's "Next case" link) if it
 * is on screen, so the next Tab carries on from there instead of starting over at the top of the page.
 */
export function restoreFocusOnBack() {
  const caseId = document.querySelector<HTMLElement>('main[data-case]')?.dataset.case;
  if (caseId) addEventListener('pagehide', () => session.set(KEYS.lastCase, caseId));
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  const last = session.get<string | null>(KEYS.lastCase, null);
  if (nav?.type !== 'back_forward' || !last || last === caseId) return;
  const run = () =>
    requestAnimationFrame(() => {
      // The title that opened it, or on a Case, the "Next case" link that led on.
      const link = document.querySelector<HTMLElement>(
        `.entry__link[data-case-link="${last}"], .row__link[data-case-link="${last}"], .case__more a[data-case-link="${last}"]`,
      );
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
    // Back from the Case: the names were only for the way out (the way back is named in Base.astro).
    document.querySelectorAll<HTMLElement>('.case__title-text, .case__next-text').forEach((el) => el.style.removeProperty('view-transition-name'));
    document.documentElement.classList.remove('vt-folding');
  });
}

/**
 * Summaries and Research in Development expand in place. The text is in the HTML for readers without
 * scripts; scripts collapse it behind its button. A link to one of them (from the résumé, or Selected work)
 * opens it, so the address lands on the words, not on a title with its text folded away.
 */
export function wireDisclosures() {
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  type Disclosure = { btn: HTMLButtonElement; panel: HTMLElement };
  const all = [...document.querySelectorAll<HTMLButtonElement>('[data-more-toggle]')].flatMap((btn): Disclosure[] => {
    const panel = document.getElementById(btn.getAttribute('aria-controls')!);
    return panel ? [{ btn, panel }] : [];
  });
  const set = ({ btn, panel }: Disclosure, open: boolean, animate: boolean) => {
    btn.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    if (!open || !animate || reduced()) return;
    panel.animate(
      [
        { opacity: 0, clipPath: 'inset(0 0 100% 0)' },
        { opacity: 1, clipPath: 'inset(0 0 0% 0)' },
      ],
      { duration: 700, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    );
  };
  // Entry ids are plain words, so the fragment is compared as it is written.
  const atHash = ({ btn }: Disclosure) => btn.closest('.entry')?.id === location.hash.slice(1);
  all.forEach((d) => {
    set(d, false, false);
    d.btn.hidden = false;
    d.btn.addEventListener('click', () => {
      const open = d.btn.getAttribute('aria-expanded') !== 'true';
      set(d, open, true);
      // Folding what the address opened is kept with this history entry, so coming Back to it does not open it again.
      if (atHash(d)) history.replaceState({ ...(history.state ?? {}), hashOpen: open }, '');
    });
  });
  // An arriving page is not a reader choosing to open something, so it opens without the reveal.
  const openAtHash = () => {
    const d = all.find(atHash);
    if (d) set(d, history.state?.hashOpen ?? true, false);
  };
  openAtHash();
  addEventListener('hashchange', openAtHash);
}

/** Where a jump rests against its target: above it, clear of the top bar. */
const ANCHOR_OFFSET = -64;
/** A jump over more than this many screens fades the page out and in; a shorter one flies over it. */
const FAR_JUMP = 2.5;
const FADE_OUT_MS = 180;
const FADE_IN_MS = 350;
/** The `out` curve, as CSS (see motion.ts). */
const OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

let veil: HTMLElement | null = null;
let fade: Animation | null = null;
let fades = 0;

/**
 * Takes the page's paper to `to` (1 hides the page) over `ms`, from wherever it is now, and says when it is there.
 * Asking again in the middle replaces the fade, so a second jump never stacks on the first.
 */
function fadePage(to: 0 | 1, ms: number, done?: () => void) {
  if (!veil) {
    veil = document.createElement('div');
    veil.className = 'veil';
    veil.setAttribute('aria-hidden', 'true');
    document.body.append(veil);
  }
  const from = getComputedStyle(veil).opacity;
  veil.style.opacity = String(to);
  fade?.cancel();
  fade = veil.animate({ opacity: [from, String(to)] }, { duration: ms, easing: OUT });
  const mine = ++fades;
  let over = false;
  const finish = () => {
    if (over || mine !== fades) return;
    over = true;
    done?.();
  };
  fade.onfinish = finish;
  // The paper never stays up because an animation was cut short.
  setTimeout(finish, ms + 150);
}

/**
 * A jump over many screens would strobe every scene it crosses and spend the page's own arrival at its far end
 * while the page is still flying. So the page fades to paper, jumps while it is hidden, and fades back in. The
 * first frames after the jump are the heaviest of the visit; they pass under the paper.
 */
function fadeJump(land: () => void) {
  fadePage(1, FADE_OUT_MS, () => {
    // The page settles in the frames after a jump (the readout lays out its rows). Scroll anchoring would move the
    // landing by what it settles by, a pixel at most, which a flying jump never shows, since it sets its last
    // position after the page has settled.
    document.documentElement.style.overflowAnchor = 'none';
    land();
    const landed = fades;
    requestAnimationFrame(() => fades === landed && fadePage(0, FADE_IN_MS, () => document.documentElement.style.removeProperty('overflow-anchor')));
  });
}

/**
 * A jump within the page (Contact, a route item, Explore the journey) moves focus to where it lands, not only
 * the scroll: the section's heading takes focus, so the next Tab continues from there. A mouse click shows no
 * ring; a keyboard jump does. A short jump flies there on the smooth scroller; a long one fades (see fadeJump).
 */
export function wireAnchorJumps(restored: boolean) {
  // Focus goes where the jump lands: the target itself, or its own heading when that heading opens it (a Chapter,
  // the close). A wrapper without one (the Journey, the route index) takes focus itself, so the next Tab
  // continues from its start rather than skipping ahead to a heading further down.
  const focusable = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return null;
    let el = target;
    if (!target.matches('[tabindex], a[href], button')) {
      const heading = target.querySelector<HTMLElement>('h1[tabindex], h2[tabindex], h3[tabindex]');
      if (heading && heading.getBoundingClientRect().top - target.getBoundingClientRect().top < 320) el = heading;
      else {
        target.tabIndex = -1;
        target.classList.add('focus-target');
      }
    }
    return el;
  };
  const focusAt = (id: string) => {
    const el = focusable(id);
    if (el) requestAnimationFrame(() => el.focus({ preventScroll: true }));
  };
  /** Where a jump to this target comes to rest, as the smooth scroller works it out. */
  const restAt = (target: HTMLElement) => {
    const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    return Math.min(smooth!.limit, Math.max(0, target.getBoundingClientRect().top + scrollY - margin + ANCHOR_OFFSET));
  };
  document.addEventListener('click', (ev) => {
    const a = (ev.target as Element).closest<HTMLAnchorElement>('a[href*="#"]');
    if (!a || ev.defaultPrevented || a.origin !== location.origin || a.pathname !== location.pathname || a.hash.length < 2) return;
    const id = decodeURIComponent(a.hash.slice(1));
    const target = document.getElementById(id);
    // With no smooth scroller (reduced motion) the browser jumps, as it does for any link.
    if (!target || !smooth) {
      focusAt(id);
      return;
    }
    const plain = ev.button === 0 && !(ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey);
    // Where it rests is worked out now, as it is for a flying jump, so a jump lands where the page said it would.
    const rest = restAt(target);
    // A jump asked for while another is fading takes over the fade, so the page is never left half hidden.
    if (plain && !reducedMotion() && (Math.abs(rest - scrollY) > FAR_JUMP * innerHeight || fade?.playState === 'running')) {
      ev.preventDefault();
      fadeJump(() => {
        // The address and its history entry are made while the page is still where it was, so Back returns there.
        // (Setting the hash would jump natively first, and the smooth scroller would then measure from a stale place.)
        if (location.hash !== a.hash) history.pushState(null, '', a.hash);
        // Focus before the scroll: the top bar hides as the page moves down unless focus is inside it, and until
        // now it is on the link that was clicked.
        focusable(id)?.focus({ preventScroll: true });
        smooth!.scrollTo(rest, { immediate: true, force: true });
        document.dispatchEvent(new CustomEvent('jump:landed'));
      });
      return;
    }
    smooth.scrollTo(target, { offset: ANCHOR_OFFSET });
    focusAt(id);
  });
  // Arriving from another page with a fragment (Contact from a Case) lands focus there too, unless the reader is
  // being put back where they were (Return, or Back through history), where focus belongs to the Entry.
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (location.hash.length > 1 && !restored && nav?.type !== 'back_forward') focusAt(decodeURIComponent(location.hash.slice(1)));
}

/** The smooth scroller, once motion has started one: whatever else moves the page by itself goes through it. */
let smooth: Lenis | null = null;
export const setScroller = (lenis: Lenis) => (smooth = lenis);

/**
 * How far down the screen the fixed chrome reaches once it has settled: the top bar, and on small screens the
 * notes ticker (or the open sheet) under it. Read from the layout, not from where the bar is mid-slide.
 */
function chromeBottom() {
  const root = document.documentElement;
  const away = root.classList.contains('nav-hidden');
  const bar = document.querySelector<HTMLElement>('.top');
  const notes = document.querySelector<HTMLElement>('.notes');
  let bottom = bar && !away ? bar.offsetHeight : 0;
  if (notes && getComputedStyle(notes).position === 'fixed' && (!away || root.classList.contains('notes-open'))) {
    bottom = Math.max(bottom, parseFloat(getComputedStyle(notes).top) + notes.offsetHeight);
  }
  return bottom;
}

/**
 * One frame after focus lands, a control the bar or the ticker would cover is scrolled clear of them, at once.
 * The frame lets the browser finish its own scroll into view first.
 */
function clearOfChrome(el: HTMLElement) {
  requestAnimationFrame(() => {
    // Focus may have moved on already (tabbing quickly through a slow frame); it is the one that rests that matters.
    if (document.activeElement !== el || smooth?.isScrolling === 'smooth') return;
    const { top, bottom } = el.getBoundingClientRect();
    const under = chromeBottom();
    if (bottom <= 0 || top >= under) return;
    const by = top - under - 12;
    if (smooth) smooth.scrollTo(smooth.scroll + by, { immediate: true, force: true });
    else scrollBy({ top: by, behavior: 'instant' as ScrollBehavior });
  });
}

/** The top bar steps aside while reading down and returns when scrolling up. */
export function wireTopBar() {
  const root = document.documentElement;
  let last = scrollY;
  // A keyboard user tabbing into the bar or the notes brings them back, so focus never lands on something off screen.
  document.addEventListener('focusin', (ev) => {
    const el = ev.target as HTMLElement;
    if (el.closest('.top, .notes')) {
      root.classList.remove('nav-hidden');
      return;
    }
    // The browser brings a focused control into view without knowing about the fixed chrome, so one it leaves under
    // the bar or the ticker is moved clear of it, at once. Only controls the keyboard can reach: the heading a jump
    // lands on, and a jump still under way, keep the landing the page gave them.
    if (el.tabIndex < 0 || el.closest('.skip') || !el.matches(':focus-visible')) return;
    clearOfChrome(el);
  });
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
 * The top bar's place and clock follow the scene being read, so scrolling back up always shows where in the journey
 * you are: a Chapter's place, and inside a Time Shift the place it is flying to. Before the first Chapter and after
 * the last it is New York, where Kaushik is now.
 */
export function wireTopWhere() {
  const where = document.querySelector<HTMLElement>('[data-top-where]');
  const scenes = [...document.querySelectorAll<HTMLElement>('[data-chapter-section][data-tz], [data-shift]')];
  if (!where || !scenes.length) return;
  const place = where.querySelector<HTMLElement>('[data-top-place]')!;
  const clock = where.querySelector<HTMLElement>('[data-clock]')!;
  const home = { name: place.textContent ?? '', tz: clock.dataset.clock! };
  const show = (name: string, tz: string) => {
    if (clock.dataset.clock === tz && place.textContent === name) return;
    place.textContent = name;
    clock.dataset.clock = tz;
    clock.textContent = clockFormat(tz).format(new Date());
  };
  // The scene the reading line has reached last is the one being read, so the space between a Chapter and the Time
  // Shift after it still belongs to the Chapter. The observer says when the line crosses a scene's edge.
  const last = scenes[scenes.length - 1];
  const read = (line: number) => {
    const reached = scenes.filter((s) => s.getBoundingClientRect().top <= line).pop();
    if (!reached || (reached === last && last.getBoundingClientRect().bottom < line)) {
      show(home.name, home.tz);
      return;
    }
    // A Chapter names its own place, a Time Shift the place it flies to.
    const { place: name, tz, to, toTz } = reached.dataset;
    show(name ?? to!, tz ?? toTz!);
  };
  const io = new IntersectionObserver((entries) => read(entries[0].rootBounds!.bottom), { rootMargin: READING_LINE });
  scenes.forEach((s) => io.observe(s));
  // At the close, the top bar marks Contact as where you are rather than the Journey.
  const contact = document.getElementById('contact');
  if (contact) {
    new IntersectionObserver(([en]) => document.documentElement.classList.toggle('at-contact', en.isIntersecting), {
      rootMargin: READING_LINE,
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
