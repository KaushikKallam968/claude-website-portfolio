/**
 * What a Time Shift and the Field must agree on: the curve a flight is flown on, the stretch of a band's passage it
 * is flown over, the hours its clock has turned, how long a band runs, and the hours between two places' clocks. The
 * page measures them at build time (a band's length, at one fixed instant), the browser while it scrolls (the clocks,
 * live).
 */

/** A domestic band's curve (cubic in-out), so its clock and its traveller keep time together. */
export const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * The ocean crossing's curve (sine in-out). The cubic runs three times the mean rate at mid-flight, which packed the
 * crossing's hours into a few pixels of scroll each; this peaks at about 1.6 times, so they stay countable.
 */
export const sineInOut = (t: number) => 0.5 - Math.cos(Math.PI * t) / 2;

/** How far along its leg a traveller is, from how far through its flight it is: a band on the cubic, the crossing on the sine. */
export const travelled = (flight: number, band: boolean) => (band ? inOut : sineInOut)(flight);

/**
 * How many of a scene's hours its clock has turned, from how far along its leg the traveller is. The count starts
 * where the traveller is at `start`, turns the hours one at a time as the traveller covers the rest, and the last
 * one as it lands.
 */
export function hoursTurned(along: number, start: number, hours: number) {
  const k = Math.min(1, Math.max(0, (along - start) / Math.max(0.05, 1 - start)));
  return Math.min(hours, Math.floor(k * hours));
}

/**
 * How far along its flight a domestic band's traveller is, from how far the reader is through the band's passage
 * (0 as its top enters, 1 as its bottom leaves). It flies over the middle half, while the band is most on screen.
 */
export const bandFlight = (passage: number) => Math.min(1, Math.max(0, (passage - 0.25) / 0.5));

/** A domestic band's runway in vh: a base for the clocks and the map, and a tenth of a screen for each hour flown. */
export const bandRun = (hours: number) => 48 + 10 * Math.abs(hours);

/**
 * The instant a band is sized at: mid-January, when every zone that keeps daylight saving is on standard time. A
 * band's length is pacing, so it must not move with the day the site is built; its clock and its hour count are
 * live, and stay exact all year.
 */
export const BAND_REFERENCE = new Date('2026-01-15T12:00:00Z');

/** A domestic band's runway between two zones, sized at the reference instant. */
export const bandRunBetween = (fromTz: string, toTz: string) => bandRun(offsetHours(fromTz, toTz, BAND_REFERENCE));

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
