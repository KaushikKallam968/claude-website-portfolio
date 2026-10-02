/**
 * The notes' clock keeps the time the page was in sight, not the time it was open. A tab put away, or the site
 * left and come back to, is not reading, so each such stretch is set aside and every duration built on the clock
 * (a Chapter's time, a pause, the readout's total) leaves it out without knowing it happened.
 */

/**
 * A gap this short between one page hiding and the next showing is a link followed, not the reader leaving: a page
 * hides as it hands over to the next, which starts within a moment. Only a longer gap is an absence.
 */
export const NAVIGATION_GAP_MS = 2000;

/** What the visit keeps between pages: when the last page went out of sight (null while one is in sight), and the time set aside so far. */
export interface AwayState {
  hiddenAt: number | null;
  awayMs: number;
}

/** Where that state is kept (sessionStorage). Reading gives the fallback when nothing can be read back. */
export interface AwayStore {
  read(fallback: AwayState): AwayState;
  write(state: AwayState): void;
}

export function createVisibleClock(startedAt: number, store: AwayStore, now: () => number = () => Date.now()) {
  // What this page last knew, so a page whose storage is blocked still sets aside its own absences.
  let known = store.read({ hiddenAt: null, awayMs: 0 });
  const keep = (state: AwayState) => {
    known = state;
    store.write(state);
  };

  return {
    /** Milliseconds since the visit began, less every stretch the page was out of sight. */
    elapsed: () => now() - startedAt - known.awayMs,

    /** The page is going out of sight (a hidden tab, a page being left); the latest moment it said so is kept. */
    hide() {
      keep({ ...store.read(known), hiddenAt: now() });
    },

    /**
     * The page is in sight again: a tab shown, a page restored from the back-forward cache, or the next page of the
     * visit loading. Returns how long it was gone, or 0 for a hand-over between pages or when it had not gone.
     * It reads the store first, because the pages visited meanwhile may have set time aside that this one has not seen.
     */
    back(): number {
      const saved = store.read(known);
      const gap = saved.hiddenAt === null ? 0 : now() - saved.hiddenAt;
      const away = gap > NAVIGATION_GAP_MS ? gap : 0;
      keep({ hiddenAt: null, awayMs: saved.awayMs + away });
      return away;
    },
  };
}
