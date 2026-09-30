/**
 * Which place a device's clock belongs to, for the one note about it. The Journey's places are named the way the
 * Journey names them (Atlanta keeps New York's time, and both Texas Chapters are Texas); zone.test.ts checks this
 * table against src/data/journey.ts, which the browser never loads for this.
 */
export const PLACE_CLOCKS: Record<string, string> = {
  'America/New_York': 'New York',
  'America/Chicago': 'Texas',
  'America/Los_Angeles': 'Silicon Valley',
  'Asia/Singapore': 'Singapore',
};

/**
 * The place a device keeps time for: a Journey place when it keeps that place's clock, otherwise the zone's city.
 * UTC, a fixed offset and a device that will not say have no place to name.
 */
export function clockPlace(timeZone: string | undefined): string | null {
  if (!timeZone) return null;
  if (PLACE_CLOCKS[timeZone]) return PLACE_CLOCKS[timeZone];
  if (!timeZone.includes('/') || timeZone.startsWith('Etc/')) return null;
  return timeZone.slice(timeZone.lastIndexOf('/') + 1).replace(/_/g, ' ');
}
