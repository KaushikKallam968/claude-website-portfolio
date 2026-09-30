/**
 * Whether a pointer arriving over an element was the reader's doing. Browsers also report it when the page
 * scrolls under a pointer that is resting still; noting that as "You pointed at …" would record intent that
 * never happened, the very mistake the Instrumentation case is about.
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
    /** A hover counts unless the page has scrolled and the pointer is still exactly where it last moved to. */
    counts(px: number, py: number) {
      return !(scrolledSinceMove && px === x && py === y);
    },
  };
}
