import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';
import Lenis from 'lenis';
import { startTimeShifts } from './timeshift';
import { startField, type FieldHandle } from './field';
import { record, elapsed } from './notes';
import { livePaused } from './navigation';

/**
 * One motion grammar for the whole site: position, opacity and clip only.
 * "out" is the entrance curve, "scene" the in-out used when something changes place.
 */
gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
CustomEase.create('out', 'M0,0 C0.16,1 0.3,1 1,1');
CustomEase.create('scene', 'M0,0 C0.86,0 0.07,1 1,1');

let lenis: Lenis | null = null;

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function reveal() {
  document.querySelectorAll<HTMLElement>('[data-reveal], .hero__word, [data-split]').forEach((el) => {
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

/**
 * Content that opens in place (a Summary, Research in Development) moves everything below it, so the
 * scroll scenes measure again once the page has settled at its new height. The Field listens for the same
 * refresh and re-measures its bands.
 */
function remeasureOnGrowth() {
  let settled = document.body.scrollHeight;
  let timer = 0;
  ScrollTrigger.addEventListener('refresh', () => (settled = document.body.scrollHeight));
  new ResizeObserver(() => {
    if (Math.abs(document.body.scrollHeight - settled) < 2) return;
    clearTimeout(timer);
    timer = window.setTimeout(() => ScrollTrigger.refresh(), 120);
  }).observe(document.body);
}

function intro(field: FieldHandle | null) {
  const words = gsap.utils.toArray<HTMLElement>('.hero__word');
  if (!words.length) return;
  const root = document.documentElement;

  if (field) {
    // The Field draws the name; the words stay as the accessible, selectable text underneath.
    gsap.set(words, { opacity: 1 });
    // Who this is and what they do is never held back by the arrival: that text is part of the first paint
    // (see global.css), and the world draws behind it. The index and the notes follow the name.
    const tl = gsap.timeline({ defaults: { ease: 'out' }, delay: field.textCue, onComplete: () => root.classList.add('motion-done') });
    tl.fromTo('.route__list', { '--rule-w': 0 }, { '--rule-w': 1, duration: 1.2, ease: 'scene' }, 0.1);
    tl.fromTo('.route__item', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.05 }, 0.25);
    tl.fromTo('.rail .notes', { clipPath: 'inset(0 0 100% 0)', opacity: 1 }, { clipPath: 'inset(0 0 0% 0)', opacity: 1, duration: 1.2, ease: 'scene' }, 0.3);
    return;
  }

  const splits = words.map((w) => SplitText.create(w, { type: 'chars', charsClass: 'ch', aria: 'none' }));
  gsap.set(words, { opacity: 1 });
  const tl = gsap.timeline({ defaults: { ease: 'out' }, onComplete: () => root.classList.add('motion-done') });
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
    record({ type: 'point', t: elapsed(), tag: 'hero.name', label: 'my name', cannotShow: 'Whether you were reading it or just passing through.' });
  });
  gsap.ticker.add((_time, deltaMs) => {
    if (!active || name.getBoundingClientRect().bottom < 0) return;
    const cool = Math.exp(-deltaMs / 900); // a letter cools to a third of its heat in about a second
    let warm = 0;
    for (let i = 0; i < chars.length; i++) {
      const b = chars[i].getBoundingClientRect();
      const dx = px - (b.left + b.width / 2);
      const dy = py - (b.top + b.height / 2);
      const near = Math.exp(-(dx * dx + dy * dy) / (2 * 70 * 70));
      heat[i] = Math.max(heat[i] * cool, near);
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
      const s = SplitText.create(word, { type: 'words,chars', charsClass: 'ch', wordsClass: 'wd', mask: 'chars', aria: 'none' });
      const qual = ch.querySelector<HTMLElement>('.chapter__qual');
      const tl = gsap.timeline({ scrollTrigger: { trigger: head, start: 'top 82%', once: true } });
      // Far enough below the mask that no ascender peeks over its edge before the word rises (the headline's
      // line height is tighter than its glyphs).
      tl.from(s.chars, { yPercent: 140, duration: 1.3, stagger: 0.03, ease: 'out' });
      // The qualifier follows its word in, never ahead of it.
      if (qual) tl.from(qual, { opacity: 0, x: -14, duration: 0.8, ease: 'out' }, 0.45);
      // So does the place's data: it never stands on screen above a heading that has not arrived yet.
      const meta = ch.querySelectorAll<HTMLElement>('.chapter__meta > div');
      if (meta.length) tl.from(meta, { opacity: 0, y: 10, duration: 0.8, stagger: 0.06, ease: 'out' }, 0.3);
      // Keyboard focus arriving in the chapter finishes the reveal, so a heading is never read half-masked.
      ch.addEventListener('focusin', () => tl.progress(1), { once: true });
    }
    // Reading text never fades in: only the chapter word and the rules between entries move.
    ch.querySelectorAll<HTMLElement>('.entry').forEach((row) => {
      gsap.from(row, { '--line': 0, duration: 1.2, ease: 'scene', scrollTrigger: { trigger: row, start: 'top 88%', once: true } });
    });
  });

  const close = document.querySelector('.close__title');
  if (close) {
    const s = SplitText.create(close, { type: 'lines', mask: 'lines', linesClass: 'ln', aria: 'auto' });
    gsap.from(s.lines, { yPercent: 105, duration: 1.3, stagger: 0.1, ease: 'out', scrollTrigger: { trigger: close, start: 'top 85%', once: true } });
  }
}

