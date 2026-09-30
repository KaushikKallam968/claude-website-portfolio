import { createObservation, type Note, type RawEvent } from '../lib/observe';

/**
 * Wires the observation layer to the page. Raw events are kept in sessionStorage only, and replayed on
 * each page so the notes and the closing readout survive a trip into a Case and back. Nothing is sent.
 */
const KEY = 'kk:events';
const START = 'kk:start';
const MAX_EVENTS = 400;
const VISIBLE_NOTES = 7;

const store = {
  get<T>(k: string, fallback: T): T {
    try {
      const v = sessionStorage.getItem(k);
      return v ? (JSON.parse(v) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(k: string, v: unknown) {
    try {
      sessionStorage.setItem(k, JSON.stringify(v));
    } catch {
      /* private mode: notes simply do not persist */
    }
  },
};

const start: number = store.get(START, 0) || Date.now();
store.set(START, start);
const now = () => Date.now() - start;

const events: RawEvent[] = store.get(KEY, []);
const obs = createObservation();
const notes: Note[] = [];
for (const e of events) {
  const n = obs.record(e);
  if (n) notes.push(n);
}

let listEl: HTMLOListElement | null = null;
let countEl: HTMLElement | null = null;

const clock = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}.${Math.floor((ms % 1000) / 100)}`;
};

function noteEl(n: Note) {
  const li = document.createElement('li');
  li.className = `note note--${n.quality}`;
  const t = document.createElement('span');
  t.className = 'note__t num';
  t.textContent = clock(n.t);
  const shows = document.createElement('span');
  shows.className = 'note__shows';
  shows.textContent = n.shows;
  const cannot = document.createElement('span');
  cannot.className = 'note__cannot';
  cannot.textContent = n.cannotShow;
  li.append(t, shows, cannot);
  return li;
}

function render(fresh?: Note) {
  if (!listEl) return;
  if (countEl) countEl.textContent = String(notes.length);
  if (fresh) {
    const li = noteEl(fresh);
    li.classList.add('note--fresh');
    listEl.prepend(li);
    requestAnimationFrame(() => requestAnimationFrame(() => li.classList.remove('note--fresh')));
    while (listEl.children.length > VISIBLE_NOTES) listEl.lastElementChild?.remove();
    return;
  }
  listEl.replaceChildren(...notes.slice(-VISIBLE_NOTES).reverse().map(noteEl));
}

export function record(e: RawEvent) {
  events.push(e);
  if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);
  store.set(KEY, events);
  const n = obs.record(e);
  if (n) {
    notes.push(n);
    render(n);
  }
  return n;
}

export const readout = () => obs.readout(now());
export const elapsed = now;

function wirePointing() {
  const seen = new Map<string, number>();
  document.addEventListener('pointerover', (ev) => {
    if ((ev as PointerEvent).pointerType === 'touch') return;
    const el = (ev.target as Element).closest<HTMLElement>('[data-observe]');
    if (!el) return;
    const tag = el.dataset.observe!;
    const last = seen.get(tag) ?? -Infinity;
    if (now() - last < 20000) return; // one note per element per 20 s keeps the column readable
    seen.set(tag, now());
    record({ type: 'point', t: now(), tag, label: el.dataset.observeLabel ?? el.textContent?.trim() ?? tag });
  });
  // A click that lands on nothing interactive is a coverage gap: the page recorded it but can't say what it was.
  let lastGap = -Infinity;
  document.addEventListener('click', (ev) => {
    const target = ev.target as Element;
    if (target.closest('a, button, input, label, summary, [data-observe], [data-notes]')) return;
    if (now() - lastGap < 4000) return;
    lastGap = now();
    record({ type: 'press', t: now(), tag: null });
  });
}

function wireDepth() {
  let raf = 0;
  addEventListener(
    'scroll',
    () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        if (max > 0) record({ type: 'depth', t: now(), fraction: scrollY / max });
      });
    },
    { passive: true },
  );
}

function wireIdle() {
  let lastActive = now();
  const wake = () => {
    const idle = now() - lastActive;
    if (idle > 5000) record({ type: 'idle', t: now(), ms: idle });
    lastActive = now();
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
        if (en.isIntersecting && active !== id) {
          if (active) record({ type: 'leave', t: now(), id: active });
          active = id;
          record({ type: 'enter', t: now(), id, title: el.dataset.chapterTitle ?? id });
          document.querySelectorAll('.route__item').forEach((a) => a.setAttribute('aria-current', String(a.getAttribute('href') === `#${id}`)));
        }
      }
    },
    { rootMargin: '-45% 0px -54% 0px' },
  );
  sections.forEach((s) => io.observe(s));
  addEventListener('pagehide', () => {
    if (active) record({ type: 'leave', t: now(), id: active });
  });
}

function wireToggle() {
  const btn = document.querySelector<HTMLButtonElement>('[data-notes-toggle]');
  if (!btn) return;
  const sync = () => {
    const off = document.documentElement.classList.contains('notes-off');
    btn.textContent = off ? 'Show' : 'Hide';
    btn.setAttribute('aria-pressed', String(off));
  };
  sync();
  btn.addEventListener('click', () => {
    document.documentElement.classList.toggle('notes-off');
    try {
      sessionStorage.setItem('kk:notes', document.documentElement.classList.contains('notes-off') ? 'off' : 'on');
    } catch {
      /* ignore */
    }
    sync();
  });
}

export function startNotes() {
  listEl = document.querySelector('[data-notes-list]');
  countEl = document.querySelector('[data-notes-count]');
  if (!events.some((e) => e.type === 'enter') && !notes.length) {
    // The first note: arriving is the only thing the page knows for certain.
    const first: Note = {
      t: 0,
      event: 'point',
      tag: 'page.arrive',
      quality: 'tagged',
      shows: 'You arrived.',
      cannotShow: 'From where, or what you hoped to find.',
    };
    notes.push(first);
  }
  render();
  wireToggle();
  wirePointing();
  wireDepth();
  wireIdle();
  wireChapters();
}
