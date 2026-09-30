# Critique ignore list

Findings that match these are settled decisions, not open issues. Drop them silently.

- **The three hero text actions** ("Explore the journey", "Selected work", "Résumé") next to the top-bar navigation. The home-page direction contract specifies them.
- **The WebGL dot Field existing at all, or being a particle/point-cloud effect.** The owner lifted the no-particle rule for the Field (ADR 0002).
- **No portrait.** Owner decision.
- **Employer names and the approved App Store screens.** Cleared by the owner before publishing; not a design issue.
- **The detector's `low-contrast` finding on `.link` elements**, in any colour: "text #111110 on #111110" (ink links) and "text #4a4a46 on #4a4a46" (the ink-2 "Continue to" links), at 4.5:1 or 3:1. A documented false positive: the 1px currentColor underline gradient is read as the text background. Real contrast is 15.95:1 (ink) and 7.52:1 (ink-2) on paper, and in dark mode 15.7:1 (#ecebe6) and 9.01:1 (#b5b4ad) on #121211.
- **`dark-glow` on `body` (#ffba00) and `text-occlusion` on an overlay label** when the detector re-scans a page it has already drawn its overlay on. Both come from the detector's own overlay, not the site.
- **A place left unnamed on the world-scale overview map.** At world zoom New York, Atlanta, Plano and Richardson sit within a label's width of each other, so label placement names the ones that fit clear of text and each other; every place is named once the map zooms to its leg.
- **The lens tally and "Hide tracking" bar covering text at the bottom left.** It is a fixed control bar for a mode the reader switched on, kept within thumb reach on purpose; it leaves with the lens.
