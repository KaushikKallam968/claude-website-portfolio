import { describe, expect, it } from 'vitest';
import { joinMethods, keepCompounds } from './format';

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

describe('naming a Case\u2019s methods on one line', () => {
  it('joins them with semicolons and starts each one after the first in lower case', () => {
    expect(joinMethods(['Comparative survey of 1,000 students', 'Unmoderated interviews with 12 students'])).toBe(
      'Comparative survey of 1,000 students; unmoderated interviews with 12 students',
    );
  });

  it('leaves an acronym or a lone capital as written', () => {
    expect(joinMethods(['Diary study', 'AI evaluation', 'A/B test'])).toBe('Diary study; AI evaluation; A/B test');
  });

  it('gives a single method back as it is', () => {
    expect(joinMethods(['Instrumentation coverage audit'])).toBe('Instrumentation coverage audit');
  });
});
