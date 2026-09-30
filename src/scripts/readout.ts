import { readout, elapsed } from './notes';
import { livePaused } from './navigation';
import { formatDuration } from '../lib/format';

/**
 * The closing readout: what the page observed, in the same honest terms as the notes. Time outside the
 * Chapters (the introduction, Cases, other pages) is shown as its own row so the rows add up to the total.
 */
export function startReadout() {
  const root = document.querySelector<HTMLElement>('[data-readout]');
  if (!root) return;
  const total = root.querySelector<HTMLElement>('[data-readout-total]')!;
  const cases = root.querySelector<HTMLElement>('[data-readout-cases]')!;

  const paint = () => {
    const r = readout();
    const all = elapsed();
    const inChapters = r.chapters.reduce((sum, c) => sum + c.ms, 0);
    const rows = new Map(r.chapters.map((c) => [c.id, c.ms]));
    rows.set('outside', Math.max(0, all - inChapters));
    const longest = Math.max(1, ...rows.values());
    total.textContent = formatDuration(all);
    root.querySelectorAll<HTMLElement>('[data-bar]').forEach((li) => {
      const ms = rows.get(li.dataset.bar!) ?? 0;
      li.style.setProperty('--share', String(ms / longest));
      li.querySelector('.readout__value')!.textContent = formatDuration(ms);
    });
    cases.textContent = r.casesOpened.length
      ? `You opened ${r.casesOpened.map((c) => c.title).join(', ')}.`
      : 'You didn’t open a case. That could mean many things.';
  };

  let timer = 0;
  new IntersectionObserver(([en]) => {
    clearInterval(timer);
    if (!en.isIntersecting) return;
    paint();
    timer = window.setInterval(() => {
      if (!livePaused()) paint();
    }, 1000);
  }).observe(root);
}
