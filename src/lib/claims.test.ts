import { describe, expect, it } from 'vitest';
import { allEntries, chapters, type FigureKind } from '../data/journey';
import thisFile from './claims.test.ts?raw';
import { check, checkAll, checkNotCases, isBinary, listUnder, notCases, rules, sentences, staleAllowances, type Rule, type Source, type Violation } from './claims';

// Typed as escapes so this file holds no em dash itself, which would break the first Rule.
const EM = '\u2014';
const EN = '\u2013';
// The internal tool names are never written out in the repository, so the plants decode them by hand.
const [TOOL_A, TOOL_B] = ['SUJBVA==', 'SU1VUw=='].map((t) => atob(t));

const byId = (id: string) => rules.find((r) => r.id === id)!;
const planted = (text: string, about?: string[]): Source => ({ file: 'planted.md', text, copy: true, about });
const report = (found: Violation[]) => found.map((v) => `${v.file}:${v.line} "${v.found}" in: ${v.sentence}`);

const INSPIRE = ['inspire-ad-creative'];

/** One planted violation set per Rule: wording that must fail it, and nearby wording that must pass. Written by hand. */
const plants: Record<string, { about?: string[]; bad: string[]; good: string[] }> = {
  'no-em-dash': {
    bad: [`Two words ${EM} joined.`],
    good: ['Two words, joined.', `A hyphen - and an en dash ${EN} are fine.`],
  },
  'inspire-no-causal-wording': {
    about: INSPIRE,
    bad: [
      'Humor drives lower scores.',
      'Real people caused the dip.',
      'Thirty-second ads boost the Overall ACE Score.',
      'That change led to higher scores.',
      'Humor increases Watchability.',
      'A close-up raises Likeability.',
      'Real people lowered the Overall ACE.',
      'Likeability was raised by humor.',
    ],
    good: [
      'Humor was associated with lower scores.',
      'Humor increases laughter.',
      'Because brands use what performs well, those estimates rest on smaller samples.',
      'Real people and testimonials were the attribute most strongly associated with lower values in almost every score.',
      'I raised two cautions in the readout itself.',
    ],
  },
  'inspire-no-estimates': {
    about: INSPIRE,
    bad: [
      'Humor had β = 0.4.',
      'Humor was significant (p < .05).',
      'The result held at p = 0.01.',
      'The coefficient of humor was negative.',
      'The model had an R² of 0.3.',
      'Its estimate was 0.42.',
      'Humor had a beta of \u22120.4.',
      'Humor was significant at the .05 level.',
      'Close-ups were significant in 6 of the 8 scores.',
    ],
    good: [
      'A chart set every attribute’s estimate against its statistical significance.',
      'Those estimates rest on smaller samples.',
      'I modeled each of the eight scores in R, then compared them.',
      'I found the attributes that were most strongly associated with the scores and statistically significant.',
      'Attributes few ads use leave less to go on.',
    ],
  },
  'inspire-no-decimals': {
    about: INSPIRE,
    bad: ['A close-up added 4.2 points to the Overall ACE Score.', 'Humor moved Likeability by \u22120.4.', 'Each attribute’s estimate was .31.', 'Watchability scored 8.5.'],
    good: ['I coded all 548 ads on all 21 attributes.', 'Thirty-second ads were associated with higher scores than fifteen-second ones.', 'The place is at 33.749, -84.388.', 'Version 2.12.2 is paused.', "[0.76, 'Each score is modeled against the codes."],
  },
  'inspire-no-brand-list': {
    about: INSPIRE,
    bad: ['The ads came from McDonald’s and Wendy’s.', 'We also looked at competitors.'],
    good: ['The ads came from across the quick-service category.', 'Brand was blinded in the analysis.'],
  },
  'inspire-no-brand-count': {
    about: INSPIRE,
    bad: ['The ads came from 14 brands.', 'It covered twelve different brands.'],
    good: ['Brand was blinded in the analysis.', 'I spent a summer in Atlanta with Inspire Brands.', 'I coded 548 ads on 21 attributes.'],
  },
  'no-internal-tool-names': {
    bad: [`I coded the ads in ${TOOL_A}.`, `The panel came from ${TOOL_B}.`],
    good: ['I modeled the scores in R.', 'I wrote a Python script.'],
  },
  'inspire-no-counting-thresholds': {
    about: INSPIRE,
    bad: ['A jump cut counted after three cuts in a thirty-second ad.', 'Split screens needed at least 2 panels before they counted.'],
    good: ['For jump cuts and split screens, we agreed how many an ad of each length needed before it counted.', 'Thirty-second ads were associated with higher scores than fifteen-second ones.'],
  },
  'inspire-no-outcome-percentages': {
    about: INSPIRE,
    bad: ['Recall rose 12% after the readout.', 'It lifted results by ten percent.'],
    good: ['It was used to inform creative guidance.', 'I coded all 548 ads.'],
  },
  'inspire-survey-no-numbers': {
    about: INSPIRE,
    bad: ['I flagged 300 submissions that looked automated.', 'The script removed about a third of the submissions it judged automated.'],
    good: ['I wrote a script to identify submissions that looked automated.', 'Once a spot is on air, 500 or more people watch it and complete the same standardized survey.'],
  },
  'inspire-survey-not-bots': {
    about: INSPIRE,
    bad: ['It removed bot-generated responses.', 'It caught chatbot responses.'],
    good: ['It identified submissions that looked automated.'],
  },
  'discord-no-sixty-people': {
    bad: ['We spoke with 60 unique students.', 'Sixty STEM participants took part.', 'In all, I spoke with 60 STEM undergraduates.', 'The research heard from 60 respondents.'],
    good: ['Two rounds of unmoderated interviews with 24 STEM students.', 'Three low-fidelity concept tests, 12 STEM students each.', 'Sixty-minute interviews with 24 STEM students.'],
  },
  'discord-no-sixty': {
    about: ['chegg-discord'],
    bad: [
      'We spoke with 60 unique students.',
      'In all, I spoke with 60 STEM undergraduates.',
      'The research heard from 60 respondents.',
      'The two studies reached 60 unique STEM undergraduate students.',
      'Sixty took part.',
    ],
    good: ['Two rounds of unmoderated interviews with 24 STEM students.', 'Three low-fidelity concept tests, 12 STEM students each.', 'Eight weeks, 2024.', 'The place is at 37.3541, -121.9552.'],
  },
  'discord-no-launch-or-learning-gains': {
    about: ['chegg-discord'],
    bad: ['The bot launched in the Chegg Discord server.', 'Students showed learning gains.', 'It was released to students.', 'The change improved learning.'],
    good: [
      'Homework help and quiz generation could move toward alpha with specific improvements.',
      'Likelihood of use, perceived usefulness and expected learning value informed the recommendations.',
      '- A launched bot, or the outcome of an alpha.',
      'They don’t establish learning gains or the accuracy of any model.',
    ],
  },
  'instrumentation-no-adoption-or-rollout': {
    about: ['instrumentation'],
    bad: ['Teams adopted the dashboard.', 'Adoption grew across Payments.', 'It was deployed to other lines of business.', 'The pipeline was rolled out to three teams.', 'The missing tags were repaired.'],
    good: [
      'A resumable assessment pipeline designed for reuse.',
      'The work is being publicized.',
      'I created a cross-product HTML dashboard for the Payments line of business.',
      '- That any instrumentation has been repaired yet.',
      '- Whether teams have adopted it.',
      'It has not yet been deployed to other lines of business.',
    ],
  },
  'ai-evaluation-not-the-designer': {
    about: ['ai-evaluation'],
    bad: ['I designed the agentic test experience.', 'I’m designing the agentic experience used to test it.', 'We built the agents that run the test.', 'Kaushik designs the agentic experience.'],
    good: [
      'I don’t design the agentic experience used to test it.',
      'With my manager, I’m developing an evaluation approach to help identify whether a breakdown comes from the user or the agent.',
      'Developing the approach with my manager.',
    ],
  },
  'ai-evaluation-no-agent-feelings': {
    about: ['ai-evaluation'],
    bad: ['The agent feels frustrated when it loops.', 'Agents get frustrated.', 'The agent experiences frustration.', 'Agents feel emotion.'],
    good: [
      'One challenge is defining what a human concept such as frustration means when applied to agent behavior.',
      'Agent-side indicators are an operational construct.',
      'The user was frustrated and the agent kept going.',
      'Turning it into something observable in an agent doesn’t assume the agent feels anything.',
    ],
  },
  'mexico-not-egel': {
    about: ['chegg-mexico'],
    bad: ['It sits beside the 400+ EGEL claim.', 'More than 400 students took the exam.'],
    good: ['A comparative survey of 1,000 students, 500 in the US and 500 in Mexico.'],
  },
  'mexico-implementation-is-reported': {
    about: ['chegg-mexico'],
    bad: ['The feature was implemented on chegg.mx.', 'It shipped last year.'],
    good: ['The presentation reports that it was implemented on chegg.mx.', 'Cross-language search implementation reported', 'My presentation notes record that the feature was implemented on chegg.mx.'],
  },
  'no-business-uplift': {
    bad: ['The change delivered business uplift.', 'It brought remediation gains.'],
    good: ['Adoption, learning gains or business results after the change.'],
  },
  'instrumentation-not-tableau': {
    about: ['instrumentation'],
    bad: ['It replaces the Tableau dashboards.'],
    good: ['A cross-product HTML dashboard for Payments.'],
  },
  'watched-not-from-singapore': {
    bad: ['Singapore inspired watched.', 'watched. originated in Singapore.'],
    good: ['Singapore is one of the places I’ve called home, and a core part of who I am.', 'One project brings those interests together: watched.'],
  },
  'contact-only-confirmed': {
    bad: ['Write to someone@example.com.', 'Find me at https://www.linkedin.com/in/someoneelse/.', 'Call 214-555-0100.'],
    good: ['Write to kaushik.kallam@gmail.com or https://www.linkedin.com/in/kaushikkallam/.', 'Coded 548 quick-service restaurant TV ads on 21 attributes.'],
  },
};

