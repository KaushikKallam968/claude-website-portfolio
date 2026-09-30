# Publishing recommendation

**Recommendation: Vercel, with a custom domain, deployed from this GitHub repository.**

## Why Vercel

- The site is plain static output (`npm run build` → `dist/`), so any static host works. Vercel adds the two things that matter for a job search: automatic preview URLs for every branch, and deployment protection on previews so drafts aren't public.
- Your Claude account already has the Vercel connector, so creating the project and deployments can be done from a session when you're ready.
- Free tier covers this site comfortably: the home page ships about 58 KB of gzipped JavaScript, and the whole build is 1.4 MB.

Cloudflare Pages is an equally good choice if you'd rather keep DNS and hosting together at Cloudflare. GitHub Pages works too, but has no protected previews.

## Steps

1. **Resolve drafts and disclosure first.** Done: the owner confirmed the copy and cleared the employer detail on September 30, 2026.
2. **Buy a domain** such as your name, then set it as the `SITE_URL` environment variable in Vercel (for example `https://yourdomain.com`). The build uses it for canonical and social-image links and leaves those tags out when it is not set.
3. **Create the Vercel project** from `KaushikKallam968/claude-website-portfolio` (the repository's current name). Framework preset: Astro. Build command `npm run build`, output `dist`.
4. **Keep preview protection on** (Vercel Authentication for previews), and point the production domain at `main` once the branch is merged.
5. **Add a social preview image** (an Open Graph card) before sharing links on LinkedIn.
6. **Don't add analytics that contradict the site.** The notes margin says nothing leaves the visitor's browser. If you want traffic numbers, use a privacy-first, cookieless counter and update that sentence to say exactly what is counted.

## Current deployment

Deployed publicly on September 30, 2026, at the owner's request, with the copy confirmed and the Draft markers removed.

- **Live at:** https://website-nu-five-41.vercel.app (the production domain of the existing, previously empty `website` project in the owner's Vercel team). The per-deployment `*-kaushikkallam-5085s-projects.vercel.app` URLs stay behind Vercel login, as the team's protection setting intends; the production domain is public.
- **Why that project:** the Vercel connection used from Claude sessions may deploy but may not create or change projects (both return 403), so a new `kaushik-kallam` project could not be made from a session.
- **How it is deployed:** a production deployment built by Vercel from this repository's `claude/repo-cleanup-9zbcni` branch at a given commit (framework Astro, `npm ci`, `npm run build`, output `dist`, Node 22). The project is not linked to the repository, so a push does not redeploy; each update is a new deployment from a session.
- **Still open, for the owner in the Vercel dashboard:** a nicer address (rename the project and add `kaushikkallam.vercel.app` or a custom domain under Settings, Domains), the `SITE_URL` environment variable once a domain is chosen (until then the build falls back to the current address in `astro.config.mjs`, so link previews and canonical links already work), and linking the project to the repository if pushes should deploy automatically.
