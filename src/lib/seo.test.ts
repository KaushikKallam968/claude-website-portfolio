import { describe, expect, it } from 'vitest';
import { caseDescription, caseSchema, caseTitle, homeDescription, homeSchema, llmsText, personId, resumeSchema, serializeGraph, websiteId, workSchema } from './seo';

const site = 'https://www.kkportfolio.xyz';
const contact = { email: 'kaushik.kallam@gmail.com', linkedin: 'https://www.linkedin.com/in/kaushikkallam/' };
const person = { '@id': 'https://www.kkportfolio.xyz/#person' };
const website = { '@id': 'https://www.kkportfolio.xyz/#website' };

describe('case titles', () => {
  it('names the page a case study when that fits in 65 characters', () => {
    expect(caseTitle('Chegg Discord')).toBe('Chegg Discord · Case study · Kaushik Kallam');
    expect(caseTitle('watched.')).toBe('watched. · Case study · Kaushik Kallam');
  });

  it('drops "Case study" when the full form would be longer than 65', () => {
    expect(caseTitle('Data Instrumentation Coverage and Quality')).toBe('Data Instrumentation Coverage and Quality · Kaushik Kallam');
  });

  it('keeps the full form at exactly 65 characters and drops it at 66', () => {
    const at65 = 'Ad creative and attributes research';
    const at66 = 'Ad creative and attributes research.';
    expect(at65).toHaveLength(35);
    expect(at66).toHaveLength(36);
    expect(caseTitle(at65)).toBe('Ad creative and attributes research · Case study · Kaushik Kallam');
    expect(caseTitle(at66)).toBe('Ad creative and attributes research. · Kaushik Kallam');
  });
});

describe('case descriptions', () => {
  it('adds the byline after the question when the whole fits in 160 characters', () => {
    expect(caseDescription('What did localizing a learning product for students in Mexico require beyond translation?')).toBe(
      'What did localizing a learning product for students in Mexico require beyond translation? A case study by Kaushik Kallam.',
    );
  });

  it('gives the question alone when the byline would pass 160', () => {
    const question = 'Could academic support fit into the way students already study together on Discord, and which AI-assisted capabilities were ready to develop further?';
    expect(caseDescription(question)).toBe(question);
  });

  it('keeps the byline at exactly 160 characters and drops it at 161', () => {
    const at160 = `${'a'.repeat(127)}?`;
    const at161 = `${'a'.repeat(128)}?`;
    expect(caseDescription(at160)).toBe(`${'a'.repeat(127)}? A case study by Kaushik Kallam.`);
    expect(caseDescription(at161)).toBe(at161);
  });
});

describe('the home description', () => {
  it('is the sentence the site gives, within what a search result shows', () => {
    expect(homeDescription).toBe('Kaushik Kallam, Senior Quantitative UX Researcher at JPMorganChase in New York. Research on behavior, instrumentation, AI evaluation and learning products.');
    expect(homeDescription).toHaveLength(155);
  });
});

describe('stable ids', () => {
  it('hang off the site address, with or without a trailing slash or as a URL', () => {
    expect(personId('https://www.kkportfolio.xyz')).toBe('https://www.kkportfolio.xyz/#person');
    expect(personId('https://www.kkportfolio.xyz/')).toBe('https://www.kkportfolio.xyz/#person');
    expect(personId(new URL('https://www.kkportfolio.xyz'))).toBe('https://www.kkportfolio.xyz/#person');
    expect(websiteId('https://www.kkportfolio.xyz/')).toBe('https://www.kkportfolio.xyz/#website');
  });
});

describe('serialising the graph', () => {
  it('wraps the nodes in one context and graph', () => {
    expect(serializeGraph([{ '@type': 'WebPage', name: 'Home' }])).toBe('{"@context":"https://schema.org","@graph":[{"@type":"WebPage","name":"Home"}]}');
  });

  it('escapes < so no value can close the script tag, and the JSON still reads back whole', () => {
    const out = serializeGraph([{ name: '</script><b>x' }]);
    expect(out).toBe('{"@context":"https://schema.org","@graph":[{"name":"\\u003c/script>\\u003cb>x"}]}');
    expect(out).not.toContain('<');
    expect(JSON.parse(out)['@graph'][0].name).toBe('</script><b>x');
  });
});

