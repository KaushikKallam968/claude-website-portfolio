# Kaushik Kallam · portfolio

A static Astro site: the journey home page, five case pages, a selected-work index and an HTML résumé.

## Run it

```sh
npm install
npm run dev        # http://localhost:4321
npm test           # vitest: the Origin and Observation seams
npm run check      # astro check (types)
npm run build      # static output in dist/
npm run preview    # serve dist/ locally
```

## Where things live

| Path | What |
|---|---|
| `src/data/journey.ts` | Chapter and Entry copy (owner-accepted), places with real coordinates and time zones |
| `src/content/cases/*.md` | The five Cases (draft copy, marked DRAFT on the page) |
| `src/lib/origin.ts`, `src/lib/observe.ts` | Tested logic: where Return goes; what the observation notes say |
| `src/scripts/` | Browser behavior: notes, readout, clocks, time shifts, motion, navigation |
| `src/components/` | Chapter sections, entries, figures, the notes panel, time shifts |
| `PRODUCT.md`, `GLOSSARY.md` | Product truth, claim boundaries and domain language |
| `docs/research/` | The portfolio research this design is built on |
| `docs/adr/` | Architecture decisions |
| `docs/publishing.md` | How to put it online |

## Before publishing

- Case copy is draft until Kaushik confirms it, and employer material needs disclosure review. Set `draft: false` in a case's front matter only after that.
- The observation notes promise that nothing leaves the visitor's browser. Keep it true: don't add third-party analytics without changing that copy.
