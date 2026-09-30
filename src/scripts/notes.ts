import { createObservation, type Note, type RawEvent } from '../lib/observe';
import { formatElapsed } from '../lib/format';
import { KEYS, session } from '../lib/store';
import { createHoverIntent } from '../lib/hover';

/**
 * Wires the observation layer to the page. Events are kept in sessionStorage only and replayed on each
 * page, so the notes and the closing readout survive a trip into a Case and back. Nothing is sent.
 */
const MAX_EVENTS = 400;
const VISIBLE_NOTES = 7;

const sessionStart: number = session.get(KEYS.sessionStart, 0) || Date.now();
session.set(KEYS.sessionStart, sessionStart);

/** Milliseconds since this visit began, on the notes' clock. */
export const elapsed = () => Date.now() - sessionStart;

/** What this page is called in a note, since notes are read again on later pages. */
const pageName = () => document.querySelector<HTMLElement>('[data-page-name]')?.dataset.pageName ?? 'this page';

const savedEvents: RawEvent[] = session.get(KEYS.events, []);
const observation = createObservation();
const notes: Note[] = [];
for (const e of savedEvents) {
  const n = observation.record(e);
  if (n) notes.push(n);
}

let listEl: HTMLOListElement | null = null;
let countEl: HTMLElement | null = null;
let latestEl: HTMLElement | null = null;

function noteElement(n: Note) {
  const li = document.createElement('li');
  li.className = `note note--${n.quality}`;
  const t = document.createElement('span');
  t.className = 'note__t num';
  t.textContent = formatElapsed(n.t);
  const shows = document.createElement('span');
  shows.className = 'note__shows';
  shows.textContent = n.shows;
  const cannot = document.createElement('span');
  cannot.className = 'note__cannot';
  cannot.textContent = n.cannotShow;
  li.append(t, shows, cannot);
  return li;
}

/** The list shows the latest notes; the count covers the whole visit, so the list says what it leaves out. */
function renderEarlier() {
  if (!listEl) return;
  listEl.querySelector('.notes__earlier')?.remove();
  const hidden = notes.length - VISIBLE_NOTES;
  if (hidden <= 0) return;
  const li = document.createElement('li');
  li.className = 'notes__earlier';
  li.textContent = `${hidden} earlier ${hidden === 1 ? 'note' : 'notes'} not shown.`;
  listEl.append(li);
}

function render(fresh?: Note) {
  if (!listEl) return;
  if (countEl) countEl.textContent = String(notes.length);
  const last = fresh ?? notes[notes.length - 1];
  if (latestEl && last) latestEl.textContent = last.shows;
  if (fresh) {
    const li = noteElement(fresh);
    li.classList.add('note--fresh');
    listEl.prepend(li);
    requestAnimationFrame(() => requestAnimationFrame(() => li.classList.remove('note--fresh')));
    listEl.querySelectorAll('.note').forEach((n, i) => i >= VISIBLE_NOTES && n.remove());
    renderEarlier();
    peek();
    return;
  }
  listEl.replaceChildren(...notes.slice(-VISIBLE_NOTES).reverse().map(noteElement));
  renderEarlier();
}

/** State changes always persist; moment-to-moment signals persist only when they produced a note. */
const persistsAlways = (e: RawEvent) => e.type === 'enter' || e.type === 'leave' || e.type === 'open';

export function record(e: RawEvent) {
  const n = observation.record(e);
  if (n || persistsAlways(e)) {
    savedEvents.push(e);
    if (savedEvents.length > MAX_EVENTS) savedEvents.splice(0, savedEvents.length - MAX_EVENTS);
    session.set(KEYS.events, savedEvents);
  }
  if (n) {
    notes.push(n);
    render(n);
  }
  return n;
}

export const readout = () => observation.readout(elapsed());

