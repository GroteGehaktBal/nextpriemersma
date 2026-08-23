/**
 * Checks that the static export is complete and internally consistent.
 *
 * Run after `npm run build:static`:
 *
 *   npm run build:static && npm run check:export
 *
 * The point is the migration to Cloudflare Pages. Serving `out/` is not the same
 * as serving the site through Next: there is no proxy, no route handlers, and
 * nothing that resolves a URL at request time — a path either corresponds to a
 * file on disk or it is a 404. Three things can silently break in that move, and
 * this checks all three:
 *
 *  1. A page that was never emitted. `out/index.html` in particular does not
 *     exist, which is why `_redirects` has to send the bare domain somewhere.
 *  2. An internal link that resolves through Next's routing but not through a
 *     filesystem — a link to `/en/work/x` when the file is `en/work/x.html`.
 *  3. A redirect rule pointing at a page that no longer exists, which turns a
 *     recovered URL back into a 404 without anyone noticing.
 */

import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const OUT = 'out';

/** Pages that must exist for the site to be servable at all. */
const REQUIRED = [
  'en.html',
  'nl.html',
  'en/about.html',
  'nl/about.html',
  'en/work.html',
  'nl/work.html',
  '404.html',
  'robots.txt',
  'sitemap.xml',
  'og.png',
  '_redirects',
];

const problems = [];

async function exists(relative) {
  try {
    await access(path.join(OUT, relative));
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolves a site path the way a static host does.
 *
 * Cloudflare Pages serves `/en/about` from `en/about.html` and `/images/x.jpg`
 * from the file of that name. Anything with a fragment or a query string is
 * trimmed first; anything that is not a path at all is skipped by the caller.
 */
async function resolves(url) {
  const clean = url.split('#')[0].split('?')[0].replace(/^\//, '').replace(/\/$/, '');

  if (clean === '') return exists('index.html');

  return (
    (await exists(clean)) || (await exists(`${clean}.html`)) || (await exists(`${clean}/index.html`))
  );
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const full = path.join(directory, entry.name);
      return entry.isDirectory() ? walk(full) : Promise.resolve([full]);
    })
  );
  return nested.flat();
}

// 1. Everything the site cannot do without.
for (const file of REQUIRED) {
  if (!(await exists(file))) problems.push(`missing from the export: ${file}`);
}

// The case studies, both languages, read from the source of truth rather than a
// list that would have to be maintained here.
for (const locale of ['en', 'nl']) {
  const slugs = (await readdir(path.join('src', 'app', '[locale]', 'work', 'projects', locale)))
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => path.basename(file, '.mdx'));

  for (const slug of slugs) {
    const page = `${locale}/work/${slug}.html`;
    if (!(await exists(page))) problems.push(`missing case study: ${page}`);
  }
}

// 2. Every internal link in every emitted page.
const pages = (await walk(OUT)).filter((file) => file.endsWith('.html'));
const links = new Map();

for (const page of pages) {
  const html = await readFile(page, 'utf-8');
  for (const match of html.matchAll(/href="(\/[^"]*)"/g)) {
    const href = match[1];
    if (href.startsWith('/_next/')) continue;
    if (!links.has(href)) links.set(href, path.relative(OUT, page));
  }
}

for (const [href, page] of links) {
  if (!(await resolves(href))) problems.push(`dead link ${href} (in ${page})`);
}

// 3. Every redirect destination.
const redirects = (await readFile(path.join(OUT, '_redirects'), 'utf-8'))
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'))
  .map((line) => line.split(/\s+/));

for (const [from, to] of redirects) {
  // A destination with a placeholder cannot be checked without knowing the
  // source URL, so the check is that the branch it lands in exists at all.
  const target = to.replace('/:splat', '');
  if (!(await resolves(target))) problems.push(`redirect ${from} points at ${to}, which is not there`);
}

console.log(
  `checked ${pages.length} pages, ${links.size} internal links, ${redirects.length} redirect rules`
);

if (problems.length > 0) {
  console.error(`\n${problems.length} problem${problems.length === 1 ? '' : 's'}:`);
  for (const problem of problems) console.error(`  ${problem}`);
  console.error('\nThis export would not serve correctly on a static host.');
  process.exit(1);
}

console.log('The export is complete and every link and redirect resolves.');