describe('the Rules', () => {
  const product = Object.values(import.meta.glob<string>('../../PRODUCT.md', { query: '?raw', import: 'default', eager: true }))[0];

  it('each has its own id, a reason, and words that PRODUCT.md really says', () => {
    expect(new Set(rules.map((r) => r.id)).size).toBe(rules.length);
    for (const rule of rules) {
      expect(rule.id, rule.id).toMatch(/^[a-z]+(?:-[a-z]+)*$/);
      expect(rule.reason.length, `${rule.id} reason`).toBeGreaterThan(20);
      expect(product, `${rule.id} cites "${rule.from}"`).toContain(rule.from);
    }
    for (const stay of notCases) expect(product, `${stay.id} cites "${stay.from}"`).toContain(stay.from);
  });

  it('are patterns without the g or y flag, so reading a sentence never changes the next', () => {
    for (const rule of rules) for (const p of [rule.forbids, rule.when, ...(rule.allow ?? []).map((a) => a.words)]) expect(p?.global || p?.sticky, rule.id).toBeFalsy();
  });

  it('have a planted violation each, and no planted violation lacks its Rule', () => {
    expect(Object.keys(plants).sort()).toEqual(rules.map((r) => r.id).sort());
  });

  it.each(rules)('$id: fails the planted violation and passes the clean wording', (rule) => {
    const { about, bad, good } = plants[rule.id];
    for (const text of bad) expect(check(rule, planted(text, about)).map((v) => v.rule), text).toEqual([rule.id]);
    for (const text of good) expect(check(rule, planted(text, about)), text).toEqual([]);
  });

  it('read only text about their Cases, when they name Cases', () => {
    for (const rule of rules.filter((r) => r.about)) {
      const { bad } = plants[rule.id];
      expect(check(rule, planted(bad[0], ['watched'])), `${rule.id} about another Case`).toEqual([]);
      expect(check(rule, planted(bad[0])), `${rule.id} about no Case`).toEqual([]);
    }
  });

  it('read only the site’s copy, unless they read everything', () => {
    const code: Source = { file: 'planted.ts', text: `Two words ${EM} joined. The change delivered business uplift.`, copy: false };
    expect(check(byId('no-em-dash'), code)).toHaveLength(1);
    expect(check(byId('no-business-uplift'), code)).toEqual([]);
  });

  it('keeps the internal tool names out of code and tests too', () => {
    expect(check(byId('no-internal-tool-names'), { file: 'planted.ts', text: `const tool = '${TOOL_A}';`, copy: false })).toHaveLength(1);
  });
});

