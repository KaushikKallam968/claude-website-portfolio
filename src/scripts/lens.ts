import { gsap } from 'gsap';

/**
 * The instrumentation lens: this site's own tagging, made visible. Every element the observation layer
 * records carries a data-observe tag; the lens outlines those, names their tags, and marks interactive
 * elements with no tag as coverage gaps (the idea behind the Data Instrumentation case, applied to itself).
 * It also shows the other half of that case, quality: a tag carried by more than one control on the page is
 * recorded, but can't say which of them was used.
 * While it is on, fine pointers also get a small tag that follows the cursor, naming what it is over; with the
 * lens off the pointer carries nothing, so reading is never interrupted.
 */

const INTERACTIVE = 'a[href], button, [data-observe]';

interface Mark {
  el: HTMLElement;
  box: HTMLElement;
  label: HTMLElement;
  labelW: number;
  labelH: number;
  /** An inline link wrapping a block of text (a two-line title) measures by its children, not its line box. */
  inline: boolean;
  tagged: boolean;
  /** Another control on this page sends the same tag, so a record of it can't say which was used. */
  shared: boolean;
}

/** How many visible controls on the page carry each tag. */
const tagCounts = () => {
  const counts = new Map<string, number>();
  document.querySelectorAll<HTMLElement>('[data-observe]').forEach((el) => {
    if (!visible(el)) return;
    const t = el.dataset.observe!;
    counts.set(t, (counts.get(t) ?? 0) + 1);
  });
  return counts;
};

const rectOf = (m: Mark) => {
  const r = m.el.getBoundingClientRect();
  if (!m.inline) return r;
  let [x0, y0, x1, y1] = [r.left, r.top, r.right, r.bottom];
  for (const c of m.el.children) {
    const q = c.getBoundingClientRect();
    if (q.width === 0) continue;
    [x0, y0, x1, y1] = [Math.min(x0, q.left), Math.min(y0, q.top), Math.max(x1, q.right), Math.max(y1, q.bottom)];
  }
  return new DOMRect(x0, y0, x1 - x0, y1 - y0);
};

function describe(el: HTMLElement) {
  const tag = el.closest<HTMLElement>('[data-observe]');
  return tag ? { tagged: true, text: tag.dataset.observe! } : { tagged: false, text: el.tagName === 'BUTTON' ? 'untagged button' : 'untagged link' };
}

const visible = (el: HTMLElement) => {
  if (el.closest('[hidden], [aria-hidden="true"]:not(a), .skip, .lens-layer, .lens-bar, .field-labels')) return false;
  const r = el.getBoundingClientRect();
  return r.width > 2 && r.height > 2;
};

function cursorTag() {
  if (!matchMedia('(pointer: fine)').matches) return;
  const chip = document.createElement('p');
  chip.className = 'lens-cursor';
  chip.setAttribute('aria-hidden', 'true');
  document.body.append(chip);
  const x = gsap.quickTo(chip, 'x', { duration: 0.45, ease: 'out' });
  const y = gsap.quickTo(chip, 'y', { duration: 0.45, ease: 'out' });
  let current: Element | null = null;
  let px = -1;
  let py = -1;
  // What is under the pointer can change without the pointer moving (scrolling), so both update the tag.
  const lensOn = () => document.documentElement.classList.contains('lens-on');
  const update = (target: Element | null) => {
    const el = lensOn() ? (target?.closest<HTMLElement>(INTERACTIVE) ?? null) : null;
    if (el === current) return;
    current = el;
    if (!el || !visible(el)) {
      chip.classList.remove('is-on');
      return;
    }
    const d = describe(el);
    const n = d.tagged ? (tagCounts().get(d.text) ?? 1) : 1;
    chip.textContent = n > 1 ? `${d.text} · sent by ${n} controls` : d.text;
    chip.classList.toggle('is-gap', !d.tagged);
    chip.classList.add('is-on');
  };
  const follow = () => {
    // Keep the tag inside the viewport: it flips to the other side of the pointer near an edge.
    const w = chip.offsetWidth || 120;
    const h = chip.offsetHeight || 20;
    x(px + 16 + w > innerWidth - 8 ? px - 12 - w : px + 16);
    y(py + 18 + h > innerHeight - 8 ? py - 12 - h : py + 18);
  };
  addEventListener(
    'pointermove',
    (e) => {
      px = e.clientX;
      py = e.clientY;
      update(e.target as Element);
      follow();
    },
    { passive: true },
  );
  addEventListener('scroll', () => px >= 0 && update(document.elementFromPoint(px, py)), { passive: true });
  document.addEventListener('pointerleave', () => {
    current = null;
    chip.classList.remove('is-on');
  });
}

