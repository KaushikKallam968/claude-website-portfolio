# Test seams

Agreed seams for the portfolio's logic (the owner delegated technical decisions to Claude, so these are recorded rather than asked). Tests live only here; everything else is verified in the browser.

1. **Origin** (`src/lib/origin.ts`): `originFromState(state)` and `returnTargetFor(caseRef, origin)`. Given where a Case was opened from, where does "Return" go, what gets focus, what scroll position is restored.
2. **Observation** (`src/lib/observe.ts`): `createObservation()` with `record(event)` and `readout()`. Given raw visitor events, which observation notes appear (with what they can and cannot explain), and what the closing readout says.
3. **Search metadata** (`src/lib/seo.ts`): `caseTitle(title)`, `caseDescription(question)`, the schema builders (`homeSchema`, `workSchema`, `caseSchema`, `resumeSchema`), `serializeGraph(nodes)` and `llmsText(site, cases, contact)`. Given a page's facts, what are its title, description and JSON-LD graph, which ids point at which nodes, that no value can close the script tag, and what `/llms.txt` says.
4. **Claim boundaries** (`src/lib/claims.ts`): `rules` (each a Rule: what is forbidden, where it reads, the PRODUCT.md words it comes from and why), `check(rule, source)`, `checkAll`, `staleAllowances` and `checkNotCases`. Given the site's real text, does it break any boundary PRODUCT.md sets (no em dash, no cause in the Inspire Brands Case, no estimates or brand list, no merged EGEL claim), and does every Rule still fail on a planted violation. A new Rule is one entry in `rules` and one planted pair in `claims.test.ts`.