/**
 * On Case pages the figure plays its argument in place, step by step, once it is on screen: progress
 * (--p) drives its parts and the numbered caption follows. Any step can be chosen directly; choosing one
 * stops the autoplay. Nothing holds the scroll.
 */
function figureScenes() {
  const STEP_MS = 2400;
  // Parts are hidden for the step sequence only once this script is running, so a failed load never hides them.
  if (document.querySelector('[data-fig-scene]')) document.documentElement.classList.add('scenes');
  document.querySelectorAll<HTMLElement>('[data-fig-scene]').forEach((scene) => {
    const stage = scene.querySelector<HTMLElement>('.scene__stage')!;
    const marks: number[] = JSON.parse(scene.dataset.steps ?? '[]');
    const items = [...scene.querySelectorAll<HTMLElement>('[data-step]')];
    const state = { p: 0 };
    let step = -1;
    let timer = 0;
    stage.style.setProperty('--step-ms', `${STEP_MS}ms`);
    const paint = () => stage.style.setProperty('--p', state.p.toFixed(4));
    // Each step plays from its own mark to the next, so the parts it introduces arrive while it is shown.
    const show = (i: number, duration = 1.4) => {
      step = i;
      items.forEach((li, k) => {
        li.classList.toggle('is-on', k === i);
        li.classList.toggle('is-done', k < i);
        // The current step is announced, not only coloured.
        const b = li.querySelector('button');
        if (k === i) b?.setAttribute('aria-current', 'step');
        else b?.removeAttribute('aria-current');
      });
      const end = i + 1 < marks.length ? marks[i + 1] - 0.001 : 1;
      gsap.to(state, { p: end, duration, ease: 'scene', onUpdate: paint, overwrite: true });
    };
    const play = () => {
      clearTimeout(timer);
      if (step >= marks.length - 1) return;
      // Paused: wait, and carry on when live motion resumes.
      if (livePaused()) {
        timer = window.setTimeout(play, 500);
        return;
      }
      show(step + 1);
      timer = window.setTimeout(play, STEP_MS);
    };
    items.forEach((li, i) =>
      li.querySelector('button')?.addEventListener('click', () => {
        clearTimeout(timer);
        if (i < step) {
          state.p = marks[i];
          paint();
        }
        show(i, 0.9);
      }),
    );
    paint();
    const io = new IntersectionObserver(
      ([en]) => {
        if (!en.isIntersecting) return;
        io.disconnect();
        play();
      },
      { threshold: 0.55 },
    );
    io.observe(stage);
  });
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
  if (!reduced()) figureScenes();
  if (reduced()) {
    startTimeShifts(true, livePaused);
    reveal();
    return;
  }
  smoothScroll();
  document.fonts.ready.then(async () => {
    const wantsField = document.documentElement.classList.contains('field');
    const field = wantsField ? await startField().catch(() => null) : null;
    if (!field) document.documentElement.classList.remove('field');
    startTimeShifts(false, livePaused);
    // After a slow load the failsafe has already shown the page; an entrance now would only hide it again.
    if (!document.documentElement.classList.contains('motion-done')) intro(field);
    chapters();
    ScrollTrigger.refresh();
    remeasureOnGrowth();
  });
  // Failsafe: never leave text hidden if something above throws.
  setTimeout(() => reveal(), 5500);
}
