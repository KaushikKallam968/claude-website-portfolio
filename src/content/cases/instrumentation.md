---
title: Data Instrumentation Coverage and Quality
order: 1
context: JPMorganChase · Payments
question: When a product records an interaction, does that record actually explain what the person did?
contribution: I created the cross-product dashboard and the assessment pipeline.
timeline: 2026, ongoing
methods:
  - Instrumentation coverage audit
  - Review of tag meaning and context
  - Cross-product comparison with product drill-down
outcome: A cross-product HTML dashboard for Payments, with product-level analysis, and a resumable assessment pipeline designed for reuse. The work is being publicized.
outcomeType: Delivered capability
status: Dashboard and pipeline created · being publicized
shows:
  - Where interactions have no tags at all.
  - Which frequently used tags carry too little context to support behavioral analysis.
  - How products compare, and where to look first.
cannotShow:
  - That any instrumentation has been repaired yet.
  - Whether teams have adopted it. The work is still being publicized.
  - A measured improvement in data quality or in the decisions it informs.
draft: true
---

## When an event is recorded but the behavior is still unclear

A product can record an interaction and still leave us unable to explain it. Some interactions have no tag at all. Others have a tag that fires reliably but says too little: a tag called “search” on a page with several search bars can’t tell us which one someone used.

Both limit behavioral analysis, but they call for different work. A missing tag needs instrumentation. An ambiguous tag needs meaning. I wanted an assessment that kept those problems apart so teams could see which kind of attention their data needed.

## What I built

I created a cross-product HTML dashboard for the Payments line of business. It spans roughly eight products and more than 200 million interaction events; that volume is context for the work, not a result of it. It compares products side by side, and a team can drill into a single product to inspect its own analysis. I also created a resumable pipeline for the assessment, designed so it can be reused beyond this first analysis rather than run once and forgotten. It has not yet been deployed to other lines of business.

## How the assessment frames the problem

**Coverage** asks where interactions need instrumentation: which actions leave no trace, and what should be tagged.

**Quality** asks whether the tags that exist mean enough to support analysis. Many were automatically generated technical labels, such as component names. Others were ambiguous. A tag can fire often and still not tell us what a person did.

**Prioritization** brings the two together. Poor-quality tags attached to large numbers of interactions matter more than rare ones, and products with large coverage gaps stand out. There is no formal scoring model behind this; the point is to make the next instrumentation question obvious.

## The research judgment

Event volume is easy to count and tempting to trust. The distinction that shaped this work is whether an event is usable behavioral evidence at all. Presence and volume are context. Interpreting behavior also requires knowing what an interaction represents.

That is the same question this site asks in its margin: what a record shows, and what it can’t.
