import { describe, expect, it } from 'vitest';
import { chapters } from '../data/journey';
import { bandFlight, bandRun, inOut, offsetHours } from './shift';

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
