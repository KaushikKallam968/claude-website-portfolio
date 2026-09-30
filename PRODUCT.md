# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated to Claude (owner, September 30, 2026). The choice is recorded in `docs/adr/` once the experience direction fixes the motion requirements. Review happens on localhost for now; a publishing route is recommended at the end, and nothing is deployed publicly without the owner's explicit approval.

## Users

Recruiters and UX research professionals.

- **Recruiters** arrive between other candidates, often from LinkedIn or an application link, frequently on a phone. They need to know within seconds what Kaushik researches, how senior he is, what he personally did, and how to reach him or read his résumé.
- **Research peers and hiring managers** read more slowly. They inspect research judgment: why a method was chosen, how scope was negotiated, what the evidence supports and what it does not.
- **Visitors interested in the person** want to understand who he is beyond a job title: the places he has lived, what he cares about outside work, and watched.

## Product Purpose

A personal portfolio for Kaushik Kallam that connects his research judgment with his life. Success: a recruiter can go from the first screen to a relevant case to contact without friction; a research peer comes away convinced of his judgment; anyone leaves remembering the person, not only the job title. The owner's stated bar is an award-level site, with motion design as the signature craft.

## Positioning

A quantitative UX researcher working in the gaps between what people need, how products behave, and what the data can explain. His work repeatedly separates things that look alike: recorded activity versus interpretable behavior (instrumentation coverage versus quality), a correct answer versus an efficient process (bounded multi-agent evaluation), interest in AI help versus readiness of a concept (Chegg Discord), translation versus localization (Chegg Mexico), liking versus preferring (watched.). He has lived across countries and research contexts and embraces change rather than fearing it.

## Operating Context

Owner-confirmed biographical record (background, not a required route): born in Tirupati, India; moved to Singapore when young; New Jersey from 2007 for two years; New Mexico one year; Minnesota one year; Texas for middle school through a master's degree; Atlanta for an internship during the master's; Silicon Valley for a summer internship; back to Texas as a remote Chegg contractor (one of two interns converted), then JPMorganChase; moved internally to New York City.

Curated journey content, confirmed in the earlier project: New York (current work) → Texas (career) → Silicon Valley (Chegg internship) → Atlanta (Inspire Brands) → Texas (education) → Singapore (life outside work), then contact. It is a curated reverse narrative, not a date sort. The two Texas chapters stay distinct. Childhood stops and a return to Tirupati are excluded.

Roles and dates:

- Senior Quantitative UX Researcher · JPMorganChase · NYC · June 2026 to present (formal profile title: Senior Quantitative Behavioral Researcher; the site uses the functional title).
- Experience Research Senior Associate · JPMorganChase · Plano, Texas · November 2024 to June 2026 (title confirmed by the owner, September 30, 2026).
- Chegg · UX Researcher II, contractor · August to November 2024 · remote from Texas.
- Chegg · UX Research internship · June to August 2024 · Santa Clara County, California.
- Inspire Brands · Quantitative Consumer Insights internship · June to August 2023 · Atlanta.
- University of Texas at Dallas: MS Applied Cognition and Neuroscience, HCI specialization (2022 to 2024); BS Neuroscience and Psychology (2018 to 2022).

## Capabilities and Constraints

Featured research, in order: Data Instrumentation Coverage and Quality; Chegg Discord; Chegg Mexico. watched. is a distinct cofounder/product case. Bounded multi-agent evaluation is "research in development", never a completed case. Chase Mobile Entry Points is a concise summary, not a full case.

Claim boundaries that bind every surface:

- **Instrumentation:** owner-created cross-product HTML Payments dashboard, product drill-down and resumable pipeline designed for reuse. Coverage means missing tags; quality means high-use tags without usable semantic context. Being publicized. No adoption, remediation gains, deployment to other lines of business or business uplift. Not the separate Tableau dashboards.
- **AI evaluation:** bounded multi-agent workflows only; concept development with his manager; he does not design the agentic test experience. Internal signals, definitions, rubrics and logs are protected. Agent-side indicators are an operational construct, not proof agents feel emotion.
- **Discord:** discovery plus low-fidelity concept tests produced different advance/iterate recommendations. No launched bot or measured learning gains. Do not sum participants into 60 unique people.
- **Mexico:** mixed-methods; stakeholder scoping from a 100+ question draft; bilingual search recommendation, implementation reported in the owner's presentation. No business uplift. Do not merge with the separate 400+ EGEL claim.
- **watched.:** co-founded with two longtime friends; research, product/UX and front-end contributions alongside technical cofounders; launched, currently paused in an offline maintenance release (App Store, checked September 28, 2026; recheck before publishing). Singapore did not inspire or originate it.
- Case copy is draft until the owner confirms it; review builds mark it as draft (owner, September 30, 2026: keep the markers until he reviews each case). Employer material is not cleared for public release: the JPMorganChase entries stay as written, and the owner clears them before anything is published.

## Brand Commitments

- Voice: warm, perceptive, quietly confident; a thoughtful researcher explaining consequential work to an intelligent colleague. No em dashes. No travel puns, slogans, invented motivations, anecdotes or metrics.
- The journey conveys that he embraces change; no separate adaptability anecdote is required.
- Singapore is a core part of who he is and holds life outside work: films, television, friendships, watched.
- Particles: the earlier "no particle or point-cloud effects" rule (from the airplane-window era) is lifted for the Field, the dot system that draws the world, the name and the visit (owner, September 30, 2026). The lift covers the Field only; it is not a licence for decorative particle effects elsewhere.
- The earlier airplane and window-seat premise is no longer binding: the owner delegated the premise to Claude on September 30, 2026. Flight imagery may return only if the chosen direction earns it.
- Contact shown on the site: kaushik.kallam@gmail.com and https://www.linkedin.com/in/kaushikkallam/ (owner-confirmed September 30, 2026).

## Evidence on Hand

- Content spine (owner-accepted chapter copy, reading flow, draft cases, source syntheses): `portfolio-handoff/outputs/portfolio-reading-draft.md`, `portfolio-reading-flow.md`, `portfolio-selected-case-studies.md`, `portfolio-journey-content-map.md`, `portfolio-voice-guide.md`, and the source notes they cite.
- Licensed material: Figtree (SIL OFL) and CC0 Poly Haven HDR skies in `portfolio-handoff/`.
- No portrait of Kaushik on the site (owner decision, September 30, 2026).
- watched. screenshots: the real screens from the public App Store listing (provenance in `assets-source/watched/PROVENANCE.md`) are approved for the site (owner, September 30, 2026).
- Absent, and never to be fabricated: photos of Kaushik or his life, watched. video, a résumé PDF, publishable employer artifacts, participant quotes, outcome metrics.

## Product Principles

1. The person and the research judgment are both the subject; neither is decoration for the other.
2. Every claim is bounded by its evidence; status labels say exactly how far work went.
3. The work is never behind the show: direct access to cases, résumé and contact from anywhere, no forced sequence.
4. Motion carries meaning and continuity; it never hides content or gates navigation.
5. Places are true to his life; nothing about a place is invented.

## Accessibility & Inclusion

WCAG 2.2 AA. Full keyboard access with visible focus; screen-reader order matches reading order; decorative canvases hidden from assistive technology. `prefers-reduced-motion` wins on load and every destination works without animation; a visible control pauses ambient motion. The site works without WebGL, without JavaScript for core reading, and when images fail. Baseline viewports 1440×900, 1280×800, 390×844 and 360×800, plus 200% zoom. Case return restores origin, position and focus; browser Back behaves normally.
