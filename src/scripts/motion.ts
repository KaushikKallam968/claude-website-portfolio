import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';
import Lenis from 'lenis';
import { startTimeShifts } from './timeshift';
import { record, elapsed } from './notes';

/**
 * One motion grammar for the whole site: position, opacity and clip only.
 * "out" is the entrance curve, "scene" the in-out used when something changes place.
 */
gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
CustomEase.create('out', 'M0,0 C0.16,1 0.3,1 1,1');
CustomEase.create('scene', 'M0,0 C0.86,0 0.07,1 1,1');

export let lenis: Lenis | null = null;

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function reveal(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-reveal], .hero__word, [data-split]').forEach((el) => {
    el.style.opacity = '1';
  });
  document.documentElement.classList.add('motion-done');
}

function smoothScroll() {
  lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), anchors: { offset: -64 }, autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

function intro() {
  const words = gsap.utils.toArray<HTMLElement>('.hero__word');
  if (!words.length) return;
  const splits = words.map((w) => SplitText.create(w, { type: 'chars', charsClass: 'ch', aria: 'none' }));
  gsap.set(words, { opacity: 1 });
  const tl = gsap.timeline({ defaults: { ease: 'out' }, onComplete: () => document.documentElement.classList.add('motion-done') });
  splits.forEach((s, i) => {
    tl.from(s.chars, { yPercent: 108, duration: 1.35, stagger: 0.034 }, i * 0.12);
  });
  tl.fromTo('[data-reveal]', { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.08, clearProps: 'transform' }, 0.42);
  tl.from('.route__item', { y: 18, opacity: 0, duration: 1, stagger: 0.05 }, 0.7);
  tl.from('.notes', { clipPath: 'inset(0 0 100% 0)', duration: 1.2, ease: 'scene' }, 0.75);

  attentionTrace(splits.flatMap((s) => s.chars as HTMLElement[]));

  // As the reader leaves the hero, the two halves of the name drift apart.
  const [l1, l2] = gsap.utils.toArray<HTMLElement>('.hero__line');
  if (l1 && l2) {
    const st = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 };
    gsap.to(l1, { xPercent: -14, ease: 'none', scrollTrigger: st });
    gsap.to(l2, { xPercent: 10, ease: 'none', scrollTrigger: st });
  }
}

/**
 * The name keeps a trace of where the pointer has been: letters warm toward the annotation blue and cool
 * over a few seconds. It is the observation layer made visible, and it never changes layout.
 */
function attentionTrace(chars: HTMLElement[]) {
  if (!chars.length || !matchMedia('(pointer: fine)').matches) return;
  const name = document.querySelector<HTMLElement>('.hero__name')!;
  const heat = new Float32Array(chars.length);
  let px = -1e4;
  let py = -1e4;
  let active = false;
  let noted = false;
  addEventListener('pointermove', (e) => {
    px = e.clientX;
    py = e.clientY;
    active = true;
  }, { passive: true });
  name.addEventListener('pointermove', () => {
    if (noted) return;
    noted = true;
    record({ type: 'point', t: elapsed(), tag: 'hero.name', label: 'my name' });
  });
  gsap.ticker.add(() => {
    if (!active || name.getBoundingClientRect().bottom < 0) return;
    let warm = 0;
    for (let i = 0; i < chars.length; i++) {
      const b = chars[i].getBoundingClientRect();
      const dx = px - (b.left + b.width / 2);
      const dy = py - (b.top + b.height / 2);
      const near = Math.exp(-(dx * dx + dy * dy) / (2 * 85 * 85));
      heat[i] = Math.max(heat[i] * 0.972, near);
      if (heat[i] < 0.002) heat[i] = 0;
      warm += heat[i];
      chars[i].style.setProperty('--heat', heat[i].toFixed(3));
    }
    if (warm === 0) active = false; // nothing left to cool; sleep until the pointer moves
  });
}

function chapters() {
  gsap.utils.toArray<HTMLElement>('.chapter').forEach((ch) => {
    const word = ch.querySelector<HTMLElement>('.chapter__word');
    const head = ch.querySelector('.chapter__head');
    if (word) {
      const s = SplitText.create(word, { type: 'words,chars', charsClass: 'ch', wordsClass: 'wd', mask: 'chars', aria: 'auto' });
      gsap.from(s.chars, {
        yPercent: 110,
        duration: 1.3,
        stagger: 0.03,
        ease: 'out',
        scrollTrigger: { trigger: head, start: 'top 82%', once: true },
      });
    }
    gsap.from(ch.querySelectorAll('.chapter__no, .chapter__meta > div, .chapter__qual'), {
      y: 16,
      opacity: 0,
      duration: 1,
      stagger: 0.06,
      ease: 'out',
      scrollTrigger: { trigger: head, start: 'top 80%', once: true },
    });
    ch.querySelectorAll<HTMLElement>('.chapter__body').forEach((b) =>
      gsap.from(b.querySelectorAll('.chapter__text > *, .chapter__roles > li'), {
        y: 28,
        opacity: 0,
        duration: 1.1,
        stagger: 0.07,
        ease: 'out',
        scrollTrigger: { trigger: b, start: 'top 85%', once: true },
      }),
    );
    ch.querySelectorAll<HTMLElement>('.entry').forEach((row) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 88%', once: true }, defaults: { ease: 'out' } });
      tl.from(row, { '--line': 0, duration: 1.2, ease: 'scene' });
      tl.from(row.querySelectorAll('.entry__rail, .entry__kind, .entry__title, .entry__preview, .entry__side'), { y: 30, opacity: 0, duration: 1.1, stagger: 0.06 }, 0.1);
    });
  });

  const close = document.querySelector('.close__title');
  if (close) {
    const s = SplitText.create(close, { type: 'lines', mask: 'lines', linesClass: 'ln', aria: 'auto' });
    gsap.from(s.lines, { yPercent: 105, duration: 1.3, stagger: 0.1, ease: 'out', scrollTrigger: { trigger: close, start: 'top 85%', once: true } });
  }
}

/** Figures play their small demonstration once, when most of them is on screen. */
function figures() {
  const figs = document.querySelectorAll<HTMLElement>('[data-fig]');
  if (reduced()) {
    figs.forEach((f) => f.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      }
    },
    { threshold: 0.45 },
  );
  figs.forEach((f) => io.observe(f));
}

export function startMotion() {
  figures();
  if (reduced()) {
    startTimeShifts(true);
    reveal();
    return;
  }
  startTimeShifts(false);
  smoothScroll();
  document.fonts.ready.then(() => {
    intro();
    chapters();
    ScrollTrigger.refresh();
  });
  // Failsafe: never leave text hidden if something above throws.
  setTimeout(() => reveal(), 3500);
}