describe('the home page graph', () => {
  const graph = homeSchema(site, 'Kaushik Kallam · Senior Quantitative UX Researcher', contact);

  it('is the website and a profile page whose main entity is the full person', () => {
    expect(graph).toEqual([
      {
        '@type': 'WebSite',
        '@id': 'https://www.kkportfolio.xyz/#website',
        url: 'https://www.kkportfolio.xyz/',
        name: 'Kaushik Kallam',
        inLanguage: 'en',
        publisher: person,
        author: person,
      },
      {
        '@type': 'ProfilePage',
        url: 'https://www.kkportfolio.xyz/',
        name: 'Kaushik Kallam · Senior Quantitative UX Researcher',
        isPartOf: website,
        mainEntity: {
          '@type': 'Person',
          '@id': 'https://www.kkportfolio.xyz/#person',
          name: 'Kaushik Kallam',
          givenName: 'Kaushik',
          familyName: 'Kallam',
          jobTitle: 'Senior Quantitative UX Researcher',
          worksFor: { '@type': 'Organization', name: 'JPMorganChase' },
          workLocation: { '@type': 'PostalAddress', addressLocality: 'New York', addressRegion: 'NY', addressCountry: 'US' },
          alumniOf: { '@type': 'CollegeOrUniversity', name: 'The University of Texas at Dallas' },
          url: 'https://www.kkportfolio.xyz/',
          email: 'mailto:kaushik.kallam@gmail.com',
          sameAs: ['https://www.linkedin.com/in/kaushikkallam/', 'https://github.com/KaushikKallam968'],
          knowsAbout: [
            'Instrumentation and behavioral data',
            'AI evaluation',
            'Research design',
            'Surveys',
            'Interviews',
            'Usability testing',
            'Concept testing',
            'Mixed methods',
          ],
        },
      },
    ]);
  });
});

describe('the Selected work graph', () => {
  const graph = workSchema(
    site,
    'Selected work · Research case studies · Kaushik Kallam',
    [
      { id: 'instrumentation', title: 'Data Instrumentation Coverage and Quality' },
      { id: 'chegg-discord', title: 'Chegg Discord' },
    ],
  );

  it('is a collection page, the cases in the order given, and the breadcrumb', () => {
    expect(graph).toEqual([
      {
        '@type': 'CollectionPage',
        url: 'https://www.kkportfolio.xyz/work/',
        name: 'Selected work · Research case studies · Kaushik Kallam',
        isPartOf: website,
        about: person,
      },
      {
        '@type': 'ItemList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, url: 'https://www.kkportfolio.xyz/work/instrumentation/', name: 'Data Instrumentation Coverage and Quality' },
          { '@type': 'ListItem', position: 2, url: 'https://www.kkportfolio.xyz/work/chegg-discord/', name: 'Chegg Discord' },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Kaushik Kallam', item: 'https://www.kkportfolio.xyz/' },
          { '@type': 'ListItem', position: 2, name: 'Selected work', item: 'https://www.kkportfolio.xyz/work/' },
        ],
      },
    ]);
  });
});

describe('a Case graph', () => {
  it('is an article by the person, about the organisation in its context, and the breadcrumb', () => {
    const graph = caseSchema(site, {
      id: 'chegg-mexico',
      title: 'Chegg Mexico',
      context: 'Chegg · Mixed-methods localization research',
      question: 'What did localizing a learning product for students in Mexico require beyond translation?',
    });
    expect(graph).toEqual([
      {
        '@type': 'Article',
        headline: 'Chegg Mexico',
        description: 'What did localizing a learning product for students in Mexico require beyond translation?',
        url: 'https://www.kkportfolio.xyz/work/chegg-mexico/',
        mainEntityOfPage: 'https://www.kkportfolio.xyz/work/chegg-mexico/',
        author: { '@type': 'Person', '@id': 'https://www.kkportfolio.xyz/#person', name: 'Kaushik Kallam' },
        isPartOf: website,
        inLanguage: 'en',
        about: { '@type': 'Organization', name: 'Chegg' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Kaushik Kallam', item: 'https://www.kkportfolio.xyz/' },
          { '@type': 'ListItem', position: 2, name: 'Selected work', item: 'https://www.kkportfolio.xyz/work/' },
          { '@type': 'ListItem', position: 3, name: 'Chegg Mexico', item: 'https://www.kkportfolio.xyz/work/chegg-mexico/' },
        ],
      },
    ]);
  });

  it('takes the whole text before the first " · " as the organisation', () => {
    const graph = caseSchema(site, { id: 'instrumentation', title: 'Data Instrumentation Coverage and Quality', context: 'JPMorganChase · Payments', question: 'Q?' });
    expect(graph[0]).toMatchObject({ about: { '@type': 'Organization', name: 'JPMorganChase' } });
    const inspire = caseSchema(site, { id: 'inspire-ad-creative', title: 'Inspire Brands Ad Creative', context: 'Inspire Brands · Quantitative advertising research', question: 'Q?' });
    expect(inspire[0]).toMatchObject({ about: { '@type': 'Organization', name: 'Inspire Brands' } });
  });

  it('is about the project itself when the context opens with a role, not an organisation (watched.)', () => {
    const graph = caseSchema(site, { id: 'watched', title: 'watched.', context: 'Cofounder · Personal project', question: 'Q?' });
    expect(graph[0]).toMatchObject({ about: { '@type': 'Thing', name: 'watched.' } });
  });
});

