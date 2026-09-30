# Fifteen award-winning personal portfolios: motion, type and recruiter clarity

September 30, 2026. Companion to [uxr-portfolio-landscape.md](uxr-portfolio-landscape.md) (section 3) and [portfolio-teardown.md](portfolio-teardown.md). A separate study covers 15 UX research portfolios; none of those people appear here.

**Selection.** Fifteen individuals' portfolios, each with at least one award I re-opened on the award body's own page on September 30, 2026. Eleven of the fifteen awards date from 2024 to 2026; four are older classics kept because their awards are unusually strong (two Sites of the Month) and their motion ideas are still widely imitated. Five are UX or product-design adjacent (marked ◆). Dropped for lack of a verifiable award: Rauno Freiberg (Awwwards Honorable Mention only), Lynn Fisher and Olivier Larose (no award page found), Patrick Heng (valid SOTD from 2020, cut for space).

**Method.** Headless Chromium 141 with SwiftShader WebGL at 1440×900 and an iPhone 13 profile, through a proxy. For each site: a screencast strip of the first 12 s, a hero shot, a 12-frame scroll strip (120 ms then 200 ms steps after a mouse-wheel burst), three deeper scroll positions, a hover strip and a 12-frame click-through transition, plus a paired `prefers-reduced-motion: reduce` run. Computed styles gave fonts and sizes; every loaded script and stylesheet was scanned for `cubic-bezier`, GSAP ease names, `duration:` values and `prefers-reduced-motion`. Captures are in `docs/research/captures/award15-<slug>-*.jpg`.

**Capture caveats.** Software rendering and the proxy slow everything, so absolute timings are inflated; compare sites with each other rather than with a real laptop. This Chromium build has no H.264 or AAC, so loaders that wait on MP4 video (Lallé) stall; where noted I fired the media-ready events by script ("kick") so the layout could reveal, which leaves the video boxes black. Two sites (Pertant, Wodniack) sometimes served a bot-verification page first. Bruno Simon's and Léo Parpeix's 3D scenes, and Olha Lazarieva's loader, did not render in software, so those sections lean on the authors' case studies.

## Summary

Scores are 1 to 5: **V** visual craft, **M** motion craft, **D** distinctiveness, **C** clarity for a recruiter, **P** performance and accessibility.

