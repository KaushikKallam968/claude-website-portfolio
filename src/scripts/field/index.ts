import { gsap } from 'gsap';
import { equalEarth, greatCircle, subsolarPoint, type LonLat } from '../../lib/geo';
import { KEYS, session } from '../../lib/store';
import { clockFormat } from '../clock';
import { livePaused } from '../navigation';
import { record, elapsed, readout } from '../notes';
import { dotUnit } from '../../lib/visit';
import { cssColor } from './gl';
import { sampleName } from './name';
import { FieldRenderer, type Camera, type FieldFrame } from './renderer';

/**
 * The Journey's single moving image, in three acts:
 *  1. Arrival: the world appears (with tonight's real day and night), the route draws from Singapore to
 *     New York, and the dots gather into the name.
 *  2. The Journey: scrolling out of the introduction dissolves the name back into the world and flies to
 *     New York; each Time Shift flies the map to the next place while its clock rolls.
 *  3. The visit (visit.ts): at the close the same dots count the visitor's own time.
 * Reading happens in between, on a quiet page: the map fades out before each Chapter's text.
 */

interface Place {
  id: string;
  label: string;
  short: string;
  lat: number;
  lon: number;
  tz: string;
}

interface Window {
  kind: 'intro' | 'shift' | 'visit';
  start: number;
  end: number;
  /** Where the next Chapter begins: the map is gone before its heading reaches the reader. */
  nextTop: number;
  from: number; // index into places (page order)
  to: number;
  /** A domestic flight: the scene is a band of the page, [top, bottom], and the map draws only inside it. */
  band?: [number, number];
}

const TRAIL = 20;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export interface FieldHandle {
  /** Seconds until the name has formed, so the rest of the introduction can follow it. */
  textCue: number;
}