describe('the causal wording Rule', () => {
  const rule = byId('inspire-no-causal-wording');
  const found = (text: string) => check(rule, planted(text, INSPIRE)).length;
  // The readout sentence as the Case words it, with the curly apostrophe.
  const readout = 'In the readout’s terms, a close-up focus on the product were the biggest positive drivers of the overall score.';

  it.each(['drive', 'drives', 'driver', 'drivers', 'impact', 'impactful', 'cause', 'caused', 'causes', 'leads to', 'led to', 'boost', 'boosts'])('forbids "%s"', (word) => {
    expect(found(`Humor ${word} scores.`)).toBe(1);
  });

  it('forbids "increases" when it is applied to scores, in either order', () => {
    expect(found('Humor increases scores.')).toBe(1);
    expect(found('Scores increase with humor.')).toBe(1);
    expect(found('Humor increases laughter.')).toBe(0);
  });

  it('lets the sentence that opens "In the readout’s terms" use "drivers", because it quotes the readout', () => {
    expect(found(readout)).toBe(0);
  });

  it('fails the same word anywhere else, even beside that sentence', () => {
    expect(found(`${readout} Humor is a driver of lower scores.`)).toBe(1);
    expect(found('Humor, in the readout’s terms, drives lower scores.')).toBe(1);
    expect(found('Watchability was the biggest positive driver of the overall score.')).toBe(1);
  });

  it('lets the two sentences that deny a cause use the word, and only those', () => {
    expect(found('- That an attribute causes higher scores.')).toBe(0);
    expect(found('The ads were coded as they aired rather than varied in an experiment, so the results describe association, not cause.')).toBe(0);
    expect(found('The ads were coded as they aired, so humor causes lower scores.')).toBe(1);
  });

  it('lets an allowed sentence use only the words it names', () => {
    // The readout sentence names "drivers"; "caused" in it is a claim of its own.
    expect(found('In the readout’s terms, close-ups were the biggest positive drivers of the overall score and of every component, and humor caused lower scores.')).toBe(1);
    // The denial names "cause"; "drive" in it is not that word.
    expect(found('The ads were coded as they aired rather than varied in an experiment, so the results describe association, though close-ups clearly drive the overall score.')).toBe(1);
    expect(found('That an attribute causes higher scores, and that close-ups drive them.')).toBe(1);
    // The singular is not the word the readout used.
    expect(found('In the readout’s terms, close-ups were the biggest positive driver of the overall score.')).toBe(1);
  });

  it('reads a sentence after a closing quote as its own, so an allowance cannot cover the next one', () => {
    expect(found('In the readout’s terms, close-ups were “the biggest positive drivers of the overall score.” Real people and testimonials drive lower scores.')).toBe(1);
    expect(found('In the readout’s terms, close-ups were “the biggest positive drivers of the overall score.” Real people and testimonials were associated with lower scores.')).toBe(0);
  });

  it('gives each allowance a reason', () => {
    for (const a of rule.allow!) expect(a.reason.length).toBeGreaterThan(20);
  });
});