describe('the résumé graph', () => {
  it('is a web page about the person, and the breadcrumb', () => {
    expect(resumeSchema(site, 'Résumé · Kaushik Kallam, Senior Quantitative UX Researcher')).toEqual([
      {
        '@type': 'WebPage',
        url: 'https://www.kkportfolio.xyz/resume/',
        name: 'Résumé · Kaushik Kallam, Senior Quantitative UX Researcher',
        about: person,
        isPartOf: website,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Kaushik Kallam', item: 'https://www.kkportfolio.xyz/' },
          { '@type': 'ListItem', position: 2, name: 'Résumé', item: 'https://www.kkportfolio.xyz/resume/' },
        ],
      },
    ]);
  });
});

describe('llms.txt', () => {
  const cases = [
    { id: 'instrumentation', title: 'Data Instrumentation Coverage and Quality', question: 'When a product records an interaction, does that record actually explain what the person did?' },
    { id: 'chegg-discord', title: 'Chegg Discord', question: 'Could academic support fit into the way students already study together on Discord?' },
  ];

  it('introduces the person, lists each Case in the order given with its question, then the pages and the contact', () => {
    expect(llmsText(site, cases, contact)).toBe(`# Kaushik Kallam

> Kaushik Kallam, Senior Quantitative UX Researcher at JPMorganChase in New York. Research on behavior, instrumentation, AI evaluation and learning products.

Role: Senior Quantitative UX Researcher at JPMorganChase, New York. Education: MS in Applied Cognition and Neuroscience and BS in Neuroscience and Psychology, University of Texas at Dallas.

## Case studies

- [Data Instrumentation Coverage and Quality](https://www.kkportfolio.xyz/work/instrumentation/): When a product records an interaction, does that record actually explain what the person did?
- [Chegg Discord](https://www.kkportfolio.xyz/work/chegg-discord/): Could academic support fit into the way students already study together on Discord?

## Pages

- [Selected work](https://www.kkportfolio.xyz/work/)
- [Résumé](https://www.kkportfolio.xyz/resume/)

## Contact

- [LinkedIn](https://www.linkedin.com/in/kaushikkallam/)
`);
  });

  it('lists a new Case without any other change, and uses the site as given', () => {
    const text = llmsText('https://example.com/', [{ id: 'new-case', title: 'New case', question: 'Why?' }], contact);
    expect(text).toContain('- [New case](https://example.com/work/new-case/): Why?\n');
    expect(text).toContain('- [Selected work](https://example.com/work/)\n');
  });

  it('contains no em dash', () => {
    expect(llmsText(site, cases, contact)).not.toContain('\u2014');
  });
});

describe('every graph', () => {
  it('builds addresses from the origin even when the site is given with a trailing slash', () => {
    const graph = resumeSchema('https://www.kkportfolio.xyz/', 'R');
    expect(graph[0]).toMatchObject({ url: 'https://www.kkportfolio.xyz/resume/', about: person });
  });

  it('contains no em dash', () => {
    const all = [
      ...homeSchema(site, 'Kaushik Kallam · Senior Quantitative UX Researcher', contact),
      ...workSchema(site, 'Selected work · Research case studies · Kaushik Kallam', [{ id: 'chegg-discord', title: 'Chegg Discord' }]),
      ...caseSchema(site, { id: 'watched', title: 'watched.', context: 'Cofounder · Personal project', question: 'Q?' }),
      ...resumeSchema(site, 'Résumé · Kaushik Kallam, Senior Quantitative UX Researcher'),
    ];
    expect(JSON.stringify(all)).not.toContain('\u2014');
  });
});
