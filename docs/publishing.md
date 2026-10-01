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
4. **Keep preview protection on** (Vercel Authentication for previews), and point the production domain at `main` once the branch is merged.
5. **Keep the social preview image current.** The Open Graph card is `public/og.png` (1200 by 630), already linked from every page. If you redraw it, change its alt text in `src/layouts/Base.astro` to match.
6. **Don't add analytics that contradict the site.** The notes margin says nothing leaves the visitor's browser. If you want traffic numbers, use a privacy-first, cookieless counter and update that sentence to say exactly what is counted.

## Current deployment

Deployed publicly on September 30, 2026, at the owner's request, with the copy confirmed and the Draft markers removed.

- **Live at:** https://www.kkportfolio.xyz, the owner's domain, bought through Vercel on October 1, 2026 (`www` is primary; the bare `kkportfolio.xyz` redirects to it). It belongs to the `website` project in the owner's Vercel team, whose first address, https://website-nu-five-41.vercel.app, still serves the site. The per-deployment `*-kaushikkallam-5085s-projects.vercel.app` URLs stay behind Vercel login, as the team's protection setting intends; the production domain is public.
- **Why that project:** the Vercel connection used from Claude sessions may deploy but may not create or change projects (both return 403), so a new `kaushik-kallam` project could not be made from a session.
- **How it is deployed:** the project is linked to this repository (owner, October 1, 2026). Production is built from `master`: work happens on a branch (each push builds a preview behind Vercel login), is verified, then `master` is moved to it and the push deploys the live site. The build is pinned in the repository (`vercel.json`: framework Astro, `npm ci`, `npm run build`, output `dist`; `package.json` engines: Node 22), so every build matches.
- **Still open, for the owner in the Vercel dashboard:** redirect the old `website-nu-five-41.vercel.app` to `www.kkportfolio.xyz` (Settings, Domains, Edit, Redirect to, 308), so the site has one address. The canonical links already name the new domain, so search engines prefer it either way.
