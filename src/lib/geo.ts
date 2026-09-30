/**
 * The geometry behind the Journey's world: the Equal Earth projection centred on the Pacific (so the one
 * date-line crossing sits mid-map), great-circle paths between places, and where the sun is overhead now.
 * Longitudes and latitudes are in degrees; projected units are the projection's own (about ±2.7 by ±1.3).
 */
export type LonLat = [number, number];

export const CENTRAL_MERIDIAN = 150;

const rad = Math.PI / 180;
const A1 = 1.340264, A2 = -0.081106, A3 = 0.000893, A4 = 0.003796;
const M = Math.sqrt(3) / 2;

const wrap180 = (deg: number) => ((((deg % 360) + 540) % 360) - 180);

/** Equal Earth (Šavrič, Patterson, Jenny 2018), y up. */
export function equalEarth(lon: number, lat: number): [number, number] {
  const lambda = wrap180(lon - CENTRAL_MERIDIAN) * rad;
  const theta = Math.asin(M * Math.sin(lat * rad));
  const t2 = theta * theta;
  const t6 = t2 * t2 * t2;
  return [
    (lambda * Math.cos(theta)) / (M * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2))),
    theta * (A1 + A2 * t2 + t6 * (A3 + A4 * t2)),
  ];
}

const toVec = ([lon, lat]: LonLat) => [Math.cos(lat * rad) * Math.cos(lon * rad), Math.cos(lat * rad) * Math.sin(lon * rad), Math.sin(lat * rad)];

/** Great-circle distance in kilometres between two places (spherical Earth, mean radius 6371 km). */
export function distanceKm(a: LonLat, b: LonLat): number {
  const va = toVec(a);
  const vb = toVec(b);
  const cross = [va[1] * vb[2] - va[2] * vb[1], va[2] * vb[0] - va[0] * vb[2], va[0] * vb[1] - va[1] * vb[0]];
  // atan2 of |a×b| and a·b stays accurate for very short and near-antipodal distances alike.
  return 6371 * Math.atan2(Math.hypot(cross[0], cross[1], cross[2]), va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2]);
}

/** `n` points along the shortest path over the sphere from `a` to `b`, endpoints included. */
export function greatCircle(a: LonLat, b: LonLat, n: number): LonLat[] {
  const va = toVec(a);
  const vb = toVec(b);
  const omega = Math.acos(Math.min(1, Math.max(-1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2])));
  const out: LonLat[] = [];
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : i / (n - 1);
    const s = Math.sin(omega);
    const ka = s < 1e-9 ? 1 - t : Math.sin((1 - t) * omega) / s;
    const kb = s < 1e-9 ? t : Math.sin(t * omega) / s;
    const v = [0, 1, 2].map((k) => ka * va[k] + kb * vb[k]);
    out.push([Math.atan2(v[1], v[0]) / rad, Math.asin(Math.max(-1, Math.min(1, v[2]))) / rad]);
  }
  return out;
}

/** Where the sun is directly overhead at `at` (NOAA low-precision solar position, good to about 0.1°). */
export function subsolarPoint(at: Date): { lat: number; lon: number } {
  const d = at.getTime() / 86400000 + 2440587.5 - 2451545.0;
  const g = (357.529 + 0.98560028 * d) * rad;
  const q = 280.459 + 0.98564736 * d;
  const L = (q + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * rad;
  const e = (23.439 - 0.00000036 * d) * rad;
  const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L)) / rad;
  const dec = Math.asin(Math.sin(e) * Math.sin(L)) / rad;
  const eqTimeHours = wrap180(q - ra) / 15;
  const utcHours = (at.getTime() / 3600000) % 24;
  return { lat: dec, lon: wrap180((12 - utcHours - eqTimeHours) * 15) };
}
