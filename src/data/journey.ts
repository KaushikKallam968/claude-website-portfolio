/**
 * The Journey: owner-accepted chapter copy (portfolio-handoff/outputs/portfolio-reading-draft.md).
 * Places carry true coordinates and time zones so the page can show live local time.
 */

export interface Place {
  name: string;
  lat: number;
  lon: number;
  timeZone: string;
}

export interface Role {
  title: string;
  org: string;
  period: string;
  where: string;
  /** Résumé lines: what the work was, without metrics the sources don't support. */
  highlights: string[];
  /** Where the résumé's "Read more" goes. */
  more: string;
}

/** An Entry either opens a Case (its own page) or expands in place as a Summary / Research in Development. */
export type EntryKind = 'case' | 'summary' | 'research-in-development';
export type FigureKind = 'instrumentation' | 'ai-evaluation' | 'discord' | 'mexico' | 'watched';

export interface Entry {
  id: string;
  title: string;
  kind: EntryKind;
  context: string;
  preview: string[];
  /** What Kaushik personally did (see GLOSSARY: Contribution). */
  contribution: string;
  status: string;
  action: string;
  figure?: FigureKind;
  /** Copy awaiting the owner's confirmation. */
  draft: boolean;
  /** Expanded text for entries that do not open a Case. */
  more?: string[];
}

export interface Chapter {
  id: string;
  title: string;
  /** How the chapter is labelled when both Texas chapters could be confused. */
  label: string;
  /** What the Chapter holds, in a few words, for the route index: its work, or what the place was for. */
  work: string;
  place: Place;
  period: string;
  intro: string[];
  roles: Role[];
  entries: Entry[];
  /** Short transition line into this chapter, when the draft has one. */
  lead?: string;
  subsections?: { heading: string; text: string[]; role?: Role; entries: Entry[] }[];
  facts?: string[];
}

