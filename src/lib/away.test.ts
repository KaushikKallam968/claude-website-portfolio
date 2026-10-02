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

  it('keeps the latest moment the page went out of sight, since pagehide and visibilitychange both say so', () => {
    let at = 0;
    const clock = createVisibleClock(0, sessionLike(), () => at);
    clock.hide();
    at = 40;
    clock.hide();
    at = 60_040;
    expect(clock.back()).toBe(60_000);
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
    // The cached page has not run since: its own total of time away is still nothing.
    expect(journey.elapsed()).toBe(400_200);
    expect(journey.back()).toBe(0);
    expect(journey.elapsed()).toBe(160_200);
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
