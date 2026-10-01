/**
 * What a Time Shift and the Field must agree on: the curve a flight is flown on, the stretch of a band's passage it
 * is flown over, how long a band runs, and the hours between two places' clocks. The page measures them at build
 * time, the browser while it scrolls.
 */

/** The flight's curve (cubic in-out), so a band's clock and its traveller keep time together. */
export const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * How far along its flight a domestic band's traveller is, from how far the reader is through the band's passage
 * (0 as its top enters, 1 as its bottom leaves). It flies over the middle half, while the band is most on screen.
 */
export const bandFlight = (passage: number) => Math.min(1, Math.max(0, (passage - 0.25) / 0.5));

/** A domestic band's runway in vh: a base for the clocks and the map, and a tenth of a screen for each hour flown. */
export const bandRun = (hours: number) => 48 + 10 * Math.abs(hours);

/** Wall-clock hour, minute and calendar date in a time zone. */
export function wallClock(tz: string, at: Date) {
  const p = new Intl.DateTimeFormat('en-GB', { timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(at);
  const get = (t: string) => Number(p.find((x) => x.type === t)?.value ?? 0);
  return { y: get('year'), mo: get('month'), d: get('day'), h: get('hour'), m: get('minute') };
}

/** The zone's offset from UTC in minutes at this moment (daylight saving included). */
function utcOffsetMinutes(tz: string, at: Date) {
  const w = wallClock(tz, at);
  return Math.round((Date.UTC(w.y, w.mo - 1, w.d, w.h, w.m) - Math.floor(at.getTime() / 60000) * 60000) / 60000);
}

/** Offset in whole hours between two time zones right now (positive: `to` is ahead). */
export function offsetHours(fromTz: string, toTz: string, at: Date) {
  return Math.round((utcOffsetMinutes(toTz, at) - utcOffsetMinutes(fromTz, at)) / 60);
}
