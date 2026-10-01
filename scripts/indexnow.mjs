// Tells IndexNow (shared by Bing, Yandex and others) which pages the site has, from its live sitemap.
// Run it after a deploy that adds or changes pages: npm run indexnow
// SITE_URL overrides the address; the default is the site's own domain. The key is public on purpose: the
// engines fetch it from the site to see that the sender owns it.
import { readFileSync } from 'node:fs';

const keyFile = 'fefa50f43588b16143b7a231f06ad4c6.txt';
const site = (process.env.SITE_URL || 'https://www.kkportfolio.xyz').replace(/\/$/, '');
const key = readFileSync(new URL(`../public/${keyFile}`, import.meta.url), 'utf8').trim();

const sitemap = await fetch(`${site}/sitemap.xml`);
if (!sitemap.ok) throw new Error(`${site}/sitemap.xml answered ${sitemap.status}`);
const urlList = [...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: new URL(site).host, key, keyLocation: `${site}/${keyFile}`, urlList }),
});
console.log(`IndexNow answered ${res.status} for ${urlList.length} addresses.`);
// 200 and 202 are accepted; 403 means the key file could not be read at keyLocation, 422 that an address is off this host.
if (!res.ok) process.exitCode = 1;
