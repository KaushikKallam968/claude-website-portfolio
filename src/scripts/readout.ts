import { readout, elapsed } from './notes';
import { livePaused } from './navigation';
import { formatDuration, sentence } from '../lib/format';

const listFormat = new Intl.ListFormat('en', { type: 'conjunction' });

/**
 * The closing readout: what the site observed this visit, in the same honest terms as the notes. Time not
 * spent in a Chapter (the introduction, this close, Cases, other pages) is its own row, so the rows add up
 * to the total. Chapters with less than a second of reading are left out (that moment joins everywhere else),
 * and a line says when that is all of them, so a visitor who jumps straight to Contact sees an honest short
 * readout rather than a column of zeros. With no Case opened either, that one line says both.
 *
 * It is a snapshot of the visit up to the close, taken as the close rises into view: reading the readout does
 * not change it, so nothing re-flows while it is read. Leaving and coming back takes a new one.
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
    // A Chapter passed through in under a second is left out, and its moment counts as everywhere else.
    const rows = new Map(r.chapters.filter((c) => chapterIds.has(c.id) && c.ms >= 1000).map((c) => [c.id, c.ms]));
    const inChapters = [...rows.values()].reduce((sum, ms) => sum + ms, 0);
    rows.set('outside', Math.max(0, all - inChapters));
    const longest = Math.max(1, ...rows.values());
    total.textContent = formatDuration(all);
    bars.forEach((li) => {
      const ms = rows.get(li.dataset.bar!) ?? 0;
      li.hidden = !rows.has(li.dataset.bar!);
      li.style.setProperty('--share', String(ms / longest));
      li.querySelector('.readout__value')!.textContent = formatDuration(ms);
    });
    const noChapters = !bars.some((li) => li.dataset.bar !== 'outside' && !li.hidden);
    const noCases = r.casesOpened.length === 0;
    // Nothing in a Chapter and no Case opened is one statement, not two lines that say the same thing.
    if (empty) {
      empty.hidden = !noChapters;
      empty.textContent = noCases ? 'You haven’t stopped in a chapter or opened a case. That could mean many things.' : 'You haven’t spent a second in any chapter.';
    }
    cases.hidden = noChapters && noCases;
    // The portrait is drawn into these rows, so it re-measures once they and the line above them have settled.
    const now = bars.map((li) => (li.hidden ? 0 : 1)).join('') + (empty && !empty.hidden ? empty.textContent : '');
    if (now !== shown) {
      shown = now;
      document.dispatchEvent(new CustomEvent('readout:rows'));
    }
    const one = r.casesOpened.length === 1;
    cases.textContent = noCases
      ? 'You didn’t open a case. That could mean many things.'
      : `${sentence(`You opened ${listFormat.format(r.casesOpened.map((c) => c.title))}`)} Whether ${one ? 'it was' : 'they were'} what you came for, this site can’t tell.`;
    // The portrait is drawn from the same moment.
    document.dispatchEvent(new CustomEvent('readout:paint'));
  };

  // Paint once now, and again as the close's top rises past 60% of the screen: the reader has finished the last
  // Chapter (its final entry can sit just above the close), the dot portrait is about to form from this same
  // snapshot, and the rows (below the title and the hand-off) are still out of sight. It then holds still while
  // the close is in view.
  paint();
  const close = root.closest('section') ?? root;
  new IntersectionObserver(
    ([en]) => {
      if (en.isIntersecting && !livePaused()) paint();
    },
    { rootMargin: '0px 0px -40% 0px' },
  ).observe(close);
}
