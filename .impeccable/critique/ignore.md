# Critique ignore list

Findings that match these are settled decisions, not open issues. Drop them silently.

- **Draft markers on case and entry copy.** The owner keeps them until they review the copy (PRODUCT.md, owner decisions). They come off at publish.
- **The three hero text actions** ("Explore the journey", "Selected work", "Résumé") next to the top-bar navigation. The home-page direction contract specifies them.
- **The WebGL dot Field existing at all, or being a particle/point-cloud effect.** The owner lifted the no-particle rule for the Field (ADR 0002).
- **No portrait.** Owner decision.
- **Employer names and the approved App Store screens.** Cleared by the owner before publishing; not a design issue.
- **The detector's `low-contrast` finding on `.link` elements** ("text #111110 on #111110"). A documented false positive: the 1px currentColor underline gradient is read as the text background. Real contrast is 15.95:1 and 7.52:1.
