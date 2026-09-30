import { readout, elapsed } from './notes';

const fmt = (ms: number) => {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s} s`;
  return `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s`;
};

/** Fills the closing readout with what the page observed; refreshes while it is on screen. */
export function startReadout() {
  const root = document.querySelector<HTMLElement>('[data-readout]');
  if (!root) return;
  const total = root.querySelector<HTMLElement>('[data-readout-total]')!;
  const cases = root.querySelector<HTMLElement>('[data-readout-cases]')!;

  const paint = () => {
    const r = readout();
    total.textContent = fmt(elapsed());
    const max = Math.max(1, ...r.chapters.map((c) => c.ms));
    root.querySelectorAll<HTMLElement>('[data-bar]').forEach((li) => {
      const c = r.chapters.find((x) => x.id === li.dataset.bar);
      const ms = c?.ms ?? 0;
      li.style.setProperty('--share', String(ms / max));
      li.querySelector('.readout__value')!.textContent = fmt(ms);
    });
    cases.textContent = r.casesOpened.length
      ? `You opened ${r.casesOpened.map((c) => c.title).join(', ')}.`
      : 'You didn’t open a case. That could mean many things.';
  };

  let timer = 0;
  new IntersectionObserver(([en]) => {
    clearInterval(timer);
    if (en.isIntersecting) {
      paint();
      timer = window.setInterval(paint, 1000);
    }
  }).observe(root);
}