export const chapters: Chapter[] = [
  {
    id: 'nyc',
    title: 'New York',
    label: 'New York',
    work: 'Instrumentation · AI evaluation',
    place: { name: 'New York', lat: 40.7128, lon: -74.006, timeZone: 'America/New_York' },
    period: '2026 to now',
    intro: [
      'At JPMorganChase, I study how we make sense of behavior in Payments products and bounded multi-agent workflows. My work includes assessing the quality of interaction data and developing an approach to AI-agent evaluation.',
    ],
    roles: [
      {
        title: 'Senior Quantitative UX Researcher',
        org: 'JPMorganChase',
        period: 'June 2026 to present',
        where: 'New York',
        highlights: [
          'Assess interaction-data coverage and quality across Payments products; created a cross-product HTML dashboard and a resumable assessment pipeline.',
          'Developing an evaluation approach for bounded multi-agent workflows with my manager (concept development).',
        ],
        more: '/work/instrumentation/',
      },
    ],
    entries: [
      {
        id: 'instrumentation',
        title: 'Data Instrumentation Coverage and Quality',
        kind: 'case',
        context: 'JPMorganChase · Payments',
        preview: [
          'Some interaction data recorded activity without enough context to explain it. A tag called “search” on a page with several search bars couldn’t tell us which one someone used. Other interactions needed instrumentation altogether.',
          'I created a cross-product HTML dashboard to distinguish coverage gaps from unusable tags, with product-level analysis and a resumable pipeline designed for reuse.',
        ],
        contribution: 'I created the dashboard and the assessment pipeline.',
        status: 'Dashboard and pipeline created · being publicized',
        action: 'Explore the assessment',
        figure: 'instrumentation',
        draft: true,
      },
      {
        id: 'ai-evaluation',
        title: 'Evaluating bounded multi-agent workflows',
        kind: 'research-in-development',
        context: 'JPMorganChase · Bounded multi-agent workflows',
        preview: [
          'A bounded multi-agent workflow can return the right answer while taking unnecessary steps and making tool calls that add cost. Evaluating the result alone can miss those problems.',
        ],
        more: [
          'With my manager, I’m developing an evaluation approach to help identify whether a breakdown comes from the user or the agent. I don’t design the agentic experience used to test it.',
          'One challenge is defining what a human concept such as frustration means when applied to agent behavior. Turning it into something observable in an agent doesn’t assume the agent feels anything.',
        ],
        contribution: 'Developing the approach with my manager. I don’t design the agentic experience used to test it.',
        status: 'Research in development · concept stage',
        action: 'Read the research overview',
        figure: 'ai-evaluation',
        draft: true,
      },
    ],
  },
  {
    id: 'texas-career',
    title: 'Texas',
    label: 'Texas: career',
    work: 'Chase Mobile · account opening',
    place: { name: 'Plano, Texas', lat: 33.0198, lon: -96.6989, timeZone: 'America/Chicago' },
    period: '2024 to 2026',
    lead: 'Before moving to New York, I worked on another team at JPMorganChase in Texas.',
    intro: [
      'In Texas, my work at Chase focused on the moments when people needed to find their way through a banking experience. I used usability research and interviews to understand where they struggled and what teams could improve.',
    ],
    roles: [
      {
        title: 'Experience Research Senior Associate',
        org: 'JPMorganChase',
        period: 'November 2024 to June 2026',
        where: 'Plano, Texas',
        highlights: [
          'Unmoderated usability research on Chase mobile entry points, informing navigation and prioritization recommendations.',
          'Moderated interviews on assisted account opening, informing design strategy.',
        ],
        more: '/#chase-entry-points',
      },
    ],
    entries: [
      {
        id: 'chase-entry-points',
        title: 'Chase Mobile Entry Points',
        kind: 'summary',
        context: 'JPMorganChase · Usability research',
        preview: [
          'How people enter an experience can shape whether they complete the task they came for. I used unmoderated usability testing to investigate friction in Chase mobile entry points and identify opportunities to improve navigation.',
        ],
        more: [
          'The research informed recommendations for design and prioritization, connecting the difficulties people encountered with the changes teams needed to consider.',
          'I also researched assisted account opening, using moderated interviews to understand username-related challenges and cross-selling friction. The findings informed design strategy for the experience.',
        ],
        contribution: 'I ran the usability research and the interviews.',
        status: 'Research completed · recommendations for design and prioritization',
        action: 'Read the research summary',
        draft: true,
      },
    ],
  },
  {
    id: 'silicon-valley',
    title: 'Silicon Valley',
    label: 'Silicon Valley',
    work: 'Chegg Mexico · Chegg Discord',
    place: { name: 'Santa Clara County, California', lat: 37.3541, lon: -121.9552, timeZone: 'America/Los_Angeles' },
    period: 'Summer 2024',
    intro: [
      'In the summer of 2024, I interned at Chegg in Silicon Valley, working on understanding students’ needs and evaluating learning experiences.',
    ],
    roles: [
      {
        title: 'UX Research intern',
        org: 'Chegg',
        period: 'June to August 2024',
        where: 'Santa Clara County, California',
        highlights: ['Mixed-methods localization research for Mexico: a 1,000-student comparative survey and 12 interviews, leading to a cross-language search recommendation.'],
        more: '/work/chegg-mexico/',
      },
    ],
    entries: [
      {
        id: 'chegg-mexico',
        title: 'Chegg Mexico',
        kind: 'case',
        context: 'Chegg · Mixed-methods localization research',
        preview: [
          'Localizing a learning product meant understanding how students studied, the support they relied on, and how they moved between languages.',
          'Interviews revealed that students searched in both Spanish and English. I recommended that a Spanish search could retrieve a relevant answer from Chegg’s English database.',
        ],
        contribution: 'I worked across the survey and interview phases and made the cross-language search recommendation.',
        status: 'Mixed-methods study completed · cross-language search implementation reported',
        action: 'Explore the Mexico case',
        figure: 'mexico',
        draft: true,
      },
    ],
    subsections: [
      {
        heading: 'After the summer: Chegg contract work',
        text: [
          'After the internship, I returned to Texas and kept working with Chegg remotely until I joined Chase. I was one of two interns who moved into a contractor role.',
          'That work included studying how AI-powered academic support could fit into students’ existing Discord routines.',
        ],
        role: {
          title: 'UX Researcher II, contractor',
          org: 'Chegg',
          period: 'August to November 2024',
          where: 'Remote from Texas',
          highlights: ['Discovery research and three concept tests for AI-assisted academic support in Discord; one of two interns who moved into a contractor role.'],
          more: '/work/chegg-discord/',
        },
        entries: [
          {
            id: 'chegg-discord',
            title: 'Chegg Discord',
            kind: 'case',
            context: 'Chegg · Discovery and concept evaluation',
            preview: [
              'Students already used Discord to study together. We wanted to understand what academic support should look like within that environment.',
              'Through discovery research and concept testing, I explored homework help, math solving and quiz generation. The findings gave the concepts different next steps.',
            ],
            contribution: 'I ran the discovery research and the concept tests.',
            status: 'Discovery and concept testing completed · recommendations for alpha and iteration',
            action: 'Explore the Discord case',
            figure: 'discord',
            draft: true,
          },
        ],
      },
    ],
  },
  {
    id: 'atlanta',
    title: 'Atlanta',
    label: 'Atlanta',
    work: 'Consumer insights, Inspire Brands',
    place: { name: 'Atlanta, Georgia', lat: 33.749, lon: -84.388, timeZone: 'America/New_York' },
    period: 'Summer 2023',
    intro: [
      'During my master’s degree, I spent a summer in Atlanta with Inspire Brands. I worked with survey data and advertising analysis to understand consumer responses, bringing quantitative research into a different product context.',
      'The work included examining response quality and collaborating on regression analysis of advertising attributes.',
    ],
    roles: [
      {
        title: 'Quantitative Consumer Insights intern',
        org: 'Inspire Brands',
        period: 'June to August 2023',
        where: 'Atlanta, Georgia',
        highlights: ['Survey data and advertising analysis, including response quality and regression analysis of advertising attributes.'],
        more: '/#atlanta',
      },
    ],
    entries: [],
  },
  {
    id: 'texas-education',
    title: 'Texas',
    label: 'Texas: education',
    work: 'MS and BS, UT Dallas',
    place: { name: 'Richardson, Texas', lat: 32.9857, lon: -96.7502, timeZone: 'America/Chicago' },
    period: '2018 to 2024',
    intro: [
      'Texas is where I completed my undergraduate and master’s degrees at the University of Texas at Dallas.',
      'I studied neuroscience and psychology, then Applied Cognition and Neuroscience with a specialization in Human-Computer Interaction. Those fields provide different ways of understanding how people think, behave and interact with technology.',
    ],
    roles: [],
    facts: [
      'MS, Applied Cognition and Neuroscience · HCI specialization · 2022 to 2024',
      'BS, Neuroscience and Psychology · 2018 to 2022',
    ],
    entries: [],
  },
  {
    id: 'singapore',
    title: 'Singapore',
    label: 'Singapore',
    work: 'watched.',
    place: { name: 'Singapore', lat: 1.3521, lon: 103.8198, timeZone: 'Asia/Singapore' },
    period: 'Home',
    intro: [
      'Singapore is one of the places I’ve called home, and a core part of who I am.',
      'This part of the journey moves beyond my professional timeline. Films, television and longtime friendships are part of my life, too. One project brings those interests together: watched.',
    ],
    roles: [],
    entries: [
      {
        id: 'watched',
        title: 'watched.',
        kind: 'case',
        context: 'Cofounder · Research, product and front-end',
        preview: [
          'Choosing what to watch was a problem my friends and I kept coming back to. Recommendations often felt generic or disconnected from our taste, so we co-founded watched., a movie and TV tracking and discovery app.',
          'It starts with Liked, Meh or Disliked, then asks you to compare titles within the same bucket.',
        ],
        contribution: 'Cofounder: research, product and interaction design, and front-end work, with two technical cofounders.',
        status: 'Launched project · currently paused',
        action: 'Explore watched.',
        figure: 'watched',
        draft: true,
      },
    ],
  },
];

