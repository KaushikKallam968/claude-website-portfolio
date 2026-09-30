# Fifteen reputable UX research portfolios, analysed

Researched September 30, 2026 for Kaushik Kallam's portfolio. This is the UX research half of a 30-site study; a companion analysis covers 15 non-research award winners. It builds on [uxr-portfolio-landscape.md](uxr-portfolio-landscape.md) and reuses its verified facts where they still hold.

**Selection.** Each site is a live personal site of a UX researcher whose reputation is checkable from a source other than a portfolio listicle where possible. Evidence tiers: **A** = book publisher, peer-reviewed record, government, TED or NSF page; **B** = conference, platform, or publication profile written by a third party; **C** = self-stated title at a well-known company, or a named recommendation in [User Interviews' UXR portfolio roundup](https://www.userinterviews.com/blog/ux-research-portfolio-examples-templates). Five are quantitative UX researchers; two more (Kolenda, Ladner) lead or write about mixed methods; the rest are mixed-methods practitioners and research leaders.

**Considered and dropped.** Theo Johnson (only evidence was one listicle; first case locked; captured, then removed). Judd Antin (juddantin.com is now a coaching sales page with no research work). Jan Chipchase (site showed "Site maintenance" on the capture date). Chris Chapman's quantuxblog.com (returned "upstream request failed"). Mario Callegaro (site is a consultancy company page). Harry Morgan and Audra Wingard (no third-party reputation evidence). Kate Towsey (bot wall) and Leisa Reichelt (DNS failure). **Award-winning UXR personal sites: none found**, again (Awwwards searches surfaced only UX/UI designer portfolios), so visual-craft ceilings here are lower than in the companion set.

**Method.** Headless Chromium, desktop 1440x900 and phone 390x844. For every site: desktop first viewport, a mid-page viewport, one case-study (or closest equivalent) page, and a phone first viewport, saved as `docs/research/captures/uxr30-<slug>-{desktop,mid,case,phone}.jpg`. Every capture was viewed before writing. Measured in-browser: font families by character count, largest type size, body contrast, readable-text length at 0.8, 1.5 and 3 s after navigation start, transferred bytes, running animations with and without `prefers-reduced-motion: reduce` emulation, and case word counts. The proxy adds latency, so timings are pessimistic.

## Summary table

Scores are 1 to 5. Clar = clarity for recruiters; Judg = evidence of research judgment; Vis = visual craft; Mot = motion craft; Dist = distinctiveness.

| Site | Person | Reputation evidence (tier) | Clar | Judg | Vis | Mot | Dist |
|---|---|---|---|---|---|---|---|
| [kerryrodden.com](https://kerryrodden.com/) | Kerry Rodden | Co-author, [*Quantitative User Experience Research*](https://quantuxbook.com/); originated the Quant UXR role at Google (A) | 3 | 4 | 4 | 1 | 5 |
| [carljpearson.com](https://carljpearson.com/) | Carl J. Pearson | [Rally AMA: "Staff Quantitative Researcher at Reddit"](https://www.rallyuxr.com/event/carl-pearson-on-minimum-viable-rigor-in-research) (B) | 5 | 4 | 3 | 1 | 3 |
| [randyau.com](https://www.randyau.com/) | Randy Au | [Amplitude interview: Quant UXR at Google](https://amplitude.com/blog/a-conversation-with-quantitative-ux-researcher-randy-au); taught a Quant UX Association class (B) | 2 | 3 | 1 | 1 | 3 |
| [robingomila.com](https://www.robingomila.com/) | Robin Gomila | ["Logistic or linear?"](https://doi.org/10.1037/xge0000920), *J. Exp. Psych.: General*, 427 Crossref citations (A) | 4 | 4 | 2 | 2 | 2 |
| [raboody.github.io](https://raboody.github.io/website/index.html) | Rosie Aboody | [NSF SPRF award 2204171](https://www.nsf.gov/awardsearch/showAward?AWD_ID=2204171), $138,000 (A) | 4 | 4 | 2 | 1 | 3 |
| [colettek.com](https://colettek.com/) | Colette Kolenda | [User Interviews Yearbook](https://www.userinterviews.com/yearbook-profiles/colette-kolenda): UXRConf and UX STRAT 2021 speaker, ex-Spotify research manager (B) | 3 | 3 | 4 | 3 | 3 |
| [gregg.io](https://gregg.io/) | Gregg Bernstein | Author, [*Research Practice*](https://gregg.io/book/) (A) | 3 | 4 | 4 | 2 | 4 |
| [cydharrell.com](https://cydharrell.com/) | Cyd Harrell | [SF Chief Digital Services Officer](https://www.sf.gov/profile/cyd-harrell); author, *A Civic Technologist's Practice Guide* (A) | 4 | 3 | 2 | 1 | 4 |
| [samladner.com](https://www.samladner.com/) | Sam Ladner | Author, [*Practical Ethnography*](https://www.routledge.com/Practical-Ethnography-A-Guide-to-Doing-Ethnography-in-the-Private-Sector/Ladner/p/book/9781611323900) (Routledge) and *Mixed Methods* (A) | 3 | 3 | 4 | 2 | 3 |
| [triciawang.com](https://www.triciawang.com/) | Tricia Wang | [TED speaker](https://www.ted.com/speakers/tricia_wang), "The human insights missing from big data" (A) | 3 | 2 | 3 | 2 | 3 |
| [devinharold.com](https://devinharold.com/) | Devin Harold | [Smashing Magazine author bio](https://www.smashingmagazine.com/author/devin-harold/): Head of Design Research, Capital One; named by User Interviews (B) | 5 | 3 | 4 | 2 | 3 |
| [nathanhedin.com](https://www.nathanhedin.com/) | Nathan Hedin | Self-stated Lead UX Researcher, Microsoft Teams, on site and [LinkedIn](https://www.linkedin.com/in/nathanhedin/) (C) | 4 | 4 | 2 | 1 | 2 |
| [heymia.co](https://www.heymia.co/) | Mia Eltiste | [Named by User Interviews](https://www.userinterviews.com/blog/ux-research-portfolio-examples-templates) for method justification; Lead UXR, Sinclair Digital (C) | 4 | 3 | 3 | 2 | 3 |
| [alexandramnguyen.com](https://www.alexandramnguyen.com/) | Alexandra Nguyen Walters | [Named by User Interviews](https://www.userinterviews.com/blog/ux-research-portfolio-examples-templates); Senior UXR, Nuro/Uber work (C) | 4 | 2 | 2 | 2 | 2 |
| [behzod.com](https://behzod.com/) | Behzod Sirjani | [Reforge profile](https://www.reforge.com/profiles/behzod-sirjani): led research ops at Slack, Senior User Researcher at Facebook (B) | 2 | 2 | 3 | 1 | 4 |

## Site by site

### 1. Kerry Rodden, kerryrodden.com
Captures: `uxr30-kerry-rodden-*`.
1. **First viewport.** Name in Barlow Light at 64 px, the line "Data Visualization Developer, Creative Technologist, Teacher", and her own sequences-sunburst chart cropped as a grey hero band. Below, three work thumbnails. No CTA, no resume link.
2. **Structure.** One long page: Professional Work (6), Personal Projects (6), Background and Experience. The Google quant UXR origin, the book and HEART sit in the last section. Contact is an obfuscated "contact (at) kerryrodden.com".
3. **Type and palette.** One family (Barlow), light weight, tracked uppercase project titles. Grey, black and one link blue; the charts supply all colour.
4. **Motion.** None measured; interactive pieces live on Observable.
5. **Imagery.** 100% authored: every image is a chart she built (sunburst, electoral decision tree, ranked-choice Sankey).
6. **Case anatomy.** Project cards are two-line blurbs with provenance ("Developed at YouTube and widely adopted by other organizations"). The [HEART page](https://kerryrodden.com/heart/) (201 words) is a hub: what, where to learn, CHI 2010 paper, consulting offer. No role/outcome block.
7. **Confidentiality.** Best in set: "The above examples are from professional work that can be shown publicly. I have also completed a range of other projects that are internal," followed by three classes of internal work.
8. **Perf/a11y.** Text present at 0.8 s; 4.9 MB of images; all 14 images have alt text.
9. **Adopt:** a quant hero made from your own chart, plus a public-versus-internal work statement. **Avoid:** hiding the research title in the final section.

### 2. Carl J. Pearson, carljpearson.com
Captures: `uxr30-carl-pearson-*`.
1. **First viewport.** "Hi there! I'm Carl, a quantitative UX researcher." in Source Serif at 40 px beside a cutout portrait; next sentence gives PhD, "staff quantitative UX researcher" at Reddit, ex-Meta, UserTesting, Red Hat.
2. **Structure.** Nav: Home, Blog, LinkedIn, Coaching, Speaking. No résumé or case studies; two inline links go to a journal article and a Drive PDF.
3. **Type and palette.** Source Serif throughout, 18 px body, 740 px measure; off-white with a sage-green "Figures & Frameworks" blog logomark whose F is built from bars.
4. **Motion.** None.
5. **Imagery.** Studio portrait; blog posts use felt-diorama illustrations (provenance not stated).
6. **Case anatomy.** The "case" is an essay, ["Effect sizes in UX research: report the raw results"](https://carljpearson.com/effect-sizes-in-ux-research-report-the-raw-results/): 3,150 words with worked examples, an appendix and footnotes. It shows judgment (raw effects plus intervals over standardized effects) but no project, role or outcome.
7. **Confidentiality.** Avoided by publishing method writing, not project work.
8. **Perf/a11y.** Text by 1.5 s; 1.1 MB; body contrast 13.8:1. On phone the portrait comes first and the headline starts mid-screen.
9. **Adopt:** a one-sentence quant identity with seniority, employer and method range. **Avoid:** zero project evidence; a recruiter cannot see what he shipped.

### 3. Randy Au, randyau.com
Captures: `uxr30-randy-au-*`.
1. **First viewport.** "Randy Au" and a bio that leads with the weekly *Counting Stuff* newsletter ("a new post every Tuesday morning since 2020"). No job title or employer anywhere on the home page.
2. **Structure.** About, Contact Info, Talks & Projects. The [talks page](https://www.randyau.com/projects/) (77 words) lists PyData NYC 2023, NormConf 2022, organizing Data Behind the Scenes 2025, and an April 2025 Quant UX Association class ("25 students").
3. **Type and palette.** Default Jekyll theme: system sans, 16 px, blue links.
4. **Motion.** None.
5. **Imagery.** None.
6. **Case anatomy.** None; "Influential Articles" titles do the work ("Data Cleaning is Analysis", "The data is probably wrong").
7. **Confidentiality.** Not applicable.
8. **Perf/a11y.** 0.5 MB, text at 0.8 s, 18.6:1 contrast.
9. **Adopt:** a true, odd personal detail ("Hobby Highlights: Gem Cutting ... I have a tendency to take hobbies to absurd lengths"). **Avoid:** omitting role and employer.

### 4. Robin Gomila, robingomila.com
Captures: `uxr30-robin-gomila-*`.
1. **First viewport.** Circular portrait with Twitter, LinkedIn, Scholar and GitHub icons; text opens "I am a Quantitative UX Researcher at Meta. Prior to joining Meta, I was Lecturer in Statistical Methods at Princeton University." Links to publications and résumé.
2. **Structure.** One-page Hugo "Academic" theme: About, Publications, Teaching, Resources, Contact.
3. **Type and palette.** Roboto body at 21 px in grey (7.2:1), Montserrat headings, one link blue. Theme defaults.
4. **Motion.** Theme "intro" fade of 300 ms on sections, which still runs under reduced-motion emulation.
5. **Imagery.** Portrait only.
6. **Case anatomy.** Publications replace cases. Each entry carries [pdf] [link to journal] [data | code], mostly to OSF. The [resources page](https://www.robingomila.com/resources) (410 words) curates tools and methods reading.
7. **Confidentiality.** Nothing from Meta is shown.
8. **Perf/a11y.** 0.6 MB; text by 1.5 s; portrait alt is empty.
9. **Adopt:** attach analysis artifacts (code, data or a reproducible notebook) to claims. **Avoid:** an unmodified academic template for a product-industry audience.

### 5. Rosie Aboody, raboody.github.io
Captures: `uxr30-rosie-aboody-*`.
1. **First viewport.** Cyan band, circular outdoor portrait, "Rosie Aboody, PhD" and "Currently, I'm a Senior Quantitative UX Researcher at Instagram. Previously, I won independent NSF funding..."
2. **Structure.** CV (PDF), Publications, Listserv, Resources. Home is three research stories.
3. **Type and palette.** Helvetica only, 24 px body; white, one cyan, teal links.
4. **Motion.** None.
5. **Imagery.** Her own simple diagrams per study (a questioner loop, speech bubbles).
6. **Case anatomy.** Each story ("What's in a question?") is question, study, finding, implication in about 150 words, with press and paper links. Plainest statement of "so what" in the set.
7. **Confidentiality.** Only academic work is shown.
8. **Perf/a11y.** Text at 0.8 s; 0.9 MB. No viewport meta tag, so phones get a 980 px layout that Chrome's text autosizing rescues.
9. **Adopt:** question, finding, implication in plain language with an authored diagram. **Avoid:** no responsive viewport.

### 6. Colette Kolenda, colettek.com
Captures: `uxr30-colette-kolenda-*`.
1. **First viewport.** H1 "Mixed Methods Research Leader" in Newsreader at 68 px, a 12 px tracked rust eyebrow "Driving evidence-based product & business decisions.", one button "Contact Colette", and the top of a large portrait. Her name appears only in the small wordmark; Google is not mentioned until the journey.
2. **Structure.** Numbered one-pager: 01 About, 02 Speaking & Writing (with Patents and Podcasts), 03 Research Journey, Contact. No résumé.
3. **Type and palette.** Newsreader serif display plus Inter; warm beige, near-black, rust accent. Grey body text measures 4.22:1 on the beige, below the 4.5:1 AA minimum.
4. **Motion.** A 700 ms staggered "riseIn" on the H1, eyebrow, button and photo. It still runs under reduced-motion emulation; no reduced-motion rule exists.
5. **Imagery.** Photos of her on stage (UXinsight) beside the talk list: evidence, not decoration.
6. **Case anatomy.** No cases. The [journey](https://colettek.com/#journey) (496 words) is a timeline with concrete scope: "As the 5th researcher hired", "grew the team from 2 to 8 researchers", research that "shaped the 2023 roadmap for 10+ product teams".
7. **Confidentiality.** Scope and team numbers only.
8. **Perf/a11y.** 1.05 MB; text at 0.8 s. On phone, the nav disappears with no menu button.
9. **Adopt:** section numbering plus a scope-numbered career timeline. **Avoid:** name absent from the H1, and no phone navigation.

### 7. Gregg Bernstein, gregg.io
Captures: `uxr30-gregg-bernstein-*`.
1. **First viewport.** "Hello! I'm Gregg." in Zilla Slab, then "I'm a user experience researcher and writer," on a soft amber wash; a hand-drawn squiggle divider between brick, orange and amber bars; then Writing and Notes columns. No employer; the book is one nav click away.
2. **Structure.** Home, Writing, Notes (timestamped microposts syndicated to Bluesky, Mastodon, LinkedIn), Book, About, Contact, search, tag index.
3. **Type and palette.** Zilla Slab plus Inter; brick red (#9A3324), orange, amber, navy footer. A "G" monogram echoes the bars.
4. **Motion.** Hover transitions of 250 to 350 ms only.
5. **Imagery.** Authored motifs (monogram, squiggle), no photos on home.
6. **Case anatomy.** The essay ["Brace for impact"](https://gregg.io/brace-for-impact) (about 850 words) argues research impact "is found in the decisions of others" and recommends colleagues document how research supported their decisions. Direct guidance for outcome labelling.
7. **Confidentiality.** Not applicable.
8. **Perf/a11y.** 0.5 MB; text by 1.5 s; 19:1 contrast.
9. **Adopt:** a small authored mark system (monogram plus divider) that makes a text site feel owned. **Avoid:** no line naming what he is known for (the book) on the home page.

### 8. Cyd Harrell, cydharrell.com
Captures: `uxr30-cyd-harrell-*`.
1. **First viewport.** "CYD HARRELL" in Oswald Light at 130 px, burnt orange; tagline "ux, product, civic tech, haiku"; small headshot; About text naming her Chief Digital Services Officer role and "If I have to pick one thing to call myself I'll say a user researcher."
2. **Structure.** About me, Book, Work (Resume, Favorite Projects x5), Writing, Speaking.
3. **Type and palette.** Oswald plus Alegreya Sans at 20 px in mid-grey (5.2:1); white, orange accent.
4. **Motion.** Hover transitions only.
5. **Imagery.** Headshot and a 2021 to 2022 Twitter haiku widget.
6. **Case anatomy.** [Find My Court 2](https://cydharrell.com/work/favorite-projects/find-my-court-2/) (255 words): observed problem at court help centers, method ("58 superior courts... some 254 courthouses", data returned to courts for correction), outcome as observed adoption (moved to production, named 2.0, dataset shared with Pew). No role block.
7. **Confidentiality.** Public-sector work, shown openly.
8. **Perf/a11y.** 0.5 MB; text at 0.8 s. Unfinished edges: the active nav label is covered by its orange bar, the embedded tweets are from 2022, and an unstyled WordPress comment form sits under About.
9. **Adopt:** outcome stated as what the organization did next. **Avoid:** stale third-party widgets.

### 9. Sam Ladner, samladner.com
Captures: `uxr30-sam-ladner-*`.
1. **First viewport.** Handwritten signature logo, seven nav items, and "Sam Ladner (she/her) is a sociologist, researcher, and student of productivity studying the future of work." in Financier at 68 px over an orange radial glow.
2. **Structure.** Writing, Free videos, Subscribers Homepage, Foresight Book, Newsletter, About. Research roles (first Senior Principal Researcher at Workday) sit in About, mid-page.
3. **Type and palette.** Financier serif plus Inter; white, black, orange glow.
4. **Motion.** Squarespace with global animation type set to none; carousel and header transitions only.
5. **Imagery.** Signature, a greyscale binocular photo on the book page.
6. **Case anatomy.** A publications carousel with "Access" buttons; the [book page](https://www.samladner.com/foresight-book) (180 words) is a chapter map.
7. **Confidentiality.** Not applicable.
8. **Perf/a11y.** 1.6 MB; text by 1.5 s; 2 of 3 images lack alt.
9. **Adopt:** a signature as a genuinely personal mark. **Avoid:** seven nav items, three of them about subscriptions.

### 10. Tricia Wang, triciawang.com
Captures: `uxr30-tricia-wang-*`.
1. **First viewport.** Green "Join my email list" bar, spaced-caps name, full-bleed street portrait, then "I am obsessed with discovering the unknown." and a bio of more than 100 words ("tech ethnographer", "advise C-Suite leaders").
2. **Structure.** Home, About, Updates, Consulting, Speaking, Writing, China, Contact.
3. **Type and palette.** Proxima Nova only; white and grey bands, one green.
4. **Motion.** Squarespace 480 ms content fade; not reduced under emulation.
5. **Imagery.** Professional portraits and TED stage stills.
6. **Case anatomy.** The [Consulting page](https://www.triciawang.com/consulting) is 47 words pointing to her firm's site.
7. **Confidentiality.** Not applicable.
8. **Perf/a11y.** Heaviest home in the set: 5.2 MB, 156 requests, no text at 1.5 s, text at 3 s. The TED card repeats The Conf's blurb word for word; the Instagram grid dates from 2021.
9. **Adopt:** photos of the researcher presenting, as proof of standing. **Avoid:** copy-paste errors and stale feeds.

### 11. Devin Harold, devinharold.com
Captures: `uxr30-devin-harold-*` (plus `-case2`, the first content slide).
1. **First viewport.** Dark page; "A different era of design leadership." in Nohemi at 130 px with "different era" in an orange-to-violet gradient; a line naming him Global Director of SmartOps Product Design at Byte by Yum! Brands; CTAs "Explore my perspective" and "See leadership impact"; nav with LinkedIn, Resume and "Start a conversation".
2. **Structure.** Perspective, Speaking (upcoming World Usability Congress and PUSH UX, sixth year guest lecturing at CMU), Impact, About.
3. **Type and palette.** Nohemi plus Merriweather; near-black with one gradient.
4. **Motion.** Hover transitions of 200 ms and scroll-spy nav highlighting. Inline CSS sets animation and transition to none under `prefers-reduced-motion: reduce`.
5. **Imagery.** Employer logos and a portrait in About.
6. **Case anatomy.** Homepage impact tiles label modeled values: "16 sec removed per order... est. $8.3M annual labor capacity". All five "Read case study" links open different slides of one published Google Slides deck; the first starts at slide 41. [Slide 42](https://docs.google.com/presentation/d/e/2PACX-1vRhFm94yvp6bxOgkO7JqsMKluI2rmaqvkdZoRjCMmQyN-eHIk_z3cVPfnMrEDPmTNu3sjHsiuItwtz1/pub?start=false&loop=false&delayms=5000&slide=id.g3847a8272e1_0_4024) has Role, Time, Activities, Scope, Impacts ("$800k+ in cost savings", "+15% team satisfaction"), unlabeled; slide 44 is a six-stage maturity model.
7. **Confidentiality.** Logos, scope and numbers; no internal screens.
8. **Perf/a11y.** A 52 KB HTML page with local WebP assets; text at 0.8 s. The transparent header overlaps display headings while scrolling.
9. **Adopt:** the "est." label on modeled value. **Avoid:** dropping that label inside the cases, and a gradient headline that reads as template.

### 12. Nathan Hedin, nathanhedin.com
Captures: `uxr30-nathan-hedin-*`.
1. **First viewport.** "NATHAN HEDIN" in Futura, subtitle "Lead UX Researcher | AI | UX Strategist | Mixed Methods", portrait, and a 180-word intro naming Microsoft Teams and Copilot.
2. **Structure.** Portfolio, Resume, Contact; three image tiles (Team Copilot, Meet app, AT&T).
3. **Type and palette.** Futura plus Proxima Nova, grey 15 px body (7.2:1); white.
4. **Motion.** None.
5. **Imagery.** Photo of Satya Nadella announcing Team Copilot at Build 2024; report slides.
6. **Case anatomy.** [Team Copilot](https://www.nathanhedin.com/team-copilot-ai/) (1,600 words) opens with Overview, Key Insights (5), Impact (4), Reflection, then "DETAILS": plan changed when in-code build slipped; three studies with n (12 interviews, 18-person group, 10-person co-design). Impact mixes adoption ("became a reference point across multiple Copilot teams") with a causal credit claim ("enabled Satya Nadella to confidently announce").
7. **Confidentiality.** Inline scoping: "Due to NDA limits with the audience", and "<not shown>" on withheld slides.
8. **Perf/a11y.** 1.4 MB; text by 1.5 s.
9. **Adopt:** summary layer, then detail layer, with n per study. **Avoid:** crediting an executive decision to research without a label.

### 13. Mia Eltiste, heymia.co
Captures: `uxr30-mia-eltiste-*`.
1. **First viewport.** Illustrated avatar logo, "Hi, my name is Mia. I'm a UX Researcher based in NYC." in Poppins at 49 px, "Currently: Lead UX Researcher at Sinclair Digital", "See my work", arch-masked full-length photo.
2. **Structure.** Home, Portfolio, Resume, Learn UX (a public Notion). Home adds client logos, a testimonial carousel, and a three-line philosophy.
3. **Type and palette.** Poppins only; white, dark teal, teal buttons.
4. **Motion.** Testimonial carousel only.
5. **Imagery.** Photo, avatar, and a one-page case poster.
6. **Case anatomy.** The [athenahealth case](https://www.heymia.co/portfolio/athenahealth) (1,380 words) opens with an image poster: Background, Objectives, Outcome, "How I got there", "...and next steps". Notes say it was a master's capstone. Method adapted after round one; 45 unmoderated interviews plus Likert ratings. "Outcome" lists deliverables, not decisions.
7. **Confidentiality.** Not needed (capstone).
8. **Perf/a11y.** 1.8 MB; text by 1.5 s; the summary poster is text in an image; 4 of 12 images lack alt.
9. **Adopt:** a one-screen case summary. **Avoid:** summary as an image, and deliverables presented as outcomes.

### 14. Alexandra Nguyen Walters, alexandramnguyen.com
Captures: `uxr30-alexandra-nguyen-walters-*`.
1. **First viewport.** Name in Marcellus, "Senior User Experience Researcher", a one-line POV ("Obsessed with asking the right questions..."), a "Portfolio Highlights" button, and a carousel of eight logos (Shortcut, Nuro, Crunchbase, Uber, Home Depot, Emory, Children's Healthcare of Atlanta, MARTA).
2. **Structure.** Work, Resume, About, LinkedIn; sticky footer with social icons.
3. **Type and palette.** Marcellus serif; slate-blue bars, lavender buttons.
4. **Motion.** Logo carousel transform of 1,000 ms.
5. **Imagery.** Headshot, logos, darkened stock-style photos (a handshake for Crunchbase).
6. **Case anatomy.** All three cases sit behind a Wix "Guest Area" password. Each card publishes company, study type, and a "How might we" question.
7. **Confidentiality.** Password on everything, legible question outside.
8. **Perf/a11y.** 2.7 MB, 198 requests; text at 0.8 s.
9. **Adopt:** the public research question on a locked card. **Avoid:** locking every case, and stock imagery.

### 15. Behzod Sirjani, behzod.com
Captures: `uxr30-behzod-sirjani-*`.
1. **First viewport.** Black page, "Thanks for stopping by. My name is Behzod (bay'-zod) and this is my little corner of the internet." in Roboto Mono, then prose with magenta underlined links: runs Yet Another Studio ("hired to care"), Reforge Program Partner, past research at Slack and Facebook.
2. **Structure.** Now, Writing, Photography, Organizations as Ecosystems, social icons. No résumé.
3. **Type and palette.** Roboto Mono voice plus Roboto; black, white, magenta.
4. **Motion.** None beyond header transitions.
5. **Imagery.** None on home; photography lives on its own page.
6. **Case anatomy.** [Organizations as Ecosystems](https://behzod.com/oae) (193 words) is a numbered essay index (001 to 005) plus readings.
7. **Confidentiality.** Not applicable.
8. **Perf/a11y.** 1.4 MB; 21:1 contrast. "Venture Parter" typo, and the page ends "Updated August 2022."
9. **Adopt:** a mono voice and pronunciation guide that sound like a person. **Avoid:** a visible last-updated date that is four years old.

## Patterns across the 15

1. **Reputation is rarely carried by case studies.** Only 4/15 publish a public research case (Hedin, Eltiste, Harrell, Harold via slides), and Nguyen Walters locks 3/3. The other 10 substitute publications (Gomila, Aboody, Ladner), essays or newsletters (Pearson, Bernstein, Au, Sirjani), talks (Kolenda, Wang), or built artifacts (Rodden). The four book authors lead with identity, books and writing; only Harrell publishes a case, at 255 words.
2. **Title plus employer in the first viewport: 7/15.** All three quant researchers currently at large platforms (Pearson at Reddit, Gomila at Meta, Aboody at Instagram) do it in their first sentence. The most famous names (Rodden, Bernstein, Ladner, Wang, Au) do not, and rely on recognition a recruiter may not have.
3. **Summary block on cases: 3 of the 4 public cases** (Hedin's Overview/Insights/Impact/Reflection, Eltiste's poster, Harold's Role/Time/Scope/Impacts slide). Measured lengths: 255, 1,380 and 1,600 words for the web cases, which is inside the 800 to 1,600 range from the landscape study except Harrell's.
4. **Outcome labelling is almost absent.** 1/15 marks modeled value ("est." on Harold's home page), and his slides drop it. Elsewhere outcomes are adoption (Harrell), deliverables (Eltiste), or an unlabeled causal credit (Hedin). 0/15 use a measured / modeled / recommended vocabulary.
5. **Quant researchers show method, not projects.** Of 5 quant researchers, 3 expose method artifacts (Gomila's data and code per paper, Rodden's charts and HEART, Pearson's 3,150-word effect-size essay). None shows a quant case with sample, estimate, uncertainty and the decision it informed. Sample sizes appear only in qualitative cases (Hedin: 12, 18, 10; Eltiste: 45).
6. **Writing is the default proof of thinking: 9/15** put a blog, newsletter or writing link in the main nav or home. 6/15 have a Speaking or Talks section.
7. **Portraits: 9/15 show a face in the first desktop viewport, 6/15 do not**, including three of the four book authors (Rodden, Bernstein, Ladner). Two show the researcher presenting (Kolenda, Wang), the only photos that double as evidence.
8. **Motion is minimal and not accessible when present.** 0/15 load a JS animation library. 3/15 run entrance animations (Kolenda 700 ms stagger, Wang 480 ms, Gomila 300 ms), and 0 of those 3 stop under reduced-motion emulation. Harold's CSS has a global reduced-motion override, but his site has no entrance motion for it to stop. 9/15 have no motion beyond hover.
9. **Visual craft comes from custom builds.** Platforms: 5 Squarespace, 2 WordPress, 1 Wix, 1 Hugo Academic, 1 Jekyll, 1 hand-written GitHub Pages, 4 custom. Four of the five sites scored 4 on visual craft are custom (Rodden, Kolenda, Bernstein, Harold); the fifth is a heavily styled Squarespace (Ladner). 5/15 lead with a serif display face; only Sirjani uses a mono voice.
10. **Unfinished edges on reputable sites: 4/15** (Sirjani's typo and 2022 date, Wang's duplicated blurb and 2021 feed, Harrell's 2022 widget and obscured nav label, Harold's header overlap). Kolenda adds a 4.22:1 body-text contrast failure and no phone nav; Aboody has no viewport meta.
11. **Speed is not the problem.** 14/15 show readable text by 1.5 s; only Wang (5.2 MB, 156 requests) waits until 3 s. 8/15 have at least one visible image with empty or missing alt text.

**What this means for Kaushik.** Lead like Pearson (quant identity, seniority, employer, one sentence). Borrow Rodden's authored-chart imagery and public-versus-internal statement, Hedin's summary-then-detail case with n per study, and Harold's "est." label, applied consistently as measured, modeled, recommended. Publish the one thing nobody here does: a quant case with sample, estimate, interval, and the decision it informed. Any motion must pass the reduced-motion test that 3 of 3 animated sites here fail.
