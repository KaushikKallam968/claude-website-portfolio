// Draws one 1200 by 630 share card per Case into public/og/<case id>.png, in the system public/og.png uses:
// paper, ink type in Switzer, a short blue rule and two lines of blue Fragment Mono at the bottom right.
// Run it after changing a Case's title, context or question, then commit the PNGs: npm run og
// playwright-core downloads no browser; CHROME_PATH points at a Chromium (default /opt/pw-browsers/chromium).
import { mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright-core';
// Node strips the types itself (22.18 and later), so the cards wrap hyphenated words as the pages do.
import { nobrCompounds } from '../src/lib/format.ts';

const fromRoot = (path) => new URL(`../${path}`, import.meta.url);
const casesDir = fromRoot('src/content/cases/');
const outDir = fromRoot('public/og/');
const chrome = process.env.CHROME_PATH || '/opt/pw-browsers/chromium';

const WIDTH = 1200;
const HEIGHT = 630;
const MARGIN = 48;
// What the layout tries, largest first. A card takes the first pair that fits; none fitting is an error, not a smaller card.
const TITLE_SIZES = [120, 116, 112, 108, 104, 100, 96, 92, 88, 84, 80, 76, 72];
const QUESTION_SIZES = [36, 35, 34, 33, 32];
const MAX_TITLE_LINES = 2;
const MAX_QUESTION_LINES = 3;
// Nothing may come nearer another box than this.
const CLEARANCE = 16;

// Colours come from the stylesheet, so the cards follow the site. --note is the blue og.png uses.
const css = readFileSync(fromRoot('src/styles/global.css'), 'utf8');
function token(name) {
  const hit = css.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6});`, 'i'));
  if (!hit) throw new Error(`src/styles/global.css has no --${name} colour`);
  return hit[1];
}
const colour = { paper: token('paper'), ink: token('ink'), ink2: token('ink-2'), note: token('note') };

const fontData = (file) => readFileSync(fromRoot(`public/fonts/${file}`)).toString('base64');

/** The title, context and question: single-line values in each Case's front matter, plain or in simple quotes. */
function readCase(file) {
  const text = readFileSync(new URL(file, casesDir), 'utf8');
  const block = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!block) throw new Error(`${file}: no front matter between --- lines`);
  const lines = block[1].split(/\r?\n/);
  const card = { id: file.replace(/\.md$/, '') };
  for (const key of ['title', 'context', 'question']) {
    const line = lines.find((l) => l.startsWith(`${key}:`));
    const raw = line?.slice(key.length + 1).trim();
    if (!raw) throw new Error(`${file}: front matter has no single-line "${key}"`);
    card[key] = scalar(raw, `${file}: "${key}"`);
  }
  return card;
}

function scalar(raw, where) {
  const quote = raw[0];
  if (quote === '"' || quote === "'") {
    const body = raw.slice(1, -1);
    if (raw.length < 2 || raw.at(-1) !== quote || body.includes('\\') || body.includes(quote)) {
      throw new Error(`${where} is quoted in a way this reader does not handle; write it plain or in simple quotes`);
    }
    return body;
  }
  if (/^[|>[{&*!%@`#]/.test(raw)) throw new Error(`${where} is not a single-line plain value`);
  return raw;
}

function cardHtml({ title, context, question }) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><style>
@font-face { font-family: 'Switzer'; src: url(data:font/woff2;base64,${fontData('switzer-variable.woff2')}) format('woff2'); font-weight: 100 900; }
@font-face { font-family: 'Fragment Mono'; src: url(data:font/woff2;base64,${fontData('fragment-mono.woff2')}) format('woff2'); font-weight: 400; }
* { margin: 0; box-sizing: border-box; }
html, body { width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; background: ${colour.paper}; }
.card { position: relative; width: ${WIDTH}px; height: ${HEIGHT}px; padding: ${MARGIN}px; font-family: 'Switzer'; color: ${colour.ink}; }
.context { font-size: 28px; line-height: 36px; letter-spacing: -0.01em; color: ${colour.ink2}; }
.title { margin-top: 24px; max-width: ${WIDTH - 2 * MARGIN}px; font-size: var(--title); font-weight: 500; line-height: 0.92; letter-spacing: -0.06em; text-wrap: balance; }
.question { margin-top: 32px; max-width: 860px; font-size: var(--question); line-height: 1.3; letter-spacing: -0.015em; color: ${colour.ink2}; text-wrap: pretty; }
.foot { position: absolute; left: ${MARGIN}px; right: ${MARGIN}px; bottom: ${MARGIN}px; display: flex; justify-content: space-between; align-items: last baseline; }
.nobr { white-space: nowrap; }
.by { font-size: 28px; line-height: 34px; letter-spacing: -0.01em; }
.by__name { font-weight: 500; }
.by__role { color: ${colour.ink2}; }
.note { padding-top: 16px; border-top: 1px solid ${colour.note}; font: 15px/24px 'Fragment Mono'; color: ${colour.note}; text-align: right; white-space: nowrap; }
</style></head><body>
<main class="card">
  <p class="context">${nobrCompounds(context)}</p>
  <h1 class="title">${nobrCompounds(title)}</h1>
  <p class="question">${nobrCompounds(question)}</p>
  <footer class="foot">
    <div class="by"><p class="by__name">Kaushik Kallam</p><p class="by__role">Senior Quantitative UX Researcher</p></div>
    <p class="note">what the data shows<br>and what it can’t</p>
  </footer>
