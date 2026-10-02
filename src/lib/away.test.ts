import { describe, expect, it } from 'vitest';
import { NAVIGATION_GAP_MS, createVisibleClock, type AwayState, type AwayStore } from './away';
import { createObservation } from './observe';

/** A store that keeps what it is given, as sessionStorage does between pages. */
const sessionLike = (): AwayStore => {
  let saved: AwayState | null = null;
  return { read: (fallback) => saved ?? fallback, write: (state) => (saved = state) };
};
/** Storage that is blocked: nothing is kept and nothing is read back. */
const blocked: AwayStore = { read: (fallback) => fallback, write: () => {} };

describe('the notes’ clock', () => {
  it('runs with the wall clock while the page stays in sight', () => {
    let at = 1_000;
    const clock = createVisibleClock(1_000, sessionLike(), () => at);
    expect(clock.elapsed()).toBe(0);
    at = 31_500;
    expect(clock.elapsed()).toBe(30_500);
  });

  it('leaves out a stretch the page was hidden, so the next Chapter leave excludes it', () => {
    let at = 0;
    const clock = createVisibleClock(0, sessionLike(), () => at);
    const obs = createObservation();
    at = 10_000;
    obs.record({ type: 'enter', t: clock.elapsed(), id: 'nyc', title: 'New York' });
    // Thirty seconds in the Chapter, then three minutes in another tab, then ten more seconds back.
    at = 40_000;
    clock.hide();
    at = 220_000;
    expect(clock.back()).toBe(180_000);
    at = 230_000;
    obs.record({ type: 'leave', t: clock.elapsed(), id: 'nyc' });
    const r = obs.readout(clock.elapsed());
    expect(r.chapters).toEqual([{ id: 'nyc', title: 'New York', ms: 40_000 }]);
    expect(r.totalMs).toBe(50_000);
  });

  it('closes a Chapter still open at the readout without the time it was hidden', () => {
    let at = 0;
    const clock = createVisibleClock(0, sessionLike(), () => at);
    const obs = createObservation();
    obs.record({ type: 'enter', t: clock.elapsed(), id: 'texas-career', title: 'Texas: career' });
    at = 20_000;
    clock.hide();
    at = 620_000;
    clock.back();
    at = 625_000;
    expect(obs.readout(clock.elapsed()).chapters).toEqual([{ id: 'texas-career', title: 'Texas: career', ms: 25_000 }]);
  });

  it('changes nothing for an absence no longer than the gap between two pages of the site', () => {
    expect(NAVIGATION_GAP_MS).toBe(2000);
    let at = 0;
    const clock = createVisibleClock(0, sessionLike(), () => at);
    at = 20_000;
    clock.hide();
    at = 21_500;
    expect(clock.back()).toBe(0);
    at = 30_000;
    expect(clock.elapsed()).toBe(30_000);
    // Exactly the gap is still a hand-over; a moment more is an absence.
    clock.hide();
    at = 32_000;
    expect(clock.back()).toBe(0);
    clock.hide();
    at = 34_001;
    expect(clock.back()).toBe(2_001);
    expect(clock.elapsed()).toBe(32_000);
  });

  it('adds up every absence of the visit', () => {
    let at = 0;
    const clock = createVisibleClock(0, sessionLike(), () => at);
    at = 10_000;
    clock.hide();
    at = 70_000;
    clock.back();
    at = 100_000;
    clock.hide();
    at = 400_000;
    clock.back();
    at = 410_000;
    // 410 s on the wall, less 60 s and 300 s away.
    expect(clock.elapsed()).toBe(50_000);
  });

  it('has nothing to add when the page comes back without having gone', () => {
    let at = 5_000;
    const clock = createVisibleClock(0, sessionLike(), () => at);
    expect(clock.back()).toBe(0);
    at = 9_000;
    expect(clock.elapsed()).toBe(9_000);
  });

  it('counts an absence once, though pagehide and visibilitychange both say the page returned', () => {
    let at = 0;
    const clock = createVisibleClock(0, sessionLike(), () => at);
    clock.hide();
    at = 90_000;
    expect(clock.back()).toBe(90_000);
    expect(clock.back()).toBe(0);
    expect(clock.elapsed()).toBe(0);
  });

  it('holds still while the page is out of sight, so what is stamped then gets the moment it left', () => {
    let at = 0;
    const clock = createVisibleClock(0, sessionLike(), () => at);
    at = 40_000;
    clock.hide();
    at = 100_000;
    expect(clock.elapsed()).toBe(40_000);
    at = 640_000;
    expect(clock.elapsed()).toBe(40_000);
  });

  it('keeps the earliest moment the page went out of sight, so a later pagehide does not shorten the absence', () => {
    const store = sessionLike();
    let at = 0;
    const closing = createVisibleClock(0, store, () => at);
    // The tab goes to the background at 40 s, and is closed from the tab strip ten minutes later.
    at = 40_000;
    closing.hide();
    at = 640_000;
    closing.hide();
    // Session restore opens it again at 700 s.
    at = 700_000;
    const restored = createVisibleClock(0, store, () => at);
    expect(restored.back()).toBe(660_000);
    expect(restored.elapsed()).toBe(40_000);
  });

  it('gives a Chapter left while the page is out of sight the time it was in sight, not the hidden time', () => {
    const store = sessionLike();
    let at = 0;
    const closing = createVisibleClock(0, store, () => at);
    const obs = createObservation();
    at = 10_000;
    obs.record({ type: 'enter', t: closing.elapsed(), id: 'nyc', title: 'New York' });
    at = 40_000;
    closing.hide();
    // The tab is closed at 640 s: pagehide stamps the leave, then hides.
    at = 640_000;
    obs.record({ type: 'leave', t: closing.elapsed(), id: 'nyc' });
    closing.hide();
    at = 700_000;
    const restored = createVisibleClock(0, store, () => at);
    restored.back();
    const r = obs.readout(restored.elapsed());
    expect(r.chapters).toEqual([{ id: 'nyc', title: 'New York', ms: 30_000 }]);
    expect(r.totalMs).toBe(40_000);
  });
});

