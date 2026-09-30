import { describe, expect, it } from 'vitest';
import { keepCompounds } from './format';

const WJ = '⁠';

describe('keeping compound words on one line', () => {
  it('glues the part after a hyphen to the hyphen, so a line never ends on it', () => {
    expect(keepCompounds('co-founded')).toBe(`co-${WJ}founded`);
    expect(keepCompounds('AI-powered academic support')).toBe(`AI-${WJ}powered academic support`);
  });

  it('glues every hyphen in a longer compound, even one with a single letter between them', () => {
    expect(keepCompounds('image-to-text')).toBe(`image-${WJ}to-${WJ}text`);
    expect(keepCompounds('a-b-c')).toBe(`a-${WJ}b-${WJ}c`);
  });

  it('counts accented letters as letters', () => {
    expect(keepCompounds('déjà-vu')).toBe(`déjà-${WJ}vu`);
  });

  it('leaves a hyphen alone unless a letter stands on both sides', () => {
    expect(keepCompounds('June 2024-2026')).toBe('June 2024-2026');
    expect(keepCompounds('a hyphen - set apart')).toBe('a hyphen - set apart');
    expect(keepCompounds('trailing-')).toBe('trailing-');
    expect(keepCompounds('-leading')).toBe('-leading');
    expect(keepCompounds('COVID-19')).toBe('COVID-19');
  });

  it('gives the same text back when it is applied twice', () => {
    const once = keepCompounds('cross-language search, front-end work');
    expect(keepCompounds(once)).toBe(once);
  });
});
