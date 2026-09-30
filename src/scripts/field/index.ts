import { gsap } from 'gsap';
import { equalEarth, greatCircle, subsolarPoint, type LonLat } from '../../lib/geo';
import { KEYS, session } from '../../lib/store';
import { clockFormat } from '../clock';
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
  nextBody: number;
  from: number; // index into places (page order)
  to: number;
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
    return { el, x, y, t: placeT.get(p.id)!, id: p.id };
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
  let nameCount = 0;
  let dotTotal = 0;
  let visitOrder: number[] = [];
  let mapXY = new Float32Array(0);
  let visitDoc = { x: 0, y: 0 };
  let visitRows: { id: string; x: number; y: number; cols: number; lines: number }[] = [];
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
    nameCount = name.count;
    renderer.sizes.name = spacing * 0.94;
    renderer.sizes.map = narrow ? 2.3 : 2.1;
    renderer.sizes.visit = narrow ? 2.4 : 3.2;

    const nIdx = Array.from({ length: name.count }, (_, i) => i).sort((a, b) => name.points[a * 2] - name.points[b * 2]);
    const N = Math.max(name.count, world.length);
    const nameArr = new Float32Array(N * 3);
    const mapArr = new Float32Array(N * 4);
    const meta = new Float32Array(N * 4);
    const visit = new Float32Array(N * 3);
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
      meta.set([clamp01(0.62 * (nx / nameW) + 0.38 * Math.random()), (narrow ? 8 : 14) + Math.random() * (narrow ? 26 : 52), Math.random(), mi !== lastM ? 1 : 0], i * 4);
      visit.set([nx, name.points[ni * 2 + 1], 0], i * 3);
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
    worldCam = {
      x: (Math.min(...xs) + Math.max(...xs)) / 2,
      y: (Math.min(...ys) + Math.max(...ys)) / 2 + 0.05,
      z: Math.min(1.3, fitZoom(xs, ys, narrow ? 0.84 : 0.62, 0.5)),
    };

    const bodyTop = (id: string) => {
      const section = document.getElementById(id);
      const body = section?.querySelector('.chapter__body');
      return (body ?? section)!.getBoundingClientRect().top + sy;
    };
    const pro = document.querySelector<HTMLElement>('[data-prologue]');
    const pr = pro?.getBoundingClientRect();
    const proStart = pr ? pr.top + sy : heroBottom;
    const proEnd = pr ? pr.top + sy + pr.height - vh : heroBottom;
    stageEnd = pr ? proStart + (proEnd - proStart) * 0.22 : heroBottom - vh * 0.3;
    windows = [{ kind: 'intro', start: proStart, end: Math.max(proEnd, proStart + 1), nextBody: bodyTop(places[0].id), from: 0, to: 0 }];
    document.querySelectorAll<HTMLElement>('[data-shift]').forEach((el) => {
      const r = el.getBoundingClientRect();
      const from = places.findIndex((p) => p.id === el.dataset.fromId);
      const to = places.findIndex((p) => p.id === el.dataset.toId);
      if (from < 0 || to < 0) return;
      windows.push({ kind: 'shift', start: r.top + sy, end: r.top + sy + r.height - vh, nextBody: bodyTop(places[to].id), from, to });
    });

    // The close: the world evaporates into the rows of the visit readout.
    const bars = document.querySelector<HTMLElement>('[data-readout-bars]');
    if (bars) {
      const br = bars.getBoundingClientRect();
      visitDoc = { x: br.left, y: br.top + sy };
      visitSpacing = narrow ? 3.6 : 4.6;
      visitRows = [...bars.querySelectorAll<HTMLElement>('[data-bar]')].map((li) => {
        const tr = li.querySelector('.readout__track')!.getBoundingClientRect();
        return {
          id: li.dataset.bar!,
          x: tr.left - br.left,
          y: tr.top - br.top,
          cols: Math.max(1, Math.floor(tr.width / visitSpacing)),
          lines: Math.max(1, Math.floor(tr.height / (visitSpacing * 0.9))),
        };
      });
      visitEndY = visitDoc.y - vh * 0.62;
      const close = bars.closest('section');
      closeDocTop = close ? close.getBoundingClientRect().top + sy : visitDoc.y - vh * 0.5;
      const last = places.length - 1;
      windows.push({ kind: 'visit', start: Math.min(closeDocTop - vh * 0.5, visitEndY - 200), end: visitEndY, nextBody: Infinity, from: last, to: last });
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
    const capacity = Math.min(...visitRows.map((row) => row.cols * row.lines));
    const { phrase, counts } = dotUnit(ms, capacity);
    if (unitEl) {
      unitEl.hidden = false;
      unitEl.textContent = `Each dot is ${phrase} of your visit.`;
    }
    // Dots that are not part of the portrait head for where the world would be, fading as they go.
    const visit = new Float32Array(dotTotal * 3);
    const scale = renderer.scale * worldCam.z;
    const topAtEnd = visitDoc.y - visitEndY;
    for (let i = 0; i < dotTotal; i++) {
      visit[i * 3] = vw / 2 + (mapXY[i * 2] - worldCam.x) * scale - visitDoc.x;
      visit[i * 3 + 1] = vh / 2 + (worldCam.y - mapXY[i * 2 + 1]) * scale - topAtEnd;
    }
    let k = 0;
    visitRows.forEach((row, ri) => {
      for (let j = 0; j < counts[ri] && k < visitOrder.length; j++) {
        const idx = visitOrder[k++];
        const col = Math.floor(j / row.lines);
        const line = j % row.lines;
        visit.set([row.x + (col + 0.5) * visitSpacing, row.y + (line + 0.5) * visitSpacing * 0.9, row.id === 'outside' ? 0.45 : 1], idx * 3);
      }
    });
    renderer.setVisit(visit);
  }

  buildDots();
  measure();

  // ---------- Colours follow the theme ----------
  const readColors = () => {
    const cs = getComputedStyle(root);
    renderer.colors = { ink: cssColor(cs.getPropertyValue('--ink')), note: cssColor(cs.getPropertyValue('--note')) };
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
  const tl = gsap.timeline({ paused: true, onComplete: () => (intro.running = false) });
  tl.to(intro, { mapIn: 1, duration: 1.1, ease: 'out' }, 0)
    .to(intro, { push: 1, duration: 3.4, ease: 'out' }, 0)
    .to(intro, { route: 1, duration: 1.7, ease: 'scene' }, 0.3)
    .to(intro, { routeVis: 0, duration: 0.7, ease: 'out' }, 2.05)
    .to(intro, { stage: 0, duration: 1.55, ease: 'none' }, 1.85);
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
    nameAt: [0, 0], visitAt: [0, 0], trail, sun, time: 0, clip: -1e5,
  };
  const t0 = performance.now();
  let idle = false;

  const compute = () => {
    const y = scrollY;
    const pStage = clamp01(y / Math.max(1, stageEnd));
    let mapVis = 0;
    let active: Window = windows[0];
    for (const w of windows) {
      const fadeIn =
        w.kind === 'intro' ? 1 : w.kind === 'visit' ? smooth(closeDocTop - vh, closeDocTop - vh * 0.55, y) : smooth(vh * 0.95, vh * 0.15, w.start - y);
      const fadeOut = smooth(vh * 0.5, vh * 0.95, w.nextBody - y);
      mapVis = Math.max(mapVis, fadeIn * fadeOut);
      if (w.kind === 'intro' || (w.kind === 'visit' ? y >= closeDocTop - vh : w.start <= y + vh * 0.6)) active = w;
    }

    frame.stage = Math.max(intro.stage, pStage);
    frame.mapIn = intro.mapIn;
    frame.route = intro.route;
    // The name is on the canvas, behind the page: it scrolls at half speed, so it lingers while it dissolves.
    frame.nameAt = [nameDoc.x, nameDoc.y - y * 0.5];
    frame.mapVis = mapVis;
    frame.leg = [0, 0, 0];

    frame.visitAt = [visitDoc.x, visitDoc.y - y];
    frame.visitVis = 1;
    frame.clip = active.kind === 'visit' ? closeDocTop - y : -1e5;
    if (active.kind === 'visit') {
      const p = clamp01((y - active.start) / Math.max(1, active.end - active.start));
      const k = ease(clamp01(p * 1.4));
      const city = cityCam(active.from);
      frame.stage = 1 + p;
      frame.cam = { x: lerp(city.x, worldCam.x, k), y: lerp(city.y, worldCam.y, k), z: Math.exp(lerp(Math.log(city.z), Math.log(worldCam.z), k)) };
      frame.routeVis = mapVis * (1 - smooth(0.2, 0.7, p));
      frame.active = -1;
    } else if (active.kind === 'intro') {
      const p = clamp01((y - active.start) / (active.end - active.start));
      const k = ease(clamp01((p - 0.18) / 0.82));
      const city = cityCam(0);
      frame.cam = { x: lerp(worldCam.x, city.x, k), y: lerp(worldCam.y, city.y, k), z: Math.exp(lerp(Math.log(worldCam.z * intro.push), Math.log(city.z), k)) };
      frame.routeVis = mapVis * Math.max(intro.running ? intro.routeVis : 0, smooth(0.55, 1, pStage));
      frame.active = k > 0.6 ? tOf(0) : -1;
    } else {
      const p = clamp01((y - active.start) / Math.max(1, active.end - active.start));
      const e = ease(p);
      const ta = tOf(active.from);
      const tb = tOf(active.to);
      const [tx, ty] = pointAt(lerp(ta, tb, e));
      const [ax, ay] = placeXY(active.from);
      const [bx, by] = placeXY(active.to);
      const zFit = fitZoom([ax, bx], [ay, by], narrow ? 0.7 : 0.55, 0.5);
      const bump = Math.sin(Math.PI * e);
      const z = Math.min(cityZoom, Math.exp(lerp(Math.log(cityZoom), Math.log(Math.min(zFit, cityZoom)), bump)));
      frame.cam = { x: lerp(tx, (ax + bx) / 2, bump * 0.6), y: lerp(ty, (ay + by) / 2, bump * 0.6), z };
      frame.routeVis = mapVis;
      frame.leg = [ta, tb, p];
      frame.traveller = [tx, ty];
      frame.active = p < 0.5 ? ta : tb;
    }
    root.classList.toggle('in-scene', mapVis > 0.3 && frame.stage > 0.6 && frame.stage < 1.5);
  };

  const placeLabels = () => {
    const show = frame.routeVis;
    for (const l of labels) {
      const x = vw / 2 + (l.x - frame.cam.x) * renderer.scale * frame.cam.z;
      const y = vh / 2 + (frame.cam.y - l.y) * renderer.scale * frame.cam.z;
      const revealed = frame.route >= l.t - 0.0001 ? 1 : 0;
      const isActive = Math.abs(frame.active - l.t) < 0.0001;
      // Plano and Richardson are a few miles apart: Richardson is labelled only while it is the place being read.
      const crowded = l.id === 'texas-education' && !isActive;
      const clipped = y < frame.clip + 30;
      const o = crowded || clipped ? 0 : show * revealed * (isActive || frame.active === -1 ? 1 : 0.55);
      l.el.style.opacity = o.toFixed(3);
      l.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      l.el.classList.toggle('is-active', isActive);
      l.el.classList.toggle('is-left', x > vw - 150);
    }
  };

  gsap.ticker.add(() => {
    if (document.hidden) return;
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
    if (idle) labelLayer.style.visibility = '';
    idle = false;
    const now = performance.now();
    frame.time = (now - t0) / 1000;
    frame.sun = sun;
    fillTrail(now);
    renderer.draw(frame);
    placeLabels();
  });

  // The portrait keeps counting while it is on screen.
  const visitWindow = () => windows.find((w) => w.kind === 'visit');
  setInterval(() => {
    const w = visitWindow();
    if (!w || scrollY < w.start - vh) return;
    updateVisit();
  }, 1000);
  updateVisit();

  let resizeTimer = 0;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      measure();
      buildDots();
      updateVisit();
    }, 160);
  });
  // Layout settles after fonts, images and pinned sections; measure again whenever ScrollTrigger does.
  import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => ScrollTrigger.addEventListener('refresh', measure));

  return { textCue: skip ? 0.05 : 2.35 };
}