</main>
</body></html>`;
}

/**
 * Runs in the page. Sets the largest title size, then the largest question size, at which every box sits inside the
 * margins and clear of the others, and leaves the page at that choice. Returns the choice, or what broke at the smallest.
 */
function fit({ titleSizes, questionSizes, frame, clearance, maxTitleLines, maxQuestionLines }) {
  const root = document.documentElement;
  const q = (selector) => document.querySelector(selector);

  // The words of a block, not the whole block: its box is as wide as its container. Its height is its lines' boxes.
  function words(el) {
    const range = document.createRange();
    range.selectNodeContents(el);
    const rects = [...range.getClientRects()];
    const spacing = parseFloat(getComputedStyle(el).letterSpacing) || 0;
    const block = el.getBoundingClientRect();
    return {
      left: Math.min(...rects.map((r) => r.left)),
      top: block.top,
      // The last letter's spacing is added after it, so with tight tracking its ink reaches that far past the rect.
      right: Math.max(...rects.map((r) => r.right)) - Math.min(spacing, 0),
      bottom: block.bottom,
      lines: new Set(rects.map((r) => Math.round(r.top))).size,
    };
  }
  const whole = (el) => {
    const r = el.getBoundingClientRect();
    return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, lines: 1 };
  };
  const apart = (a, b) => a.right + clearance <= b.left || b.right + clearance <= a.left || a.bottom + clearance <= b.top || b.bottom + clearance <= a.top;

  function problems() {
    const boxes = {
      context: words(q('.context')),
      title: words(q('.title')),
      question: words(q('.question')),
      byline: whole(q('.by')),
      note: whole(q('.note')),
    };
    const found = [];
    for (const [name, b] of Object.entries(boxes)) {
      if (b.left < frame.left - 0.5 || b.top < frame.top - 0.5 || b.right > frame.right + 0.5 || b.bottom > frame.bottom + 0.5) {
        found.push(`${name} leaves the margins (${Math.round(b.left)},${Math.round(b.top)} to ${Math.round(b.right)},${Math.round(b.bottom)})`);
      }
    }
    if (boxes.title.lines > maxTitleLines) found.push(`the title takes ${boxes.title.lines} lines`);
    if (boxes.question.lines > maxQuestionLines) found.push(`the question takes ${boxes.question.lines} lines`);
    const names = Object.keys(boxes);
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        if (!apart(boxes[names[i]], boxes[names[j]])) found.push(`${names[i]} and ${names[j]} come within ${clearance}px`);
      }
    }
    return { found, boxes };
  }

  let last;
  for (const title of titleSizes) {
    for (const question of questionSizes) {
      root.style.setProperty('--title', `${title}px`);
      root.style.setProperty('--question', `${question}px`);
      last = problems();
      if (last.found.length === 0) {
        return { title, question, titleLines: last.boxes.title.lines, questionLines: last.boxes.question.lines, problems: [] };
      }
    }
  }
  return { problems: last.found };
}

const files = readdirSync(casesDir).filter((f) => f.endsWith('.md')).sort();
if (files.length === 0) throw new Error(`No Cases found in ${casesDir.pathname}`);
const cases = files.map(readCase);

let browser;
try {
  browser = await chromium.launch({ executablePath: chrome, args: ['--disable-lcd-text', '--font-render-hinting=none', '--force-color-profile=srgb'] });
} catch (err) {
  throw new Error(`Could not start Chromium at ${chrome}. Set CHROME_PATH to a Chromium executable.\n${err.message}`);
}

mkdirSync(outDir, { recursive: true });
const failures = [];
try {
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
  for (const c of cases) {
    await page.setContent(cardHtml(c));
    await page.evaluate(() => document.fonts.ready);
    const loaded = await page.evaluate(() => document.fonts.check("500 20px 'Switzer'") && document.fonts.check("15px 'Fragment Mono'"));
    if (!loaded) throw new Error(`${c.id}: Switzer or Fragment Mono did not load`);
    const frame = { left: MARGIN, top: MARGIN, right: WIDTH - MARGIN, bottom: HEIGHT - MARGIN };
    const result = await page.evaluate(fit, {
      titleSizes: TITLE_SIZES,
      questionSizes: QUESTION_SIZES,
      frame,
      clearance: CLEARANCE,
      maxTitleLines: MAX_TITLE_LINES,
      maxQuestionLines: MAX_QUESTION_LINES,
    });
    if (result.problems.length > 0) {
      failures.push(`${c.id}: no layout fits at the smallest sizes (${result.problems.join('; ')})`);
      continue;
    }
    const png = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });
    writeFileSync(new URL(`${c.id}.png`, outDir), png);
    console.log(`${c.id}.png  title ${result.title}px on ${result.titleLines} line(s), question ${result.question}px on ${result.questionLines}  ${(png.length / 1024).toFixed(0)} KB`);
  }
} finally {
  await browser.close();
}

// A card whose Case is gone would ship for nothing.
const ids = new Set(cases.map((c) => c.id));
for (const f of readdirSync(outDir)) {
  if (f.endsWith('.png') && !ids.has(f.slice(0, -4))) {
    unlinkSync(new URL(f, outDir));
    console.log(`removed ${f}: no Case has that id`);
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
}
