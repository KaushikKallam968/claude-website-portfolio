# Kaushik Kallam · portfolio

The portfolio of Kaushik Kallam, Senior Quantitative UX Researcher at JPMorganChase in New York.

**Live:** https://www.kkportfolio.xyz

The site is built around two ideas that come from the work itself:

- **A journey told backwards.** The home page goes from New York, where Kaushik works now, back through Texas, Silicon Valley, Atlanta and Texas again to Singapore. Each place is a Chapter, and scroll-driven flights carry the reader between them. A dot "Field" drawn in WebGL forms his name, the world and the route, and the clocks count the real hours between places.
- **An honest observation layer.** A research site that watches its visitor should say what it can and can't tell. The notes beside every page record what you do there, and each note says what it can't explain. The closing readout charts your visit. A "Show tracking" lens outlines what each page records and what it misses. **Nothing leaves the browser:** the notes live in `sessionStorage` and there are no analytics.

## Pages

| Path | What it is |
|---|---|
| `/` | The Journey: the hero, a route index, the Prologue, six Chapters joined by Time Shift flights, and a closing contact with the visit readout |
| `/work/` | Selected work: every Case side by side, with its question, contribution, methods and status |
| `/work/<case>/` | Five Cases: Data Instrumentation Coverage and Quality, Chegg Discord, Chegg Mexico, Inspire Brands Ad Creative, watched. |
| `/resume/` | An HTML résumé that prints to two pages (Letter or A4) |
| `/404.html` | Not found, with four ways out |

Each Case opens with its question and the owner's part in it, explains the research decisions, and ends with what the evidence shows and what it can't.

## Run it

Requires Node 22 (pinned in `package.json`).

```sh
npm ci
npm run dev        # http://localhost:4321
npm test           # vitest
npm run check      # astro check (types)
npm run build      # static output in dist/
npm run preview    # serve dist/ locally
```

## Stack

