import { describe, expect, it } from 'vitest';
import { chapters } from '../data/journey';
import { PLACE_CLOCKS, clockKept } from './zone';

describe('what a device’s clock keeps', () => {
  it('names a Journey place by its time zone, and cannot drift from the Journey', () => {
    // The first Chapter to use a zone names it: Atlanta keeps New York's time, and both Texas Chapters are Texas.
    const derived: Record<string, string> = {};
    for (const c of chapters) derived[c.place.timeZone] ??= c.title;
    expect(PLACE_CLOCKS).toEqual(derived);
  });

  it('says the same time as a Journey place, since a whole zone is shared by places the reader may not be in', () => {
    expect(clockKept('America/New_York')).toBe('the same time as New York');
    expect(clockKept('America/Chicago')).toBe('the same time as Texas');
    expect(clockKept('America/Los_Angeles')).toBe('the same time as Silicon Valley');
    expect(clockKept('Asia/Singapore')).toBe('the same time as Singapore');
  });

  it('otherwise names the zone’s city time', () => {
    expect(clockKept('Europe/London')).toBe('London time');
    expect(clockKept('Asia/Kolkata')).toBe('Kolkata time');
    expect(clockKept('America/Argentina/Buenos_Aires')).toBe('Buenos Aires time');
    expect(clockKept('America/Indiana/Indianapolis')).toBe('Indianapolis time');
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
    for (const [id, city] of Object.entries(old)) expect(clockKept(id)).toBe(`${city} time`);
  });

  it('has no place to name for UTC, a fixed offset, or a device that will not say', () => {
    for (const zone of ['UTC', 'Etc/UTC', 'Etc/GMT+5', 'GMT', 'EST', '', undefined]) expect(clockKept(zone)).toBeNull();
  });
});
