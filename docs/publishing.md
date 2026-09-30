# Publishing recommendation

**Recommendation: Vercel, with a custom domain, deployed from this GitHub repository.**

## Why Vercel

- The site is plain static output (`npm run build` → `dist/`), so any static host works. Vercel adds the two things that matter for a job search: automatic preview URLs for every branch, and deployment protection on previews so drafts aren't public.
- Your Claude account already has the Vercel connector, so creating the project and deployments can be done from a session when you're ready.
- Free tier covers this site comfortably: the home page ships about 58 KB of gzipped JavaScript, and the whole build is 1.4 MB.

Cloudflare Pages is an equally good choice if you'd rather keep DNS and hosting together at Cloudflare. GitHub Pages works too, but has no protected previews.

## Steps

1. **Resolve drafts and disclosure first.** Every Case is marked DRAFT. Confirm the copy, and decide what JPMorganChase and Chegg detail is cleared for a public page. If employer detail is not cleared, keep the Cases' research questions public and protect the bodies (research on researcher portfolios shows password-protected cases with public questions are common and accepted).
2. **Buy a domain** such as your name, then set it as the `SITE_URL` environment variable in Vercel (for example `https://yourdomain.com`). The build uses it for canonical and social-image links and leaves those tags out when it is not set.
3. **Create the Vercel project** from `KaushikKallam968/claude-website-portfolio` (the repository's current name). Framework preset: Astro. Build command `npm run build`, output `dist`.
4. **Keep preview protection on** (Vercel Authentication for previews), and point the production domain at `main` once the branch is merged.
5. **Add a social preview image** (an Open Graph card) before sharing links on LinkedIn.
6. **Don't add analytics that contradict the site.** The notes margin says nothing leaves the visitor's browser. If you want traffic numbers, use a privacy-first, cookieless counter and update that sentence to say exactly what is counted.

Nothing has been deployed. Deployment needs your explicit go-ahead.
