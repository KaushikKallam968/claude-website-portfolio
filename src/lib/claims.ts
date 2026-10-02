/**
 * The claim boundaries in PRODUCT.md that a string or a structure check can catch, as data. A Rule says which
 * words are not allowed, where it reads, why, and the PRODUCT.md words it comes from. claims.test.ts runs every
 * Rule over the site's real text, and plants a violation of each to show the Rule can fail. To add a Rule, add
 * one entry to `rules` and one planted violation to the test.
 *
 * No check can see these, so they stay with the reader: a colleague's name, a codebook definition beyond the
 * product close-up, a follow-up plan, and whether a sentence is true.
 */

/** A piece of the site's text, and where it came from. */
export interface Source {
  file: string;
  text: string;
  /** The line of `file` where `text` starts, when `text` is only a part of the file. */
  line?: number;
  /** The Cases this text is about: a Case's own page, or the Chapter that tells it. Left out for the rest of the site. */
  about?: string[];
  /** The site's copy, as against code and tests. */
  copy: boolean;
}

/**
 * A sentence a Rule lets through, matched by how the sentence opens, with the reason it is allowed. It permits only
 * the words it names: any other match of the Rule in that sentence is still a violation.
 */
export interface Allowance {
  opens: string;
  /** The forbidden words the sentence may use, matched against the whole of what the Rule matched. Never the g or y flag. */
  words: RegExp;
  reason: string;
}

export interface Rule {
  id: string;
  /** Words from PRODUCT.md that the Rule comes from, exactly as it says them. */
  from: string;
  /** Why the line is drawn here, for whoever reads a failure. */
  reason: string;
  /** What is not allowed. A sentence that matches is a violation, unless an Allowance permits that match. Never the g or y flag: a Rule is reused. */
  forbids: RegExp;
  /** The Rule looks only at sentences that also match this. */
  when?: RegExp;
  /** Reads only text about these Cases. Left out, it reads the whole site. */
  about?: string[];
  /** Reads code and tests too, not only the site's copy. */
  anywhere?: boolean;
  allow?: Allowance[];
}

export interface Violation {
  rule: string;
  file: string;
  line: number;
  /** The words that matched. */
  found: string;
  sentence: string;
}

