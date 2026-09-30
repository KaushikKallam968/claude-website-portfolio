/**
 * Whether a pointer arriving over an element was the reader's doing. Browsers also report it when the page
 * scrolls under a pointer that is resting still; noting that as "You pointed at …" would record intent that
 * never happened, the very mistake the Instrumentation case is about. So do pages that load under a pointer
 * that has not moved yet (Back, with the mouse at rest).
 */
export function createHoverIntent() {
  let x = NaN;
  let y = NaN;
  let scrolledSinceMove = false;
  return {
    moved(px: number, py: number) {
      x = px;
      y = py;
      scrolledSinceMove = false;
    },
    scrolled() {
      scrolledSinceMove = true;
    },
    /** A hover counts once the pointer has moved on this page, unless the page has since scrolled under it at rest. */
    counts(px: number, py: number) {
      if (Number.isNaN(x)) return false;
      return !(scrolledSinceMove && px === x && py === y);
    },
  };
}
