import { describe, expect, it } from 'vitest';
import { geoEqualEarthRaw } from 'd3-geo';
import { equalEarth, greatCircle, subsolarPoint, CENTRAL_MERIDIAN } from './geo';

const rad = Math.PI / 180;

describe('equalEarth', () => {
  it('matches the reference Equal Earth projection, centred on the Pacific', () => {
    for (const [lon, lat] of [[-74.006, 40.7128], [103.8198, 1.3521], [-121.9552, 37.3541], [10, -45]]) {
      const lambda = ((((lon - CENTRAL_MERIDIAN) % 360) + 540) % 360 - 180) * rad;
      const [x, y] = geoEqualEarthRaw(lambda, lat * rad);
      const p = equalEarth(lon, lat);
      expect(p[0]).toBeCloseTo(x, 6);
      expect(p[1]).toBeCloseTo(y, 6);
    }
  });

  it('puts the date line east of the central meridian and the Atlantic at the edges', () => {
    expect(equalEarth(180, 0)[0]).toBeGreaterThan(0);
    expect(Math.abs(equalEarth(-30.01, 0)[0])).toBeGreaterThan(2.6);
  });
});

describe('greatCircle', () => {
  it('keeps both endpoints and passes through the true midpoint', () => {
    const path = greatCircle([0, 0], [90, 0], 3);
    expect(path).toHaveLength(3);
    expect(path[0][0]).toBeCloseTo(0, 6);
    expect(path[1][0]).toBeCloseTo(45, 6);
    expect(path[2][0]).toBeCloseTo(90, 6);
  });

  it('bends toward the pole between two cities at the same latitude', () => {
    const path = greatCircle([-74, 40], [10, 40], 5);
    expect(path[2][1]).toBeGreaterThan(45);
  });
});

describe('subsolarPoint', () => {
  it('sits on the Tropic of Cancer near noon UTC at the June solstice', () => {
    const s = subsolarPoint(new Date('2026-06-21T12:00:00Z'));
    expect(s.lat).toBeCloseTo(23.44, 0);
    expect(Math.abs(s.lon)).toBeLessThan(1);
  });

  it('sits on the equator at the March equinox, over the Pacific at midnight UTC', () => {
    const s = subsolarPoint(new Date('2026-03-20T14:46:00Z'));
    expect(Math.abs(s.lat)).toBeLessThan(0.1);
    const m = subsolarPoint(new Date('2026-03-21T00:00:00Z'));
    expect(Math.abs(Math.abs(m.lon) - 180)).toBeLessThan(3);
  });
});