function wirePointing() {
  const noted = new Set<string>();
  const hover = createHoverIntent();
  addEventListener('pointermove', (ev) => hover.moved(ev.clientX, ev.clientY), { passive: true });
  addEventListener('scroll', () => hover.scrolled(), { passive: true });
  document.addEventListener('pointerover', (ev) => {
    if ((ev as PointerEvent).pointerType === 'touch') return;
    // Content scrolling under a resting pointer is not pointing.
    if (!hover.counts(ev.clientX, ev.clientY)) return;
    const el = (ev.target as Element).closest<HTMLElement>('[data-observe]');
    if (!el) return;
    const tag = el.dataset.observe!;
    // Pointing at a control is noted once per page: pointing again adds nothing a reader could learn from.
    if (noted.has(tag)) return;
    noted.add(tag);
    record({
      type: 'point',
      t: elapsed(),
      tag,
      label: el.dataset.observeLabel ?? el.textContent?.trim() ?? tag,
      pageName: pageName(),
      cannotShow: el.dataset.observeCannot,
    });
  });
  // A click that lands on nothing interactive is a coverage gap: recorded, but impossible to interpret.
  let lastGap = -Infinity;
  document.addEventListener('click', (ev) => {
    // A row opens its Case from anywhere on it, so a click there is not a gap.
    if ((ev.target as Element).closest('a, button, input, label, summary, [data-observe], [data-notes], .entry, .row')) return;
    if (elapsed() - lastGap < 4000) return;
    lastGap = elapsed();
    record({ type: 'press', t: elapsed(), tag: null });
  });
}

function wireDepth() {
  let frame = 0;
  const page = location.pathname;
  // A page that marks its own parts (a Case) is noted by those parts, in its own words; generic quarters would
  // only repeat what every page says. Its end is still noted.
  const marked = document.querySelector('[data-observe-reach]') !== null;
  addEventListener(
    'scroll',
    () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        if (max <= 0) return;
        const fraction = scrollY / max;
        if (!marked || fraction >= 0.98) record({ type: 'depth', t: elapsed(), page, pageName: pageName(), fraction });
      });
    },
    { passive: true },
  );
}

/** A marked part of the page is reached when its top crosses the middle of the screen. */
function wireReach() {
  const parts = document.querySelectorAll<HTMLElement>('[data-observe-reach]');
  if (!parts.length) return;
  const page = location.pathname;
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target as HTMLElement;
        io.unobserve(el);
        record({ type: 'reach', t: elapsed(), page, id: el.dataset.observeReach!, shows: el.dataset.observeShows!, cannotShow: el.dataset.observeCannot! });
      }),
    { rootMargin: '0px 0px -50% 0px' },
  );
  parts.forEach((p) => io.observe(p));
}

function wireIdle() {
  let lastActive = elapsed();
  const wake = () => {
    record({ type: 'idle', t: elapsed(), ms: elapsed() - lastActive }); // short pauses produce no note
    lastActive = elapsed();
  };
  for (const type of ['pointermove', 'keydown', 'wheel', 'touchstart', 'scroll']) addEventListener(type, wake, { passive: true });
}

function wireChapters() {
  const sections = document.querySelectorAll<HTMLElement>('[data-chapter-section]');
  if (!sections.length) return;
  let active: string | null = null;
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        const el = en.target as HTMLElement;
        const id = el.dataset.chapterSection!;
        if (!en.isIntersecting || active === id) continue;
        if (active) record({ type: 'leave', t: elapsed(), id: active });
        active = id;
        record({ type: 'enter', t: elapsed(), id, title: el.dataset.chapterTitle ?? id });
        document.querySelectorAll('.route__item').forEach((a) => a.setAttribute('aria-current', String(a.getAttribute('href') === `#${id}`)));
      }
    },
    { rootMargin: '-45% 0px -54% 0px' },
  );
  sections.forEach((s) => io.observe(s));
  addEventListener('pagehide', () => {
    if (active) record({ type: 'leave', t: elapsed(), id: active });
  });
}

const compact = () => matchMedia('(max-width: 1100px)').matches;

