/**
 * The portrait of a visit counts time in dots. The unit is the finest one that lets the longest row fit in
 * its track, and it is always stated, so the picture never implies more precision than it has.
 */
const UNITS: [number, string][] = [
  [100, 'a tenth of a second'],
  [250, 'a quarter of a second'],
  [500, 'half a second'],
  [1000, 'one second'],
  [2000, 'two seconds'],
  [5000, 'five seconds'],
  [10000, 'ten seconds'],
  [30000, 'thirty seconds'],
  [60000, 'one minute'],
  [300000, 'five minutes'],
];

export function dotUnit(rowsMs: number[], capacity: number) {
  const longest = Math.max(0, ...rowsMs);
  const [unitMs, phrase] = UNITS.find(([u]) => Math.ceil(longest / u) <= capacity) ?? UNITS[UNITS.length - 1];
  const counts = rowsMs.map((ms) => (ms <= 0 ? 0 : Math.min(capacity, Math.max(1, Math.round(ms / unitMs)))));
  return { unitMs, phrase, counts };
}
