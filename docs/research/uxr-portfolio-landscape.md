# UX researcher portfolio landscape: portraits, structure, and motion-led award winners

Researched September 30, 2026 for Kaushik Kallam's portfolio. Builds on (from the earlier handoff, in git history at 08dc724) `portfolio-handoff/outputs/ux-researcher-portfolio-content-research.md`, `exceptional-portfolio-references.md`, and `portfolio-voice-reference-review.md`; it re-verifies their researcher references and adds 15 more researchers, first-party hiring guidance, and a verified 2024-2026 award set.

**Method.** Every portfolio was opened in headless Chromium (1440x900) on the capture date; screenshots are in `docs/research/captures/` (`uxr-*` for researchers, `motion-*` for award sites). Portraits were confirmed visually, not from alt text alone. Award claims were checked on the Awwwards, FWA, or Webby page for each site. Page weight, time-to-text, fonts, easing curves, and `prefers-reduced-motion` references were measured by instrumenting the browser; this environment has no GPU, so load and render timings are pessimistic. Library detection by string matching is heuristic, so stacks below are the author's or the award page's statement unless marked "detected". Sites in the coordinator's teardown set (`docs/research/teardown/`) were measured but not re-screenshotted.

## 1. Portraits across 22 live UX researcher portfolios

| Researcher (site) | Role as stated on the site | Face shown? | Where | Other personal photos |
|---|---|---|---|---|
| [Audra Wingard](https://audrawingard.com/) | Senior UX Researcher, mixed methods | No | None | None |
| [Harry Morgan](https://www.harrybmorgan.com/) | UX researcher, ex-Harvard historian; enterprise software, IoT | Yes | Hero: 8 s looping animated illustration of him; a frame shows a "Veo" watermark (`uxr-harry-morgan-hero-video-frame.jpg`). [About](https://www.harrybmorgan.com/about): photo | Illustrations of hobbies (jazz piano) |
| [Nathan Hedin](https://www.nathanhedin.com/) | Lead UX Researcher, Microsoft Teams | Yes | Hero, beside intro | Second photo on [About](https://www.nathanhedin.com/about) |
| [Ben Alpers](https://benalpers.com/) | UX Researcher, hardware and wearables | No | Pixel "LED" nameplate instead; [About](https://benalpers.com/about) is text only | None |
| [Joe Moran](https://research.google/people/joemoran/) | UX Researcher, Google CoreML (Google Research profile) | No | Placeholder icon | None |
| [Sarah Ng](https://www.ngsarah.com/) | Senior mixed-methods UXR, AnswerLab | Yes | Hero | [About](https://www.ngsarah.com/about): knitting, canoeing |
| [Quincey Zhou](https://www.quinceyzhou.com/) | Mixed-methods UXR, Xiaomi; ex-TikTok | Candid only | [About](https://www.quinceyzhou.com/about) | Travel and event photos |
| [Marie Donahue](https://www.mariedonahueportfolio.com/) | UX Researcher, PhD social psychologist | Yes | Hero, holding her dog | Dog |
| [Dianne Kim](https://www.diannekimstory.com/) | UX Researcher, financial services | Yes | Hero headshot | None |
| [Melanie Gierszal](https://melaniegierszal.com/) | UX research lead, fintech and e-commerce | No | None | None |
| [Carl J. Pearson](https://carljpearson.com/) | Staff quantitative UXR, Reddit; ex-Meta | Yes | Hero cutout headshot | None |
| [Rosie Aboody](https://raboody.github.io/website/index.html) | Senior Quantitative UXR, Instagram | Yes | Hero, circular | None |
| [Devin Harold](https://devinharold.com/) | Design leader; ex-Head of Design Research, Capital One; ex-Head of UXR, Verizon | Yes | About block near page bottom | None |
| [Alexandra Nguyen Walters](https://www.alexandramnguyen.com/) | Senior UXR (Nuro, Uber, Crunchbase work) | Yes | Hero | [About](https://www.alexandramnguyen.com/about): photo gallery |
| [Mia Eltiste](https://www.heymia.co/) | Lead UXR, Sinclair Digital, NYC | Yes | Hero, full-length studio photo | [About](https://www.heymia.co/about): personal photo |
| [Katie McCurdy](https://www.katiemccurdy.com/) | Healthcare UX designer and researcher | No | None found | None |
| [Cyd Harrell](https://cydharrell.com/) | Research leader, civic tech | Yes | Small, first viewport, About column | None |
| [Sam Ladner](https://www.samladner.com/) | Sociologist; ex-Workday Senior Principal Researcher, ex-Amazon Principal Researcher | Yes | About section, lower homepage | None |
| [Kerry Rodden](https://kerryrodden.com/) | Data visualization developer; co-author of [Quantitative UX Research](https://quantuxbook.com/) | No | Hero is her sunburst visualization | None |
| [Paige Nuzzolillo](https://www.paigenuzzolillo.com/) | Senior UX Researcher | Yes, in context | Hero: her at a whiteboard journey map | Hobby section |
| [Judd Antin](https://juddantin.com/) | Ex-Head of Research, Airbnb; now coach | No | None | None |
| [Kaitlyn Bryant](https://kaitlyndoesresearch.github.io/) | UX Researcher, PhD | No (homepage) | Project photo of a study setup; About not checked | Not verified |

**Tally.** 14 of 22 (64%) show the researcher somewhere; 11 (50%) in the first viewport; 3 only lower down or on About; 8 (36%) show no face at all. Seniority does not predict a big portrait: of the seven staff-level or research-leader sites (Moran, Rodden, Antin, Ladner, Harold, Harrell, Pearson), only [Carl Pearson](https://carljpearson.com/) uses a large hero portrait. Three are faceless, two place the photo in a lower About block, and Harrell's is small.

**What the strongest do.** The portrait is always subordinate to a research identity sentence. [Pearson](https://carljpearson.com/) pairs the photo with "Hi there! I'm Carl, a quantitative UX researcher", then employer, PhD, and method range. [Paige Nuzzolillo](https://www.paigenuzzolillo.com/) shows herself doing research (mapping a journey on a whiteboard), which makes the photo evidence rather than decoration. [Kerry Rodden](https://kerryrodden.com/) uses her own data visualization as the hero image, a quant-native alternative to a face. [Audra Wingard](https://audrawingard.com/) has no photo at all and still has the most distinctive homepage in this set, because it names observed behavior ("why someone keeps a spreadsheet alongside our 'all-in-one' platform"). Personal photos, where present, sit on About pages ([Sarah Ng](https://www.ngsarah.com/about), [Quincey Zhou](https://www.quinceyzhou.com/about)).

**First-party hiring guidance on photos: none found.** No research leader or hiring manager source in this review lists a photo as an evaluation criterion:

- [NN/g, Lexie Kane (2019)](https://www.nngroup.com/articles/ux-researcher-portfolio/): ten recommendations on audience, curation, context, findings, value, and constraints; nothing on photos.
- [Chris Chapman, Quant UX Blog](https://quantuxblog.com/quant-ux-interview-portfolio-presentations-recommendation) (ex-Principal UX Researcher at Google; says he has sat through "perhaps 150 interview candidate presentations" as a hiring manager and interviewer): one slide about yourself should cover research philosophy; leave academic background, hobbies, and family details to the resume. He doubts web portfolios matter for general applicants ("who would look at them?").
- [H Locke (July 2025)](https://hlockeux.substack.com/p/a-very-big-guide-to-ux-research-portfolios), 10+ years hiring UX researchers: portfolio core is elevator pitch, three case studies (max four), links, contact; "It should load quickly." Nothing on photos.
- [Lawton Pybus, Drill Bit Labs rubric (April 2025)](https://depth.drillbitlabs.com/p/uxr-portfolio-rubric): scores Clarity, Rigor, Impact, Engagement, Growth.
- [Nikki Anderson (2023)](https://www.userresearchstrategist.com/p/create-and-present-an-impactful-user): 16 case-study components starting with personal background; no photo guidance. Her May 2026 [portfolio post](https://www.userresearchstrategist.com/p/building-a-user-research-portfolio) is paywalled (not verified).

**Answer to "do we need a portrait at all?"** No. Practice is split, the most senior researchers often omit one, and no hiring-side source evaluates it. A portrait is a warmth signal, not an evidence signal. See the recommendation in section 5.

## 2. Structure for recruiters vs research peers

**First viewport.** Recruiters get role, seniority, and a route to evidence. Peers get a point of view. [Melanie Gierszal](https://melaniegierszal.com/) gives two buttons, "View Case Studies" and "Open Resume", plus a Resume (PDF) nav item. [Audra Wingard](https://audrawingard.com/) fits title, point of view, CV, email, and LinkedIn icons into one screen. [Harry Morgan](https://www.harrybmorgan.com/) leads with a career transition and "Explore my work". Every researcher site exposed work, resume, and contact through ordinary always-visible links (a top nav on most, icon links on Wingard's). None required an animation, sound choice, or loader before content.

**Research judgment and method rationale.** The strongest cases show a decision under constraint:
- [Nathan Hedin, Team Copilot](https://www.nathanhedin.com/team-copilot-ai/): he changed the plan when the in-code build was not ready, then lists three studies with sample sizes (12 interviews, an 18-person group session, a 10-person co-design). He scopes the co-design explicitly "Due to NDA limits with the audience".
- [Harry Morgan, AI vehicle camera](https://www.harrybmorgan.com/projects/ai-vehicle-camera): a TL;DR block (Problem, Role, Team, Timeline, Methods, Outcomes) serves recruiters; method-by-method detail serves peers.
- [Melanie Gierszal](https://melaniegierszal.com/) adds a "Scope of ownership" paragraph on every card, separating her work from the team's.
- [Pybus](https://depth.drillbitlabs.com/p/uxr-portfolio-rubric) scores Rigor as showing why a method was chosen, not listing it.

**Bounded outcomes.** Good patterns:
- Gierszal states "Increased conversion rate by 1 percentage point", with the unit right.
- Morgan labels unfinished evaluative work "(planned)" in his timeline.

The pitfall is in the same Morgan case: the TL;DR says "~$100k+ modeled", but the body says he "Discovered a $100k+ annual storage leak ... and solved it", which blurs modeled and realized value. Pybus notes that researchers "often have little control over how our findings and recommendations ultimately get used" and recommends looking for indirect signals. [NN/g](https://www.nngroup.com/articles/ux-researcher-portfolio/) asks candidates to acknowledge constraints.

**NDA and confidential work.**
- [Alexandra Nguyen Walters](https://www.alexandramnguyen.com/) marks each case "🔒 Password-Protected Project" but publishes its "How might we" research question, so the work stays legible.
- [Audra Wingard](https://audrawingard.com/) shows public titles, with cases behind HTTP authentication on a subdomain.
- [Sarah Ng](https://www.ngsarah.com/projects) password-protects the whole projects page.
- [Marie Donahue](https://www.mariedonahueportfolio.com/) labels a tile "CONFIDENTIAL".
- [Chapman](https://quantuxblog.com/quant-ux-interview-portfolio-presentations-recommendation) recommends "blurred images, hypothetical screen mock ups, similar but disguised products".
- [H Locke](https://hlockeux.substack.com/p/a-very-big-guide-to-ux-research-portfolios): "If you signed one, don't put confidential information on the internet," and "if a hiring manager won't use a password then you don't want to work there."

**Length.** Measured case-study word counts:

| Case | Words |
|---|---|
| [Dianne Kim, JTBD](https://www.diannekimstory.com/jtbd-project) | 824 |
| [Mia Eltiste, athenahealth](https://www.heymia.co/portfolio/athenahealth) | 1,409 |
| [Harry Morgan, AI vehicle camera](https://www.harrybmorgan.com/projects/ai-vehicle-camera) | 1,442 |
| [Nathan Hedin, Team Copilot](https://www.nathanhedin.com/team-copilot-ai/) | 1,634 |
| [Katie McCurdy, Pictal](https://www.katiemccurdy.com/work/pictal) | 1,980 |

Homepages ranged from 63 to 1,122 words. Recommended case counts: NN/g says 3 to 5; Locke says 3 (max 4); Chapman says present 1 in interviews, with a second as backup. (A three-case split attributed to Nikki Anderson in search results was not found on her pages; not verified.) Pybus reconciles depth and brevity with "an executive summary, clear sections and headers, or even a hyperlinked table of contents".

## 3. Motion-led personal portfolios with verified 2024-2026 awards

**Award context.** No personal portfolio won Awwwards Site of the Year in 2024 or 2025 ([Sites of the Year](https://www.awwwards.com/websites/sites_of_the_year/) listing: Igloo Inc, Don't Board Me, and Opal Tadpole for 2024; Lando Norris and Messenger for 2025). Awwwards' portfolio-specific recognition is monthly [Portfolio Honors](https://www.awwwards.com/websites/winner_category_portfolio/), cited below where the site holds it. Researcher-built award winners: none found. The closest UX-adjacent winners are marked ◆.

### 3a. Awards, motion, stack

| Site | Award (verified on award page) | Defining motion | Stack (author or award page) |
|---|---|---|---|
| [Bruno Simon](https://bruno-simon.com/) | [SOTD Jan 21 2026](https://www.awwwards.com/sites/brunos-portfolio); Site of the Month Jan 2026 and Portfolio Honors Dec 2025 ([listing](https://www.awwwards.com/websites/winner_category_portfolio/)); [Webby 2026 Technical Achievement, Webby + People's Voice](https://winners.webbyawards.com/2026/websites-and-mobile-sites/features-design/technical-achievement/370083/brunos-portfolio) | Drivable 3D world with physics; UI rebuilt as 3D objects; spatial sound | Three.js with WebGPU/TSL, Blender, DRACO, compressed textures ([author case study](https://www.awwwards.com/brunos-portfolio-case-study.html)); Rapier and Howler ([repo](https://github.com/brunosimon/folio-2025)) |
| [Antoine Wodniack](https://wodniack.dev/) | [FWA of the Day Nov 16 2024](https://thefwa.com/cases/antoine-wodniack-portfolio); [SOTD Dec 12 2024](https://www.awwwards.com/sites/aw-portfolio) + Portfolio Honors Nov 2024; [Webby 2025 Best Home Page, Winner](https://winners.webbyawards.com/2025/websites-and-mobile-sites/features-design/best-home-page/332383/aw-portfolio) | Intro animation, generative line-field hero, pseudo-3D grid tunnel, 3D image gallery, hover on contact | Astro ([repo](https://github.com/AntoineW/AW-2025-Portfolio)); GSAP, Lenis detected |
| [Gianluca Gradogna](https://gianlucagradogna.com/) | [SOTD Jan 23 2025](https://www.awwwards.com/sites/gianluca-gradogna-portfolio) + Portfolio Honors Jan 2025 | Infinite-scroll home with synchronized loops, horizontal photo chapter, clip-mask page transitions | Nuxt, GSAP, custom smooth scroll ([author case study](https://tympanus.net/codrops/2025/01/30/case-study-gianluca-gradogna-portfolio-25/)) |
| [Olha Lazarieva](https://www.olhalazarieva.com/) ◆ | [SOTD Oct 2 2025](https://www.awwwards.com/sites/olha-lazarieva) + Portfolio Honors Sep 2025 | 3D text-textured sphere loader, mouse-reactive camera orbit, split-letter nav | GSAP, React, Figma (award page); React Three Fiber and PixiJS ([authors' write-up](https://tympanus.net/codrops/2025/12/02/two-portfolios-one-process-where-design-motion-and-code-come-together/)) |
| [Elliott Mangham](https://elliott.mangham.dev/) | [SOTD Dec 2 2025](https://www.awwwards.com/sites/elliott-mangham) + Portfolio Honors Nov 2025 | Scroll-revealed personal statement, awards showcase, video walkthrough modal, preloader | GSAP, JavaScript, Vite (award page) |
| [Pacôme Pertant](https://pacomepertant.com/) | [SOTD Jun 9 2026](https://www.awwwards.com/sites/pacome-pertant-portfolio) + Portfolio Honors May 2026 | Spiral view morphing to list, page transitions, mouse trail, sound design | GSAP, Three.js, Nuxt (award page) |
| [Léo Parpeix](https://leoparpeix.com/) ◆ | [SOTD Sep 14 2026](https://www.awwwards.com/sites/leo-parpeix-portfolio-2026); [FWA of the Day Sep 28 2026](https://thefwa.com/cases/leo-parpeix-portfolio-2026-p3) | Single-scroll 3D character narrative; typographic transitions; sound toggle | WebGL, Blender, After Effects (award page) |
| [Jesper Landberg](https://jesperlandberg.com/) | [SOTD Sep 29 2026](https://www.awwwards.com/sites/jesper-landberg-4) (Dev Award 8.17) | Infinite scroll; video transitions home to project and project to project | GSAP, Three.js, Nuxt (award page) |
| [Grégory Lallé](https://gregorylalle.com/) | [SOTD Oct 30 2024](https://www.awwwards.com/sites/gregory-lalle-24) + Portfolio Honors Oct 2024 | Counter loader reveal, works focus view, page transitions | Not stated; GSAP, Lenis detected |
| [Gil Huybrecht](https://gilhuybrecht.com/) ◆ | [SOTD Sep 21 2026](https://www.awwwards.com/sites/gil-huybrecht) | Infinite WebGL gallery, grid and gallery toggle | WebGL, Next.js, DatoCMS (award page) |
| [Arthur Engel](https://aengel.io/) | [FWA of the Day Sep 30 2026](https://thefwa.com/cases/arthur-engel-portfolio) | "Fully immersive WebGPU experience with scroll-driven navigation, and a lite version for mobile devices" (FWA) | WebGPU (FWA); React Three Fiber detected |
| [Cyd Stumpel](https://cydstumpel.nl/) ◆ | [SOTD Mar 9 2025](https://www.awwwards.com/sites/cyd-stumpel-portfolio-2025) | Native CSS View Transitions and scroll-driven animations | CSS ([MDN: scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations)) |

◆ marks UX-adjacent winners. Léo Parpeix describes "a focus on innovation and user-centered design" ([Awwwards](https://www.awwwards.com/sites/leo-parpeix-portfolio-2026)). Gil Huybrecht lists Information Architecture and Interaction design as services (live site). Olha Lazarieva is tagged "UI design". Cyd Stumpel's Dev Award accessibility sub-score (7.8) beats Bruno Simon's (6.6).

Also verified but not ranked: [Matteo Courquin, FWA of the Day Sep 24 2026](https://thefwa.com/cases/matteo-courquin) (single-screen desktop-window UI); [Toshihito Endo, FWA of the Day Mar 1 2025](https://thefwa.com/cases/a-3d-game-like-portfolio); [Artiom Yakushev, SOTD Dec 27 2025](https://www.awwwards.com/sites/artiom-yakushev); [Meer Mohsin, SOTD Sep 26 2026](https://www.awwwards.com/sites/meer-mohsin).

### 3b. What makes them feel human-crafted: measured signals

| Site | Palette (award page) | Type (measured) | Signature easing (occurrences in loaded code) | Weight; readable text at 2.5 s |
|---|---|---|---|---|
| Wodniack | #f40c3f, #160000 | Bigger Display, Editorial New, Fraktion Mono | cubic-bezier(0.86,0,0.07,1) x9; expo.inOut x9 | 0.5 MB; yes |
| Gradogna | #0D0D0D, #FFFFFF | Neue Montreal | easeInOutSine (0.445,0.05,0.55,0.95) x24; expo.inOut x14 | 10.9 MB; 20 chars, then 2,888 by 10 s |
| Lazarieva | #101010, #F7F7F7 | Sofia Sans Condensed + Spline Sans Mono | custom (0.11,0.82,0.39,0.92) x17; power3/4.out | 5.7 MB; loader still at 73% at 10 s |
| Mangham | #121212, #fff | Neue Montreal + Roobert Mono | (0.39,0.575,0.565,1) x18; expo.out x14 | 1.2 MB; yes |
| Parpeix | not listed | self-hosted faces named "title" and "text" | (0.16,1,0.1,1) x43; expo.out x20 | 20.2 MB; 152 chars, then 10,165 by 10 s |
| Lallé | #111111 only | custom "NG" | expo.out, (0.4,0,0.2,1) | 4.2 MB; loader counter at "75" at 10 s |
| Huybrecht | #0D0D0F, #FFFFFF | custom sans | easeOutExpo (0.19,1,0.22,1) x13 | 24.3 MB; yes |
| Engel | not listed | League Spartan + Manrope | (0.22,1,0.36,1) x19 | 12.8 MB; 236 chars, then 8,766 by 10 s |
| Simon | not listed | Amatic SC, Nunito (canvas UI) | power2 family, back.out | 7.4 MB; 0 chars even at 10 s |

What reads as authored, with evidence:

1. **A narrow, committed palette.** Almost every winner lists two colors on its Awwwards page. Lallé and Yakushev list one.
2. **Characterful type, often display plus mono.** Examples: Editorial New with Fraktion Mono (Wodniack), Neue Montreal with Roobert Mono (Mangham). Toshihito Endo's FWA winner uses Inter, so no single face is the tell. Scale and pairing carry the character: Endo sets his name at 180 px.
3. **One signature curve, used relentlessly.** Parpeix reuses one near-expo ease-out 43 times. Lazarieva's custom bezier appears 17 times; her loader tweens run `power4.out` over 2 to 2.5 s, and the camera "interpolates toward the target rotation" instead of snapping ([write-up](https://tympanus.net/codrops/2025/12/02/two-portfolios-one-process-where-design-motion-and-code-come-together/)). The curves are long-tail decelerations, not the browser's `ease` or Material's (0.4,0,0.2,1), which appear rarely.
4. **Restraint in motion vocabulary.** Gradogna: "We didn't want anything overly elaborate... Position, Opacity, and Clip Masks." He prototypes motion in After Effects before code ([case study](https://tympanus.net/codrops/2025/01/30/case-study-gianluca-gradogna-portfolio-25/)).
5. **Authored assets tied to the person.** Examples:
   - Gradogna's own travel photography.
   - Simon's Blender world with three commissioned music tracks ([case study](https://www.awwwards.com/brunos-portfolio-case-study.html)).
   - Parpeix's sculpted "moustache daisy" character, "a symbol that reflects both my personality and my creative approach" ([FWA](https://thefwa.com/cases/leo-parpeix-portfolio-2026-p3)).
   - Wodniack's generative line field, which reflects his pen-plotter art practice.
   - Lazarieva's black-and-white "chessboard" language, derived from her personality.
6. **Personal specificity in copy.** Mangham's homepage shows a live London clock, rates, client brands, and "I'm rooted in England, close to the legendary home of Robin Hood" (`motion-elliott-mangham-scroll.jpg`). Parpeix writes "(Click to feed the bee)". Huybrecht states "Available September 2026". Parpeix also sets a measurable goal: visitors should "understand my skill set in under 10 seconds".

**Pitfalls observed in winners.**
- **Content gated behind loaders or canvas.** Simon's world exposes no readable DOM text after 10 s. Pacôme Pertant opens on an "enter with sound / enter without sound" choice (`motion-pacome-pertant-scroll.jpg`).
- **Heavy payloads.** 20 to 31 MB for Parpeix, Huybrecht, Yakushev, and Courquin during a 15 s session.
- **Split-letter markup.** Lazarieva's nav exposes "A B O U T M E" as text and Endo's intro duplicates words, which assistive tech may read aloud (not tested with a screen reader).
- **Placeholder copy.** Meer Mohsin's DOM text at capture included "Lorem ipsum dolor sit amet" under "GET IN TOUCH" (on-screen visibility not verified).
- **Rare reduced-motion handling.** `prefers-reduced-motion` appeared in loaded code for Engel (28 references), Mangham, Lazarieva, Huybrecht, Endo, and Yakushev. It was not detected for Simon, Wodniack, Gradogna, Parpeix, Landberg, or Lallé.

## 4. Why sites feel AI-generated: tells to avoid

These are editorial observations, contrasted with the verified winner evidence above.

1. **Default type and scale.** One sans at polite sizes, with no display face, no mono or serif counterpoint, and no typographic idea.
2. **Default or uniform motion.** Every block fades up 20 px on scroll with the same duration and stagger, on `ease` or (0.4,0,0.2,1). Winners pick one or two signature curves and reserve motion for state changes.
3. **Gradient soup.** Purple-to-pink gradients, glow blobs, glassmorphism cards, and five or more accent colors. Winners commit to one or two colors.
4. **Symmetric card grids.** Icon, title, and blurb three across, plus rounded "10+ years" stat tiles. Winners use authored indexes: Huybrecht's grid and gallery toggle, Courquin's window system, Mangham's dossier columns.
5. **Imagery with no provenance.** Stock, abstract 3D shapes, or AI-rendered or AI-animated portraits. A visible generator watermark such as "Veo" is the loudest version. Winners use their own photos, scans, 3D, or data.
6. **Slogans instead of specifics.** "Turning insights into impact", "passionate about users". Audra Wingard's spreadsheet example and Mangham's Robin Hood line cannot be generated generically.
7. **Decorative metaphor.** A 3D object or theme with no link to the person's work or life. Parpeix's daisy and Wodniack's plotter lines trace back to the author.
8. **Unfinished edges.** Placeholder text, default favicons, generic 404s, identical hover states everywhere. Winners polish 404s and loaders; Lallé and Yakushev list their 404 pages as notable elements.
9. **No point of view in the layout.** Everything is centered, evenly spaced, and equally weighted. Winners use asymmetry, extreme scale contrast, and negative space on purpose (Lazarieva: "the generous amount of negative space on the site makes it feel like the user is entering my design world").

## 5. Synthesis: what "serious research portfolio + award-level motion" requires

1. **Text first, within 2 seconds.** Name, "Senior Quantitative UX Researcher", one sentence of point of view, and links to Work and Resume must be real HTML before any scene loads. Every researcher site does this. The canvas-only award sites (Simon: 0 characters after 10 s) would fail a recruiter's first scan.
2. **Motion between reading moments, never inside them.** Transitions carry the flight and chapter changes. Case-study bodies stay still and scannable. Use Gradogna's three-parameter restraint (position, opacity, clip).
3. **Own a motion signature.** Pick one entrance curve (a long-tail ease-out near cubic-bezier(0.16,1,0.3,1)) and one scene curve (an in-out). Set durations deliberately and use them everywhere. Ban framework defaults.
4. **Two colors, one accent, one type idea.** For example, a characterful display face for chapter names and a mono for data labels, which suits a quant researcher's annotations.
5. **Authored assets only.** Use Kaushik's own photographs of NYC, Texas, and Singapore, and his own charts restyled as imagery. Rodden's visualization hero shows data as the signature visual. No stock, and no AI-generated or AI-animated images, given the owner's explicit rejection of AI-feeling directions.
6. **Two reading layers per case.** First a recruiter TL;DR (Problem, Role, Team, Timeline, Methods, Outcome). Then the peer layer: why this method, sample and uncertainty, the decision it informed, and constraints. Keep cases at 800 to 1,600 words, matching the measured range, with anchor links.
7. **Label every outcome by type:** measured, modeled, recommended, or planned. Avoid Morgan's modeled-versus-solved drift. Use percentage points where they apply.
8. **NDA-safe by design.** Publish the research question, method, and decision class. Put JPMorganChase detail behind a password or reserve it for interviews, and never show internal screens (Chapman, Locke).
9. **Budget performance like an award judge.** Wodniack won a Webby and an Awwwards SOTD at 0.5 MB, and Mangham got SOTD at 1.2 MB. Target under 3 MB before interaction. Lazy-load scenes after text, and ship a lite mobile mode (Engel's "lite version"; Simon's automatic lower preset).
10. **Accessibility is part of craft.**
    - Honor `prefers-reduced-motion`: [Lenis](https://github.com/darkroomengineering/lenis) disables smoothing, and [gsap.matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/) can zero durations.
    - Give auto-playing motion longer than 5 s a pause control ([WCAG 2.2.2, Level A](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)). Let interaction-triggered motion be disabled ([2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)).
    - Keep split-letter effects `aria-hidden` behind a real label.
    - Make sound opt-in, with no entry gate.
11. **Personal specificity replaces slogans.** Concrete observed behaviors from his research, real places and dates on the route, and one playful, true detail. That is what the winners share and what AI-feeling drafts lack.

**Portrait recommendation.** Not required. If used, it should be one recent, real, well-lit photograph (no illustration, filter, or AI animation), placed in the About or Singapore personal chapter or as a small thumbnail in the identity block (Mangham's dossier pattern). The hero belongs to the name, the research identity, and the journey. An in-context research photo (Nuzzolillo) is the strongest option if one exists that is safe to share outside JPMorganChase.

**Not verified:**
- Webby personal-website category lists: the gallery is gated behind registration.
- Awwwards 2025 Independent of the Year: reported as Louis Paquet in search results; the award page did not load.
- The full content of Nikki Anderson's 2026 post.
- Kaitlyn Bryant's About page.
- Any claim that portraits or motion change hiring outcomes: no source measured this.
