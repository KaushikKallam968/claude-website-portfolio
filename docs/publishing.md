# Publishing recommendation

**Recommendation: Vercel, with a custom domain, deployed from this GitHub repository.**

## Why Vercel

- The site is plain static output (`npm run build` → `dist/`), so any static host works. Vercel adds the two things that matter for a job search: automatic preview URLs for every branch, and deployment protection on previews so drafts aren't public.
- Your Claude account already has the Vercel connector, so creating the project and deployments can be done from a session when you're ready.
- Free tier covers this site comfortably: the home page ships about 58 KB of gzipped JavaScript, and the whole build is 1.4 MB.

Cloudflare Pages is an equally good choice if you'd rather keep DNS and hosting together at Cloudflare. GitHub Pages works too, but has no protected previews.

## Steps

1. **Resolve drafts and disclosure first.** Done: the owner confirmed the copy and cleared the employer detail on September 30, 2026.
2. **Buy a domain** such as your name, then set it as the `SITE_URL` environment variable in Vercel (for example `https://yourdomain.com`). The build uses it for the canonical link, `og:url`, the social-image link, `robots.txt` and `sitemap.xml`. When it is not set, the build falls back to the current address in `astro.config.mjs`, so those tags and files are always written.
3. **Create the Vercel project** from `KaushikKallam968/claude-website-portfolio` (the repository's current name). Framework preset: Astro. Build command `npm run build`, output `dist`.
4. **Keep preview protection on** (Vercel Authentication for previews), and build production from `master`.
5. **Keep the social preview image current.** The Open Graph card is `public/og.png` (1200 by 630), already linked from every page except the Cases, which have their own (see Search). If you redraw it, change its alt text in `src/layouts/Base.astro` to match.
6. **Don't add analytics that contradict the site.** The notes margin says nothing leaves the visitor's browser. If you want traffic numbers, use a privacy-first, cookieless counter and update that sentence to say exactly what is counted.

## Current deployment

Deployed publicly on September 30, 2026, at the owner's request, with the copy confirmed and the Draft markers removed.

- **Live at:** https://www.kkportfolio.xyz, the owner's domain, bought through Vercel on October 1, 2026 (`www` is primary; the bare `kkportfolio.xyz` redirects to it). It belongs to the `website` project in the owner's Vercel team, whose first address, https://website-nu-five-41.vercel.app, still serves the site. The per-deployment `*-kaushikkallam-5085s-projects.vercel.app` URLs stay behind Vercel login, as the team's protection setting intends; the production domain is public.
- **Why that project:** the Vercel connection used from Claude sessions may deploy but may not create or change projects (both return 403), so a new `kaushik-kallam` project could not be made from a session.
- **How it is deployed:** the project is linked to this repository (owner, October 1, 2026). Production is built from `master`: work happens on a branch (each push builds a preview behind Vercel login), is verified, then `master` is moved to it and that commit is deployed to production. Until the project's production branch is set to `master` (below), a push to `master` builds only a preview, so the production build is started from a session with the Vercel connector, from the same commit. The build is pinned in the repository (`vercel.json`: framework Astro, `npm ci`, `npm run build`, output `dist`; `package.json` engines: Node 22), so every build matches.
- **Still open, for the owner in the Vercel dashboard:**
  - Set the production branch to `master` (Settings, Environments, Production, Branch Tracking), so a push to `master` deploys the live site by itself. On October 1, 2026, a push to `master` built only a preview.
  - Redirect the old `website-nu-five-41.vercel.app` to `www.kkportfolio.xyz` (Settings, Domains, Edit, Redirect to, 308), so the site has one address. The canonical links already name the new domain, so search engines prefer it either way.

## Search

**In place** (all of it from what the site already says; no portrait, no invented dates):

- **One address per page.** Every page has a canonical link and an `og:url`; `sitemap.xml` lists the Home page, Selected work, each Case and the résumé; `robots.txt` allows everything and names the sitemap. The 404 is `noindex` and left out. `trailingSlash: true` in `vercel.json` makes `/work` redirect to `/work/`.
- **Titles and descriptions** (`src/lib/seo.ts`). A Case's title reads "Case · Case study · Kaushik Kallam" and drops "Case study" when the whole would pass 65 characters. Its description is its question plus "A case study by Kaushik Kallam." when that stays within 160 characters. The home description is 155.
- **JSON-LD**, one script per page, built in `src/lib/seo.ts`. The person and the website have stable ids (`https://www.kkportfolio.xyz/#person`, `#website`), defined on the Home page and pointed at by the rest.
  - Home: WebSite, ProfilePage (its main entity is the Person).
  - Selected work: CollectionPage, ItemList (the Cases in order), BreadcrumbList.
  - Each Case: Article, BreadcrumbList.
  - Résumé: WebPage, BreadcrumbList.
  - 404: none.
- **Link previews.** The Home page is an `og:type` of profile and each Case an article, with the author named; the card image is `public/og.png`, or a Case's own card (next bullet).
- **Case share cards.** Each Case has its own 1200 by 630 card at `public/og/<case id>.png`, drawn in the style of `public/og.png` from the Case's context, title and question by `scripts/build-og.mjs`. It is that page's `og:image` and the Article's `image`, and its alt text (`caseCardAlt` in `src/lib/seo.ts`) says in words what the card shows. After changing a Case's title, context or question, run `npm run og` and commit the PNGs. It needs a Chromium (`CHROME_PATH`, default `/opt/pw-browsers/chromium`; `playwright-core` downloads none) and refuses to draw a card whose text would overflow. A Case with no card fails `npm run build`.
- **`/favicon.ico`** (16, 32 and 48 px, drawn from `favicon.svg`), which browsers and crawlers ask for whatever the page says.
- **`/llms.txt`**, a plain-text guide for AI search engines. It lists the Cases from the collection, so a new Case appears without an edit.
- **IndexNow** (Bing and others share it). `public/fefa50f43588b16143b7a231f06ad4c6.txt` holds the key; it is public by design, since the engines fetch it to check the sender owns the site. After a deploy that adds or changes pages, run `npm run indexnow`: it reads the live `sitemap.xml` and submits its addresses. The domain has to resolve first (open https://www.kkportfolio.xyz/ and check), because the script reads the live sitemap and the engines read the key from it.

**Still open, for the owner:**

1. **Google Search Console.** At search.google.com/search-console choose Add property, then Domain, and enter `kkportfolio.xyz`. It gives a TXT record: in Vercel open Domains, `kkportfolio.xyz`, DNS Records, and add it (type TXT, name `@`). Back in Search Console press Verify, then open Sitemaps and submit `https://www.kkportfolio.xyz/sitemap.xml`.
2. **Bing Webmaster Tools.** Sign in at bing.com/webmasters and use Import to bring the site over from Search Console.
3. **LinkedIn.** Open your profile, choose Contact info under your name, then the pencil, and add `https://www.kkportfolio.xyz` as a Website. Also add it as a Featured link (Featured, the plus, Add a link).
4. **GitHub.** On the repository's page, the gear beside About: set Website to `https://www.kkportfolio.xyz`. On github.com, your profile picture, Your profile, Edit profile: set the Website there too.
