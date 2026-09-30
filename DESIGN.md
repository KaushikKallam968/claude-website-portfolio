---
name: Kaushik Kallam
description: A portfolio that quietly observes how it is being read, on daylight paper, in ink, with one annotation blue.
colors:
  paper: "#ecece8"
  paper-2: "#e3e3de"
  ink: "#111110"
  ink-2: "#4a4a46"
  ink-3: "#656560"
  rule: "rgb(17 17 16 / 0.16)"
  note: "#2c3be0"
  note-soft: "rgb(44 59 224 / 0.1)"
  paper-dark: "#121211"
  paper-2-dark: "#1b1b19"
  ink-dark: "#ecebe6"
  ink-2-dark: "#b5b4ad"
  ink-3-dark: "#85847e"
  rule-dark: "rgb(236 235 230 / 0.16)"
  note-dark: "#8e98ff"
  note-soft-dark: "rgb(142 152 255 / 0.12)"
typography:
  display:
    fontFamily: "Switzer, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(4.2rem, 18.6vw, 23rem)"
    fontWeight: 530
    lineHeight: 0.76
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Switzer, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3.25rem, 12.5cqi, 10rem)"
    fontWeight: 520
    lineHeight: 0.84
    letterSpacing: "-0.04em"
  page-title:
    fontFamily: "Switzer, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.8rem, 8cqi, 6rem)"
    fontWeight: 530
    lineHeight: 0.92
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Switzer, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 1.2rem + 1.2vw, 2.25rem)"
    fontWeight: 520
    lineHeight: 1.08
    letterSpacing: "-0.028em"
  lede:
    fontFamily: "Switzer, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1.05rem + 0.8vw, 1.75rem)"
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Switzer, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.94rem + 0.28vw, 1.1875rem)"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: "'ss01' on"
  label:
    fontFamily: "Switzer, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    letterSpacing: "0.01em"
  data:
    fontFamily: "Fragment Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.01em"
rounded:
  none: "0px"
  focus: "1px"
spacing:
  margin: "clamp(16px, 2.3vw, 36px)"
  gutter: "clamp(12px, 1.5vw, 24px)"
  top-bar: "64px"
  top-bar-phone: "56px"
  rail: "clamp(250px, 22vw, 340px)"
  entry-block: "clamp(26px, 3.4vw, 44px)"
  chapter-top: "clamp(56px, 8vw, 120px)"
components:
  text-link:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
  top-bar:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    height: "64px"
    padding: "0 clamp(16px, 2.3vw, 36px)"
  entry-row:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    padding: "clamp(26px, 3.4vw, 44px) 0"
  notes-panel:
    textColor: "{colors.note}"
    typography: "{typography.label}"
    width: "clamp(250px, 22vw, 340px)"
  notes-ticker:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.note}"
    padding: "7px clamp(16px, 2.3vw, 36px) 8px"
  time-shift:
    textColor: "{colors.note}"
  readout-bar:
    backgroundColor: "{colors.note-soft}"
    textColor: "{colors.note}"
    height: "10px"
  figure-stage:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.ink}"
    padding: "clamp(18px, 2.4vw, 32px)"
    rounded: "{rounded.none}"
  draft-marker:
    textColor: "{colors.ink-2}"
    padding: "0 6px"
    rounded: "{rounded.none}"
  skip-link:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    padding: "10px 14px"
---

# Design System: Kaushik Kallam

## Overview

**Creative North Star: "The Annotated Page"**

The site is a printed page that is taking notes on its reader. Daylight paper and near-black ink carry everything that is authored; a single annotation blue carries everything that is observed or live. The contrast between the two layers is the whole idea: the ink says what Kaushik did, the blue says what the page can see of you right now, and what it cannot tell.

One grotesk does all the talking, used at extreme scale contrast: a name set to the width of the viewport against a calm reading size, with nothing in between that shouts. Structure comes from hairline rules and flush-left columns on a twelve-column grid, never from boxes. Depth is flat. Motion moves things between reading moments and never inside them.

The system rejects the template portfolio: no kicker above the hero, no pill buttons, no cards, no gradients, no glass. Real photography in full colour is the only colour besides the blue.

**Key Characteristics:**
- Two-layer colour: ink for the authored record, blue for observation and live data.
- One variable grotesk (Switzer) at extreme scale contrast; one mono (Fragment Mono) for data only.
- Hairline rules instead of containers; square corners throughout.
- Motion limited to position, opacity and clip, on two curves.
- Light and dark themes with identical structure; dark follows `prefers-color-scheme` or `[data-theme]`.

