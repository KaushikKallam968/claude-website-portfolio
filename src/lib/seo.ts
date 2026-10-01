/**
 * What search engines and link previews read: page titles, descriptions and the schema.org graph for each page.
 * Everything here comes from what the site already says; nothing is added for the sake of a rich result.
 */

/** The site's address: Astro's `site` (a URL) or the same as text. Only its origin is used. */
export type Site = string | URL;

export interface Contact {
  email: string;
  linkedin: string;
}

/** A Case as the Selected work list names it. */
export interface CaseRef {
  id: string;
  title: string;
}

/** What a Case page says about itself (the collection's front matter). */
export interface CaseFacts extends CaseRef {
  context: string;
  question: string;
}

type Node = Record<string, unknown>;

const NAME = 'Kaushik Kallam';
const GITHUB = 'https://github.com/KaushikKallam968';

export const homeDescription = 'Kaushik Kallam, Senior Quantitative UX Researcher at JPMorganChase in New York. Research on behavior, instrumentation, AI evaluation and learning products.';

/** A Case page's title says "Case study" when the whole still fits in a search result (about 65 characters). */
export function caseTitle(title: string): string {
  const full = `${title} · Case study · ${NAME}`;
  return full.length <= 65 ? full : `${title} · ${NAME}`;
}

/** The question is the description; the byline follows it when the whole stays within 160 characters. */
export function caseDescription(question: string): string {
  const full = `${question} A case study by ${NAME}.`;
  return full.length <= 160 ? full : question;
}

const home = (site: Site) => new URL('/', site).href;
const at = (site: Site, path: string) => new URL(path, site).href;

export const personId = (site: Site) => `${home(site)}#person`;
export const websiteId = (site: Site) => `${home(site)}#website`;

const personRef = (site: Site) => ({ '@id': personId(site) });
const websiteRef = (site: Site) => ({ '@id': websiteId(site) });

/** Trails run from the home page down to the page itself. */
function breadcrumb(site: Site, trail: [name: string, path: string][]): Node {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [[NAME, '/'] as [string, string], ...trail].map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: at(site, path) })),
  };
}

/** Terms as the home page and the résumé's Methods line word them. */
const knowsAbout = [
  'Instrumentation and behavioral data',
  'AI evaluation',
  'Research design',
  'Surveys',
  'Interviews',
  'Usability testing',
  'Concept testing',
  'Mixed methods',
];

function person(site: Site, { email, linkedin }: Contact): Node {
  return {
    '@type': 'Person',
    '@id': personId(site),
    name: NAME,
    givenName: 'Kaushik',
    familyName: 'Kallam',
    jobTitle: 'Senior Quantitative UX Researcher',
    worksFor: { '@type': 'Organization', name: 'JPMorganChase' },
    workLocation: { '@type': 'PostalAddress', addressLocality: 'New York', addressRegion: 'NY', addressCountry: 'US' },
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'The University of Texas at Dallas' },
    url: home(site),
    email: `mailto:${email}`,
    sameAs: [linkedin, GITHUB],
    knowsAbout,
  };
}

/** The home page defines the website and the person; every other page points at their ids. */
export function homeSchema(site: Site, title: string, contact: Contact): Node[] {
  return [
    { '@type': 'WebSite', '@id': websiteId(site), url: home(site), name: NAME, inLanguage: 'en', publisher: personRef(site), author: personRef(site) },
    { '@type': 'ProfilePage', url: home(site), name: title, isPartOf: websiteRef(site), mainEntity: person(site, contact) },
  ];
}

/** Cases come in the order Selected work shows them. */
export function workSchema(site: Site, title: string, cases: CaseRef[]): Node[] {
  return [
    { '@type': 'CollectionPage', url: at(site, '/work/'), name: title, isPartOf: websiteRef(site), about: personRef(site) },
    {
      '@type': 'ItemList',
      itemListElement: cases.map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: at(site, `/work/${c.id}/`), name: c.title })),
    },
    breadcrumb(site, [['Selected work', '/work/']]),
  ];
}

/** A Case is about the organisation its context opens with. watched. opens with a role ("Cofounder"), so it is about itself. */
function caseAbout({ context, title }: CaseFacts): Node {
  const lead = context.split(' · ')[0];
  return lead === 'Cofounder' ? { '@type': 'Thing', name: title } : { '@type': 'Organization', name: lead };
}

export function caseSchema(site: Site, c: CaseFacts): Node[] {
  const url = at(site, `/work/${c.id}/`);
  return [
    {
      '@type': 'Article',
      headline: c.title,
      description: c.question,
      url,
      mainEntityOfPage: url,
      author: { '@type': 'Person', '@id': personId(site), name: NAME },
      isPartOf: websiteRef(site),
      inLanguage: 'en',
      about: caseAbout(c),
    },
    breadcrumb(site, [['Selected work', '/work/'], [c.title, `/work/${c.id}/`]]),
  ];
}

export function resumeSchema(site: Site, title: string): Node[] {
  return [
    { '@type': 'WebPage', url: at(site, '/resume/'), name: title, about: personRef(site), isPartOf: websiteRef(site) },
    breadcrumb(site, [['Résumé', '/resume/']]),
  ];
}

/** One JSON-LD document for a script tag. `<` is escaped so no value can close the tag. */
export function serializeGraph(nodes: Node[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes }).replace(/</g, '\\u003c');
}
