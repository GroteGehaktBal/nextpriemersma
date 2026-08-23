/**
 * Renders scripts/og-card.html to public/og.png.
 *
 * A one-off tool, not part of the build: the card changes when the design or the
 * headline changes, which is rarely, and keeping it out of the build is what
 * lets the whole site export as static files. Playwright is not a dependency of
 * this project — run this with a globally installed one:
 *
 *   node scripts/generate-og.mjs
 *
 * If `playwright` is not resolvable, install it globally first
 * (`npm i -g playwright`) or run the file with NODE_PATH pointing at a copy.
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const source = path.join(here, 'og-card.html');
const output = path.join(here, '..', 'public', 'og.png');

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});

await page.goto(`file://${source}`);
// Waits for the webfont and the portrait, so neither can be missing from the PNG.
await page.evaluate(() => document.fonts.ready);
await page.waitForLoadState('networkidle');
await page.screenshot({ path: output });

await browser.close();
console.log(`wrote ${output}`);