/** A sentence never runs over a line, and ends at . ! or ? and any closing quote or bracket after it, before a space. */
export function sentences(text: string): { text: string; line: number }[] {
  return text.split('\n').flatMap((row, i) => row.split(/(?<=[.!?][”’"')\]]*)\s+/).filter((s) => s.trim()).map((s) => ({ text: s, line: i + 1 })));
}

/** A sentence as an allowance sees it: without its indent or list dash. */
const opening = (s: string) => s.trimStart().replace(/^[-*]\s+/, '');

/** Whether an allowance names the words that matched, all of them: a longer match that only contains them is not permitted. */
const permits = (a: Allowance, found: string) => a.words.exec(found)?.[0] === found;

export function check(rule: Rule, source: Source): Violation[] {
  if (!source.copy && !rule.anywhere) return [];
  if (rule.about && !rule.about.some((id) => source.about?.includes(id))) return [];
  const every = new RegExp(rule.forbids.source, `${rule.forbids.flags}g`);
  return sentences(source.text).flatMap(({ text, line }) => {
    if (rule.when && !rule.when.test(text)) return [];
    const allowed = rule.allow?.find((a) => opening(text).startsWith(a.opens));
    const found = [...text.matchAll(every)].find((m) => !allowed || !permits(allowed, m[0]));
    if (!found) return [];
    return [{ rule: rule.id, file: source.file, line: (source.line ?? 1) + line - 1, found: found[0], sentence: text.trim() }];
  });
}

export const checkAll = (rules: Rule[], sources: Source[]) => rules.flatMap((rule) => sources.flatMap((source) => check(rule, source)));

/** The allowances of a Rule that no sentence in the sources needed: take one away and nothing new fails. */
export function staleAllowances(rule: Rule, sources: Source[]): Allowance[] {
  const held = checkAll([rule], sources).length;
  return (rule.allow ?? []).filter((a) => checkAll([{ ...rule, allow: rule.allow!.filter((x) => x !== a) }], sources).length === held);
}

/** An image, a font or any other file that is not text has a NUL byte somewhere in it. */
export const isBinary = (text: string) => text.includes('\0');

/** The items under a front matter key, as a Case's front matter writes them: `key:` and then one `  - item` per line. */
export function listUnder(text: string, key: string): string[] {
  const block = new RegExp(`^${key}:[ \\t]*\\n((?:[ \\t]+-[ \\t].*(?:\\n|$))+)`, 'm').exec(text);
  return block ? block[1].split('\n').filter((l) => l.trim()).map((l) => l.replace(/^[ \t]+-[ \t]+/, '')) : [];
}

/** A number as digits, as a word or as a fraction, so a count cannot be written around a Rule. */
const NUMBER = String.raw`\b(?:\d[\d,.]*|(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|dozens?|thirds?|halves|half|quarters?|fifths?)\b)`;

/** What the Inspire Case calls a result: a score, the ACE measure, a component, or one of the seven components by name. */
const SCORE = String.raw`scores?|ACE|components?|Watchability|Attention|Likeability|Desire|Change|Relevance|Information`;

/** A verb that moves a result up or down, as the spec's "increases" does. */
const MOVES = String.raw`(?:in|de)creas(?:e|es|ed|ing)|rais(?:e|es|ed|ing)|lowers|lowered|lowering`;

/** What may stand between "agents" and what they feel: any run of helpers, modals and intensifiers, as in "can really feel", "may be
 * getting frustrated" or "have felt". Each is a function word, so a longer run catches more without catching a denial: not, n't and never
 * are not among them. */
const AGENT_HELPERS = String.raw`(?:(?:really|actually|truly|genuinely|are|is|was|were|be|been|become|becomes|became|get|gets|got|getting|can|could|may|might|must|should|shall|do|does|did|will|would|have|has|had)\s+)*`;

/** Internal tool names stay out of the repository, this file included, so the Rule holds them as base64 and decodes them here. */
const INTERNAL_TOOLS = ['SUJBVA==', 'SU1VUw=='].map((t) => atob(t));

const CONFIRMED_EMAIL = String.raw`kaushik\.kallam@gmail\.com`;
const CONFIRMED_LINKEDIN = String.raw`in\/kaushikkallam`;

export const rules: Rule[] = [
  {
    id: 'no-em-dash',
    from: 'No em dashes.',
    reason: 'The house voice has no em dashes, in the copy, the code or the comments.',
    forbids: /\u2014/,
    anywhere: true,
  },
  {
    id: 'inspire-no-causal-wording',
    from: 'Results are associations, never causes.',
    reason: 'The ads were coded as they aired, not varied in an experiment, so no sentence may say that an attribute moves a score.',
    about: ['inspire-ad-creative'],
    forbids: new RegExp(
      [
        String.raw`\b(?:driv(?:e|es|en|ing)|drove|drivers?|impact(?:s|ed|ing|ful)?|caus(?:e|es|ed|ing)|boost(?:s|ed|ing)?|(?:lead|leads|leading|led) to)\b`,
        String.raw`\b(?:${MOVES})\b.*\b(?:${SCORE})\b`,
        String.raw`\b(?:${SCORE})\b.*\b(?:${MOVES})\b`,
      ].join('|'),
      'i',
    ),
    allow: [
      { opens: 'In the readout’s terms', words: /\bdrivers\b/, reason: 'It quotes the readout’s own words ("the biggest positive drivers") and says so in its first words.' },
      { opens: 'That an attribute causes higher scores', words: /\bcauses\b/, reason: 'It is a limit: it says what the evidence cannot show.' },
      { opens: 'The ads were coded as they aired rather than varied in an experiment', words: /\bcause\b/, reason: 'It says the results describe association, not cause.' },
    ],
  },
  {
    id: 'inspire-no-estimates',
    from: 'regression estimates or significance values',
    reason: 'The findings are published in words. A coefficient, a p-value or a fit statistic would be the regression estimates themselves.',
    about: ['inspire-ad-creative'],
    forbids: /β|\bbeta\b|\bp\s*[<=≤]\s*\.?\d|\bR(?:²|-squared| squared)|\bcoefficients?\s+(?:(?:of|was|were|is|are)\b|[=:]|(?:for|on|from)\b[^.!?]{1,40}?(?:\b(?:was|were|is|are)\b|[=:]))|\b(?:estimates?|significance|p-values?)\s+(?:of|was|were|is|are|=|:|<)\s*[-−]?\.?\d|\bsignifican\w*\b[^\d]{0,40}?[-−]?\.?\d/i,
  },
  {
    id: 'inspire-no-decimals',
    from: 'regression estimates or significance values',
    reason: 'A decimal in a sentence about a score, an attribute, an estimate, a coefficient or an effect reads as one of the regression estimates, whatever it is called. The findings are in words.',
    about: ['inspire-ad-creative'],
    when: new RegExp(String.raw`\b(?:attributes?|estimates?|coefficients?|effects?|scored|scoring|${SCORE})\b`, 'i'),
    // Not the number that opens a line as `[0.28, 'text']`: in FigureScene that is the scroll offset of a step, which is code.
    forbids: /(?<!^\s*\[)(?<!\w)\d*\.\d+\b/,
  },
  {
    id: 'inspire-no-brand-list',
    from: 'the brand list or its size, competitors',
    reason: 'The brands in the study, and any competitor, are not named. The analysis was blind to brand, and the site stays blind to it.',
    about: ['inspire-ad-creative'],
    forbids: /\b(?:McDonald|Wendy|Taco Bell|Burger King|Chick-fil-A|KFC|Subway|Domino|Pizza Hut|Papa John|Popeyes|Starbucks|Chipotle|Arby|Dunkin|Sonic|Jimmy John|Buffalo Wild Wings|Baskin|Rusty Taco|Panera|Dairy Queen|Little Caesars|Whataburger|Jack in the Box|Hardee|Five Guys|Panda Express|Wingstop|Zaxby|Shake Shack|In-N-Out|Del Taco|Qdoba|Jersey Mike|El Pollo Loco|Raising Cane)|\bcompetitors?\b/i,
  },
  {
    id: 'inspire-no-brand-count',
    from: 'the brand list or its size',
    reason: 'How many brands the 548 ads came from is the size of the brand list, which is not published.',
    about: ['inspire-ad-creative'],
    forbids: new RegExp(`${NUMBER}\\s+(?:[\\w-]+\\s+){0,2}brands\\b`, 'i'),
  },
  {
    id: 'no-internal-tool-names',
    from: 'internal tools and follow-up plans',
    reason: 'Internal tools are never named, and not in the code either: the names are held encoded so that no file in the repository spells them.',
    forbids: new RegExp(`\\b(?:${INTERNAL_TOOLS.join('|')})\\b`),
    anywhere: true,
  },
  {
    id: 'inspire-no-counting-thresholds',
    from: 'the counting thresholds',
    reason: 'The Case says some attributes needed a counting rule. It does not say what the counts were.',
    about: ['inspire-ad-creative'],
    when: /\b(?:jump cuts?|split screens?|counted|counting|thresholds?)\b/i,
    forbids: new RegExp(NUMBER, 'i'),
  },
  {
    id: 'inspire-no-outcome-percentages',
    from: 'the outcome percentages on old résumés (unsupported by the deck)',
    reason: 'Percentages once printed on résumés for this work are not in the readout deck, so no percentage is said.',
    about: ['inspire-ad-creative'],
    forbids: /%|\bper ?cent\b/i,
  },
  {
    id: 'inspire-survey-no-numbers',
    from: 'described as identifying submissions that looked automated, without numbers',
    reason: 'The survey work is told as a method with no counts, because no count has been confirmed.',
    about: ['inspire-ad-creative'],
    when: /\b(?:automated|submissions|preprocess\w*)\b/i,
    forbids: new RegExp(NUMBER, 'i'),
  },
  {
    id: 'inspire-survey-not-bots',
    from: 'sources differ on bot-generated versus chatbot responses',
    reason: 'The sources disagree on what the flagged submissions were, so the site says only that they looked automated.',
    about: ['inspire-ad-creative'],
    forbids: /\b(?:chat)?bots?\b/i,
  },
  {
    id: 'discord-no-sixty-people',
    from: 'Do not sum participants into 60 unique people.',
    reason: 'The discovery interviews and the three concept tests are counted separately, and the same people may be in both.',
    forbids: /\b(?:60|sixty)\b[\w\s-]{0,24}?\b(?:students|participants|people|users|interviewees|learners|respondents|undergraduates)\b/i,
  },
  {
    id: 'discord-no-sixty',
    from: 'Do not sum participants into 60 unique people.',
    reason: 'The Discord Case has no 60 at all. Whatever the word after it, the number is the two rounds and the three tests added together, which are counted separately.',
    about: ['chegg-discord'],
    forbids: /\b(?:60|sixty)\b/i,
  },
  {
    id: 'discord-no-launch-or-learning-gains',
    from: 'No launched bot or measured learning gains.',
    reason: 'The concepts were tested at low fidelity and recommended toward alpha. No bot launched, and no learning was measured, only reactions to concepts.',
    about: ['chegg-discord'],
    forbids: /\b(?:launch(?:ed|es|ing)?|released|shipped|went live|rolled out|deployed)\b|\blearning gains?\b|\b(?:improv|rais|increas|boost)\w*\s+(?:student\s+)?learning\b/i,
    allow: [
      { opens: 'A launched bot', words: /\blaunched\b/, reason: 'It is a limit: it says what the evidence cannot show.' },
      { opens: 'They don’t establish learning gains', words: /\blearning gains\b/, reason: 'It says the measures are reactions to concepts, not learning gains.' },
    ],
  },
  {
    id: 'mexico-not-egel',
    from: 'Do not merge with the separate 400+ EGEL claim.',
    reason: 'The EGEL figure is a separate claim, and putting it beside the 1,000-student survey would merge two pieces of evidence.',
    about: ['chegg-mexico'],
    forbids: /\bEGEL\b|\b400\s?\+|\b(?:over|more than)\s+400\b/i,
  },
  {
    id: 'mexico-implementation-is-reported',
    from: 'bilingual search recommendation, implementation reported',
    reason: 'The implementation is known only from the owner’s presentation, so any sentence that says it happened says whose word it is.',
    about: ['chegg-mexico'],
    forbids: /^(?!.*\b(?:report\w*|record\w*|notes?)\b).*\b(?:implement\w*|shipped|rolled out|went live)\b/i,
  },
  {
    id: 'no-business-uplift',
    from: 'No business uplift.',
    reason: 'Neither the instrumentation work nor the Mexico search change has a measured business result.',
    forbids: /\b(?:uplift|remediation gains?)\b/i,
  },
  {
    id: 'instrumentation-no-adoption-or-rollout',
    from: 'No adoption, remediation gains, deployment to other lines of business',
    reason: 'The dashboard and pipeline are created and being publicized. Nobody has adopted them, no tag has been repaired, and they are not deployed beyond Payments.',
    about: ['instrumentation'],
    forbids: /\b(?:adopt(?:ed|ion|ing|s)?|deploy(?:ed|ment|ing|s)?|rolled out|rollout|repaired)\b|\bother lines of business\b/i,
    allow: [
      { opens: 'That any instrumentation has been repaired yet', words: /\brepaired\b/, reason: 'It is a limit: it says what the evidence cannot show.' },
      { opens: 'Whether teams have adopted it', words: /\badopted\b/, reason: 'It is a limit: it says what the evidence cannot show.' },
      { opens: 'It has not yet been deployed to other lines of business', words: /\b(?:deployed|other lines of business)\b/, reason: 'It says the work has not been deployed beyond Payments.' },
    ],
  },
  {
    id: 'instrumentation-not-tableau',
    from: 'Not the separate Tableau dashboards.',
    reason: 'The HTML dashboard is not the Tableau dashboards, so the Case does not name them and blur the two.',
    about: ['instrumentation'],
    forbids: /\bTableau\b/i,
  },
  {
    id: 'ai-evaluation-not-the-designer',
    from: 'he does not design the agentic test experience',
    reason: 'The evaluation approach is developed with his manager. He does not design the agentic experience used to test it, so no sentence says that he designs or builds it.',
    about: ['ai-evaluation'],
    // A Role highlight and an Entry's fields have no subject by house format, so the verb may also open a string, even one that
    // follows a key on its line, or follow a semicolon, a colon, a comma, a status's middle dot, an opening bracket or "and". A denial or a third-party sentence worded the
    // same way ("Created by another team: the agentic test experience.") fails too, so reword it as the real copy does, "I don’t
    // design ...", or give it an Allowance.
    forbids: /(?:^\W*|[;:,·(]\W*(?:and\s+)?|\band\s+|\b(?:I|we|he|Kaushik|I[’']m|I[’']ve)\s+)(?:also\s+)?(?:design(?:ed|s|ing)?|built|build(?:s|ing)?|creat(?:e|ed|es|ing))\b[^.!?]*\bagent\w*/i,
  },
  {
    id: 'ai-evaluation-no-agent-feelings',
    from: 'not proof agents feel emotion',
    reason: 'Agent-side indicators are an operational construct. Nothing is said that treats an agent as feeling frustration or any other emotion.',
    about: ['ai-evaluation'],
    forbids: new RegExp(
      [
        String.raw`\bagents?\s+${AGENT_HELPERS}(?:feel(?:s|ing)?|felt|frustrated|angry|upset|anxious|annoyed)\b`,
        String.raw`\bagents?\s+${AGENT_HELPERS}experiences?\s+(?:frustration|emotions?|feelings?)\b`,
      ].join('|'),
      'i',
    ),
    allow: [
      { opens: 'Turning it into something observable in an agent', words: /^agent feels$/i, reason: 'It denies it: observing the construct does not assume the agent feels anything.' },
    ],
  },
  {
    id: 'watched-not-from-singapore',
    from: 'Singapore did not inspire or originate it.',
    reason: 'watched. is told in the Singapore Chapter because that Chapter holds life outside work. Singapore did not inspire it or start it.',
    when: /\bSingapore\b/,
    forbids: /\b(?:inspir\w*|originat\w*)\b/i,
  },
  {
    id: 'contact-only-confirmed',
    from: 'Contact shown on the site: kaushik.kallam@gmail.com and https://www.linkedin.com/in/kaushikkallam/',
    reason: 'Only the confirmed email and LinkedIn address are shown. Any other contact detail is one the owner has not cleared.',
    forbids: new RegExp(
      [
        String.raw`(?<![\w.+-])(?!${CONFIRMED_EMAIL}(?![\w-]|\.\w))[\w.+-]+@[a-z][\w-]*(?:\.[\w-]+)+`,
        String.raw`linkedin\.com\/(?!${CONFIRMED_LINKEDIN}(?![\w-]))[^\s"'<>)]*`,
        String.raw`(?<!\d)(?:\+\d{1,3}[ .-])?\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}(?!\d)`,
      ].join('|'),
      'i',
    ),
  },
];

/** Work PRODUCT.md says is not a completed Case, and the kind of Entry it has to stay. */
export const notCases = [
  { id: 'ai-evaluation', kind: 'research-in-development', from: 'Bounded multi-agent evaluation is "research in development", never a completed case.' },
  { id: 'chase-entry-points', kind: 'summary', from: 'Chase Mobile Entry Points is a concise summary, not a full case.' },
];

/** What is wrong with the Entries that must not be Cases: the wrong kind, or a Case page of their own. */
export function checkNotCases(entries: { id: string; kind: string }[], caseIds: string[]): string[] {
  return notCases.flatMap(({ id, kind }) => {
    const found = entries.find((e) => e.id === id);
    return [
      ...(found?.kind === kind ? [] : [`${id} must be a ${kind} Entry, not ${found?.kind ?? 'missing'}`]),
      ...(caseIds.includes(id) ? [`${id} has a Case page`] : []),
    ];
  });
}
