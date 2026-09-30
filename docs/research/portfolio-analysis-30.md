# Thirty portfolios, fifteen and fifteen: what they teach this site

Date: September 30, 2026. This synthesis combines two analyses written for this project:

- [uxr-15-analysis.md](uxr-15-analysis.md): 15 reputable UX research portfolios. The evidence behind each person is a publisher, peer-reviewed or government page, a third-party profile, or at least a named industry roundup.
- [award-15-analysis.md](award-15-analysis.md): 15 award-winning personal portfolios (Awwwards Site of the Day or Month, FWA, Webby), 11 of them from 2024 to 2026.

Each claim below points back to those files, which cite their sources. Screenshots are in `docs/research/captures/`. That folder is not committed.

## The one-paragraph answer

The research portfolios earn trust and the award sites earn attention, and almost nobody does both.

The research portfolios lead with identity and evidence. They show minimal motion, and none of the three that animate respects reduced motion. None publishes a quantitative case with sample, estimate, uncertainty and decision.

The award sites lead with an arrival sequence and one signature transition, and run on a two-colour palette with extreme type contrast. Most are heavy, and only two of the 15 visibly change what loads first when reduced motion is on.

The opening is a site that does both. It needs:
- award-level authored motion that carries meaning;
- a recruiter-legible first paint;
- honest, labelled evidence;
- an accessibility floor that the award set mostly lacks.

## What the thirty agree on, and what this site does about it

| Finding | Where it comes from | What the site does |
|---|---|---|
| Title and employer in the first sentence. All three quant researchers at large platforms do this; the best-known names rely on recognition instead. | UXR pattern 2 (7 of 15) | The hero line reads "Senior Quantitative UX Researcher, JPMorganChase, New York". It now appears within a third of a second, while the arrival sequence continues behind it. |
| Motion decorates first paint and never gates it. An intro gates first paint on 14 of 15 award sites; the recommendation is to do the opposite. | Award pattern 1, and the award analysis's closing recommendations | The name forms from the world map, but the identity text, the actions and the navigation are real HTML from the start. Scrolling during the arrival skips it. It never replays within a visit. |
| One signature transition: the clicked thing becomes the next page. | Award pattern 7 (10 of 15) | Opening a Case grows the clicked row's outline into the Case page while the title flies into place. It uses native cross-document View Transitions, as Cyd Stumpel does, with no WebGL. |
| An ease-out for entrances and a symmetric in-out for whole-view changes. | Award pattern 6 (9 of 13 readable) | There are two named curves: "out" (0.16, 1, 0.3, 1) and "scene" (0.86, 0, 0.07, 1). "scene" is exactly the curve Wodniack uses. |
| Two colours, with type scale carrying the hierarchy. | Award patterns 2 and 3 | Paper and ink, plus one annotation blue reserved for what is observed or live. One grotesk at extreme scale contrast, and a mono voice only for data. |
| A full-screen canvas on 10 of 15, but a real HTML layer behind it on only one. | Award pattern 9 | The Field is one WebGL2 canvas that draws the world, the name, the flights and the visit portrait. Every word it depicts is also real, selectable HTML, and the canvas is `aria-hidden`. |
| Smooth scroll is standard. Scroll-linked effects work; scroll-jacking is rejected. | Award pattern 5 (10 of 15) | Lenis inertial scrolling. The scenes (Prologue, Time Shifts, Case figures) are CSS `position: sticky` runways driven by scroll progress. Scroll speed and direction stay the reader's. |
| Cursor-attached labels. | Award pattern 8 (4 of 15) | The cursor tag shows the observation tag of whatever is under the pointer. "Show tracking" outlines every tracked element and flags any untracked control as a coverage gap. That is the Data Instrumentation case applied to the site itself. |
| Reduced motion is rare in both sets: no animated research portfolio and only 2 of 15 award sites honour it. | UXR pattern 8, award pattern 10 | Under reduced motion the Field never loads, scenes become static bands, View Transitions are off and reels land on their final digits. Checked in paired captures. |
| Heavy payloads are a choice. The lightest award sites stay under 1.5 MB with full motion. | Award pattern 12 | Home ships about 74 KB of gzipped JavaScript and 41 KB of map data, plus self-hosted fonts. The whole build is 1.6 MB across all pages. |
| A summary block first, and n for every study. | UXR pattern 3 (3 of 4 public cases) | Every Case opens with its question, Contribution, timeline, methods with sample sizes, and an Outcome with its type. |
| Almost nobody labels outcomes as measured, modeled or recommended. | UXR pattern 4 (0 of 15 consistently) | Every Case states an Outcome type ("Recommendations", "Recommendation, implementation reported"). Each ends with what the evidence shows and what it cannot show. |
| Say what is public and what is internal. | UXR, Rodden | Each figure says what it is: "Illustration of the idea, not the internal dashboard." |
| Portraits are common (9 of 15) but not required: three of the four book authors show none. | UXR pattern 7 | No portrait, by the owner's decision. The site's closing image is a portrait of the visitor's time instead. |
| Unfinished edges appear even on reputable sites. | UXR pattern 10 | Detector, finish review, keyboard and phone checks run before each milestone. Draft copy is marked Draft until the owner confirms it. |

## Where this site goes further than the thirty

- **Motion that means something.** The dots are observations:
  - they draw the real world with tonight's day and night;
  - they fly the reader along the actual route, with every clock computed live;
  - they end as a count of the reader's own time, with the unit stated.
  None of the 15 award sites ties its signature motion to the author's discipline this directly.
- **The observation layer.** A margin of notes records what the visitor does and what each note cannot tell. It stays on the device. This matches the analysts' finding that the quant researchers show method, not projects (UXR pattern 5): here the method is a working instrument you can inspect.

## What the thirty suggest that only the owner can supply

1. **A quantitative case with sample, estimate, uncertainty and the decision it informed.** None of the 15 research portfolios has one, which makes it the clearest open position (UXR pattern 5). This site does not invent one. When Kaushik can share a sanitized analysis, it belongs in Selected Work, shaped like the existing Cases.
2. **Writing or talks.** Nine of the 15 research portfolios link writing from the home page (UXR pattern 6). A short essay on instrumentation coverage versus quality would extend the lens naturally.
3. **Availability.** Six award sites state availability with a date (award pattern 11). Add it only if Kaushik wants to signal it.
