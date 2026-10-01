# Test seams

Agreed seams for the portfolio's logic (the owner delegated technical decisions to Claude, so these are recorded rather than asked). Tests live only here; everything else is verified in the browser.

1. **Origin** (`src/lib/origin.ts`): `originFromState(state)` and `returnTargetFor(caseRef, origin)`. Given where a Case was opened from, where does "Return" go, what gets focus, what scroll position is restored.
2. **Observation** (`src/lib/observe.ts`): `createObservation()` with `record(event)` and `readout()`. Given raw visitor events, which observation notes appear (with what they can and cannot explain), and what the closing readout says.
3. **Search metadata** (`src/lib/seo.ts`): `caseTitle(title)`, `caseDescription(question)`, the schema builders (`homeSchema`, `workSchema`, `caseSchema`, `resumeSchema`), `serializeGraph(nodes)` and `llmsText(site, cases, contact)`. Given a page's facts, what are its title, description and JSON-LD graph, which ids point at which nodes, that no value can close the script tag, and what `/llms.txt` says.
