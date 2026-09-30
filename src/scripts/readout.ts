import { readout, elapsed } from './notes';
import { livePaused } from './navigation';
import { formatDuration } from '../lib/format';

/**
 * The closing readout: what the site observed this visit, in the same honest terms as the notes. Time not
 * spent in a Chapter (the introduction, this close, Cases, other pages) is its own row, so the rows add up
 * to the total. Chapters with less than a second of reading are left out, and a line says when that is all of
 * them, so a visitor who jumps straight to Contact sees an honest short readout rather than a column of zeros.
 */
export function startReadout() {
  const root = document.querySelector<HTMLElement>('[data-readout]');
  if (!root) return;
  const total = root.querySelector<HTMLElement>('[data-readout-total]')!;
  const cases = root.querySelector<HTMLElement>('[data-readout-cases]')!;
  const empty = root.querySelector<HTMLElement>('[data-readout-empty]');
  let shown = '';

  const paint = () => {
    const r = readout();
    const all = elapsed();
    const bars = [...root.querySelectorAll<HTMLElement>('[data-bar]')];
    const chapterIds = new Set(bars.map((li) => li.dataset.bar!).filter((id) => id !== 'outside'));
    const rows = new Map(r.chapters.filter((c) => chapterIds.has(c.id)).map((c) => [c.id, c.ms]));
    const inChapters = [...rows.values()].reduce((sum, ms) => sum + ms, 0);
    rows.set('outside', Math.max(0, all - inChapters));
    const longest = Math.max(1, ...rows.values());
    total.textContent = formatDuration(all);
    bars.forEach((li) => {
      const ms = rows.get(li.dataset.bar!) ?? 0;
      li.hidden = li.dataset.bar !== 'outside' && ms < 1000;
      li.style.setProperty('--share', String(ms / longest));
      li.querySelector('.readout__value')!.textContent = formatDuration(ms);
    });
    if (empty) empty.hidden = bars.some((li) => li.dataset.bar !== 'outside' && !li.hidden);
    // The portrait is drawn into these rows, so it re-measures when the set of rows changes.
    const now = bars.map((li) => (li.hidden ? 0 : 1)).join('');
    if (now !== shown) {
      shown = now;
      document.dispatchEvent(new CustomEvent('readout:rows'));
    }
    const titles = r.casesOpened.map((c) => c.title).join(', ');
    cases.textContent = r.casesOpened.length
      ? `You opened ${titles}${/[.!?]$/.test(titles) ? '' : '.'}`
      : 'You didn’t open a case. That could mean many things.';
  };

  // Paint once now and again a screen before the readout arrives, so rows are settled before they are seen.
  paint();
  let timer = 0;
  new IntersectionObserver(
    ([en]) => {
      clearInterval(timer);
      if (!en.isIntersecting) return;
      paint();
      timer = window.setInterval(() => {
        if (!livePaused()) paint();
      }, 1000);
    },
    { rootMargin: '100% 0px' },
  ).observe(root);
}
