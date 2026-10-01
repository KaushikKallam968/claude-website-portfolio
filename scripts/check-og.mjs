// Stops the build when a Case has no share card, so no page points at an image that is not there.
// npm runs it before every build (the "prebuild" script). To make the cards: npm run og, then commit public/og/.
import { existsSync, readdirSync } from 'node:fs';

const ids = readdirSync(new URL('../src/content/cases/', import.meta.url))
  .filter((f) => f.endsWith('.md'))
  .map((f) => f.slice(0, -3));
const missing = ids.filter((id) => !existsSync(new URL(`../public/og/${id}.png`, import.meta.url)));

if (missing.length > 0) {
  console.error(`No share card for ${missing.join(', ')}. Run "npm run og" and commit public/og/.`);
  process.exitCode = 1;
}