describe('the Rules that deny a result, a launch or a feeling', () => {
  const found = (id: string, about: string, text: string) => check(byId(id), planted(text, [about])).length;

  it('lets a Discord sentence deny a launch or learning gains, and no more than the words it names', () => {
    const id = 'discord-no-launch-or-learning-gains';
    expect(found(id, 'chegg-discord', 'A launched bot, or the outcome of an alpha, and learning gains.')).toBe(1);
    expect(found(id, 'chegg-discord', 'They don’t establish learning gains, and the bot launched.')).toBe(1);
  });

  it('lets an Instrumentation sentence deny adoption, a repair or a rollout, and no more than the words it names', () => {
    const id = 'instrumentation-no-adoption-or-rollout';
    expect(found(id, 'instrumentation', 'Whether teams have adopted it, and the adoption is wide.')).toBe(1);
    expect(found(id, 'instrumentation', 'That any instrumentation has been repaired yet, or adopted.')).toBe(1);
    expect(found(id, 'instrumentation', 'It has not yet been deployed to other lines of business, but the pipeline was rolled out in Payments.')).toBe(1);
  });

  it('lets the AI evaluation sentence deny a feeling, and no more than the words it names', () => {
    const id = 'ai-evaluation-no-agent-feelings';
    expect(found(id, 'ai-evaluation', 'Turning it into something observable in an agent doesn’t assume the agent feels anything, but agents get frustrated.')).toBe(1);
  });
});

