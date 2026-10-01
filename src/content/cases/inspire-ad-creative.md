---
title: Inspire Brands Ad Creative
order: 4
context: Inspire Brands · Quantitative advertising research
question: Which creative attributes of quick-service restaurant TV ads drive their ACE Metrix scores?
contribution: As a Quantitative Consumer Insights intern, I defined the attributes with the head of Demand Gen Analytics, coded all 548 ads, ran every regression in R and presented the readout.
team: The head of Demand Gen Analytics, who helped define the attributes, and a member of the Data Science team, who advised on the statistical approach
timeline: Summer 2023, readout on August 8
methods:
  - Content coding of 548 quick-service restaurant TV ads from the past year on 21 yes-or-no attributes
  - A codebook of 21 attributes defined before any ad was watched, with counting rules for ambiguous ones
  - Linear regression of the Overall ACE Score and its seven components on the coded attributes, in R
outcome: A readout of which creative attributes drove the Overall ACE Score and each of its components, with a creative recommendation for each score. I presented it, and it was used to inform Inspire’s creative guidance.
outcomeType: Recommendations, used
status: Analysis completed · readout presented and used, August 2023
shows:
  - How subjective creative choices became yes-or-no codes with explicit rules.
  - Which kinds of creative were associated with higher and lower ACE scores across the category.
  - Why brand was set aside as an assumption, and why I named that as a limit.
cannotShow:
  - That an attribute causes higher scores. The ads were coded as they aired, so the results are associations.
  - Results for any single brand. Brand was blinded in the analysis.
  - How the creative guidance changed later ads or their scores.
---

## Which parts of an ad move its scores

Optimizing ad creative matters for how a restaurant company allocates resources and how its campaigns perform. The key is knowing which specific attributes of an ad drive success on the core ad metrics. During my summer at Inspire Brands, I studied that question for quick-service restaurant TV ads.

The scores came from the ACE Metrix database. Once a spot is on air, 500 or more people watch it and complete the same standardized survey. The survey yields the Overall ACE Score and seven components: Watchability, Attention, Likeability, Desire, Change, Relevance and Information.

## Defining the attributes before watching

The study covered 548 quick-service restaurant TV ads from the past year. Before I watched any of them, I sat down with the head of Demand Gen Analytics to identify and define the attributes that mattered. We arrived at 21, each written as a yes-or-no question about what the ad showed or said, such as whether it featured a close-up of the product.

Some attributes needed a rule as well as a definition. For jump cuts and split screens, we agreed how many an ad of each length needed before it counted. Then I coded all 548 ads on all 21 attributes.

## Choosing the model

I asked a member of the Data Science team for guidance on the statistical approach, then chose linear regression: in R, I modeled each of the eight scores against the coded attributes, to find the attributes that were both most impactful and statistically significant. A separate regression of the overall score on its seven components ranked how much each one mattered.

The analysis assumed that brand does not affect the scores, and brand was blinded. That kept the study on creative attributes across the category, and it meant the study could say nothing about any single brand.

## What the readout found

Watchability was the most influential component of the Overall ACE Score by a significant margin, with Change and Relevance tied for second. A close-up focus on the product, and action set at the restaurant, were the biggest positive drivers of the overall score and of every component. Real people and testimonials were the top negative driver in almost every score, and humor was a negative driver in many scores. Thirty-second ads were associated with higher scores than fifteen-second ones.

For each score, a chart set every attribute’s impact against its statistical significance and highlighted the key drivers, and each score got its own recommendation. For the overall score, it was a 30-second ad focused on the product, with the action at the restaurant. I presented the readout in August, and it was used to inform Inspire’s creative guidance.

## Survey response quality

I also wrote a Python script to preprocess survey responses and check their quality.

## What the evidence can and can’t show

I raised two cautions in the readout itself. Attributes that were negative drivers tended to appear in fewer ads, because brands are more likely to use what performs well, so those estimates rest on smaller samples. And humor is subjective and polarizing, so a yes-or-no code may not capture how viewers experienced it. I also named the brand assumption as a limitation, since anecdotal evidence suggests brand does affect scores.

The ads were coded as they aired rather than varied in an experiment, so the results describe association, not cause.
