import { describe, expect, it } from 'vitest';
import { chapters } from '../data/journey';
import { bandFlight, bandRun, hoursTurned, inOut, offsetHours, sineInOut, travelled } from './shift';

const summer = new Date('2026-07-01T12:00:00Z');
const winter = new Date('2026-01-15T12:00:00Z');

describe('the hours between two places', () => {
  it('counts the zones crossed, daylight saving included', () => {
    expect(offsetHours('America/New_York', 'America/Chicago', summer)).toBe(-1);
    expect(offsetHours('America/Chicago', 'America/Los_Angeles', summer)).toBe(-2);
    expect(offsetHours('America/Los_Angeles', 'America/New_York', summer)).toBe(3);
    // The Pacific crossing is the one that changes with the season: Chicago is an hour further behind in winter.
    expect(offsetHours('America/Chicago', 'Asia/Singapore', summer)).toBe(13);
    expect(offsetHours('America/Chicago', 'Asia/Singapore', winter)).toBe(14);
  });

  it('sizes each domestic band of the Journey by them', () => {
    const bands = chapters.slice(1).map((to, i) => ({ to: to.id, hours: offsetHours(chapters[i].place.timeZone, to.place.timeZone, summer) }));
    expect(bands.map((b) => b.hours)).toEqual([-1, -2, 3, -1, 13]);
    expect(bands.slice(0, 4).map((b) => bandRun(b.hours))).toEqual([58, 68, 78, 58]);
  });
});

describe('a band’s flight', () => {
  it('is flown over the middle half of the band’s passage', () => {
    expect(bandFlight(0)).toBe(0);
    expect(bandFlight(0.25)).toBe(0);
    expect(bandFlight(0.5)).toBe(0.5);
    expect(bandFlight(0.75)).toBe(1);
    expect(bandFlight(1)).toBe(1);
  });

  it('keeps one curve for the traveller and the clock, landing exactly at the end', () => {
    expect(inOut(0)).toBe(0);
    expect(inOut(0.5)).toBe(0.5);
    expect(inOut(1)).toBe(1);
  });
});

describe('the ocean crossing’s curve', () => {
  it('is a sine in-out: it starts and ends at rest and passes the middle at the middle', () => {
    expect(sineInOut(0)).toBe(0);
    expect(sineInOut(1)).toBe(1);
    expect(sineInOut(0.5)).toBeCloseTo(0.5, 12);
    expect(sineInOut(0.25) + sineInOut(0.75)).toBeCloseTo(1, 12);
  });

  it('never runs faster than about 1.6 times the mean rate, where the cubic runs three times', () => {
    const peak = (curve: (t: number) => number) => Math.max(...Array.from({ length: 1000 }, (_, i) => (curve((i + 1) / 1000) - curve(i / 1000)) * 1000));
    expect(peak(sineInOut)).toBeLessThan(1.6);
    expect(peak(inOut)).toBeGreaterThan(2.9);
  });

  it('is the traveller’s only on the crossing: a domestic band keeps the cubic', () => {
    expect(travelled(0.25, false)).toBeCloseTo(sineInOut(0.25), 12);
    expect(travelled(0.25, true)).toBe(inOut(0.25));
    expect(travelled(1, false)).toBe(1);
    expect(travelled(1, true)).toBe(1);
  });
});

describe('the hours a clock has turned', () => {
  // Where, as a fraction of the crossing's scroll, each hour turns: the first scroll position that shows it.
  const turns = (hours: number, start: number) => {
    const at: number[] = [];
    for (let i = 0; i <= 20000; i++) {
      const p = i / 20000;
      const n = hoursTurned(travelled(p, false), travelled(start, false), hours);
      if (n > at.length) at.push(p);
    }
    return at;
  };

  it('turns every hour of a crossing, the last on the frame the traveller lands', () => {
    for (const hours of [13, 14]) {
      expect(turns(hours, 0.12)).toHaveLength(hours);
      const along = travelled(1, false);
      expect(hoursTurned(along, travelled(0.12, false), hours)).toBe(hours);
      expect(hoursTurned(travelled(0.9999, false), travelled(0.12, false), hours)).toBe(hours - 1);
    }
  });

  it('keeps every two turns at least 60% as far apart as the average (on the cubic, a third)', () => {
    for (const hours of [13, 14]) {
      const at = turns(hours, 0.12);
      const gaps = at.slice(1).map((p, i) => p - at[i]);
      const mean = (at[hours - 1] - at[0]) / (hours - 1);
      expect(Math.min(...gaps)).toBeGreaterThan(0.6 * mean);
    }
  });
});