export const closing = {
  text: 'Thanks for taking a look around. If you’d like to talk about research, AI experiences or something we could build together, I’d be glad to hear from you.',
  email: 'kaushik.kallam@gmail.com',
  linkedin: 'https://www.linkedin.com/in/kaushikkallam/',
};

/** A Chapter's place as the map and the Time Shifts name it: the city alone ("Santa Clara", not "Santa Clara County, California"). */
export const shortPlace = (c: Chapter) => c.place.name.split(',')[0].replace(/ County$/, '');

/**
 * Every Entry in reading order, with the Chapter it belongs to (for Origin and Selected Work) and where the
 * work was done: the place of the Role it sits under. A Chapter can tell work done elsewhere (the Chegg
 * contract, remote from Texas), and work with no Role (watched.) claims no place.
 */
export function allEntries() {
  return chapters.flatMap((c) => [
    ...c.entries.map((e) => ({ entry: e, chapter: c, where: c.roles[0]?.where })),
    ...(c.subsections ?? []).flatMap((s) => s.entries.map((e) => ({ entry: e, chapter: c, where: (s.role ?? c.roles[0])?.where }))),
  ]);
}

/** The Entry and Chapter for a Case id; a Case always appears somewhere on the Journey. */
export function entryFor(id: string) {
  const found = allEntries().find((x) => x.entry.id === id);
  if (!found) throw new Error(`No Entry on the Journey for Case "${id}"`);
  return found;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** When a Role ended, from its period ("June to August 2024", "June 2026 to present"), as a sortable number. */
function ended(period: string) {
  const end = period.split(' to ').pop()!.trim();
  if (end === 'present') return Infinity;
  const [month, year] = end.split(' ');
  return Number(year) * 12 + MONTHS.indexOf(month);
}

/**
 * Every Role, most recent first. A Chapter can tell its roles in story order (Silicon Valley tells the
 * internship before the contract that followed it), so the résumé sorts them by when each ended.
 */
export function allRoles() {
  return chapters
    .flatMap((c) => [...c.roles, ...(c.subsections ?? []).flatMap((s) => (s.role ? [s.role] : []))])
    .sort((a, b) => ended(b.period) - ended(a.period));
}

export const kindLabels: Record<EntryKind, string> = {
  case: 'Case',
  summary: 'Summary',
  'research-in-development': 'Research in development',
};

/** The Chapter's short qualifier, e.g. "career" for "Texas: career". */
export const qualifierOf = (c: Chapter) => (c.label === c.title ? null : c.label.slice(c.title.length).replace(/^:\s*/, ''));