- [Astro 7](https://astro.build): static output, with content collections for the Cases. No client framework.
- TypeScript throughout. The page behaviour is hand-written modules in `src/scripts/`.
- [GSAP](https://gsap.com) (ScrollTrigger, SplitText, CustomEase) for scroll scenes, and [Lenis](https://lenis.darkroom.engineering) for smooth scrolling.
- Raw WebGL2 for the dot Field (no 3D library; see [ADR 0002](docs/adr/0002-one-dot-field-in-raw-webgl2.md)).
- Cross-document View Transitions for moving between the Journey, Selected work and the Cases.
- [Vitest](https://vitest.dev) for the logic that can be tested without a browser.

The reasoning behind the stack is in [ADR 0001](docs/adr/0001-static-astro-with-hand-built-motion.md).

## Where things live

| Path | What |
|---|---|
| `src/data/journey.ts` | Chapters, Roles and Entries (the Journey's copy), with each place's coordinates and time zone |
| `src/content/cases/*.md` | The Cases. The front matter carries the question, contribution, methods, outcome, status and what the evidence shows and can't show; the schema is in `src/content.config.ts` |
| `src/pages/` | The pages, plus `robots.txt`, `sitemap.xml` and `llms.txt` endpoints |
| `src/layouts/Base.astro` | The document head, metadata, the top bar and the view-transition hooks |
| `src/components/` | Chapter sections, Entry rows, Case figures and their step scenes, the notes panel and the Time Shifts |
| `src/scripts/` | Browser behaviour: `motion.ts` (start-up and scroll scenes), `field/` (the WebGL Field), `navigation.ts` (in-page jumps, Return and focus), `notes.ts` and `readout.ts` (the observation layer), `lens.ts`, `timeshift.ts`, `clock.ts` |
| `src/lib/` | Pure, tested logic: `origin` (where Return goes), `observe` (what each note says), `visit` (the readout), `shift` (flight curves and band sizes), `zone` (the clock note), `seo` (titles, descriptions and structured data), `geo`, `hover`, `format` |
| `src/styles/global.css` | Tokens, base styles, view transitions and print |
| `public/data/world-dots.bin` | The Field's world, built by `scripts/build-world-dots.mjs` from Natural Earth land data |
| `assets-source/` | Source material and provenance, for example where the watched. screenshots came from |

## Design and product docs

These describe the site as shipped. Keep them current with any change.

- [`PRODUCT.md`](PRODUCT.md): who the site is for, the owner-confirmed facts, and the claim boundaries for every Case (what may and may not be said).
- [`DESIGN.md`](DESIGN.md): the design system, covering tokens, type, layout, components, motion, print and accessibility.
- [`GLOSSARY.md`](GLOSSARY.md): the domain language (Journey, Chapter, Entry, Case, Field, Time Shift, notes, readout, lens).
- [`docs/adr/`](docs/adr/): architecture decisions.
- [`docs/test-seams.md`](docs/test-seams.md): what is tested and where.
- [`docs/publishing.md`](docs/publishing.md): how the site is deployed, and what is left for the owner.
- `.impeccable/`: the design direction contract (`surfaces/`), critique history (`critique/`) and settled decisions the critiques must not reopen (`critique/ignore.md`).

## Editing content

- **A Case:** edit its Markdown in `src/content/cases/`. `order` sets its place in Selected work, in "Case N of 5" and in Next case; it follows the Journey's order. Its figure is a `kind` in `src/components/CaseFigure.astro`, and its scroll steps are in `src/components/FigureScene.astro`. After changing its title, context or question, run `npm run og` and commit the redrawn share card in `public/og/` (it needs a Chromium; see `docs/publishing.md`).
- **The Journey:** edit `src/data/journey.ts`. A Chapter's roles appear newest first, like the Journey itself. An Entry of kind `case` links to a Case, while `summary` and `research-in-development` expand in place.
- **The résumé** is built from the Journey's Roles, plus a few lines in `src/pages/resume/index.astro`.

Rules that every edit keeps:

- **Only true, owner-confirmed claims.** No invented metrics, outcomes, adoption or launches. Check `PRODUCT.md`'s claim boundaries before changing Case copy.
- **No em dashes** in copy, comments or commit messages.
- **The observation layer stays local.** Adding analytics, third-party scripts or anything that sends data would break the promise the notes make.
- **Reduced motion, no JavaScript and keyboard use** each get a complete page. The Field, Lenis and view transitions all step aside under `prefers-reduced-motion`.

## Testing

`npm test` runs the Vitest suites in `src/lib/*.test.ts`. They cover:
- Return's origin logic;
- the observation notes and readout;
- flight curves and band sizes;
- geography;
- the hover intent behind "pointed at" notes;
- the clock note's time zones;
- text formatting;
- page titles, descriptions and structured data.

Pages, motion and layout are checked in a browser. The design critiques in `.impeccable/critique/` record those checks: axe, overflow, touch targets, focus visibility, layout shift, and frame-by-frame captures of transitions.

## Deployment

The site is a Vercel project linked to this repository. The build is pinned in [`vercel.json`](vercel.json): framework Astro, `npm ci`, `npm run build`, output `dist`.

- **Production** is built from `master`. Once the project's production branch is set to `master` (an open owner item in `docs/publishing.md`), a push to `master` deploys the live site; until then the production build is started by hand from the same commit.
- **Previews:** every other branch gets a preview deployment, which is behind Vercel login.
- **Site address:** `www.kkportfolio.xyz` is the primary domain (the bare `kkportfolio.xyz` redirects to it). It is the canonical address in `astro.config.mjs`, used for canonical links, social previews, `robots.txt` and `sitemap.xml`; a `SITE_URL` environment variable overrides it.
- **Search:** `vercel.json` also gives each page one address (`/work` redirects to `/work/`) and sets cache and security headers. Structured data, `llms.txt`, `favicon.ico` and the IndexNow script (`npm run indexnow`, after a deploy that adds or changes pages) are described in the Search section of [`docs/publishing.md`](docs/publishing.md), with the steps still open for the owner.

See [`docs/publishing.md`](docs/publishing.md) for details and open owner items.

## Credits

- **Type:** [Switzer](https://www.fontshare.com/fonts/switzer) by Indian Type Foundry, via Fontshare, and Fragment Mono (SIL Open Font License).
- **Map data:** [Natural Earth](https://www.naturalearthdata.com) land outlines (public domain), via [world-atlas](https://github.com/topojson/world-atlas).
- **watched. screenshots:** from the app's public App Store listing; provenance is in `assets-source/watched/PROVENANCE.md`. Film posters within them belong to their rights holders.
