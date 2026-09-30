import { gsap } from 'gsap';

/**
 * The instrumentation lens: this site's own tagging, made visible. Every element the observation layer
 * records carries a data-observe tag; the lens outlines those, names their tags, and marks interactive
 * elements with no tag as coverage gaps (the idea behind the Data Instrumentation case, applied to itself).
 * On fine pointers a small tag also follows the cursor, naming what it is over.
 */

const INTERACTIVE = 'a[href], button, [data-observe]';

interface Mark {
  el: HTMLElement;
  box: HTMLElement;
  tagged: boolean;
}

function describe(el: HTMLElement) {
  const tag = el.closest<HTMLElement>('[data-observe]');
  return tag ? { tagged: true, text: tag.dataset.observe! } : { tagged: false, text: el.tagName === 'BUTTON' ? 'untagged button' : 'untagged link' };
}

const visible = (el: HTMLElement) => {
  if (el.closest('[hidden], [aria-hidden="true"]:not(a), .skip, .lens-layer, .field-labels')) return false;
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
  addEventListener(
    'pointermove',
    (e) => {
      x(e.clientX + 16);
      y(e.clientY + 18);
      const el = (e.target as Element).closest<HTMLElement>(INTERACTIVE);
      if (el === current) return;
      current = el;
      if (!el || !visible(el)) {
        chip.classList.remove('is-on');
        return;
      }
      const d = describe(el);
      chip.textContent = d.text;
      chip.classList.toggle('is-gap', !d.tagged);
      chip.classList.add('is-on');
    },
    { passive: true },
  );
  document.addEventListener('pointerleave', () => chip.classList.remove('is-on'));
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
  const tally = document.createElement('p');
  tally.className = 'lens-tally';
  layer.append(scan, tally);
  document.body.append(layer);

  let marks: Mark[] = [];
  let raf = 0;
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  const build = () => {
    layer.querySelectorAll('.lens-box').forEach((b) => b.remove());
    const seen = new Set<Element>();
    marks = [];
    document.querySelectorAll<HTMLElement>(INTERACTIVE).forEach((el) => {
      if (seen.has(el) || !visible(el)) return;
      // Nested interactive elements inside a tagged one are covered by that tag.
      const owner = el.closest<HTMLElement>('[data-observe]') ?? el;
      if (seen.has(owner)) return;
      seen.add(owner);
      const d = describe(owner);
      const box = document.createElement('div');
      box.className = `lens-box${d.tagged ? '' : ' is-gap'}`;
      const label = document.createElement('span');
      label.textContent = d.text;
      box.append(label);
      layer.append(box);
      marks.push({ el: owner, box, tagged: d.tagged });
    });
  };

  const place = () => {
    let tagged = 0;
    let gaps = 0;
    for (const m of marks) {
      const r = m.el.getBoundingClientRect();
      const onScreen = r.bottom > 0 && r.top < innerHeight && r.width > 0;
      m.box.style.display = onScreen ? '' : 'none';
      if (!onScreen) continue;
      m.box.style.transform = `translate3d(${r.left - 4}px, ${r.top - 4}px, 0)`;
      m.box.style.width = `${r.width + 8}px`;
      m.box.style.height = `${r.height + 8}px`;
      if (m.tagged) tagged++;
      else gaps++;
    }
    tally.textContent = `On screen: ${tagged} tracked · ${gaps} not tracked`;
    raf = requestAnimationFrame(place);
  };

  const set = (on: boolean) => {
    root.classList.toggle('lens-on', on);
    btn.setAttribute('aria-pressed', String(on));
    btn.textContent = on ? 'Hide tracking' : 'Show tracking';
    cancelAnimationFrame(raf);
    if (!on) return;
    build();
    place();
    if (reduce()) return;
    // A scan passes down the screen and the outlines appear as it reaches them.
    gsap.fromTo(scan, { y: 0, opacity: 1 }, { y: innerHeight, duration: 0.9, ease: 'scene', onComplete: () => gsap.set(scan, { opacity: 0, y: 0 }) });
    marks.forEach((m) => {
      const top = m.el.getBoundingClientRect().top;
      gsap.fromTo(m.box, { opacity: 0 }, { opacity: 1, duration: 0.35, delay: Math.max(0, Math.min(0.9, (top / innerHeight) * 0.9)), ease: 'out' });
    });
  };

  btn.closest('p')!.hidden = false;
  btn.addEventListener('click', () => set(!root.classList.contains('lens-on')));
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('lens-on')) set(false);
  });
}
