---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: []
---

Scope: the home page (Journey) as an Experience surface; Case pages inherit the world as Read surfaces.

Audience and job: recruiters (fast fit, contribution, contact) and research peers (judgment); both must reach work without the journey.

Owner steer (September 30, 2026): two rolled direction rounds were declined ("be more bold and creative"; "this all feels AI generated"). The owner asked for a direction derived from what makes world-renowned portfolios great. Evidence: docs/research/portfolio-teardown.md and docs/research/uxr-portfolio-landscape.md.

## Direction contract

THESIS: The portfolio does what Kaushik does. It quietly observes how it is being read and is candid about what those observations can and cannot explain, so the site itself demonstrates his research judgment. It refuses the template hero (kicker, "Hi, I'm", two pill buttons) and every costume metaphor.

OWN-WORLD: Daylight paper ground and near-black ink; one annotation blue reserved for the observation layer and live state; real photography in full colour is the only other colour. One grotesk used at extreme scale contrast (a name set to the width of the page, a calm reading size), a mono only for observed events. Hairline rules, flush-left columns, no gradients, glass, cards or pill buttons.

STORY: The visitor meets a person (name, role, one sentence of point of view), notices the page taking honest notes on what they do, travels through real places to real work, opens a Case, returns exactly where they left, and ends at a readout of their own visit that hands off to "I'd rather ask you" and his email.

FIRST VIEWPORT: The name set across the full width at display scale is the hero. Beneath it, on a twelve-column grid: the identity block (Senior Quantitative UX Researcher, JPMorganChase, New York; one point-of-view sentence; text actions Explore the journey, Selected work, Résumé) at left; an optional small real portrait in the middle only if the owner supplies one; the observation column at right logging the visitor's events in blue mono, each with what it cannot explain. A numbered route index of the six places (years, live local time) sits on a hairline along the bottom edge and doubles as chapter navigation. Readable HTML text before any script runs.

FORM: Owner-steered, research-derived direction after two declined rolls (seed f79d63f5, bolder re-roll 1). Signature interaction: the observation layer and the closing visit readout. Motion grammar: only position, opacity and clip; one entrance curve cubic-bezier(0.16,1,0.3,1) and one scene curve cubic-bezier(0.86,0,0.07,1), used everywhere; line-masked text reveals, inertial scroll, one continuous case transition (cross-document view transition of the Entry title) with origin-aware return; motion between reading moments, never inside them.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