describe('the decimals Rule', () => {
  const rule = byId('inspire-no-decimals');
  const found = (text: string) => check(rule, planted(text, INSPIRE)).length;

  it('lets a figure step open with its scroll offset, and fails a decimal the step then states', () => {
    expect(found("[0.28, 'Each attribute is a yes or no, defined before any ad was watched.'],")).toBe(0);
    expect(found("[0.28, 'Each attribute adds 0.4 to the score.'],")).toBe(1);
    expect(found("Each attribute is a yes or no, defined before any ad was watched, at 0.28.")).toBe(1);
  });
});

describe('finding allowances nothing uses', () => {
  const rule: Rule = {
    id: 'planted',
    from: '',
    reason: 'A Rule for the test.',
    forbids: /drive/i,
    allow: [
      { opens: 'In the readout', words: /^drive$/, reason: 'Quotes the readout.' },
      { opens: 'Never written', words: /^drive$/, reason: 'No sentence opens like this.' },
    ],
  };

  it('names each allowance that no sentence in the text needed', () => {
    expect(staleAllowances(rule, [planted('Humor also drives lower scores.')]).map((a) => a.opens)).toEqual(['In the readout', 'Never written']);
    expect(staleAllowances(rule, [planted('In the readout, humor drives scores. Humor also drives lower scores.')]).map((a) => a.opens)).toEqual(['Never written']);
  });

  it('names an allowance that lets nothing through, because the sentence it opens uses other words', () => {
    expect(staleAllowances(rule, [planted('In the readout, humor drives scores.')]).map((a) => a.opens)).toEqual(['Never written']);
    expect(staleAllowances({ ...rule, forbids: /drive|cause/i }, [planted('In the readout, humor causes scores.')]).map((a) => a.opens)).toEqual(['In the readout', 'Never written']);
  });
});

describe('reading text', () => {
  it('splits sentences after a closing quote or bracket that follows the full stop', () => {
    expect(sentences('He wrote “drivers.” Then “stop!” (Aside.) She said "no." Last')).toEqual([
      { text: 'He wrote “drivers.”', line: 1 },
      { text: 'Then “stop!”', line: 1 },
      { text: '(Aside.)', line: 1 },
      { text: 'She said "no."', line: 1 },
      { text: 'Last', line: 1 },
    ]);
    expect(sentences('Close-ups were ‘drivers.’ Wendy’s is not a stop')).toEqual([
      { text: 'Close-ups were ‘drivers.’', line: 1 },
      { text: 'Wendy’s is not a stop', line: 1 },
    ]);
  });

  it('splits sentences at . ! or ? before a space, and never across a line', () => {
    expect(sentences('One. Two!\n- Three? Four\n\nFive')).toEqual([
      { text: 'One.', line: 1 },
      { text: 'Two!', line: 1 },
      { text: '- Three?', line: 2 },
      { text: 'Four', line: 2 },
      { text: 'Five', line: 4 },
    ]);
  });

  it('names the file and the line of a violation, counted from the line a part of a file starts on', () => {
    const rule = byId('no-business-uplift');
    expect(check(rule, { file: 'a.md', text: 'Fine.\nIt brought uplift. Fine again.', copy: true })).toEqual([
      { rule: 'no-business-uplift', file: 'a.md', line: 2, found: 'uplift', sentence: 'It brought uplift.' },
    ]);
    expect(check(rule, { file: 'b.ts', text: 'x\nIt brought uplift.', line: 40, copy: true })[0].line).toBe(41);
  });

  it('takes a file with a NUL byte for binary, so an image is never read as text', () => {
    expect(isBinary('PNG\0\0\0\rIHDR')).toBe(true);
    expect(isBinary('plain text')).toBe(false);
  });

  it('reads the items under a front matter key, and none for an empty or missing key', () => {
    const front = '---\ntitle: X\nshows:\n  - One.\n  - Two.\ncannotShow: []\nstatus: Y\n---\nBody';
    expect(listUnder(front, 'shows')).toEqual(['One.', 'Two.']);
    expect(listUnder(front, 'cannotShow')).toEqual([]);
    expect(listUnder(front, 'methods')).toEqual([]);
  });
});