export function startLens() {
  cursorTag();
  const btn = document.querySelector<HTMLButtonElement>('[data-lens-toggle]');
  if (!btn) return;
  const root = document.documentElement;
  const layer = document.createElement('div');
  layer.className = 'lens-layer';
  layer.setAttribute('aria-hidden', 'true');
  const scan = document.createElement('div');
  scan.className = 'lens-scan';
  layer.append(scan);
  // The tally and a way out sit together at the bottom left, within a thumb's reach: on touch there is no
  // Escape key, and the toggle may be scrolled away or under an outline.
  const bar = document.createElement('div');
  bar.className = 'lens-bar';
  const tally = document.createElement('p');
  tally.className = 'lens-tally';
  tally.setAttribute('aria-hidden', 'true');
  const exit = document.createElement('button');
  exit.type = 'button';
  exit.className = 'lens-exit';
  exit.textContent = 'Hide tracking';
  exit.dataset.observe = 'lens.hide';
  exit.dataset.observeLabel = 'Hide tracking';
  exit.dataset.observeCannot = 'Whether you found what you were looking for.';
  bar.append(tally, exit);
  document.body.append(layer, bar);

  let marks: Mark[] = [];
  const coarse = matchMedia('(pointer: coarse)');
  let raf = 0;
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  const build = () => {
    layer.querySelectorAll('.lens-box').forEach((b) => b.remove());
    const seen = new Set<Element>();
    const counts = tagCounts();
    marks = [];
    document.querySelectorAll<HTMLElement>(INTERACTIVE).forEach((el) => {
      if (seen.has(el) || !visible(el)) return;
      // Nested interactive elements inside a tagged one are covered by that tag.
      const owner = el.closest<HTMLElement>('[data-observe]') ?? el;
      if (seen.has(owner)) return;
      seen.add(owner);
      const d = describe(owner);
      const shared = d.tagged && (counts.get(d.text) ?? 0) > 1;
      const box = document.createElement('div');
      box.className = `lens-box${d.tagged ? '' : ' is-gap'}${shared ? ' is-shared' : ''}`;
      const label = document.createElement('span');
      label.textContent = shared ? `${d.text} · shared` : d.text;
      box.append(label);
      layer.append(box);
      marks.push({ el: owner, box, label, labelW: 0, labelH: 0, inline: getComputedStyle(owner).display === 'inline', tagged: d.tagged, shared });
    });
    // Measure each label once, so placing them never forces a layout per frame.
    marks.forEach((m) => {
      m.labelW = m.label.offsetWidth;
      m.labelH = m.label.offsetHeight;
    });
  };

  const place = () => {
    let tagged = 0;
    let shared = 0;
    let gaps = 0;
    // Read every rect before writing any style, so the loop never forces a layout per element.
    const rects = marks.map(rectOf);
    // A control under the fixed chrome (the top bar, the open notes sheet) is out of sight, so it is not outlined;
    // nor is the margin while a map scene has faded it out.
    const railFaded = root.classList.contains('in-scene');
    const covered = rects.map((r, i) => {
      if (r.bottom <= 0 || r.top >= innerHeight) return false;
      if (railFaded && marks[i].el.closest('.rail')) return true;
      const hit = document.elementFromPoint(r.left + r.width / 2, Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2)));
      return Boolean(hit && !marks[i].el.contains(hit) && hit.closest('.top, .notes') && !hit.closest('.top, .notes')!.contains(marks[i].el));
    });
    const labelled = coarse.matches;
    // The notes ticker's line is text a reader follows, so no label is laid over it.
    const avoid = labelled
      ? [...document.querySelectorAll<HTMLElement>('.notes__latest')]
          .map((e) => e.getBoundingClientRect())
          .filter((q) => q.width > 0 && q.bottom > 0 && q.top < innerHeight)
          .map((q) => ({ x0: q.left, y0: q.top, x1: q.right, y1: q.bottom }))
      : [];
    const taken: { x0: number; y0: number; x1: number; y1: number }[] = [...avoid];
    marks.forEach((m, i) => {
      const r = rects[i];
      const onScreen = r.bottom > 0 && r.top < innerHeight && r.width > 0 && !covered[i];
      m.box.style.display = onScreen ? '' : 'none';
      if (!onScreen) return;
      m.box.style.transform = `translate3d(${r.left - 4}px, ${r.top - 4}px, 0)`;
      m.box.style.width = `${r.width + 8}px`;
      m.box.style.height = `${r.height + 8}px`;
      // Labels sit outside their outline, so they never cover what they name: above it, or below it near the
      // top of the screen, and slid left as far as needed to stay on screen.
      const below = r.top < 90;
      m.box.classList.toggle('is-top', below);
      if (labelled) {
        // Slide left to stay on screen, then step away from the outline until clear of labels already placed.
        const over = r.left - 4 + m.labelW - (innerWidth - 6);
        const dx = over > 0 ? -Math.min(over, r.left - 6) : 0;
        const x0 = r.left - 5 + dx;
        let y0 = below ? r.bottom + 4 : r.top - 4 - m.labelH;
        let dy = 0;
        const clash = (t: { x0: number; y0: number; x1: number; y1: number }) => x0 < t.x1 && x0 + m.labelW > t.x0 && y0 + dy < t.y1 && y0 + dy + m.labelH > t.y0;
        // Clear of labels already placed, and of every other outlined control, so no label covers a control.
        const hits = () => taken.some(clash) || rects.some((o, j) => j !== i && !covered[j] && o.width > 0 && clash({ x0: o.left - 4, y0: o.top - 4, x1: o.right + 4, y1: o.bottom + 4 }));
        // Two steps at most: a label further from its outline than that no longer reads as its name.
        for (let k = 0; k < 2 && hits(); k++) dy += (below ? 1 : -1) * (m.labelH + 2);
        // With no clear place the label is left out; the outline still marks the control.
        const clear = !hits();
        m.label.style.visibility = clear ? '' : 'hidden';
        if (clear) taken.push({ x0, y0: y0 + dy, x1: x0 + m.labelW, y1: y0 + dy + m.labelH });
        m.label.style.translate = dx || dy ? `${dx}px ${dy}px` : '';
      }
      if (m.shared) shared++;
      else if (m.tagged) tagged++;
      else gaps++;
    });
    tally.textContent = `On screen: ${tagged} tracked${shared ? ` · ${shared} share a tag` : ''} · ${gaps} not tracked`;
    raf = requestAnimationFrame(place);
  };

  const set = (on: boolean) => {
    root.classList.toggle('lens-on', on);
    btn.setAttribute('aria-pressed', String(on));
    btn.textContent = on ? 'Hide tracking' : 'Show tracking';
    if (!on) document.querySelector('.lens-cursor')?.classList.remove('is-on');
    cancelAnimationFrame(raf);
    if (!on) return;
    // On a small screen the lens is switched on from the Notes sheet; the sheet steps aside so the outlines
    // and their labels fall on the page, not on its text.
    document.dispatchEvent(new CustomEvent('lens:on'));
    build();
    place();
    if (reduce()) return;
    // A scan passes down the screen and the outlines appear as it reaches them.
    gsap.fromTo(scan, { y: 0, opacity: 1 }, { y: innerHeight, duration: 0.9, ease: 'scene', onComplete: () => gsap.set(scan, { opacity: 0, y: 0 }) });
    marks.forEach((m) => {
      const top = rectOf(m).top;
      gsap.fromTo(m.box, { opacity: 0 }, { opacity: 1, duration: 0.35, delay: Math.max(0, Math.min(0.9, (top / innerHeight) * 0.9)), ease: 'out' });
    });
  };

  btn.closest('p')!.hidden = false;
  btn.addEventListener('click', () => set(!root.classList.contains('lens-on')));
  exit.addEventListener('click', () => {
    set(false);
    btn.focus({ preventScroll: true });
  });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('lens-on')) set(false);
  });
}
