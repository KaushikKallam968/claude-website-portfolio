import { describe, expect, it } from 'vitest';
import { chapters } from '../data/journey';
import { PLACE_CLOCKS, clockPlace } from './zone';

describe('the place a device keeps time for', () => {
  it('names a Journey place by its time zone, and cannot drift from the Journey', () => {
    // The first Chapter to use a zone names it: Atlanta keeps New York's time, and both Texas Chapters are Texas.
    const derived: Record<string, string> = {};
    for (const c of chapters) derived[c.place.timeZone] ??= c.title;
    expect(PLACE_CLOCKS).toEqual(derived);
    expect(clockPlace('America/New_York')).toBe('New York');
    expect(clockPlace('America/Chicago')).toBe('Texas');
    expect(clockPlace('America/Los_Angeles')).toBe('Silicon Valley');
    expect(clockPlace('Asia/Singapore')).toBe('Singapore');
  });

  it('otherwise names the zone’s city', () => {
    expect(clockPlace('Europe/London')).toBe('London');
    expect(clockPlace('Asia/Kolkata')).toBe('Kolkata');
    expect(clockPlace('America/Argentina/Buenos_Aires')).toBe('Buenos Aires');
    expect(clockPlace('America/Indiana/Indianapolis')).toBe('Indianapolis');
  });

  it('names a renamed zone by its current name, though a browser may still report the old id', () => {
    // Chromium says Asia/Calcutta for a device set to Kolkata; tzdb has long since called every one of these by the name on the right.
    const old: Record<string, string> = {
      'Asia/Calcutta': 'Kolkata',
      'Europe/Kiev': 'Kyiv',
      'Asia/Saigon': 'Ho Chi Minh',
      'Asia/Katmandu': 'Kathmandu',
      'Asia/Rangoon': 'Yangon',
      'America/Godthab': 'Nuuk',
      'America/Coral_Harbour': 'Atikokan',
      'Africa/Asmera': 'Asmara',
      'Pacific/Truk': 'Chuuk',
      'Pacific/Ponape': 'Pohnpei',
      'Atlantic/Faeroe': 'Faroe',
      'Pacific/Enderbury': 'Kanton',
    };
    for (const [id, city] of Object.entries(old)) expect(clockPlace(id)).toBe(city);
  });

  it('has no place to name for UTC, a fixed offset, or a device that will not say', () => {
    for (const zone of ['UTC', 'Etc/UTC', 'Etc/GMT+5', 'GMT', 'EST', '', undefined]) expect(clockPlace(zone)).toBeNull();
  });
});