## Colors

A near-achromatic warm-grey paper and ink pair, with one saturated blue held back for the observation layer.

### Primary
- **Annotation Blue** (`note`; `note-dark` in dark): the observation layer only. The Notes panel and phone ticker, the Time Shift clocks and their top rule, the closing readout bars and total, the attention trace on the hero name, the route index hover bar, `::selection` background, the caret, and the `:focus-visible` outline. Its tint (`note-soft`) is the empty track of a readout bar and nothing else.

### Neutral
- **Daylight Paper** (`paper`): the page ground, the top bar and the phone ticker background.
- **Shade Paper** (`paper-2`): the stage behind Case figures. The only tonal surface in the system.
- **Ink** (`ink`): all authored text, heading rules above role lists, the Case summary and limits rules, the primary work-row hover rule.
- **Ink Two** (`ink-2`): secondary prose, entry previews, figure captions, qualifiers.
- **Ink Three** (`ink-3`): labels, metadata, dates, the smallest type. Raised from #7c7c76 to #656560 so 13px labels pass WCAG AA on paper; do not lighten it again.
- **Rule** (`rule`): every hairline divider between rows, facts and footers.

Dark theme swaps each token for its `-dark` twin with no structural change. The meta theme-color follows the paper (#ecece8 light, #121211 dark).

### Named Rules
**The Two Layers Rule.** Blue means "observed or live". If an element is authored content, it is ink, however important it is. A blue heading, blue button or blue decorative accent breaks the meaning of every note on the page.

**The Photography Exception Rule.** Real photographs and real product screenshots keep their full colour. No other colour enters the palette.

## Typography

**Display Font:** Switzer variable (with ui-sans-serif, system-ui)
**Body Font:** Switzer variable, `ss01` on
**Label/Mono Font:** Fragment Mono (with ui-monospace), for data only

**Character:** A single neutral grotesk carries identity through scale alone, from a name the width of the page to a 13px label. The mono appears only where the page reports a measured fact.

### Hierarchy
- **Display** (530, clamp(4.2rem, 18.6vw, 23rem), 0.76): the hero name only. Two lines, the second set flush right.
- **Headline** (520, clamp(3.25rem, 12.5cqi, 10rem), 0.84): Chapter titles on the Journey, with a qualifier at 0.24em in ink-2.
- **Page title** (530, clamp(2.8rem, 8cqi, 6rem), 0.92): Case title and Work index title. Work rows use a 5rem ceiling; the Case Return link matches.
- **Title** (520, `--t-h3`, 1.08): Entry titles, résumé role titles, Case prose h2, limits heading, Also-list names.
- **Lede** (400 to 520, `--t-lede`, 1.3 to 1.4): hero role and point of view, chapter text, Case question, section headings on the résumé.
- **Body** (400, `--t-body`, 1.55; Case prose 1.62): reading text, capped at 52 to 66ch.
- **Label** (400, 0.8125rem, 0.01em, ink-3): dt labels, footers, metadata.
- **Data** (Fragment Mono 400, 0.75rem; notes timestamps 0.6875rem): chapter coordinates, local times and periods, route numbers and periods, note timestamps and "can't tell" lines, readout values, event and language codes inside figures, the 404 number.

Weights sit in a narrow band: 400 for reading, 520 for emphasis and titles, 530 for the largest display, 560 for `strong` and the top-bar name. Headings are `text-wrap: balance`; paragraphs are `pretty`. Numerals that update or align use `tabular-nums`.

### Named Rules
**The Tracking Floor Rule.** Letter-spacing never goes below -0.04em, at any size.

**The Six Rem Rule.** Display type caps at 6rem. Only pinned elements may exceed it: the hero name, Chapter titles, and the far Time Shift clock.

**The Mono Means Data Rule.** Fragment Mono is for clocks, coordinates, periods, note timestamps, and event and language codes in figures. Never for headings, labels or decoration. The top-bar clock and the large Time Shift digits are Switzer with tabular numerals, because they are read as display, not logged.

## Layout

A twelve-column grid (`.grid`: 12 equal columns, `gutter` column gap, `margin` inline padding) organises every page. Content hangs flush left; nothing is centred except the watched. phone group inside its figure.

- **Top bar:** fixed, 64px (56px at 720px and below), paper background, name in columns 1 to 3, New York clock in 4 to 6, navigation right-aligned from column 7. A `rule` hairline appears once scrolled past 8px. It slides up while reading down past 400px and returns on scroll up, unless focus is inside it or the notes sheet is open.
- **Rail:** the Notes panel lives in a right-hand rail (`rail` width), sticky at 88px. On the Journey it starts below the hero; on Case and Work pages it is a second grid column.
- **Journey:** the hero name spans the full width; the identity block sits in the negative space beside the second line; the route index is a six-column list on an ink hairline. Chapters: title in columns 1 to 9, mono meta in 10 to 12, text in 4 to 9 (max 34ch), roles in 10 to 12. Entries subgrid across 12: main 1 to 7, figure 8 to 12.
- **Case:** single article column (title max 14ch, prose 66ch, blocks max 1100px) beside the rail.
- **Rhythm:** large fluid gaps between reading moments (chapter tops `clamp(56px, 8vw, 120px)`, first chapter up to 220px, Time Shifts up to 220px above), tight gaps within them (6 to 18px).

### Breakpoints
- **1100px and below:** the rail collapses. On phones and tablets the Notes become a one-line ticker fixed under the top bar showing the latest note; it hides with the bar while reading down and returns with it. "Show" opens the full list as a sheet under the bar (max 60svh). The body gains 36px top padding to make room.
- **900px and below:** all grid spans go full width; the hero identity block becomes static; the route index becomes two columns.
- **720px and below:** top bar 56px, clock hidden.
- **600px and below:** Work row arrows hidden, facts single-column, figure layouts stack.

## Elevation & Depth

Flat. There are no shadows, gradients or blurs on any surface. Depth is expressed by layering order only (the fixed top bar at z 40 over content, the ticker at 39) with an opaque paper background, and by the single tonal step of `paper-2` behind figures.

### Named Rules
**The Hairline Rule.** Separation is a 1px line in `rule`, or `ink` when it opens a section. Nothing else divides content.

## Shapes

Square. Every surface, link, figure stage, marker and bar has 0 radius; the focus outline carries a 1px radius only to soften its corners. Borders are 1px; dashed borders mean "absent or wasted" inside figures (a button with no event, a wasted agent step), and dotted borders separate notes and limits. The one rounded form is a phone screenshot in the watched. figure (16px), because it depicts a device.

## Components

### Text links and actions
Plain words, never buttons.
- **Shape:** no box, no radius.
- **Default:** `.link` text with no underline; `.link--under` shows a 1px currentColor underline drawn as a background.
- **Hover / Focus:** the underline draws in from the left over 0.6s on `ease-out`; an underlined link retracts and redraws (0.9s). The current nav item keeps its underline drawn.
- **Arrow:** every action ends with the drawn `Arrow` (16px viewBox, 1.6 stroke, square caps) pointing in the direction of travel: right, down, up-right (external), left (Return). It nudges 6px on row hover.

### Navigation
- **Top bar:** see Layout. Links are text links with `aria-current="page"`.
- **Route index:** six numbered places with period and live local time in mono. Hover, focus or current raises a 3px blue bar along the top rule, scaling in from the left.
- **Case Return:** a large text link (up to 5rem) with a left arrow on an ink rule, labelled with the reader's real origin.

### Entry row
The unit of work on the Journey.
- **Structure:** title (Title role, max 22ch), context line in ink-3, preview in ink-2, Contribution and Status facts, action, optional compact figure.
- **Divider:** a `rule` hairline above each row that draws in from the left on scroll.
- **Hover:** for Case entries the whole row is the link target; the title words slide 8px right and the arrow 6px.
- **Focus:** the row takes the 2px blue outline, inset.
- **Disclosure:** non-Case entries with more text expand in place; the panel clips open over 0.7s. Without scripts the text is simply present.
- **Work index rows** follow the same pattern at page-title scale, with an ink rule that draws across on hover or focus-within.

### Notes panel (signature)
The observation layer.
- **Style:** all text in note blue at label size; header rule in currentColor; title and controls in uppercase mono at 0.06em tracking; each note a two-column grid (timestamp, then what was seen in ink and a mono "can't tell" line) above a dotted blue hairline.
- **States:** Hide collapses the list (persisted for the session); new notes arrive from 10px above with an opacity fade.
- **Pause live:** stops clocks and running totals, `aria-pressed`, persisted for the visit.
- **Not a live region:** screen readers read it on demand.
- **Phone ticker:** see Layout.

### Time Shift (signature)
Between two chapters, the local time rolls from the previous place to the next.
- **Style:** blue top rule and digits, Switzer 440 at up to 11.5rem (19rem for the far Pacific crossing, which sets on its own row), tabular numerals, a "+1 day" or "−1 day" tag, and an ink sentence stating the real offset.
- **Motion:** each changed digit reel spins one full turn on `scene` (1.6s, 0.1s stagger), up for forward in time, down for back.
- **No script:** the places are stated plainly.

### Case figure
Authored diagrams of each case's idea on a `paper-2` stage with 1px `ink-3` or `ink` outlines, and a caption in ink-2 that always says what the figure is not. Items enter once at 45% visibility, staggered by 0.28s.

### Readout
Closing bars of the visitor's own time per chapter: 10px blue fill on a `note-soft` track, scaling from the left over 1.2s; mono values right-aligned. "Everywhere else" uses ink-3.

### Draft marker
A small 1px `rule`-bordered tag reading Draft, for copy awaiting the owner's confirmation.

## Motion

Motion tokens (`--ease-out` cubic-bezier(0.16, 1, 0.3, 1) for entrances, `--ease-scene` cubic-bezier(0.86, 0, 0.07, 1) for changes of place) are registered in GSAP as CustomEase `out` and `scene`. Lenis provides inertial scroll (1.15s).

- **Hero entrance:** SplitText characters of the name rise from 108% (1.35s, 0.034s stagger); identity lines rise 26px and fade in; route items follow; the notes clip open on `scene`. On scroll the two name lines drift apart.
- **Attention trace:** under a fine pointer, letters of the name warm toward the annotation blue and cool back over about a second. It never changes layout. It is the only colour animation in the system.
- **Chapter word:** characters rise from 110% under a mask once, at 82% viewport.
- **Entry rules:** draw in from the left on `scene` (1.2s).
- **Figures:** play once at 45% visibility.
- **Case transition:** a cross-document view transition carries the Entry title into the Case title (0.9s, `scene`); the old page fades in 0.5s, the new rises 24px from 0.15s.
- **Reading text never animates** except the hero identity block on arrival.

### Named Rules
**The Three Properties Rule.** Animate position, opacity and clip only. The attention trace is the one colour exception.

**The Reduced Motion Rule.** Under `prefers-reduced-motion: reduce`, the view transition is off, reels land on the destination time, reveals and figures show their end state, and Lenis does not run.

## Accessibility commitments
- **Pause live** stops every updating clock and total (WCAG 2.2.2) and persists for the session.
- **Return restores focus** to the originating Entry or Chapter heading, and scroll, including from the back-forward cache.
- **No-JS path:** all text is in the HTML; hidden entrance states apply only under `.js`, with a 4s failsafe; disclosures are open; notes say honestly that nothing was recorded.
- **Focus:** 2px note-blue outline at 3px offset everywhere; row-wide links outline the whole row. The top bar never hides while focus is inside it.
- **Contrast:** ink-3 at #656560 is the lightest text allowed on paper.
- **Known detector false positive:** the low-contrast check flags every `.link` because its underline is a currentColor gradient background. It is not a real contrast failure; do not "fix" it.

## Do's and Don'ts

### Do:
- **Do** keep annotation blue for notes, live data (Time Shift clocks, readout bars), the attention trace, selection and focus.
- **Do** separate content with 1px hairlines in `rule`, or `ink` to open a section.
- **Do** end every text action with the drawn Arrow in its direction of travel.
- **Do** use Fragment Mono only for clocks, coordinates, periods, note timestamps and codes in figures.
- **Do** use `ease-out` for entrances and `scene` for changes of place, and nothing else.
- **Do** give every live or animated element a reduced-motion and no-script end state.

### Don't:
- **Don't** set letter-spacing below -0.04em.
- **Don't** set display type above 6rem unless it is the hero name, a Chapter title or the far Time Shift clock.
- **Don't** add a kicker or eyebrow above any heading.
- **Don't** use side stripes thicker than 1px.
- **Don't** use cards, gradients, glass, shadows or pill buttons.
- **Don't** use blue for authored content, headings or decoration.
- **Don't** animate colour or layout properties, except the attention trace. Rules and bars draw with a left-origin scaleX, which reads as a clip; nothing else scales.
- **Don't** use text glyphs (→) as icons; use the Arrow component.
