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
 *  4. A page that starts loading something from another origin. `public/_headers`
 *     tells browsers that everything comes from this site; the moment that stops
 *     being true, the browser enforces the header rather than the intention, and
 *     the page breaks in production and nowhere else.
 */

import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const OUT = 'out';

/**
 * Pages that must exist for the site to be servable at all.
 *
 * `contact/thanks` is on this list for a reason the others are not: nothing
 * links to it. It is reached only by the redirect the contact Function answers
 * with, so the link check below can never notice its absence — and the way that
 * would surface is a visitor pressing Send and landing on a 404, having already
 * sent the message.
 */
const REQUIRED = [
  'en.html',
  'nl.html',
  'en/about.html',
  'nl/about.html',
  'en/work.html',
  'nl/work.html',
  'en/contact.html',
  'nl/contact.html',
  'en/contact/thanks.html',
  'nl/contact/thanks.html',
  '404.html',
  'robots.txt',
  'sitemap.xml',
  'og.png',
  '_redirects',
  '_headers',
];

/** The site's own origin, as the canonical tags and the sitemap write it. */
const ORIGIN = 'https://priemersma.nl';

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

// 4. What the pages load, against what the headers say they load.
//
// Only the resources a browser fetches and executes or renders are checked. An
// `<a href>` to GitHub is a link, not a load, and no policy here restricts one.
const headers = await readFile(path.join(OUT, '_headers'), 'utf-8');
const policy = /^\s*Content-Security-Policy:\s*(.+)$/m.exec(headers)?.[1] ?? '';

if (policy === '') {
  problems.push('_headers carries no Content-Security-Policy');
} else if (!policy.includes("default-src 'self'")) {
  // The check below is only meaningful while this is what the policy claims.
  problems.push("the Content-Security-Policy no longer says default-src 'self'");
}

const LOADS = [
  /<script[^>]+src="([^"]+)"/g,
  /<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g,
  /<img[^>]+src="([^"]+)"/g,
  /<img[^>]+srcset="([^"]+)"/g,
  /<(?:iframe|embed|object)[^>]+(?:src|data)="([^"]+)"/g,
];

/** Whether a URL a page loads would survive `default-src 'self'`. */
function sameOrigin(url) {
  if (!/^[a-z][a-z0-9+.-]*:/i.test(url)) return true; // relative
  return url.startsWith(`${ORIGIN}/`) || url === ORIGIN;
}

const foreign = new Map();

for (const page of pages) {
  const html = await readFile(page, 'utf-8');

  for (const pattern of LOADS) {
    for (const match of html.matchAll(pattern)) {
      for (const url of match[1].split(',').map((part) => part.trim().split(/\s+/)[0])) {
        if (url !== '' && !sameOrigin(url)) foreign.set(url, path.relative(OUT, page));
      }
    }
  }
}

// Stylesheets can pull in a font or an image of their own.
for (const stylesheet of (await walk(OUT)).filter((file) => file.endsWith('.css'))) {
  const css = await readFile(stylesheet, 'utf-8');
  for (const match of css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
    const url = match[1];
    if (!url.startsWith('data:') && !sameOrigin(url)) {
      foreign.set(url, path.relative(OUT, stylesheet));
    }
  }
}

for (const [url, source] of foreign) {
  problems.push(`${source} loads ${url} from another origin, which the CSP blocks`);
}

console.log(
  `checked ${pages.length} pages, ${links.size} internal links, ` +
    `${redirects.length} redirect rules, and every resource they load`
);

if (problems.length > 0) {
  console.error(`\n${problems.length} problem${problems.length === 1 ? '' : 's'}:`);
  for (const problem of problems) console.error(`  ${problem}`);
  console.error('\nThis export would not serve correctly on a static host.');
  process.exit(1);
}

console.log('The export is complete and every link and redirect resolves.');