/** On small screens the ticker under the top bar shows the latest note; a new one slides in. */
let peekTimer = 0;
function peek() {
  const root = document.documentElement;
  if (!compact() || root.classList.contains('notes-open')) return;
  root.classList.remove('notes-peek');
  void root.offsetWidth; // restart the animation for back-to-back notes
  root.classList.add('notes-peek');
  clearTimeout(peekTimer);
  peekTimer = window.setTimeout(() => root.classList.remove('notes-peek'), 700);
}

function wireToggle() {
  const btn = document.querySelector<HTMLButtonElement>('[data-notes-toggle]');
  if (!btn) return;
  const root = document.documentElement;
  const sync = () => {
    const open = compact() ? root.classList.contains('notes-open') : !root.classList.contains('notes-off');
    btn.textContent = open ? 'Hide' : 'Show';
    btn.setAttribute('aria-expanded', String(open));
  };
  sync();
  matchMedia('(max-width: 1100px)').addEventListener('change', sync);
  let openedAt = 0;
  btn.addEventListener('click', () => {
    root.classList.remove('notes-peek');
    if (compact()) {
      root.classList.toggle('notes-open');
      openedAt = scrollY;
    } else {
      root.classList.toggle('notes-off');
      session.set(KEYS.notesHidden, root.classList.contains('notes-off'));
    }
    sync();
  });
  // On small screens the open sheet covers the page, so it gets out of the way: reading on (scrolling),
  // tapping outside it, or Escape closes it. Focus inside it returns to the toggle.
  const isOpen = () => compact() && root.classList.contains('notes-open');
  const close = () => {
    const notes = btn.closest('.notes');
    if (notes?.contains(document.activeElement) && document.activeElement !== btn) btn.focus({ preventScroll: true });
    root.classList.remove('notes-open');
    sync();
  };
  addEventListener('scroll', () => isOpen() && Math.abs(scrollY - openedAt) > 48 && close(), { passive: true });
  document.addEventListener('pointerdown', (e) => {
    if (!isOpen() || (e.target as Element).closest('.notes, .lens-bar')) return;
    close();
    // The tap that dismisses the sheet only dismisses it: the click it produces must not open what was under it.
    const swallow = (ev: Event) => {
      ev.preventDefault();
      ev.stopPropagation();
    };
    document.addEventListener('click', swallow, { capture: true, once: true });
    setTimeout(() => document.removeEventListener('click', swallow, { capture: true }), 600);
  });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen() && !root.classList.contains('lens-on')) close();
  });
  document.addEventListener('lens:on', () => isOpen() && close());
}

export function startNotes() {
  listEl = document.querySelector('[data-notes-list]');
  countEl = document.querySelector('[data-notes-count]');
  latestEl = document.querySelector('[data-notes-latest]');
  render();
  // The first note of a visit: arriving is the only thing the page knows for certain. It is kept like any other
  // note, so it is still there on the pages that follow.
  if (!savedEvents.length) record({ type: 'arrive', t: elapsed(), page: location.pathname, pageName: pageName() });
  // A Case reached any way at all (a shared link included) counts as opened, not only one clicked to.
  const caseMain = document.querySelector<HTMLElement>('main[data-case]');
  if (caseMain) record({ type: 'open', t: elapsed(), id: caseMain.dataset.case!, title: caseMain.dataset.pageName ?? caseMain.dataset.case! });
  // The next page need not explain the notes again. On this one, the explanation folds away while the first
  // map scene the reader scrolls into has the margin faded out, so the change is never seen happening.
  session.set(KEYS.notesKnown, true);
  const root = document.documentElement;
  if (!root.classList.contains('notes-known')) {
    // Only a scene the reader has scrolled into counts: the arrival also fades the margin, and folding then
    // would mean a first-time visitor never sees what the notes are.
    const mo = new MutationObserver(() => {
      if (!root.classList.contains('in-scene') || scrollY < innerHeight * 0.6) return;
      root.classList.add('notes-known');
      mo.disconnect();
    });
    mo.observe(root, { attributes: true, attributeFilter: ['class'] });
  }
  wireToggle();
  wirePointing();
  wireDepth();
  wireReach();
  wireIdle();
  wireChapters();
}
