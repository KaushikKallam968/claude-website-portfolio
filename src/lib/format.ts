export const pad2 = (n: number) => String(n).padStart(2, '0');

/** A duration for people: tenths under ten seconds, so a short visit never reads as zero. */
export function formatDuration(ms: number): string {
  const s = ms / 1000;
  if (s < 10) return `${s.toFixed(1)} s`;
  const whole = Math.round(s);
  if (whole < 60) return `${whole} s`;
  return `${Math.floor(whole / 60)} min ${pad2(whole % 60)} s`;
}

/** Elapsed time on the notes' own clock, e.g. 01:07.3. */
export function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}.${Math.floor((ms % 1000) / 100)}`;
}

/** Glue each " · " separator to the words before it, so a wrapped line never starts with a dot. */
export const keepDots = (s: string) => s.replace(/ · /g, ' · ');

const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/**
 * Escapes the text for HTML and wraps each hyphenated compound in a span that cannot break (.nobr), so "front-end"
 * never ends a line on its hyphen. Render it with set:html, for short display text only: a long compound that
 * cannot break is a long unbreakable word. It adds no character, so the text layer of a printed page stays as written.
 */
export function nobrCompounds(s: string): string {
  const escaped = s.replace(/[&<>"']/g, (c) => entities[c]);
  return escaped.replace(/\p{L}+(?:-\p{L}+)+/gu, '<span class="nobr">$&</span>');
}

/** Ends a sentence with a full stop, unless the name that ends it already carries one ("watched."). */
export const sentence = (s: string) => (/[.!?]$/.test(s) ? s : `${s}.`);
