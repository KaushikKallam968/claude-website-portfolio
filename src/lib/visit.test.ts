import { describe, expect, it } from 'vitest';
import { dotUnit } from './visit';

describe('dotUnit', () => {
  it('uses the finest unit that lets the longest row fit its track', () => {
    // 40 s in the longest row, 500 dots of room: twentieths would need 800, tenths need 400, so tenths fit.
    const u = dotUnit([40_000, 12_000, 0], 500);
    expect(u.unitMs).toBe(100);
    expect(u.counts).toEqual([400, 120, 0]);
    expect(u.phrase).toBe('a tenth of a second');
  });

  it('moves to coarser units as the visit grows', () => {
    const u = dotUnit([600_000, 30_000], 500); // ten minutes in one place
    expect(u.unitMs).toBe(2000);
    expect(u.counts).toEqual([300, 15]);
    expect(u.phrase).toBe('two seconds');
  });

  it('gives any time at all at least one dot, and none to no time', () => {
    expect(dotUnit([30, 0], 500).counts).toEqual([2, 0]);
  });

  it('counts short visits finely, so even a quick look draws a picture', () => {
    const u = dotUnit([6_000, 2_000], 500);
    expect(u.unitMs).toBe(20);
    expect(u.counts).toEqual([300, 100]);
    expect(u.phrase).toBe('a fiftieth of a second');
  });
});