describe('work that is not a Case', () => {
  it('is reported when it gains a Case page or changes kind', () => {
    expect(checkNotCases([{ id: 'ai-evaluation', kind: 'case' }, { id: 'chase-entry-points', kind: 'summary' }], ['ai-evaluation'])).toEqual([
      'ai-evaluation must be a research-in-development Entry, not case',
      'ai-evaluation has a Case page',
    ]);
    expect(checkNotCases([{ id: 'ai-evaluation', kind: 'research-in-development' }, { id: 'chase-entry-points', kind: 'research-in-development' }], [])).toEqual([
      'chase-entry-points must be a summary Entry, not research-in-development',
    ]);
    expect(checkNotCases([], [])).toEqual([
      'ai-evaluation must be a research-in-development Entry, not missing',
      'chase-entry-points must be a summary Entry, not missing',
    ]);
  });

  it('is quiet when each stays what PRODUCT.md says', () => {
    expect(checkNotCases([{ id: 'ai-evaluation', kind: 'research-in-development' }, { id: 'chase-entry-points', kind: 'summary' }], ['watched'])).toEqual([]);
  });
});

// The real text of the site, from disk. The Journey is cut at each Chapter and the two figure files at each kind of figure, so a Rule about a Case reads only the part that tells it.
const JOURNEY = 'src/data/journey.ts';
const SCENE = 'src/components/FigureScene.astro';
const FIGURE = 'src/components/CaseFigure.astro';
const COPY = /^src\/(?:content\/.+\.md|data\/journey\.ts|lib\/seo\.ts|(?:pages|components|layouts)\/.+\.astro)$/;

