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

function intro(field: FieldHandle | null) {
  const words = gsap.utils.toArray<HTMLElement>('.hero__word');
  if (!words.length) return;
  const root = document.documentElement;

  if (field) {
    // The Field draws the name; the words stay as the accessible, selectable text underneath.
    gsap.set(words, { opacity: 1 });
    const tl = gsap.timeline({ defaults: { ease: 'out' }, delay: field.textCue, onComplete: () => root.classList.add('motion-done') });
    tl.fromTo('[data-reveal]', { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.08, clearProps: 'transform' }, 0);
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
      const s = SplitText.create(word, { type: 'words,chars', charsClass: 'ch', wordsClass: 'wd', mask: 'chars', aria: 'auto' });
      gsap.from(s.chars, {
        yPercent: 110,
        duration: 1.3,
        stagger: 0.03,
        ease: 'out',
        scrollTrigger: { trigger: head, start: 'top 82%', once: true },
      });
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

/** On Case pages the figure holds while scrolling plays it: progress drives its parts and its steps. */
function figureScenes() {
  document.querySelectorAll<HTMLElement>('[data-fig-scene]').forEach((scene) => {
    const stage = scene.querySelector<HTMLElement>('.scene__stage')!;
    const marks: number[] = JSON.parse(scene.dataset.steps ?? '[]');
    const items = [...scene.querySelectorAll<HTMLElement>('[data-step]')];
    let current = -1;
    const update = (p: number) => {
      stage.style.setProperty('--p', p.toFixed(4));
      let step = 0;
      marks.forEach((at, i) => {
        if (p >= at) step = i;
      });
      if (step === current) return;
      current = step;
      items.forEach((li, i) => {
        li.classList.toggle('is-on', i === step);
        li.classList.toggle('is-past', i < step);
      });
    };
    ScrollTrigger.create({ trigger: scene, start: 'top top+=64', end: 'bottom bottom', onUpdate: (st) => update(st.progress), onRefresh: (st) => update(st.progress) });
    update(0);
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
    intro(field);
    chapters();
    ScrollTrigger.refresh();
  });
  // Failsafe: never leave text hidden if something above throws.
  setTimeout(() => reveal(), 5500);
}