describe('the notes’ clock across pages', () => {
  it('does not count the moment between a page hiding and the next page opening', () => {
    const store = sessionLike();
    let at = 100_000;
    const first = createVisibleClock(0, store, () => at);
    first.hide();
    at = 100_400;
    const next = createVisibleClock(0, store, () => at);
    expect(next.back()).toBe(0);
    expect(next.elapsed()).toBe(100_400);
  });

  it('counts the time between a page hiding and the next page opening in the same tab session, when it was long', () => {
    const store = sessionLike();
    let at = 100_000;
    const first = createVisibleClock(0, store, () => at);
    first.hide();
    at = 340_000;
    const next = createVisibleClock(0, store, () => at);
    expect(next.back()).toBe(240_000);
    at = 345_000;
    expect(next.elapsed()).toBe(105_000);
  });

  it('takes the time set aside on the pages visited since, when a page comes back from the back-forward cache', () => {
    const store = sessionLike();
    let at = 60_000;
    const journey = createVisibleClock(0, store, () => at);
    // The Journey page is left for a Case, and kept in the cache.
    journey.hide();
    at = 60_300;
    const aCase = createVisibleClock(0, store, () => at);
    aCase.back();
    // On the Case the reader looks away for four minutes, then goes Back.
    at = 100_000;
    aCase.hide();
    at = 340_000;
    expect(aCase.back()).toBe(240_000);
    at = 400_000;
    aCase.hide();
    at = 400_200;
    // The cached page has not run since, so it knows nothing of the four minutes until it is shown and reads them.
    expect(journey.back()).toBe(0);
    expect(journey.elapsed()).toBe(160_200);
  });

  it('does not take another page’s hiding for its own, when a cached page comes back and is left again', () => {
    const store = sessionLike();
    let at = 0;
    const journey = createVisibleClock(0, store, () => at);
    // The Journey page is left for a Case, and kept in the cache.
    at = 10_000;
    journey.hide();
    at = 10_300;
    const aCase = createVisibleClock(0, store, () => at);
    aCase.back();
    // Back to the cached Journey page at 20 s: the Case hides as it is left. The Journey read for 8 s, then follows
    // the next Case. Its own first hide is the moment it went, not the 10 s the store still held from before.
    at = 20_000;
    journey.back();
    aCase.hide();
    at = 28_000;
    journey.hide();
    at = 28_300;
    const next = createVisibleClock(0, store, () => at);
    expect(next.back()).toBe(0);
    expect(next.elapsed()).toBe(28_300);
  });

  it('reads a navigation that started before the old page hid as a link followed, with nothing set aside', () => {
    const store = sessionLike();
    let at = 10_300;
    createVisibleClock(0, store, () => at).hide();
    // A browser starts the next page's navigation before the old page's pagehide, so the gap runs backwards: 10000 less 10300.
    at = 10_900;
    const next = createVisibleClock(0, store, () => at);
    expect(next.back(10_000)).toBe(0);
    expect(next.elapsed()).toBe(10_900);
  });

  it('measures a page load up to where its navigation started, not to when its script ran', () => {
    const store = sessionLike();
    let at = 10_000;
    const first = createVisibleClock(0, store, () => at);
    first.hide();
    // The next page is slow: its navigation started at 11 s, and its script runs at 17 s.
    at = 17_000;
    const next = createVisibleClock(0, store, () => at);
    expect(next.back(11_000)).toBe(0);
    expect(next.elapsed()).toBe(17_000);
  });

  it('still counts a long absence before a page load, however slow the load was', () => {
    const store = sessionLike();
    let at = 10_000;
    const first = createVisibleClock(0, store, () => at);
    first.hide();
    // The reader was gone for a minute and started this navigation at 70 s; the page took a second to run.
    at = 71_000;
    const next = createVisibleClock(0, store, () => at);
    expect(next.back(70_000)).toBe(60_000);
    expect(next.elapsed()).toBe(11_000);
  });

  it('keeps a page honest within itself when storage is blocked', () => {
    let at = 0;
    const clock = createVisibleClock(0, blocked, () => at);
    at = 30_000;
    clock.hide();
    at = 150_000;
    expect(clock.back()).toBe(120_000);
    at = 160_000;
    expect(clock.elapsed()).toBe(40_000);
  });
});

