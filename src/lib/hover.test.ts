import { describe, expect, it } from 'vitest';
import { createHoverIntent } from './hover';

describe('hover intent', () => {
  it('counts a hover the pointer moved onto', () => {
    const hover = createHoverIntent();
    hover.moved(100, 200);
    expect(hover.counts(100, 200)).toBe(true);
  });

  it('ignores a hover that only happened because the page scrolled under a resting pointer', () => {
    const hover = createHoverIntent();
    hover.moved(360, 520);
    hover.scrolled();
    expect(hover.counts(360, 520)).toBe(false);
  });

  it('counts a hover after scrolling once the pointer moves again', () => {
    const hover = createHoverIntent();
    hover.moved(360, 520);
    hover.scrolled();
    expect(hover.counts(362, 540)).toBe(true);
    hover.moved(362, 540);
    expect(hover.counts(362, 540)).toBe(true);
  });

  it('ignores a hover reported before the pointer has moved on this page, as when a page loads under a resting pointer', () => {
    const hover = createHoverIntent();
    expect(hover.counts(360, 520)).toBe(false);
  });
});