// A glob leaves out the file that asks, so this file is read by name.
const files = [
  ...Object.entries(import.meta.glob<string>(['../**/*', '!../**/*.{png,jpg,jpeg,webp,avif,gif,ico,woff,woff2,ttf,otf}'], { query: '?raw', import: 'default', eager: true })),
  ['./claims.test.ts', thisFile],
]
  .map(([path, text]) => ({ file: path.replace(/^\.\.\//, 'src/').replace(/^\.\//, 'src/lib/'), text }))
  .filter(({ text }) => !isBinary(text));

/** Where a part of a file starts, and which Cases it is about. */
interface Cut {
  at: number;
  about: string[];
}

const startOf = (file: string, text: string, marker: string | RegExp) => {
  const at = typeof marker === 'string' ? text.indexOf(marker) : text.search(marker);
  if (at < 0) throw new Error(`${file} has no part that starts at ${marker}`);
  return at;
};

/** A file cut into the part before the first cut, the part each cut starts, and the part after `end`. Each part says which line it starts on. */
function cutSources(file: string, text: string, parts: Cut[], end: number): Source[] {
  const cuts = [0, ...parts.map((p) => p.at), end, text.length];
  const lineAt = (offset: number) => text.slice(0, offset).split('\n').length;
  return cuts.slice(0, -1).map((from, i) => ({ file, text: text.slice(from, cuts[i + 1]), line: lineAt(from), copy: COPY.test(file), about: parts[i - 1]?.about ?? [] }));
}

function chapterSources(text: string): Source[] {
  const parts = chapters.map((c) => ({
    at: startOf(JOURNEY, text, `    id: '${c.id}',`),
    about: allEntries().filter((x) => x.chapter.id === c.id).map((x) => x.entry.id),
  }));
  return cutSources(JOURNEY, text, parts, text.indexOf('\n];', parts[parts.length - 1].at));
}

/** The Case that each kind of figure is about. A new FigureKind has to be placed here. */
const FIGURE_CASE: Record<FigureKind, string> = {
  instrumentation: 'instrumentation',
  'ai-evaluation': 'ai-evaluation',
  discord: 'chegg-discord',
  mexico: 'chegg-mexico',
  inspire: 'inspire-ad-creative',
  watched: 'watched',
};

/** FigureScene keys its steps by kind, and CaseFigure has one block per kind. */
function figureSources(file: string, text: string): Source[] {
  const scene = file === SCENE;
  const parts = (Object.keys(FIGURE_CASE) as FigureKind[])
    .map((kind) => ({ at: startOf(file, text, scene ? new RegExp(`^  '?${kind}'?: \\[`, 'm') : `  {kind === '${kind}' && (`), about: [FIGURE_CASE[kind]] }))
    .sort((a, b) => a.at - b.at);
  return cutSources(file, text, parts, text.indexOf(scene ? '\n};' : '</figure>', parts[parts.length - 1].at));
}

const sources: Source[] = files.flatMap(({ file, text }) => {
  if (file === JOURNEY) return chapterSources(text);
  if (file === SCENE || file === FIGURE) return figureSources(file, text);
  const caseId = /^src\/content\/cases\/(.+)\.md$/.exec(file)?.[1];
  return [{ file, text, copy: COPY.test(file), about: caseId ? [caseId] : [] }];
});
const cases = sources.filter((s) => s.file.startsWith('src/content/cases/'));

describe('reading the real text', () => {
  it('finds the five Cases, the Journey by Chapter, the pages and the code', () => {
    expect(cases.map((s) => s.about)).toEqual([['chegg-discord'], ['chegg-mexico'], ['inspire-ad-creative'], ['instrumentation'], ['watched']]);
    const atlanta = sources.find((s) => s.file === JOURNEY && s.about?.includes('inspire-ad-creative'))!;
    expect(atlanta.text).toContain('Inspire Brands');
    expect(atlanta.text).not.toContain('Santa Clara');
    expect(sources.filter((s) => s.file === JOURNEY && s.copy)).toHaveLength(chapters.length + 2);
    const copy = sources.filter((s) => s.copy).map((s) => s.file);
    expect(copy).toEqual(expect.arrayContaining(['src/pages/index.astro', 'src/pages/resume/index.astro', 'src/components/CaseFigure.astro', 'src/layouts/Base.astro', 'src/lib/seo.ts']));
    expect(sources.filter((s) => !s.copy).map((s) => s.file)).toEqual(expect.arrayContaining(['src/scripts/notes.ts', 'src/styles/global.css']));
  });

  it('cuts the Journey without a gap or an overlap, and says which line each part starts on', () => {
    const whole = files.find((f) => f.file === JOURNEY)!.text;
    const parts = sources.filter((s) => s.file === JOURNEY);
    expect(parts.map((s) => s.text).join('')).toBe(whole);
    const atlanta = sources.find((s) => s.file === JOURNEY && s.about?.includes('inspire-ad-creative'))!;
    expect(whole.split('\n')[atlanta.line! - 1]).toBe("    id: 'atlanta',");
  });

  it('cuts the figure copy by kind, so a Rule about a Case reads the figure of that Case', () => {
    const cuts = (file: string) => sources.filter((s) => s.file === file);
    const about = (file: string, id: string) => cuts(file).filter((s) => s.about?.includes(id)).map((s) => s.text).join('');
    for (const file of [SCENE, FIGURE]) {
      expect(cuts(file).map((s) => s.text).join(''), `${file} cut without a gap or an overlap`).toBe(files.find((f) => f.file === file)!.text);
      expect(cuts(file).flatMap((s) => s.about!).sort(), file).toEqual(['ai-evaluation', 'chegg-discord', 'chegg-mexico', 'inspire-ad-creative', 'instrumentation', 'watched']);
    }
    // The Inspire step text lands in an Inspire-tagged Source, and no other Case's text does.
    expect(about(SCENE, 'inspire-ad-creative')).toContain('A fictional spot stands in for the 548 real ones.');
    expect(about(SCENE, 'inspire-ad-creative')).toContain('An attribute few ads use leaves less to go on.');
    expect(about(SCENE, 'inspire-ad-creative')).not.toContain('Students searched for help in Spanish');
    expect(about(SCENE, 'chegg-mexico')).toContain('The presentation reports that this was implemented on chegg.mx.');
    expect(about(SCENE, 'chegg-mexico')).not.toContain('Three concepts, each tested');
    expect(about(SCENE, 'chegg-discord')).toContain('Three concepts, each tested with 12 STEM students.');
    expect(about(FIGURE, 'inspire-ad-creative')).toContain('Illustration of the method, not the readout.');
    expect(about(FIGURE, 'inspire-ad-creative')).not.toContain('Illustration of the recommendation');
    expect(about(FIGURE, 'chegg-mexico')).toContain('Illustration of the recommendation, not the chegg.mx interface.');
    expect(about(FIGURE, 'watched')).toContain('Screens from the App Store listing, before the pause.');
    expect(about(FIGURE, 'ai-evaluation')).toContain('Internal signals and definitions are not shown.');
  });

  it('fails an edit to the figure copy that breaks the boundary of its Case', () => {
    const broken = (file: string, from: string, to: string) => {
      const whole = files.find((f) => f.file === file)!.text;
      expect(whole, `${file} holds "${from}"`).toContain(from);
      return checkAll(rules, figureSources(file, whole.replace(from, to))).map((v) => `${v.rule} ${v.file}:${v.line}`);
    };
    expect(broken(SCENE, 'The presentation reports that this was implemented', 'This was implemented')).toEqual([expect.stringMatching(/^mexico-implementation-is-reported src\/components\/FigureScene\.astro:\d+$/)]);
    expect(broken(SCENE, 'leaves less to go on.', 'leaves less to go on. Close-ups drive the score.')).toEqual([expect.stringMatching(/^inspire-no-causal-wording src\/components\/FigureScene\.astro:\d+$/)]);
    expect(broken(FIGURE, 'and each score is modeled against them.', 'and each score is modeled against them. Humor caused the dip.')).toEqual([expect.stringMatching(/^inspire-no-causal-wording src\/components\/CaseFigure\.astro:\d+$/)]);
    expect(broken(SCENE, 'Homework help: answers had to arrive inside Discord.', 'Homework help: the bot launched inside Discord.')).toEqual([expect.stringMatching(/^discord-no-launch-or-learning-gains src\/components\/FigureScene\.astro:\d+$/)]);
    expect(broken(SCENE, 'The button records nothing at all.', 'Teams adopted the button.')).toEqual([expect.stringMatching(/^instrumentation-no-adoption-or-rollout src\/components\/FigureScene\.astro:\d+$/)]);
    expect(broken(SCENE, 'each tested with 12 STEM students.', 'each tested with 20 STEM students, 60 in all.')).toEqual([expect.stringMatching(/^discord-no-sixty src\/components\/FigureScene\.astro:\d+$/)]);
  });

  it('skips images, and anything else with a NUL byte', () => {
    expect(files.map((f) => f.file).filter((f) => f.endsWith('.png'))).toEqual([]);
    expect(files.filter((f) => f.text.includes('\0'))).toEqual([]);
  });

  it('gets the text of every file it reads, the stylesheet included', () => {
    expect(files.filter((f) => f.text.trim() === '').map((f) => f.file)).toEqual([]);
  });
});

describe('the real content', () => {
  it.each(rules)('keeps to $id', (rule) => {
    expect(report(checkAll([rule], sources))).toEqual([]);
  });

  it('uses every allowance it has, so none outlives the sentence it was for', () => {
    for (const rule of rules) expect(staleAllowances(rule, sources).map((a) => `${rule.id}: ${a.opens}`)).toEqual([]);
  });

  it('gives every Case something it shows and something its evidence cannot show', () => {
    for (const { file, text } of cases) {
      expect(listUnder(text, 'shows').length, `${file} shows`).toBeGreaterThan(0);
      expect(listUnder(text, 'cannotShow').length, `${file} cannotShow`).toBeGreaterThan(0);
    }
  });

  it('keeps research in development and the summary from becoming Cases', () => {
    const caseIds = cases.flatMap((s) => s.about!);
    expect(checkNotCases(allEntries().map(({ entry }) => entry), caseIds)).toEqual([]);
  });
});