describe('the notes written for an absence', () => {
  it('writes one note for a four minute absence, and no idle note for the hidden time', () => {
    let at = 0;
    const clock = createVisibleClock(0, sessionLike(), () => at);
    const obs = createObservation();
    const notes = [];
    // Last sign of life at 20 s; the tab is put away at once.
    at = 20_000;
    const lastActive = clock.elapsed();
    clock.hide();
    at = 260_000;
    const gone = clock.back();
    notes.push(obs.record({ type: 'away', t: clock.elapsed(), ms: gone }));
    // Coming back is itself a sign of life, so the first scroll afterwards has nothing to be idle since.
    const resumed = clock.elapsed();
    at = 262_000;
    notes.push(obs.record({ type: 'idle', t: clock.elapsed(), ms: clock.elapsed() - resumed }));
    expect(notes.filter(Boolean)).toEqual([
      {
        t: 20_000,
        event: 'away',
        tag: null,
        quality: 'tagged',
        shows: 'You left this tab for 4 minutes.',
        cannotShow: 'Where you went, or whether you meant to come back.',
      },
    ]);
    // Even from the last sign of life before leaving, the hidden four minutes are no part of the pause.
    expect(clock.elapsed() - lastActive).toBe(2_000);
  });

  it('writes no note for a slow page load, and one note for an absence before a page load', () => {
    // The page hid at 10 s. Each arm is a different next page.
    const hidden = () => {
      const store = sessionLike();
      createVisibleClock(0, store, () => 10_000).hide();
      return store;
    };
    // Navigation started at 11 s and the script ran at 17 s: six seconds of network is the page arriving, not the reader leaving.
    let at = 17_000;
    const slow = createVisibleClock(0, hidden(), () => at);
    const slowGone = slow.back(11_000);
    expect(slowGone).toBe(0);
    expect(createObservation().record({ type: 'away', t: slow.elapsed(), ms: slowGone })).toBeNull();
    // Navigation started at 70 s and the script ran a second later: a minute gone.
    at = 71_000;
    const late = createVisibleClock(0, hidden(), () => at);
    const lateGone = late.back(70_000);
    expect(lateGone).toBe(60_000);
    expect(createObservation().record({ type: 'away', t: late.elapsed(), ms: lateGone })?.shows).toBe('You left this tab for 1 minute.');
  });

  it('writes no note for an absence under the floor, though the time is still set aside', () => {
    let at = 0;
    const clock = createVisibleClock(0, sessionLike(), () => at);
    const obs = createObservation();
    at = 10_000;
    clock.hide();
    at = 13_000;
    const gone = clock.back();
    expect(gone).toBe(3_000);
    expect(obs.record({ type: 'away', t: clock.elapsed(), ms: gone })).toBeNull();
    expect(clock.elapsed()).toBe(10_000);
  });
});
