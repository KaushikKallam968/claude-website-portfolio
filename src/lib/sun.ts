/** Approximate solar altitude in degrees for a place and moment (good to about a degree). */
export function sunAltitude(lat: number, lon: number, date: Date): number {
  const rad = Math.PI / 180;
  const n = date.getTime() / 864e5 + 2440587.5 - 2451545;
  const L = (280.46 + 0.9856474 * n) % 360;
  const g = ((357.528 + 0.9856003 * n) % 360) * rad;
  const lam = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * rad;
  const eps = 23.439 * rad;
  const dec = Math.asin(Math.sin(eps) * Math.sin(lam));
  const ra = Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam));
  const gmst = (280.46061837 + 360.98564736629 * n) % 360;
  const ha = (gmst + lon) * rad - ra;
  return Math.asin(Math.sin(lat * rad) * Math.sin(dec) + Math.cos(lat * rad) * Math.cos(dec) * Math.cos(ha)) / rad;
}

export function daylightWord(altitude: number): string {
  if (altitude > 6) return 'day';
  if (altitude > -6) return altitude > 0 ? 'low sun' : 'twilight';
  return 'night';
}
