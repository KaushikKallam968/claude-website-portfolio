# 0002: One dot field, in raw WebGL2, as the Journey's moving image

Date: 2026-09-30 · Status: accepted (after the owner asked for motion that shows real design skill)

## Context

The first build met the direction contract but its motion was only well-behaved entrances. The owner asked for motion that is innovative and shows real craft. Across the 15 award-winning portfolios analysed, 10 use a full-screen canvas, but only one gives it a real HTML layer behind it, and only two change what loads first under reduced motion (docs/research/portfolio-analysis-30.md).

## Decision

- **A single crowd of dots plays three roles.** Every dot has a place in the name, a place on the world map and a place in the portrait of the visit, and one `stage` value moves the whole crowd between them. The world is Natural Earth land, sampled once at build time on an even hexagonal grid in the Equal Earth projection centred on 150°E (scripts/build-world-dots.mjs → public/data/world-dots.bin, 16,002 dots, 41 KB gzipped).
- **Raw WebGL2** (two small programs, about 300 lines) rather than Three.js or OGL. The scene is points in 2D, so a scene graph, camera classes and a material system would add weight (Three.js is over 150 KB) without adding capability.
- **Scroll drives the scenes through CSS `position: sticky` runways** (the Prologue, the Time Shifts and the Case figures), not pinned transforms. The layout classes (`field`, `scenes`) are set by an inline script before first paint, so scroll positions saved for Return are stable.
- **Truth stays in HTML.** The canvas is `aria-hidden`. The name, places, times and readout are real text. Clocks and the day/night terminator are computed live.
- **It only runs where it is welcome:** on the home page, with WebGL2 available, and without a reduced-motion preference. Otherwise the page is the calm editorial layout it was before.

## Alternatives considered

- **Three.js or OGL:** familiar, but heavier than the problem needs. It would also pull the motion vocabulary toward 3D, which the direction (paper, ink, one blue) does not want.
- **SVG or DOM dots:** 16,000 animated elements cannot hold 60 fps on phones.
- **Pre-rendered video:** could not show tonight's day and night, the reader's own pointer, or their time on the site, which are what make the motion mean something.

## Consequences

- The Field's choreography lives in src/scripts/field/index.ts and depends on page geometry (hero, Prologue, Time Shifts, readout). New sections between them need their windows added there.
- Geometry is pure and tested (src/lib/geo.ts, src/lib/visit.ts). The renderer is verified visually with captures, not unit tests.
