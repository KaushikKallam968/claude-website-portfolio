# 0001: Static Astro site with hand-built motion (GSAP, Lenis, WebGL only where it earns it)

Date: 2026-09-30 · Status: accepted (stack delegated to Claude by the owner) · Amended 2026-09-30 after the build (see "As built")

## Context

The portfolio must be award-level in motion while every Case stays a shareable, naturally scrolling reading page that works without JavaScript, restores the reader's Origin on return, and keeps browser Back honest. Recruiters open it on phones. The earlier Codex attempt spent most of its effort on a real-time 3D aircraft that never reached the owner's bar; the lesson is that the motion has to be authored and art-directed, not simulated.

## Decision

- **Astro (static output)** for pages and content. Every Chapter, Case and Selected Work entry is real HTML at a real URL. Content lives in typed content collections, so claims, Status and Contribution are data, not copy scattered through components.
- **GSAP (with ScrollTrigger, SplitText, Flip)** for authored timelines, and **Lenis** for inertial scrolling that stays in sync with ScrollTrigger. Motion is written by hand with named easings and durations, not delegated to a library's defaults.
- **WebGL only where the chosen direction needs it** (a single canvas, lazily started, hidden from assistive technology, with a static fallback). No framework on the client; interactive pieces are small TypeScript modules.
- **Case transitions** use a single page-transition controller (View Transitions API where supported, a GSAP overlay otherwise) that records the Origin in `history.state` and restores position and focus on return.

## As built

- **GSAP plugins:** ScrollTrigger, SplitText and CustomEase. Flip was not needed.
- **WebGL:** one canvas on the home page, the Field (see 0002). It is a raw WebGL2 dot field that draws the world, the name, the flights between places and the portrait of the visit.
- **Case transitions:** cross-document View Transitions (`@view-transition { navigation: auto }`) move the Entry title into the Case title. When a Case opens from its row, the new page grows out of that row's outline: the rect is handed over in `sessionStorage`, then applied in a `pagereveal` listener registered before first render. Browsers without View Transitions get a plain navigation. Reduced motion turns the transition off.
- **Origin:** the page that opens a Case hands its Origin over in `sessionStorage` for that one hop. The Case page moves it into its own `history.state`, so a reload keeps it and a later visit from a shared link does not. Return uses `history.back()` when the Origin is the page directly behind, so the browser restores everything. Otherwise it navigates to the Origin and restores scroll and focus on arrival, including pages restored from the back-forward cache. Browser Back is never intercepted.

## Alternatives considered

- **Next.js / React:** heavier client runtime and hydration cost for a site that is mostly reading; nothing here needs React state.
- **Plain Vite multi-page:** workable, but Astro gives content collections, image optimization and static routing for free.
- **Three.js scene as the whole site (Codex's path):** high cost, fragile on phones, and it made the aircraft the product instead of Kaushik.

## Consequences

- Motion quality depends on hand-tuned timelines; there is no theme to lean on.
- The site deploys as static files to any host (recommendation deferred to the end of the build).
- Reduced motion and no-JS paths come almost for free because the HTML is complete before any script runs.
