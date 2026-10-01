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
 * Ids a browser's own time zone data may still report for a zone that tzdb has renamed (Chromium says Asia/Calcutta
 * for a device set to Kolkata). Each maps to the name tzdb uses now; only renames that change the city are listed.
 */
const RENAMED: Record<string, string> = {
  'Asia/Calcutta': 'Asia/Kolkata',
  'Europe/Kiev': 'Europe/Kyiv',
  'Asia/Saigon': 'Asia/Ho_Chi_Minh',
  'Asia/Katmandu': 'Asia/Kathmandu',
  'Asia/Rangoon': 'Asia/Yangon',
  'America/Godthab': 'America/Nuuk',
  'America/Coral_Harbour': 'America/Atikokan',
  'Africa/Asmera': 'Africa/Asmara',
  'Pacific/Truk': 'Pacific/Chuuk',
  'Pacific/Ponape': 'Pacific/Pohnpei',
  'Atlantic/Faeroe': 'Atlantic/Faroe',
  'Pacific/Enderbury': 'Pacific/Kanton',
};

/**
 * The place a device keeps time for: a Journey place when it keeps that place's clock, otherwise the zone's city.
 * UTC, a fixed offset and a device that will not say have no place to name.
 */
export function clockPlace(timeZone: string | undefined): string | null {
  if (!timeZone) return null;
  const id = RENAMED[timeZone] ?? timeZone;
  if (PLACE_CLOCKS[id]) return PLACE_CLOCKS[id];
  if (!id.includes('/') || id.startsWith('Etc/')) return null;
  return id.slice(id.lastIndexOf('/') + 1).replace(/_/g, ' ');
}
