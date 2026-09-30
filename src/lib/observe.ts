/**
 * The observation layer: turns what a visitor does on the page into short, honest notes.
 * Everything stays in the browser. Each note says what the event shows and what it cannot.
 */
import { sentence } from './format';

export type RawEvent =
  | { type: 'point'; t: number; tag: string; label: string; pageName?: string; cannotShow?: string }
  | { type: 'press'; t: number; tag: string | null; label?: string }
  /** Text copied from inside a tagged control (the email address): noted once per tag on each page. */
  | { type: 'copy'; t: number; page: string; tag: string; label: string; cannotShow?: string }
  /** The place the device's clock keeps time for; the zone itself never enters the note. */
  | { type: 'clock'; t: number; place: string }
  /** Where the visit began; its name, because the note is read on later pages too. */
  | { type: 'arrive'; t: number; page: string; pageName: string }
  | { type: 'depth'; t: number; page: string; pageName?: string; fraction: number }
  /** Reaching a part of a page that says, in its own words, what reaching it shows and can't. */
  | { type: 'reach'; t: number; page: string; id: string; shows: string; cannotShow: string }
  | { type: 'idle'; t: number; ms: number }
  | { type: 'enter'; t: number; id: string; title: string }
  | { type: 'leave'; t: number; id: string }
  | { type: 'open'; t: number; id: string; title: string };

export interface Note {
  t: number;
  event: RawEvent['type'];
  tag: string | null;
  quality: 'tagged' | 'untagged';
  shows: string;
  cannotShow: string;
}

// Each names its page: notes are replayed on every later page, where "this page" would be untrue.
const QUARTERS = [
  { at: 0.25, shows: (p: string) => sentence(`You scrolled past a quarter of ${p}`), cannotShow: 'Whether you read it or skimmed it.' },
  { at: 0.5, shows: (p: string) => sentence(`You scrolled past half of ${p}`), cannotShow: 'Whether you were looking for something in particular.' },
  { at: 0.75, shows: (p: string) => sentence(`You scrolled past three quarters of ${p}`), cannotShow: 'Whether you are reading closely or heading for the end.' },
  { at: 0.98, shows: (p: string) => sentence(`You reached the end of ${p}`), cannotShow: 'Whether you read everything on the way down.' },
];

export interface Readout {
  totalMs: number;
  chapters: { id: string; title: string; ms: number }[];
  casesOpened: { id: string; title: string }[];
}

/** A pause shorter than this is just reading rhythm, not something worth noting. */
const IDLE_WORTH_NOTING_MS = 5000;

export function createObservation() {
  const quartersSeen = new Map<string, number>();
  const reached = new Set<string>();
  const copied = new Set<string>();
  let clockNoted = false;
  const chapters = new Map<string, { title: string; ms: number }>();
  let current: { id: string; since: number } | null = null;
  const opened = new Map<string, string>();
  let arrivedAt: string | null = null;

  const close = (t: number) => {
    if (!current) return;
    const c = chapters.get(current.id);
    if (c) c.ms += t - current.since;
    current = null;
  };

  return {
    record(e: RawEvent): Note | null {
      switch (e.type) {
        case 'point':
          return {
            t: e.t,
            event: 'point',
            tag: e.tag,
            quality: 'tagged',
            shows: sentence(`You pointed at ${e.label}${e.pageName ? ` on ${e.pageName}` : ''}`),
            cannotShow: e.cannotShow ?? 'Whether you meant to open it.',
          };
        case 'press':
          if (e.tag === null) {
            return {
              t: e.t,
              event: 'press',
              tag: null,
              quality: 'untagged',
              shows: 'You clicked something I never tagged.',
              cannotShow: 'What it was. That is a coverage gap.',
            };
          }
          return null;
        case 'copy': {
          const key = `${e.page}#${e.tag}`;
          if (copied.has(key)) return null;
          copied.add(key);
          return {
            t: e.t,
            event: 'copy',
            tag: e.tag,
            quality: 'tagged',
            shows: sentence(`You copied ${e.label}`),
            cannotShow: e.cannotShow ?? 'What you will do with it.',
          };
        }
        case 'clock':
          // Said once per visit: the notes are replayed on every later page, and the clock has not changed.
          if (clockNoted) return null;
          clockNoted = true;
          return { t: e.t, event: 'clock', tag: null, quality: 'tagged', shows: `Your device keeps ${e.place} time.`, cannotShow: 'Whether you’re there, or only your clock is.' };
        case 'depth': {
          let seen = quartersSeen.get(e.page) ?? 0;
          const next = QUARTERS[seen];
          if (!next || e.fraction < next.at) return null;
          // Jumps past several quarters at once report the deepest one reached.
          while (seen < QUARTERS.length && e.fraction >= QUARTERS[seen].at) seen++;
          quartersSeen.set(e.page, seen);
          return {
            t: e.t,
            event: 'depth',
            tag: null,
            quality: 'tagged',
            shows: QUARTERS[seen - 1].shows(e.pageName ?? 'this page'),
            cannotShow: QUARTERS[seen - 1].cannotShow,
          };
        }
        case 'arrive':
          arrivedAt = e.pageName;
          return { t: e.t, event: 'arrive', tag: 'page.arrive', quality: 'tagged', shows: sentence(`You arrived at ${e.pageName}`), cannotShow: 'From where, or what you hoped to find.' };
        case 'reach': {
          const key = `${e.page}#${e.id}`;
          if (reached.has(key)) return null;
          reached.add(key);
          return { t: e.t, event: 'reach', tag: null, quality: 'tagged', shows: e.shows, cannotShow: e.cannotShow };
        }
        case 'idle':
          if (e.ms < IDLE_WORTH_NOTING_MS) return null;
          return {
            t: e.t,
            event: 'idle',
            tag: null,
            quality: 'tagged',
            shows: `The page sat still for ${Math.round(e.ms / 1000)} seconds.`,
            cannotShow: 'Whether you were reading, thinking or away.',
          };
        case 'enter':
          close(e.t);
          if (!chapters.has(e.id)) chapters.set(e.id, { title: e.title, ms: 0 });
          current = { id: e.id, since: e.t };
          return null;
        case 'leave':
          if (current?.id === e.id) close(e.t);
          return null;
        case 'open': {
          if (opened.has(e.id)) return null;
          opened.set(e.id, e.title);
          // A visit that began on this Case has already said so in its arrival note.
          if (e.title === arrivedAt) return null;
          return { t: e.t, event: 'open', tag: null, quality: 'tagged', shows: sentence(`You opened ${e.title}`), cannotShow: 'Whether it was what you came for.' };
        }
      }
    },

    readout(t: number): Readout {
      const open = current;
      const chapterList = [...chapters].map(([id, c]) => ({
        id,
        title: c.title,
        ms: c.ms + (open?.id === id ? t - open.since : 0),
      }));
      return {
        totalMs: t,
        chapters: chapterList,
        casesOpened: [...opened].map(([id, title]) => ({ id, title })),
      };
    },
  };
}
