/**
 * Samples the hero name as dots. Each word is drawn off screen where the page lays it out (same font,
 * size, weight, tracking and baseline), then read back on a hexagonal grid. The HTML heading stays the
 * real, selectable, accessible name; the dots are what is seen.
 */
export interface NameSample {
  points: Float32Array; // x, y pairs in px from the heading's top-left
  count: number;
  spacing: number;
}

function baselineOf(word: HTMLElement) {
  const probe = document.createElement('span');
  probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
  word.after(probe);
  const y = probe.getBoundingClientRect().top;
  probe.remove();
  return y;
}

export function sampleName(heading: HTMLElement, spacing: number): NameSample {
  const box = heading.getBoundingClientRect();
  const w = Math.ceil(box.width);
  const h = Math.ceil(box.height + spacing * 4);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.fillStyle = '#000';
  ctx.textBaseline = 'alphabetic';

  heading.querySelectorAll<HTMLElement>('.hero__word').forEach((word) => {
    const cs = getComputedStyle(word);
    const size = parseFloat(cs.fontSize);
    const tracking = parseFloat(cs.letterSpacing) || 0;
    ctx.font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`;
    const r = word.getBoundingClientRect();
    const x0 = r.left - box.left;
    const y = baselineOf(word) - box.top;
    // Draw letter by letter so tracking matches in every browser, with or without canvas letterSpacing.
    let x = x0;
    for (const ch of word.textContent ?? '') {
      ctx.fillText(ch, x, y);
      x += ctx.measureText(ch).width + tracking;
    }
  });

  const img = ctx.getImageData(0, 0, w, h).data;
  const pts: number[] = [];
  const dy = spacing * 0.866;
  for (let row = 0, y = dy / 2; y < h; row++, y += dy) {
    for (let x = (row % 2 ? spacing / 2 : 0) + spacing / 4; x < w; x += spacing) {
      const i = (Math.floor(y) * w + Math.floor(x)) * 4 + 3;
      if (img[i] > 110) pts.push(x, y);
    }
  }
  return { points: new Float32Array(pts), count: pts.length / 2, spacing };
}