| # | Site | Person | Discipline | Award (verified) | V | M | D | C | P |
|---|---|---|---|---|---|---|---|---|---|
| 1 | [bruno-simon.com](https://bruno-simon.com/) | Bruno Simon | Creative developer, 3D | [SOTD Jan 21 2026](https://www.awwwards.com/sites/brunos-portfolio), [Site of the Month Jan 2026](https://www.awwwards.com/websites/sites_of_the_month/), [Webby 2026](https://winners.webbyawards.com/2026/websites-and-mobile-sites/features-design/technical-achievement/370083/brunos-portfolio) | 5 | 5 | 5 | 1 | 1 |
| 2 | [wodniack.dev](https://wodniack.dev/) | Antoine Wodniack | Creative developer | [SOTD Dec 12 2024](https://www.awwwards.com/sites/aw-portfolio), [FWA Nov 16 2024](https://thefwa.com/cases/antoine-wodniack-portfolio), [Webby 2025 Best Home Page](https://winners.webbyawards.com/2025/websites-and-mobile-sites/features-design/best-home-page/332383/aw-portfolio) | 5 | 5 | 5 | 3 | 3 |
| 3 | [gianlucagradogna.com](https://gianlucagradogna.com/) | Gianluca Gradogna | Designer, photographer | [SOTD Jan 23 2025](https://www.awwwards.com/sites/gianluca-gradogna-portfolio) + Portfolio Honors Jan 2025 | 5 | 4 | 4 | 3 | 2 |
| 4 | [olhalazarieva.com](https://www.olhalazarieva.com/) ◆ | Olha Lazarieva | Web and UX/UI designer | [SOTD Oct 2 2025](https://www.awwwards.com/sites/olha-lazarieva) + Portfolio Honors Sep 2025 | 4 | 4 | 4 | 3 | 2 |
| 5 | [elliott.mangham.dev](https://elliott.mangham.dev/) | Elliott Mangham | Web developer | [SOTD Dec 2 2025](https://www.awwwards.com/sites/elliott-mangham) + Portfolio Honors Nov 2025 | 4 | 4 | 4 | 5 | 4 |
| 6 | [pacomepertant.com](https://pacomepertant.com/) | Pacôme Pertant | Motion and sound designer | [SOTD Jun 9 2026](https://www.awwwards.com/sites/pacome-pertant-portfolio) + Portfolio Honors May 2026 | 4 | 4 | 5 | 2 | 2 |
| 7 | [leoparpeix.com](https://leoparpeix.com/) ◆ | Léo Parpeix | Art director, interactive designer | [SOTD Sep 14 2026](https://www.awwwards.com/sites/leo-parpeix-portfolio-2026), [FWA Sep 28 2026](https://thefwa.com/cases/leo-parpeix-portfolio-2026-p3) | 4 | 5 | 5 | 3 | 1 |
| 8 | [jesperlandberg.com](https://jesperlandberg.com/) | Jesper Landberg | Design engineer | [SOTD Sep 29 2026](https://www.awwwards.com/sites/jesper-landberg-4), Dev Award 8.17 | 5 | 5 | 4 | 4 | 3 |
| 9 | [gregorylalle.com](https://gregorylalle.com/) | Grégory Lallé | Creative developer | [SOTD Oct 30 2024](https://www.awwwards.com/sites/gregory-lalle-24) + Portfolio Honors Oct 2024 | 4 | 4 | 4 | 4 | 2 |
| 10 | [gilhuybrecht.com](https://gilhuybrecht.com/) ◆ | Gil Huybrecht | Designer, art director (IA, interaction) | [SOTD Sep 21 2026](https://www.awwwards.com/sites/gil-huybrecht) | 4 | 5 | 4 | 5 | 1 |
| 11 | [cydstumpel.nl](https://cydstumpel.nl/) ◆ | Cyd Stumpel | Creative developer, lecturer | [SOTD Mar 9 2025](https://www.awwwards.com/sites/cyd-stumpel-portfolio-2025), Dev Award 7.74 | 4 | 4 | 5 | 4 | 5 |
| 12 | [dennissnellenberg.com](https://dennissnellenberg.com/) | Dennis Snellenberg | Designer and developer | [SOTD Apr 4 2022](https://www.awwwards.com/sites/dennis-snellenberg) | 4 | 4 | 3 | 5 | 4 |
| 13 | [niccolomiranda.com](https://niccolomiranda.com/) | Niccolò Miranda | Digital art director | [SOTD Nov 18 2021](https://www.awwwards.com/sites/miranda-paper-portfolio), [Site of the Month Nov 2021](https://www.awwwards.com/niccolo-miranda-paperfolio-wins-sotm-november-2021.html) | 5 | 4 | 5 | 4 | 3 |
| 14 | [aristidebenoist.com](https://aristidebenoist.com/) | Aristide Benoist | Developer, motion | [SOTD Jun 24 2021](https://www.awwwards.com/sites/aristide-portfolio-2021), [Site of the Month Jun 2021](https://www.awwwards.com/aristide-benoist-portfolio-2021-wins-site-of-the-month-june-2021.html) | 5 | 5 | 4 | 3 | 3 |
| 15 | [robin-noguier.com](https://www.robin-noguier.com/) ◆ | Robin Noguier | Interactive designer (apps) | [SOTD Oct 27 2020](https://www.awwwards.com/sites/robin-noguier-portfolio) | 4 | 5 | 4 | 4 | 2 |

Portfolio Honors months come from the [Awwwards Portfolio Honors listing](https://www.awwwards.com/websites/winner_category_portfolio/), opened September 30, 2026. Bruno Simon also holds Portfolio Honors for Dec 2025 on that listing.

## Site by site

### 1. Bruno Simon (WebGL/3D-led)
- **Award.** SOTD Jan 21 2026 (Dev Award 7.65: animations 8.6, accessibility 6.6); Site of the Month Jan 2026; Webby 2026 Technical Achievement, Webby and People's Voice.
- **First viewport.** A drivable 3D world with no HTML text. In software rendering I got only a grid floor, then a glowing start ring; after clicking, two small HTML buttons (menu, map pin) appeared and the scene stayed dark (`award15-bruno-simon-load.jpg`, `-late.jpg`).
- **Type and palette.** Canvas UI in Amatic SC and Nunito (prior measurement); no palette listed.
- **Motion (from the [author's case study](https://www.awwwards.com/brunos-portfolio-case-study.html)).** Interface rebuilt as 3D models with "clicks, scroll, keyboard input, and touch gestures" and gamepad support; three commissioned tracks, spatial sound, one UI click sound varied by playback rate. Instancing, frustum culling, ETC1S/UASTC textures, DRACO meshes; mobile drops blur, depth of field and shadow resolution.
- **Specificity.** Leaderboards, achievements, moderated visitor "whispers": the site is his teaching subject.
- **Navigation.** Projects are places you drive to; no one-click path.
- **Weight.** 7.4 MB and 0 readable DOM characters at 10 s (prior study); no reduced-motion handling found.
- **Adopt:** one commissioned, owned element (his music) that no template has. **Avoid:** canvas-only content; a recruiter gets nothing to read.

### 2. Antoine Wodniack (typography and generative)
- **Award.** SOTD Dec 12 2024 (accessibility 6.2, animations 8.4), Portfolio Honors Nov 2024, FWA of the Day Nov 16 2024, Webby 2025 Best Home Page winner.
- **First viewport.** Ruled grid on #f40c3f: header cells (logo, About/Work/Contact, theme toggle, "Coding globally from France. Available for freelance work → Hire me", a QR code), a black generative line field reacting to the cursor, and "CREATIVE ✦ DEVELOPER" at 225 px between two binary tickers (`-hero.jpg`).
- **Type.** Bigger Display 700 (225 px), Editorial New 200 for body, Fraktion Mono for labels: display, serif and mono; ratio about 7× to the 32 px median. The h1 is split into single letters.
- **Palette.** Two (#f40c3f, #160000).
- **Motion.** Logo-bar loader on red to about 6 s, then the line field draws in (`-load.jpg`). Scrolling leads into a pseudo-3D grid tunnel with "WORK" in an arch and a 3D field of giant letters (`-deep.jpg`). Clicking "Work" starts a long smooth scroll after about 1.3 s that passes through the About copy ("I started with Dreamweaver, played with Flash and ActionScript...") (`-transition.jpg`). Top curves: cubic-bezier(0.86,0,0.07,1) ×9, expo.inOut ×9, (0.23,1,0.32,1) ×7; common durations 0.75 to 1.5 s.
- **Specificity.** The line field comes from his pen-plotter practice; old CSSDA awards sit in the tunnel.
- **Navigation.** Single page, anchors; work links go out.
- **Weight.** Lightest here: 0.5 MB, 20 requests. No `prefers-reduced-motion` in shipped code, confirmed by the paired run. Open-sourced ([repo](https://github.com/AntoineW/AW-2025-Portfolio)).
- **Adopt:** a ruled, cell-based header that holds status, location and contact at once. **Avoid:** split-letter headings that screen readers may spell out.

### 3. Gianluca Gradogna (editorial and photography)
- **Award.** SOTD Jan 23 2025 (accessibility 6.8), Portfolio Honors Jan 2025; built with Norman Gabriel.
- **First viewport.** Split screen: left, a white card ("Gianluca Gradogna / Based in Italy / Multidisciplinary Designer / Crafting Narrative Through Design. {1*}") over a black-and-white portrait; right, "THROUGH THIS LENS" in a serif with his photo set between the words, captioned "Bali, Jatiluwih Rice Fields" (`-hero.jpg`).
- **Type.** Neue Montreal for almost everything, LZ serif for the photo chapter; "01" project numerals at 152 px against a 12 px median.
- **Palette.** Two (#0D0D0D, #FFFFFF); colour comes from photographs.
- **Motion.** A bottom-left counter 0 to 100 that took about 12 s here (`-load.jpg`). Scroll is an infinite loop of project panels with a numbered index (N.01 to N.06) and a giant counter (`-deep.jpg`). "View More" raises a dark overlay from the bottom at about 1.0 to 1.3 s and the copy lines rise in by 1.9 s (`-transition.jpg`). Top curves: easeInOutSine (0.445,0.05,0.55,0.95) ×24, expo.inOut ×14; durations 0.5 to 1.2 s. The [case study](https://tympanus.net/codrops/2025/01/30/case-study-gianluca-gradogna-portfolio-25/) says the vocabulary is "Position, Opacity, and Clip Masks", prototyped in After Effects.
- **Specificity.** His own travel photography is a whole chapter.
- **Navigation.** One click from the index to a project overlay.
- **Weight.** 11.2 MB, 206 requests; no reduced-motion code.
- **Adopt:** a numbered project index that doubles as navigation. **Avoid:** a counter that holds the page for seconds.

### 4. Olha Lazarieva ◆ (UX/UI designer; type plus 3D)
- **Award.** SOTD Oct 2 2025 (accessibility 7.0), Portfolio Honors Sep 2025; developed by Max Milkin.
- **First viewport.** After load: "CREATIVE DESIGNER" in condensed type at 225 px across the page, a black-and-white portrait card, "/ART DIRECTION /WEB DESIGN (UX/UI) /WEB DEVELOPMENT", letter-spaced "BASED IN UKRAINE", a mono statement, "RECENT WORK ↘ MAX MILKIN" and "AVAILABLE FOR COLLABORATION" with her email (`-hero.jpg`).
- **Type.** Sofia Sans Condensed 700 plus Spline Sans Mono 300; the mono carries most words (654 characters against 142).
- **Palette.** Two (#101010, #F7F7F7).
- **Motion.** The 3D text-sphere loader did not render in software: 12 s of blank #F7F7F7 (`-load.jpg`). The authors' [write-up](https://tympanus.net/codrops/2025/12/02/two-portfolios-one-process-where-design-motion-and-code-come-together/) describes loader tweens on power4.out over 2 to 2.5 s and a camera that "interpolates toward the target rotation". On scroll a bracketed nav "[ ABOUT ME ] [ WORKS ] [ SERVICES ] [ CONNECT ]" fades in within 240 ms (`-scroll.jpg`). Custom cubic-bezier(0.11,0.82,0.39,0.92) ×17; CSS transitions mostly 0.8 s (52 uses).
- **Specificity.** "My philosophy" and "My lifestyle" blocks with her own photographs; a chessboard black-and-white language.
- **Navigation.** "View case" reaches a case page in one click; awards counted by body.
- **Weight.** 5.8 MB; one reduced-motion reference; the h1 is the loader's digit roller, and nav links read "A B O U T M E".
- **Adopt:** role list plus location plus availability in the first screen. **Avoid:** making the h1 a loader.

### 5. Elliott Mangham (interaction detail, dossier)
- **Award.** SOTD Dec 2 2025 (WPO 8.2, accessibility 7.0), Portfolio Honors Nov 2025.
- **First viewport.** Five mono columns: Intro (avatar, "England: LON [03 45]" live clock), Position (rates "Dev: ~£25-60K"), Recognition, Brands, Connect ("Available September 2026", "Book 30-Min Discovery Call"). Below, a 30 px statement and a Projects/Awards toggle over a thumbnail carousel (`-hero.jpg`).
- **Type.** Roobert Mono 400 for the dossier, Neue Montreal 500 for the statement; small scale (median 11 px, largest 30 px).
- **Palette.** Two (#121212, #fff) with one violet accent.
- **Motion.** A loader of percentage ticks along a hairline until about 6 s (`-load.jpg`). Scroll reveals the statement word by word (`-scroll.jpg`). Hovering a card attaches a large preview window and a violet project label to the cursor; the preview is a scrolling video walkthrough with "VIEW SITE ↗" and "RETURN KEY [ENTER]" hints (`-transition.jpg`, `-project.jpg`). Top curve easeOutSine (0.39,0.575,0.565,1) ×16, expo.out ×14; 0.3 s is the most common duration (32 uses).
- **Specificity.** Client revenue totals, "I'm rooted in England, close to the legendary home of Robin Hood", "I ride a Triumph" (`-mobile.jpg`).
- **Navigation.** Everything on one screen; contact in the first view.
- **Weight.** 1.2 MB, 27 requests. With reduced motion the loader is skipped and all copy shows by 3 s (paired run).
- **Adopt:** the dossier header, the model for a researcher's scannable first screen. **Avoid:** 11 px mono as the main reading size.

### 6. Pacôme Pertant (WebGL-led, sound)
- **Award.** SOTD Jun 9 2026 (animations 8.6), Portfolio Honors May 2026; built by Louis Bocquet and Colin Demouge.
- **First viewport.** A gate: a glossy green smiley logo, "motion & sound designer based in paris", "enter with sound" and a small "enter without sound" (`-gate.jpg`).
- **Type.** One sans (Indivisible Variable in the first run); no name set in type anywhere in view.
- **Palette.** Two (#0a0a0a, #fafafa); project covers bring saturated colour.
- **Motion.** Entering fades a spiral of bent WebGL cards in between 900 and 1,200 ms, with a "spiral • list" toggle, a "menu" pill, a rotating "showreel • 2025" badge and a sound button (`-enter.jpg`). The wheel rotates the spiral slowly (`-scroll.jpg`). Hover attaches a project pill ("Thought", "Digital Travel") to the cursor; clicking disperses the cards within about 400 ms before the route loads (`-transition.jpg`).
- **Specificity.** Sound is his discipline, so sound is the entry choice.
- **Navigation.** Two clicks to a project (gate, then card); list view exists for scanning.
- **Weight.** Not reliably measured (bot check; in two runs the whole UI rendered at giant scale). No reduced-motion code.
- **Adopt:** a spiral/list toggle, which lets a scanner switch to a list. **Avoid:** a gate before any text.

### 7. Léo Parpeix ◆ (WebGL character)
- **Award.** SOTD Sep 14 2026 (animations 8.4, accessibility 7.0), FWA of the Day Sep 28 2026; developed with Thoma Lecornu.
- **First viewport.** In software, white with "Léo Parpeix / Art director, Interactive designer / Work About Playground" and "Driven by detail. Obsessed with seamless motion." (`-scroll.jpg`); the sculpted daisy did not render.
- **Type.** Two self-hosted faces named "title" and "text"; section words ("FRENCH", "INTERACTIVE") at 162 px against 14 px.
- **Palette.** Not listed; captured text is deep green rgb(2,32,22) on white.
- **Motion.** A yellow pill beside the cursor asks visitors to click to enable sound (Howler, 103 references). Projects sit in a table with year, team and role ("Art Director, UI & Interactive Designer") (`-deep.jpg`). About swaps the statement in place (`-project.jpg`). One curve dominates: cubic-bezier(0.16,1,0.1,1) ×43; durations 0.65 to 0.75 s.
- **Specificity.** Per [FWA](https://thefwa.com/cases/leo-parpeix-portfolio-2026-p3): visitors should "understand my skill set in under 10 seconds", and the "moustache daisy" is "a symbol that reflects both my personality and my creative approach".
- **Navigation.** Projects link out; no internal case studies.
- **Weight.** 20.7 MB; no reduced-motion code; blank on the phone profile at 9 s (`-mobile.jpg`).
- **Adopt:** a stated time goal (skill set in 10 seconds) as a design requirement. **Avoid:** a 20 MB scene between the goal and the reader.

### 8. Jesper Landberg (WebGL carousel)
- **Award.** SOTD Sep 29 2026, Dev Award 8.17 (animations 9.0, WPO 8.6, accessibility 7.0).
- **First viewport.** Curved video panels on a WebGL grid floor, corners labelled "JESPER LANDBERG", "PROFILE", "FEATURED / FULL", "NEWSLETTER" (`-hero.jpg`).
- **Type.** One variable sans, 13 to 27 px; the work is the display.
- **Palette.** Two (#000, #fff).
- **Motion.** Dot then three dashes, scene at about 8 s (`-load.jpg`). The wheel turns the carousel (`-scroll.jpg`). "FULL" swaps to a centred text index of every project in about 2.2 s. Clicking a panel recentres the carousel, then opens a white rounded sheet with title, description, "UNSEEN · 2024", a trophy and a close button (`-transition.jpg`, `-project.jpg`). Curves: power1.out ×21, expo, (0.23,1,0.32,1); durations 0.3 to 0.6 s.
- **Specificity.** Describes himself in the meta tags as "Two-time Awwwards Independent of the Year (2022 & 2024)".
- **Navigation.** One click to a project; a full text index one click away.
- **Accessibility.** The only canvas site here with a parallel semantic layer: an h1, a linked project list, contact, and an `llms.txt` "what this site is" file. Weight 8.0 to 12.4 MB; no reduced-motion code.
- **Adopt:** a hidden-but-real HTML layer and a text index behind any canvas. **Avoid:** four tiny corner labels as the only navigation.

### 9. Grégory Lallé (typography)
- **Award.** SOTD Oct 30 2024 (accessibility 6.6), Portfolio Honors Oct 2024; designed with Thomas Monavon.
- **First viewport.** "Works," at 132 px top-left with "About, Contact" beside it, a centred list of ten project names (active one marked ◀), scattered screenshots, a large "01" and the name small at the bottom (`-hero.jpg`, kicked).
- **Type.** One custom grotesk, "NG" 600; scale does all the work. Commas turn the nav into a sentence.
- **Palette.** One (#111111) on white.
- **Motion.** Counter from "0"; it stalled at 75 without video codecs, then reached 99 and revealed at about 12 s once kicked (`-load.jpg`). Scrolling moves screenshots past a sticky index whose marker and section number advance (`-scroll.jpg`). Clicking an index name smooth-scrolls to that project in about 1 s (`-transition.jpg`). Durations cluster at 1 and 1.2 s. The [Codrops write-up](https://tympanus.net/codrops/2025/02/25/from-concept-to-code-inside-the-creative-process-of-thomas-monavon-gregory-lalle/) describes a deliberately simpler build: no WebGL, no unnecessary animation.
- **Navigation.** Every project is one click from the home index.
- **Weight.** 7.1 MB; 15 videos on the page, which the loader appears to wait on; no reduced-motion code; the phone view sat on "75" (`-mobile.jpg`).
- **Adopt:** a sticky list index that is also a progress indicator. **Avoid:** a loader tied to video buffering.

### 10. Gil Huybrecht ◆ (WebGL gallery, information architecture)
- **Award.** SOTD Sep 21 2026 (animations 8.4, accessibility 7.4); developed by Jesper Landberg.
- **First viewport.** One text row: "Gil Huybrecht", "Available September 2026", Services (Information Architecture, Web Design & Art Direction, Interaction design), Recognition (Awwwards SOTD 15×, FWA 13×, Webby 3×...), "Profile", "Email me". Below, a grid of numbered screenshots per project, with "Grid / Gallery" and "Normal / Star Wars" toggles in the bottom corners (`-hero.jpg`).
- **Type.** One sans at 16 px for everything.
- **Palette.** Two (#0D0D0F, #FFFFFF).
- **Motion.** Percent loader 0% to 99% over about 11 s (`-load.jpg`). Tiles dim while scrolling and brighten as they settle (`-scroll.jpg`). Clicking a tile flies the project's screenshots out in 3D; the first scales into a right-hand hero and a numbered meta list (Dev, Client, Agency, Year) fades in by about 1.6 s (`-transition.jpg`, `-project.jpg`). A text page title rises line by line. Top curve easeOutExpo (0.19,1,0.22,1) ×13.
- **Specificity.** The recognition list and a joke "Star Wars" view.
- **Navigation.** One click to a project; profile and email always in the top row.
- **Weight.** 24.7 to 27.5 MB, 181 requests; one reduced-motion reference.
- **Adopt:** the single top row of facts (availability, services, recognition, contact). **Avoid:** 25 MB before the grid appears.

### 11. Cyd Stumpel ◆ (CSS-first interaction)
- **Award.** SOTD Mar 9 2025, Dev Award 7.74 with 7.8 in every sub-score including accessibility.
- **First viewport.** "CYD STUMPEL" as a red condensed marquee at 201 px, a sticker box, email, "Available October 2026", nav; a cut-out video of her speaking over a red disc; a rotating role in serif ("Freelance Developer", "Creative Engineer", "Conference Speaker", "Parttime Lecturer"); stickers "AWARD WINNING DEVELOPER", "MOTION WEB DESIGN", "ACCESSIBILITY" (`-hero.jpg`).
- **Type.** Bueno (condensed display), Instrument Serif, Geist: display, serif, sans.
- **Palette.** Two listed (#8082F8, #FFF5EE); the live site uses red rgb(217,83,63) on seashell.
- **Motion.** Fade-in at about 6 s (`-load.jpg`). Scroll compresses the name band into a sticky header while the role word swaps through a mask (`-scroll.jpg`). Route changes use native View Transitions through Swup (128 references) and CSS scroll-driven animations (54) with GSAP fallbacks; each page gets its own band ("TECH SPEAKER" on Speaking) (`-project.jpg`). CSS durations 0.2 to 0.4 s.
- **Specificity.** Footer: "Work days Tuesday to Friday, Teaching Monday", next speaking event.
- **Navigation.** Five plain links; selected work one scroll down.
- **Accessibility.** The only skip link here; 64 `prefers-reduced-motion` references, and in the paired run her content appeared at 2.5 s with reduced motion. Her [blog post](https://cydstumpel.nl/css-scroll-driven-animations-for-creative-developers/) shows the pattern: animations sit inside `@media (prefers-reduced-motion: no-preference)` and `@supports`. 3.6 MB.
- **Adopt:** motion as progressive enhancement in CSS, gated by reduced motion. **Avoid:** four equal stickers competing with the headline.

### 12. Dennis Snellenberg (portrait and marquee)
- **Award.** SOTD Apr 4 2022 (animations 8.0, accessibility 6.8).
- **First viewport.** His photo on flat grey, his name at 216 px, joined by long dashes, scrolling as a marquee across the bottom, "Located in the Netherlands" globe pill, "Freelance Designer & Developer", Work/About/Contact (`-load.jpg`).
- **Type.** One custom face, "Dennis Sans" 450; ratio about 6.5×.
- **Palette.** Two (#1C1D20, #455CE9).
- **Motion.** A loader cycles greetings in several languages ("Hello", "स्वागत हे"), then a curtain reveals the portrait at about 6 s. The marquee runs continuously, and scroll parallax lifts it (`-scroll.jpg`). Hovering a project row floats a preview with a blue "View" circle on the cursor; clicking raises a dark curtain with a curved top edge between 0.6 and 1.0 s, holds "• FABRIC™" on black, then lands on a page with Role/Services, Credits, Location & year and a round "Live site" button (`-transition.jpg`, `-project.jpg`). Built on GSAP 3.9, Barba and Locomotive; top curves (0.34,1,0.64,1) ×9 and Power4.easeInOut.
- **Navigation.** One click to a project; phone number and email in the footer.
- **Weight.** 0.75 MB, 23 requests; no reduced-motion code.
- **Adopt:** the curtain plus project-name interstitial, which tells you where you are going. **Avoid:** copying the layout; it is one of the most imitated portfolios on the web.

### 13. Niccolò Miranda (editorial, print)
- **Award.** SOTD Nov 18 2021 (design 8.17, creativity 8.37), Site of the Month Nov 2021.
- **First viewport.** "The Paper Portfolio" masthead on textured paper, "ALL WORK! A Featured selection the latest work of the last years." between two project teasers, then "MIRANDA" at 533 px in black (`-hero.jpg`).
- **Type.** Canopee (display), Editorial New 300 (body), Domaine Display; about 31× from largest to median, the highest contrast here.
- **Palette.** Two on the award page (#000, #987654).
- **Motion.** The newspaper slides up small, tilts and zooms like a paper tossed onto a table, then settles at about 10 s (`-load.jpg`). Scroll reads like columns: illustrated self-portrait, "DIGITAL ART DIRECTOR / INTERACTIVE DESIGNER / CREATIVE DEVELOPER / BASED IN AMSTERDAM, NL.", "WEBSITE", a stamp (`-deep.jpg`). Clicking a project tears the page upward with a WebGL torn-paper edge to reveal the project image (`-transition.jpg`, `-project.jpg`). The [Site of the Month article](https://www.awwwards.com/niccolo-miranda-paperfolio-wins-sotm-november-2021.html) credits Webflow, GSAP, Locomotive, a newspaper grid vocabulary (masthead, byline, crosshead) and a Daily Prophet inspiration.
- **Navigation.** One click to a project; "Email Me" in the footer.
- **Weight.** 2.3 MB; two reduced-motion references.
- **Adopt:** a medium metaphor applied all the way down to the grid vocabulary. **Avoid:** a 10 s intro on every visit.

### 14. Aristide Benoist (WebGL detail, no libraries)
- **Award.** SOTD Jun 24 2021 (animations 9.2, the highest here; accessibility 7.6), Site of the Month Jun 2021; design by Jon Way.
- **First viewport.** Near-black, a condensed "ARISTIDE" wordmark top-left, a ruler of tick marks at the top (one per project), a strip of grayscale image slices entering from the right, "INDEPENDENT DEVELOPER / AVAILABLE APR. 2023", and Email/Instagram/Twitter (`-hero.jpg`).
- **Type.** Timmons ("TNY") display in tribute to Matt Willey, plus a small grotesk; body at 11 px.
- **Palette.** Two (#000, #ffffff).
- **Motion.** Hovering brightens one slice; clicking slides the strip, expands that slice into a full image, turns the background light grey, sets split giant letters ("J M M") around it and fades in a meta table by about 1.9 s (`-transition.jpg`). Per the [Site of the Month article](https://www.awwwards.com/aristide-benoist-portfolio-2021-wins-site-of-the-month-june-2021.html): "no libraries and frameworks", 67 KB of JavaScript, and "a click navigation, augmented with keyboard commands" instead of scroll-jacking. Curves: easeOutQuad (0.25,0.46,0.45,0.94) ×8.
- **Navigation.** One click per project; about 30 projects on one ruler.
- **Weight.** 3.9 MB, 38 requests; no reduced-motion code; the phone view shows a reduced version.
- **Adopt:** the ruler, showing how many items exist and where you are. **Avoid:** a stale availability line ("Apr. 2023") that undercuts every other detail.

### 15. Robin Noguier ◆ (interactive designer, case-study-led)
- **Award.** SOTD Oct 27 2020 (content 8.25; WPO and accessibility 6.33); built with Lorenzo Cadamuro.
- **First viewport.** One project per screen on steel blue: "Fun" in a serif display at 135 px, "Designing a new video-only dating app with Brian Norgard (ex-CPO-Tinder) and Farb Nivi.", "OPEN CASE STUDY →", a bent WebGL image plane and a dot pager (`-hero.jpg`).
- **Type.** Eksell (serif display) and Silka (sans).
- **Palette.** Three (#000, #2779a7, #49c5b6).
- **Motion.** The name fades up, then a chat bubble reads "Only one more designer left!!! Reach out before it's too late !!! #darkpatterns" (`-load.jpg`). Clicking "Open case study" flattens the plane, wipes a pale panel in from the left, moves the title left in black and centres the image, about 1.9 s in all (`-transition.jpg`, `-project.jpg`).
- **Specificity.** The dark-pattern joke is a UX designer's joke; every slide names collaborators.
- **Navigation.** One click to a deep case study; About top-right.
- **Weight.** 6.7 MB; no reduced-motion code.
- **Adopt:** one project per screen with a one-line outcome and a single "Open case study" action. **Avoid:** hiding the project list behind a pager with no index.

## Patterns across the 15

1. **An intro gates first paint on 14 of 15.** Five use a counter or percentage loader (Gradogna, Lallé, Huybrecht, Mangham, Lazarieva); the others use a name reveal, greeting cycle, logo animation, paper toss or sound gate. Only Cyd's is a plain fade. In my default captures, 14 of 15 showed no readable bio or project text at the 4 s mark (Noguier's name and role were the exception), and six were still blank or loading at 10 s (Bruno, Gradogna, Lazarieva, Huybrecht, and Lallé and Pertant for capture-specific reasons). Software rendering inflates all of this, but the ordering holds.
2. **Two colours.** Of the 13 award pages that list a palette, 11 list exactly two, Lallé lists one and Noguier three. Imagery supplies all other colour.
3. **Scale contrast carries the type, not the number of faces.** Ten of 15 pair a display face with a text face, and three add a mono annotation voice (Wodniack, Lazarieva, Mangham). Five run a single family (Snellenberg, Lallé, Landberg, Huybrecht, Pertant). On 10 of the 13 measured sites the largest text is at least 6× the median size (Miranda about 31×).
4. **The name is rarely the hero.** It is the largest text on only 3 of 15 (Snellenberg, Cyd, Miranda). Four set a role or section word huge instead ("CREATIVE DEVELOPER", "CREATIVE DESIGNER", "Works,", "FRENCH"). On seven the name is small (about 12 to 40 px) or absent (Pertant) and the work fills the screen; Bruno's lives in the 3D world.
5. **Smooth scroll is standard.** 10 of 15 use Lenis (7), Locomotive (2) or a custom smoother (Gradogna). Scroll-linked effects are sticky indexes, masked word reveals and parallax, not scroll-jacked scenes; Aristide rejects scroll-jacking outright.
6. **Ease-out dominates; in-out marks whole-view changes.** Of the 13 sites with readable source, the most frequent curve is an ease-out on 9, and an expo-style long tail is in the top three on 7: (0.19,1,0.22,1) on Huybrecht, (0.16,1,0.1,1) ×43 on Parpeix, (0.23,1,0.32,1) on Wodniack and Landberg, `expo.out` on Mangham, Lallé and Cyd. The three whose top curve is symmetric in-out (Wodniack's (0.86,0,0.07,1), Gradogna's easeInOutSine, Miranda's (0.785,0.135,0.15,0.86)) are the ones built around big intros and page-wide transitions. The commonest tween lengths are 0.3 to 1.2 s; observed page transitions finish in 1.0 to 2.0 s.
7. **The clicked thing becomes the next page.** 10 of 15 animate the move from home to a project view (Gradogna, Mangham, Pertant, Landberg, Huybrecht, Cyd, Snellenberg, Miranda, Aristide, Noguier). On four, the clicked image is carried into the detail view (Aristide's slice, Noguier's plane, Huybrecht's tiles, Landberg's panel). Three use a cover: Snellenberg's curved curtain with a project-name interstitial, Gradogna's rising overlay, Miranda's torn paper. Cyd gets the same effect with native View Transitions and no WebGL.
8. **Cursor-attached labels replace hover states.** Four attach a label or preview to the cursor (Mangham's preview window, Snellenberg's "View" circle, Pertant's project pill, Parpeix's sound prompt). Three use sound (Bruno, Pertant, Parpeix); Pertant and Parpeix make it opt-in.
9. **A full-screen canvas on 10 of 15, semantic fallback on one.** WebGL is confirmed on 9 and Three.js detected or credited on 8. Only Landberg ships a real HTML layer for the canvas (h1, project list, contact, `llms.txt`); Bruno exposes none.
10. **Reduced motion is rare.** Five of 15 mention `prefers-reduced-motion` in shipped code; only Mangham and Cyd visibly changed first paint in paired runs. Cyd is also the only one with a skip link, and her Dev Award accessibility score (7.8) is the highest here, against 6.2 to 7.6 for the rest.
11. **True, dated specifics.** Six state availability (Mangham and Huybrecht "September 2026", Cyd "October 2026" plus her work days; Wodniack and Lazarieva generically; Aristide's "Apr. 2023" is stale). Seven show recognition on the home page. Eight credit a second collaborator on the award page, so a designer and developer pair is normal at this level.
12. **Weight splits the set.** Eight of 15 exceed 5 MB in the first 12 s (up to 27.5 MB for Huybrecht). The three lightest (Wodniack 0.5 MB, Snellenberg 0.75 MB, Mangham 1.2 MB) still carry full award-level motion (a generative line field, curtain transitions, cursor-attached previews), so heavy payloads are a choice, not a requirement.

### What this means for Kaushik's site
- Put a Mangham- or Huybrecht-style fact row in the first HTML paint (name, "Senior Quantitative UX Researcher, JPMorganChase, New York", availability, a resume link, email), and let motion decorate it, never gate it.
- Use one signature transition on the case-study click (carry the clicked figure into the case page, as Aristide, Huybrecht and Noguier do), one expo-style ease-out for entrances, and one in-out curve for that transition.
- Build it as progressive enhancement in Cyd's manner: CSS View Transitions and scroll-driven animation inside `prefers-reduced-motion: no-preference`, a skip link, and a Landberg-style text index behind any canvas.
- Keep the first 12 s under about 1.5 MB, like Wodniack, Snellenberg and Mangham.
