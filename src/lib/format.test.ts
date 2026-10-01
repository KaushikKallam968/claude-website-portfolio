import { describe, expect, it } from 'vitest';
import { isLongTitle, nobrCompounds } from './format';

const nobr = (s: string) => `<span class="nobr">${s}</span>`;

describe('keeping compound words on one line', () => {
  it('wraps a hyphenated compound so it cannot break at the hyphen', () => {
    expect(nobrCompounds('front-end work')).toBe(`${nobr('front-end')} work`);
    expect(nobrCompounds('AI-assisted')).toBe(nobr('AI-assisted'));
  });

  it('wraps each compound on its own, and a longer one as a whole', () => {
    expect(nobrCompounds('cross-language search, front-end work')).toBe(`${nobr('cross-language')} search, ${nobr('front-end')} work`);
    expect(nobrCompounds('image-to-text')).toBe(nobr('image-to-text'));
  });

  it('counts accented letters as letters', () => {
    expect(nobrCompounds('déjà-vu')).toBe(nobr('déjà-vu'));
  });

  it('gives a string without a compound back unchanged', () => {
    expect(nobrCompounds('Research and design')).toBe('Research and design');
    expect(nobrCompounds('June 2024-2026')).toBe('June 2024-2026');
    expect(nobrCompounds('a hyphen - set apart')).toBe('a hyphen - set apart');
    expect(nobrCompounds('trailing- and -leading')).toBe('trailing- and -leading');
    expect(nobrCompounds('COVID-19')).toBe('COVID-19');
  });

  it('escapes the characters that mean something in HTML', () => {
    expect(nobrCompounds(`Tom & "Jerry" <b>'s`)).toBe('Tom &amp; &quot;Jerry&quot; &lt;b&gt;&#39;s');
    expect(nobrCompounds('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('escapes the text around a compound, and keeps entities out of its way', () => {
    expect(nobrCompounds('R&D front-end & "co-founded"')).toBe(`R&amp;D ${nobr('front-end')} &amp; &quot;${nobr('co-founded')}&quot;`);
    expect(nobrCompounds('<i>front-end</i>')).toBe(`&lt;i&gt;${nobr('front-end')}&lt;/i&gt;`);
  });

  it('escapes once: text that already reads like an entity is shown as written', () => {
    expect(nobrCompounds('&amp; &lt;')).toBe('&amp;amp; &amp;lt;');
  });
});

describe('which Case titles wrap', () => {
  it('counts more than 25 characters as long, the size at which a title sets on two lines', () => {
    expect(isLongTitle('x'.repeat(25))).toBe(false);
    expect(isLongTitle('x'.repeat(26))).toBe(true);
  });

  it('sorts the Cases as their headings set', () => {
    expect(['Chegg Mexico', 'Chegg Discord', 'watched.'].some(isLongTitle)).toBe(false);
    expect(isLongTitle('Inspire Brands Ad Creative')).toBe(true);
    expect(isLongTitle('Data Instrumentation Coverage and Quality')).toBe(true);
  });
});