export async function startField(): Promise<FieldHandle | null> {
  const root = document.documentElement;
  const heading = document.querySelector<HTMLElement>('.hero__name');
  const placesEl = document.getElementById('field-places');
  if (!heading || !placesEl || !('WebGL2RenderingContext' in window)) return null;

  let renderer: FieldRenderer;
  const canvas = document.createElement('canvas');
  canvas.className = 'field-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  try {
    renderer = new FieldRenderer(canvas);
  } catch {
    return null;
  }

  const places: Place[] = JSON.parse(placesEl.textContent ?? '[]');
  const [bin] = await Promise.all([
    fetch('/data/world-dots.bin').then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(r.status))),
    document.fonts.load(`${getComputedStyle(heading).fontWeight} 100px Switzer`),
  ]).catch(() => [null]);
  if (!bin) return null;

  document.body.prepend(canvas);
  root.classList.add('field-on');
  // If the GPU drops the context, fall back to the plain page: HTML name, static bands, no scenes.
  let lost = false;
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    lost = true;
    root.classList.remove('field-on', 'field', 'in-scene');
    canvas.remove();
    document.querySelector('.field-labels')?.remove();
    import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => ScrollTrigger.refresh());
  });

  // ---------- The world ----------
  const raw = new Int16Array(bin);
  const narrow = innerWidth < 700;
  const step = narrow ? 2 : 1; // phones draw every other dot
  const world: { x: number; y: number; lon: number; lat: number }[] = [];
  for (let i = 0; i < raw.length; i += 2 * step) {
    const lon = raw[i] / 100;
    const lat = raw[i + 1] / 100;
    const [x, y] = equalEarth(lon, lat);
    world.push({ x, y, lon, lat });
  }
  world.sort((a, b) => a.x - b.x);
  const mapWidth = equalEarth(150 + 179.99, 0)[0] * 2;

  // ---------- The route: chronological, so the page travels it backwards ----------
  const chrono = [...places].reverse();
  const routePts: { x: number; y: number; d: number }[] = [];
  const placeT = new Map<string, number>();
  let dist = 0;
  chrono.forEach((p, i) => {
    if (i === 0) {
      const [x, y] = equalEarth(p.lon, p.lat);
      routePts.push({ x, y, d: 0 });
      placeT.set(p.id, 0);
      return;
    }
    const prev = chrono[i - 1];
    const arc = greatCircle([prev.lon, prev.lat] as LonLat, [p.lon, p.lat] as LonLat, 160);
    for (let k = 1; k < arc.length; k++) {
      const [x, y] = equalEarth(arc[k][0], arc[k][1]);
      const last = routePts[routePts.length - 1];
      dist += Math.hypot(x - last.x, y - last.y);
      routePts.push({ x, y, d: dist });
    }
    placeT.set(p.id, dist);
  });
  const total = dist || 1;
  routePts.forEach((r) => (r.d /= total));
  placeT.forEach((v, k) => placeT.set(k, v / total));
  const tOf = (i: number) => placeT.get(places[i].id)!;

  const pointAt = (t: number): [number, number] => {
    let lo = 0;
    let hi = routePts.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (routePts[mid].d < t) lo = mid;
      else hi = mid;
    }
    const a = routePts[lo];
    const b = routePts[hi];
    const k = b.d === a.d ? 0 : (t - a.d) / (b.d - a.d);
    return [lerp(a.x, b.x, k), lerp(a.y, b.y, k)];
  };

  {
    const pos: number[] = [];
    const info: number[] = [];
    const gap = 0.011;
    for (let t = 0; t <= 1; t += gap / (total || 1)) {
      const [x, y] = pointAt(t);
      pos.push(x, y);
      info.push(t, 0, 0, 0);
    }
    chrono.forEach((p, i) => {
      const [x, y] = equalEarth(p.lon, p.lat);
      const t = placeT.get(p.id)!;
      pos.push(x, y, x, y);
      info.push(t, 2, i, 0, t, 1, i, 0);
    });
    pos.push(0, 0);
    info.push(0, 3, 0, 0);
    renderer.setRoute(new Float32Array(pos), new Float32Array(info), pos.length / 2);
  }

  // ---------- Place labels with live local time ----------
  const labelLayer = document.createElement('div');
  labelLayer.className = 'field-labels';
  labelLayer.setAttribute('aria-hidden', 'true');
  const labels = places.map((p) => {
    const el = document.createElement('p');
    el.className = 'field-label';
    el.innerHTML = `<span class="field-label__name"></span><span class="field-label__time num" data-clock="${p.tz}"></span>`;
    el.querySelector('.field-label__name')!.textContent = p.short;
    el.querySelector<HTMLElement>('.field-label__time')!.textContent = clockFormat(p.tz).format(new Date());
    labelLayer.append(el);
    const [x, y] = equalEarth(p.lon, p.lat);
    return { el, x, y, t: placeT.get(p.id)!, id: p.id, w: 0 };
  });
  document.body.prepend(labelLayer);

  // ---------- Layout ----------
  let vw = innerWidth;
  let vh = innerHeight;
  let nameDoc = { x: 0, y: 0 };
  let heroBottom = 0;
  let stageEnd = 1;
  let windows: Window[] = [];
  let worldCam: Camera = { x: 0, y: 0, z: 1 };
  let cityZoom = 4;
  let dotTotal = 0;
  let visitOrder: number[] = [];
  let mapXY = new Float32Array(0);
  let visitDoc = { x: 0, y: 0 };
  let visitRows: { id: string; x: number; y: number; w: number; h: number }[] = [];
  let visitSpacing = 4.4;
  let visitEndY = 0;
  let closeDocTop = Infinity;

  const fitZoom = (xs: number[], ys: number[], fillW: number, fillH: number) => {
    const w = Math.max(...xs) - Math.min(...xs) || 0.01;
    const h = Math.max(...ys) - Math.min(...ys) || 0.01;
    return Math.min((vw * fillW) / (w * renderer.scale), (vh * fillH) / (h * renderer.scale));
  };
  const placeXY = (i: number) => equalEarth(places[i].lon, places[i].lat);
  const cityCam = (i: number): Camera => {
    const [x, y] = placeXY(i);
    return { x, y, z: cityZoom };
  };

  function buildDots() {
    const cs = getComputedStyle(heading!);
    const size = parseFloat(cs.fontSize);
    const spacing = Math.min(5.2, Math.max(2.3, size / 52));
    const name = sampleName(heading!, spacing);
    renderer.sizes.name = spacing * (narrow ? 1.08 : 0.94);
    renderer.sizes.map = narrow ? 2.3 : 2.1;

    const nIdx = Array.from({ length: name.count }, (_, i) => i).sort((a, b) => name.points[a * 2] - name.points[b * 2]);
    const N = Math.max(name.count, world.length);
    const nameArr = new Float32Array(N * 3);
    const mapArr = new Float32Array(N * 4);
    const meta = new Float32Array(N * 4);
    const visit = new Float32Array(N * 4);
    const nameW = heading!.getBoundingClientRect().width || 1;
    let lastN = -1;
    let lastM = -1;
    for (let i = 0; i < N; i++) {
      const ni = nIdx[Math.floor((i * name.count) / N)];
      const mi = Math.floor((i * world.length) / N);
      const nx = name.points[ni * 2];
      nameArr.set([nx, name.points[ni * 2 + 1], ni !== lastN ? 1 : 0], i * 3);
      const w = world[mi];
      mapArr.set([w.x, w.y, (w.lon * Math.PI) / 180, (w.lat * Math.PI) / 180], i * 4);
      const ny = name.points[ni * 2 + 1];
      const band = (Math.sin(ny * 0.045 + nx * 0.004) + 1) / 2; // neighbouring dots share a bend
      meta.set([clamp01(0.62 * (nx / nameW) + 0.38 * Math.random()), (narrow ? 8 : 14) + Math.random() * (narrow ? 26 : 52), clamp01(band * 0.8 + Math.random() * 0.2), mi !== lastM ? 1 : 0], i * 4);
      visit.set([nx, name.points[ni * 2 + 1], 0, Math.random()], i * 4);
      lastN = ni;
      lastM = mi;
    }
    renderer.setDots({ name: nameArr, map: mapArr, meta, visit }, N);
    dotTotal = N;
    mapXY = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) mapXY.set([mapArr[i * 4], mapArr[i * 4 + 1]], i * 2);
    // Dots that stand for the visit are drawn from those visible on the map, in a shuffled order.
    visitOrder = [];
    for (let i = 0; i < N; i++) if (meta[i * 4 + 3] > 0) visitOrder.push(i);
    for (let i = visitOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [visitOrder[i], visitOrder[j]] = [visitOrder[j], visitOrder[i]];
    }
  }

  function measure() {
    vw = innerWidth;
    vh = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    renderer.resize(vw, vh, dpr, mapWidth);
    const sy = scrollY;
    const hr = heading!.getBoundingClientRect();
    nameDoc = { x: hr.left, y: hr.top + sy };
    const hero = heading!.closest('.hero') as HTMLElement;
    heroBottom = hero.getBoundingClientRect().bottom + sy;
    cityZoom = narrow ? 3 : 3.6;

    const xs = places.map((_, i) => placeXY(i)[0]);
    const ys = places.map((_, i) => placeXY(i)[1]);
    const wz = Math.min(1.3, fitZoom(xs, ys, narrow ? 0.84 : 0.56, 0.5));
    worldCam = {
      // On wide screens the route sits to the right of the introduction's text column.
      x: (Math.min(...xs) + Math.max(...xs)) / 2 - (narrow ? 0 : (vw * 0.13) / (renderer.scale * wz)),
      y: (Math.min(...ys) + Math.max(...ys)) / 2 + 0.05,
      z: wz,
    };

    const sectionTop = (id: string) => document.getElementById(id)!.getBoundingClientRect().top + sy;
    const pro = document.querySelector<HTMLElement>('[data-prologue]');
    const pr = pro?.getBoundingClientRect();
    const proStart = pr ? pr.top + sy : heroBottom;
    const proEnd = pr ? pr.top + sy + pr.height - vh : heroBottom;
    // The name finishes dissolving as the introduction leaves the screen, so it never sits under other text.
    stageEnd = Math.max(vh * 0.5, heroBottom - vh * 0.2);
    windows = [{ kind: 'intro', start: proStart, end: Math.max(proEnd, proStart + 1), nextTop: sectionTop(places[0].id), from: 0, to: 0 }];
    document.querySelectorAll<HTMLElement>('[data-shift]').forEach((el) => {
      const r = el.getBoundingClientRect();
      const from = places.findIndex((p) => p.id === el.dataset.fromId);
      const to = places.findIndex((p) => p.id === el.dataset.toId);
      if (from < 0 || to < 0) return;
      const top = r.top + sy;
      const bottom = top + r.height;
      if (el.classList.contains('shift--near')) {
        // Scrubbed across the band's whole passage: top entering at 90% of the screen to bottom leaving at 10%.
        windows.push({ kind: 'shift', start: top - vh * 0.9, end: bottom - vh * 0.1, nextTop: sectionTop(places[to].id), from, to, band: [top, bottom] });
      } else {
        windows.push({ kind: 'shift', start: top, end: bottom - vh, nextTop: sectionTop(places[to].id), from, to });
      }
    });

    // The close: the world evaporates into the rows of the visit readout.
    const bars = document.querySelector<HTMLElement>('[data-readout-bars]');
    if (bars) {
      const br = bars.getBoundingClientRect();
      visitDoc = { x: br.left, y: br.top + sy };
      visitSpacing = 0; // chosen per update so the longest row fills its track
      visitRows = [...bars.querySelectorAll<HTMLElement>('[data-bar]:not([hidden])')].map((li) => {
        const tr = li.querySelector('.readout__track')!.getBoundingClientRect();
        return {
          id: li.dataset.bar!,
          x: tr.left - br.left,
          y: tr.top - br.top,
          w: tr.width,
          h: tr.height,
        };
      });
      const close = bars.closest('section');
      closeDocTop = close ? close.getBoundingClientRect().top + sy : visitDoc.y - vh * 0.5;
      // The pour ends with the rows 62% of the way down the screen, or sooner if the page can't scroll that far
      // (a short readout on a phone or a tall screen) or if Contact lands short of it, so it always finishes
      // where the reader can stop.
      const maxY = document.documentElement.scrollHeight - vh;
      const contactY = close ? closeDocTop - (parseFloat(getComputedStyle(close).scrollMarginTop) || 0) - 64 : Infinity;
      visitEndY = Math.min(visitDoc.y - vh * 0.62, maxY - 4, contactY);
      const last = places.length - 1;
      windows.push({ kind: 'visit', start: Math.min(closeDocTop - vh * 0.5, visitEndY - 200), end: visitEndY, nextTop: Infinity, from: last, to: last });
    }
  }

  const unitEl = document.querySelector<HTMLElement>('[data-visit-unit]');
  function updateVisit() {
    if (!visitRows.length || !dotTotal) return;
    const r = readout();
    const all = elapsed();
    const ms = visitRows.map((row) => (row.id === 'outside' ? 0 : r.chapters.find((c) => c.id === row.id)?.ms ?? 0));
    const out = visitRows.findIndex((row) => row.id === 'outside');
    if (out >= 0) ms[out] = Math.max(0, all - ms.reduce((a, b) => a + b, 0));
    // Dot size adapts so the longest row fills most of its track: a short visit gets fewer, larger dots.
    // The unit is still the finest that fits at the smallest dot, and it is always stated.
    const grid = (s: number) => visitRows.map((row) => ({ cols: Math.max(1, Math.floor(row.w / s)), lines: Math.max(1, Math.floor(row.h / (s * 0.9))) }));
    const capacityAt = (s: number) => Math.min(...grid(s).map((g) => g.cols * g.lines));
    const minS = narrow ? 4.2 : 6;
    const maxS = narrow ? 9 : 13;
    const { phrase, counts } = dotUnit(ms, capacityAt(minS));
    const longest = Math.max(1, ...counts);
    // Keep the current size while it still fits and the row is at least half full, so dots rarely re-flow.
    if (!visitSpacing || capacityAt(visitSpacing) < longest || longest < capacityAt(visitSpacing) * 0.5) {
      let s = maxS;
      while (s > minS && capacityAt(s) < longest / 0.85) s -= 0.25;
      visitSpacing = s;
      renderer.sizes.visit = s * 0.8;
    }
    const cells = grid(visitSpacing);
    if (unitEl) {
      unitEl.hidden = false;
      unitEl.textContent = `Each dot is ${phrase} of your visit.`;
    }
    // Dots that are not part of the portrait head for where the world would be, fading as they go.
    const visit = new Float32Array(dotTotal * 4);
    const scale = renderer.scale * worldCam.z;
    const topAtEnd = visitDoc.y - visitEndY;
    for (let i = 0; i < dotTotal; i++) {
      visit[i * 4] = vw / 2 + (mapXY[i * 2] - worldCam.x) * scale - visitDoc.x;
      visit[i * 4 + 1] = vh / 2 + (worldCam.y - mapXY[i * 2 + 1]) * scale - topAtEnd;
      visit[i * 4 + 3] = (i * 0.618) % 1; // the rest of the world evaporates in no particular order
    }
    let k = 0;
    const rows = visitRows.length;
    visitRows.forEach((row, ri) => {
      const n = counts[ri];
      for (let j = 0; j < n && k < visitOrder.length; j++) {
        const idx = visitOrder[k++];
        const col = Math.floor(j / cells[ri].lines);
        const line = j % cells[ri].lines;
        const order = (ri + j / Math.max(1, n)) / rows; // row by row, left to right
        visit.set([row.x + (col + 0.5) * visitSpacing, row.y + (line + 0.5) * visitSpacing * 0.9, row.id === 'outside' ? 0.45 : 1, order], idx * 4);
      }
    });
    renderer.setVisit(visit);
    force = true;
  }

  buildDots();
  measure();

  // Set whenever something changes that scroll position alone would not reveal (colours, the portrait).
  let force = true;

  // ---------- Colours follow the theme ----------
  const readColors = () => {
    const cs = getComputedStyle(root);
    const ink = cssColor(cs.getPropertyValue('--ink'));
    const paper = cssColor(cs.getPropertyValue('--paper'));
    renderer.colors = { ink, note: cssColor(cs.getPropertyValue('--note')) };
    // Ink lighter than paper means the dark theme: light dots on black look bigger and louder than ink dots
    // on paper, so they are drawn a little smaller and the world a little softer, to read at the same weight.
    const lum = (c: number[]) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    const dark = lum(ink) > lum(paper);
    renderer.tone = dark ? { dot: 0.84, map: 0.62 } : { dot: 1, map: 1 };
    force = true;
  };
  readColors();
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', readColors);

  // ---------- The sun, for the live terminator ----------
  let sun: [number, number] = [0, 0];
  const updateSun = () => {
    const s = subsolarPoint(new Date());
    sun = [(s.lat * Math.PI) / 180, (s.lon * Math.PI) / 180];
  };
  updateSun();
  setInterval(updateSun, 60000);

  // ---------- Attention ----------
  const trail = new Float32Array(TRAIL * 3);
  const samples: { x: number; y: number; t: number }[] = [];
  let pointer = { x: -1e4, y: -1e4, t: 0 };
  let notedName = false;
  addEventListener(
    'pointermove',
    (e) => {
      const now = performance.now();
      pointer = { x: e.clientX, y: e.clientY, t: now };
      const last = samples[0];
      if (!last || now - last.t > 34 || Math.hypot(last.x - e.clientX, last.y - e.clientY) > 18) {
        samples.unshift({ x: e.clientX, y: e.clientY, t: now });
        if (samples.length > TRAIL - 1) samples.pop();
      }
      if (!notedName && scrollY < heroBottom) {
        const r = heading!.getBoundingClientRect();
        if (e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom) {
          notedName = true;
          record({ type: 'point', t: elapsed(), tag: 'hero.name', label: 'my name', cannotShow: 'Whether you were reading it or just passing through.' });
        }
      }
    },
    { passive: true },
  );
  const fillTrail = (now: number) => {
    const live = Math.max(0, 1 - Math.max(0, now - pointer.t - 2500) / 1500);
    trail.set([pointer.x, pointer.y, 0.9 * live], 0);
    for (let i = 1; i < TRAIL; i++) {
      const s = samples[i - 1];
      trail.set(s ? [s.x, s.y, 0.5 * Math.exp(-(now - s.t) / 650)] : [-1e4, -1e4, 0], i * 3);
    }
  };

  // ---------- Act one: arrival ----------
  const intro = { stage: 1, mapIn: 0, route: 0, routeVis: 1, push: 0.92, running: true };
  const skip = Boolean(session.get(KEYS.introSeen, false)) || scrollY > 40 || Boolean(location.hash);
  session.set(KEYS.introSeen, true);
  // On a phone the name sits above the identity text rather than beside it, so the world gives way to it
  // sooner: the empty space where the name will be never waits long.
  const q = narrow ? 0.65 : 1;
  const tl = gsap.timeline({ paused: true, onComplete: () => (intro.running = false) });
  tl.to(intro, { mapIn: 1, duration: 1.1 * q, ease: 'out' }, 0)
    .to(intro, { push: 1, duration: 3.4 * q, ease: 'out' }, 0)
    .to(intro, { route: 1, duration: 1.7 * q, ease: 'scene' }, 0.3 * q)
    .to(intro, { routeVis: 0, duration: 0.7 * q, ease: 'out' }, 2.05 * q)
    .to(intro, { stage: 0, duration: 1.55 * q, ease: 'none' }, 1.85 * q);
  if (skip) tl.progress(1);
  else {
    tl.play();
    const hurry = () => {
      if (scrollY > 8) {
        tl.progress(1);
        removeEventListener('scroll', hurry);
      }
    };
    addEventListener('scroll', hurry, { passive: true });
  }

  // ---------- The frame ----------
  const frame: FieldFrame = {
    stage: 0, mapIn: 1, mapVis: 0, nameVis: 1, visitVis: 0,
    cam: { ...worldCam }, route: 1, routeVis: 0, leg: [0, 0, 0], traveller: [0, 0], active: -1,
    nameAt: [0, 0], visitAt: [0, 0], trail, sun, time: 0, clip: [-1e5, 1e5], quiet: new Float32Array(24),
  };
  let idle = false;

  // ---------- Quiet zones: text that must stay readable over the map ----------
  const QUIET = 6;
  const quiet = new Float32Array(QUIET * 4);
  frame.quiet = quiet;
  let quietEls: HTMLElement[] = [];
  const collectQuiet = () => (quietEls = [...document.querySelectorAll<HTMLElement>('[data-quiet]')]);
  collectQuiet();
  const quietRects: DOMRect[] = [];
  // A quiet zone hugs its content: a full-width row holding a short line of text clears only around the text,
  // so the map is never cut into flat strips.
  const tight = (el: HTMLElement) => {
    let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity];
    for (const k of el.children) {
      const q = k.getBoundingClientRect();
      if (q.width === 0 || q.height === 0) continue;
      [x0, y0, x1, y1] = [Math.min(x0, q.left), Math.min(y0, q.top), Math.max(x1, q.right), Math.max(y1, q.bottom)];
    }
    return x0 === Infinity ? el.getBoundingClientRect() : new DOMRect(x0, y0, x1 - x0, y1 - y0);
  };
  const fillQuiet = () => {
    quiet.fill(0);
    quietRects.length = 0;
    for (const el of quietEls) {
      if (quietRects.length === QUIET) break;
      const r = tight(el);
      if (r.bottom < -40 || r.top > vh + 40 || r.width === 0) continue;
      quiet.set([r.left - 10, r.top - 10, r.right + 10, r.bottom + 10], quietRects.length * 4);
      quietRects.push(r);
    }
  };

  const compute = () => {
    const y = scrollY;
    const pStage = clamp01(y / Math.max(1, stageEnd));
    let mapVis = 0;
    let active: Window = windows[0];
    for (const w of windows) {
      let vis: number;
      if (w.band) {
        // A band shows the map while it is on screen; the clip keeps the dots inside it.
        vis = smooth(vh, vh * 0.8, w.band[0] - y) * smooth(0, vh * 0.2, w.band[1] - y);
      } else {
        const fadeIn =
          w.kind === 'intro' ? 1 : w.kind === 'visit' ? smooth(closeDocTop - vh, closeDocTop - vh * 0.55, y) : smooth(vh * 0.5, vh * 0.05, w.start - y);
        // Gone by the time the next Chapter's top is three quarters of the way up the screen, so its heading
        // and facts never sit on the map.
        vis = fadeIn * smooth(vh * 0.75, vh * 1.05, w.nextTop - y);
      }
      mapVis = Math.max(mapVis, vis);
      const entered = w.kind === 'visit' ? y >= closeDocTop - vh : w.band ? w.band[0] <= y + vh : w.start <= y + vh * 0.6;
      if (w.kind === 'intro' || entered) active = w;
    }

    frame.stage = Math.max(intro.stage, pStage);
    frame.mapIn = intro.mapIn;
    frame.route = intro.route;
    frame.nameAt = [nameDoc.x, nameDoc.y - y];
    frame.mapVis = mapVis;
    frame.leg = [0, 0, 0];

    frame.visitAt = [visitDoc.x, visitDoc.y - y];
    frame.visitVis = 1;
    // The map draws only where its scene is: below the close's top edge, inside a band, and below an ocean
    // crossing's top edge until it pins (so it never reaches back over the previous Chapter's text).
    frame.clip =
      active.kind === 'visit'
        ? [closeDocTop - y, 1e5]
        : active.band
          ? [active.band[0] - y, active.band[1] - y]
          : active.kind === 'shift'
            ? [Math.max(-1e5, active.start - y), 1e5]
            : [-1e5, 1e5];
    if (active.kind === 'visit') {
      const p = clamp01((y - active.start) / Math.max(1, active.end - active.start));
      const k = ease(clamp01(p * 1.4));
      const c0 = cityCam(active.from);
      const s0 = renderer.scale * c0.z;
      // Start where the last scene left the camera (the place framed up and to the right).
      const city = { x: c0.x - (narrow ? 0 : vw * 0.14) / s0, y: c0.y - (vh * (narrow ? 0.16 : 0.12)) / s0, z: c0.z };
      frame.stage = 1 + p;
      frame.cam = { x: lerp(city.x, worldCam.x, k), y: lerp(city.y, worldCam.y, k), z: Math.exp(lerp(Math.log(city.z), Math.log(worldCam.z), k)) };
      frame.routeVis = mapVis * (1 - smooth(0.2, 0.7, p));
      frame.active = -1;
    } else if (active.kind === 'intro') {
      const p = clamp01((y - active.start) / (active.end - active.start));
      const k = ease(clamp01((p - 0.18) / 0.82));
      const city = cityCam(0);
      const z = Math.exp(lerp(Math.log(worldCam.z * intro.push), Math.log(city.z), k));
      const s = renderer.scale * z;
      frame.cam = {
        x: lerp(worldCam.x, city.x - (narrow ? 0 : vw * 0.14) / s, k),
        y: lerp(worldCam.y, city.y - (vh * (narrow ? 0.16 : 0.12)) / s, k),
        z,
      };
      frame.routeVis = mapVis * Math.max(intro.running ? intro.routeVis : 0, smooth(0.55, 1, pStage));
      frame.active = k > 0.6 ? tOf(0) : -1;
    } else {
      const raw = clamp01((y - active.start) / Math.max(1, active.end - active.start));
      // A band flies in the middle of its passage, while it is most on screen.
      const p = active.band ? clamp01((raw - 0.2) / 0.6) : raw;
      const e = ease(p);
      const ta = tOf(active.from);
      const tb = tOf(active.to);
      const [tx, ty] = pointAt(lerp(ta, tb, e));
      const [ax, ay] = placeXY(active.from);
      const [bx, by] = placeXY(active.to);
      const bandH = active.band ? active.band[1] - active.band[0] : vh;
      const zFit = fitZoom([ax, bx], [ay, by], narrow ? 0.7 : 0.55, (0.5 * bandH) / vh);
      const bump = Math.sin(Math.PI * e);
      const z = Math.min(cityZoom, Math.exp(lerp(Math.log(cityZoom), Math.log(Math.min(zFit, cityZoom)), bump)));
      frame.cam = { x: lerp(tx, (ax + bx) / 2, bump * 0.6), y: lerp(ty, (ay + by) / 2, bump * 0.6), z };
      // Keep the places up and to the right of the clock and the words, which sit bottom left. In a band the
      // map rides with the page: the flight is framed on the band, wherever it is on screen.
      const s = renderer.scale * z;
      frame.cam.x -= (narrow ? 0 : vw * 0.14) / s;
      if (active.band) {
        const mid = (active.band[0] + active.band[1]) / 2 - y;
        frame.cam.y += (mid - bandH * (narrow ? 0.16 : 0.1) - vh / 2) / s;
      } else {
        frame.cam.y -= (vh * (narrow ? 0.16 : 0.12)) / s;
      }
      frame.routeVis = mapVis;
      frame.leg = [ta, tb, p];
      frame.traveller = [tx, ty];
      frame.active = p < 0.5 ? ta : tb;
    }
    root.classList.toggle('in-scene', mapVis > 0.3 && frame.stage > 0.25 && frame.stage < 1.5);
  };

  type Box = { x0: number; y0: number; x1: number; y1: number };
  const nameWords = [...document.querySelectorAll<HTMLElement>('.hero__word')];
  const placeLabels = () => {
    const show = frame.routeVis;
    const leg = frame.leg[2] > 0 ? [frame.leg[0], frame.leg[1]] : [];
    // Most important first: the place being read, then the two ends of the current leg, then the rest.
    const rank = (t: number) => (Math.abs(frame.active - t) < 0.0001 ? 0 : leg.some((v) => Math.abs(v - t) < 0.0001) ? 1 : 2);
    const toScreen = (lx: number, ly: number) => [vw / 2 + (lx - frame.cam.x) * renderer.scale * frame.cam.z, vh / 2 + (frame.cam.y - ly) * renderer.scale * frame.cam.z];
    // Every visible place marker (with its ring) is an obstacle, as is the reading text.
    const markers: Box[] = labels
      .filter((l) => frame.route >= l.t - 0.0001)
      .map((l) => {
        const [x, y] = toScreen(l.x, l.y);
        return { x0: x - 12, y0: y - 12, x1: x + 12, y1: y + 12 };
      });
    // The name's words are obstacles too: its letters are real text, drawn by the dots while it forms.
    // The traveller moves through the labels' places, so it is an obstacle too while a leg is flown, except
    // for the place it is taking off from or landing on: that place keeps its name as the traveller arrives.
    let traveller: { x: number; y: number; box: Box } | null = null;
    if (frame.leg[2] > 0 && frame.leg[2] < 1) {
      const [tx, ty] = toScreen(frame.traveller[0], frame.traveller[1]);
      traveller = { x: tx, y: ty, box: { x0: tx - 14, y0: ty - 14, x1: tx + 14, y1: ty + 14 } };
    }
    const text: Box[] = [...quietRects, ...nameWords.map((w) => w.getBoundingClientRect())]
      .filter((q) => q.bottom > 0 && q.top < vh)
      .map((q) => ({ x0: q.left - 8, y0: q.top - 8, x1: q.right + 8, y1: q.bottom + 8 }));
    const overlaps = (a: Box, b: Box) => !(a.x1 < b.x0 || a.x0 > b.x1 || a.y1 < b.y0 || a.y0 > b.y1);
    const placed: Box[] = [];
    // Places that sit almost on top of each other at this zoom (Plano and Richardson) share one label: the
    // higher-ranked place's.
    const named: [number, number][] = [];
    for (const l of [...labels].sort((a, b) => rank(a.t) - rank(b.t))) {
      const [x, y] = toScreen(l.x, l.y);
      const crowded = named.some(([nx, ny]) => Math.hypot(nx - x, ny - y) < 28);
      const w = l.w || (l.w = l.el.offsetWidth || 110);
      const own = { x0: x - 12, y0: y - 12, x1: x + 12, y1: y + 12 };
      // Try right of the marker, then left, then above, then below.
      const candidates = [
        { dx: 0, dy: 0, left: false, box: { x0: x + 12, y0: y - 8, x1: x + w + 2, y1: y + 8 } },
        { dx: 0, dy: 0, left: true, box: { x0: x - w - 2, y0: y - 8, x1: x - 12, y1: y + 8 } },
        { dx: -14, dy: -18, left: false, box: { x0: x - 2, y0: y - 27, x1: x + w - 12, y1: y - 10 } },
        { dx: -14, dy: 18, left: false, box: { x0: x - 2, y0: y + 10, x1: x + w - 12, y1: y + 27 } },
      ].filter((c) => c.box.x0 > 4 && c.box.x1 < vw - 4);
      const atThisPlace = traveller !== null && Math.hypot(traveller.x - x, traveller.y - y) < 30;
      // A spot clear of the traveller is preferred even here; only when it sits on the marker, and every spot
      // touches it, does the label take its place beside it anyway.
      const clear = (b: Box, ofTraveller = true) =>
        !placed.some((p) => overlaps(b, p)) &&
        !text.some((t) => overlaps(b, t)) &&
        !markers.some((m) => m.x0 !== own.x0 && overlaps(b, m)) &&
        !(traveller && ofTraveller && overlaps(b, traveller.box));
      // Labels belong to scenes: none while the map is only fading in or out behind reading text.
      const eligible = !crowded && frame.route >= l.t - 0.0001 && show > 0.45 && y > frame.clip[0] + 30 && y < frame.clip[1] - 30;
      // A place that could be named claims its spot even when no label fits, so a neighbour never takes its name.
      if (eligible) named.push([x, y]);
      const choice = eligible ? (candidates.find((c) => clear(c.box)) ?? (atThisPlace ? candidates.find((c) => clear(c.box, false)) : undefined)) : undefined;
      const isActive = rank(l.t) === 0;
      if (choice) placed.push(choice.box);
      // Places other than the one being read step back in colour, not opacity, so their paper stays solid.
      l.el.style.opacity = choice ? show.toFixed(3) : '0';
      l.el.classList.toggle('is-dim', !isActive && frame.active !== -1);
      l.el.style.visibility = choice ? '' : 'hidden';
      l.el.style.transform = `translate3d(${(x + (choice?.dx ?? 0)).toFixed(1)}px, ${(y + (choice?.dy ?? 0)).toFixed(1)}px, 0)`;
      l.el.classList.toggle('is-active', isActive);
      l.el.classList.toggle('is-left', Boolean(choice?.left));
    }
  };

  // Only draw when something changed: scroll, the arrival, the pointer's warmth, dots in flight, or the
  // pulsing places of a scene (which rest while live motion is paused).
  let clock = 0;
  let lastTick = performance.now();
  let lastKey = '';
  gsap.ticker.add(() => {
    if (document.hidden || lost) return;
    const now = performance.now();
    const paused = livePaused();
    if (!paused) clock += (now - lastTick) / 1000;
    lastTick = now;
    compute();
    const inHero = scrollY < heroBottom || frame.stage < 0.999;
    if (!inHero && frame.mapVis < 0.002) {
      if (!idle) {
        renderer.clear();
        labelLayer.style.visibility = 'hidden';
        idle = true;
      }
      return;
    }
    if (idle) {
      labelLayer.style.visibility = '';
      force = true;
    }
    idle = false;
    fillTrail(now);
    let warm = 0;
    for (let i = 0; i < TRAIL; i++) warm += trail[i * 3 + 2];
    const inFlight = (frame.stage > 0.001 && frame.stage < 0.999) || (frame.stage > 1.001 && frame.stage < 1.999);
    const pulsing = frame.routeVis > 0.001 && !paused;
    const key = `${scrollY}|${frame.stage.toFixed(4)}|${frame.mapIn}|${frame.route}|${frame.mapVis.toFixed(3)}|${vw}x${vh}`;
    if (!force && !intro.running && warm < 0.002 && !(inFlight && !paused) && !pulsing && key === lastKey) return;
    lastKey = key;
    force = false;
    frame.time = clock;
    frame.sun = sun;
    fillQuiet();
    renderer.draw(frame);
    placeLabels();
  });

  // The portrait is drawn from the readout's snapshot of the visit, taken as the close comes near, so it holds
  // still while it is read.
  document.addEventListener('readout:paint', () => updateVisit());
  updateVisit();

  let resizeTimer = 0;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      labels.forEach((l) => (l.w = 0));
      collectQuiet();
      measure();
      buildDots();
      updateVisit();
    }, 160);
  });
  // The readout leaves out chapters with no reading time; the portrait follows the rows it shows.
  document.addEventListener('readout:rows', () => {
    measure();
    updateVisit();
  });
  // Layout settles after fonts, images and pinned sections; measure again whenever ScrollTrigger does.
  import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => ScrollTrigger.addEventListener('refresh', measure));

  return { textCue: skip ? 0.05 : 2.35 * q };
}
