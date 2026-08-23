/**
 * Fails the build when a page outgrows its budget.
 *
 * Measures what a browser downloads for one page: the gzipped HTML, plus every
 * stylesheet and script that page's own markup references. The numbers come out
 * of the prerendered HTML rather than a build manifest, because the markup is
 * the thing the browser actually reads — and because manifest formats change
 * between Next releases while `<script src>` does not.
 *
 * Run it after `next build`:
 *
 *   npm run build && npm run size
 *
 * The JavaScript ceiling is generous next to what the site ships today, and
 * deliberately so: nearly all of that JavaScript is the React and App Router
 * runtime rather than anything this repository wrote. The number worth watching
 * is the gap between the two. If it starts closing, something has begun sending
 * components to the browser that do not need to be there.
 */

import { createReadStream } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { createGzip } from 'node:zlib';
import { pipeline } from 'node:stream/promises';

const APP = path.join('.next', 'server', 'app');
const ASSETS = '.next';

/**
 * Gzipped kilobytes.
 *
 * `js` is not a page's whole JavaScript payload: it is the part that belongs to
 * that page alone, once the chunks every page loads are taken out. That shared
 * baseline is the React and App Router runtime, which no amount of care in this
 * repository shrinks, and which a framework upgrade legitimately moves. Gating
 * on it would mean every Next release failing CI for reasons nobody here can
 * fix, so it gets its own loose ceiling — enough to catch a runaway, not enough
 * to punish an upgrade — while the tight budget sits on the part this codebase
 * actually decides.
 */
const BUDGET = { html: 12, css: 10, js: 10 };

/** Gzipped kilobytes for the runtime every page shares. */
const BASELINE_BUDGET = 200;

const sizes = new Map();

async function gzippedSize(file) {
  if (sizes.has(file)) return sizes.get(file);

  let bytes = 0;
  await pipeline(createReadStream(file), createGzip(), async function* (source) {
    for await (const chunk of source) bytes += chunk.length;
  });

  sizes.set(file, bytes);
  return bytes;
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

/** Every `/_next/...` asset of one kind referenced by a page's markup. */
function referenced(html, pattern) {
  return [...new Set([...html.matchAll(pattern)].map((match) => match[1]))]
    .filter((url) => url.startsWith('/_next/'))
    .map((url) => path.join(ASSETS, url.replace('/_next/', '')));
}

const pages = (await walk(APP)).filter((file) => file.endsWith('.html')).sort();

const scriptsPerPage = new Map();
for (const page of pages) {
  scriptsPerPage.set(page, referenced(await readFile(page, 'utf-8'), /<script[^>]+src="([^"]+)"/g));
}

/* The chunks every page loads: the framework baseline. */
const baseline = [...scriptsPerPage.values()].reduce((shared, scripts) =>
  shared.filter((file) => scripts.includes(file))
);

const kb = (bytes) => bytes / 1024;
const line = (ok, name, values) => `${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(44)} ${values}`;

let failed = false;
const report = [];

for (const page of pages) {
  const html = await readFile(page, 'utf-8');

  const scripts = scriptsPerPage.get(page).filter((file) => !baseline.includes(file));
  const styles = referenced(html, /<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g);

  const sum = async (files) =>
    (await Promise.all(files.map(gzippedSize))).reduce((total, size) => total + size, 0);

  const measured = {
    html: kb(await gzippedSize(page)),
    css: kb(await sum(styles)),
    js: kb(await sum(scripts)),
  };

  const over = Object.keys(BUDGET).filter((kind) => measured[kind] > BUDGET[kind]);
  failed ||= over.length > 0;

  report.push(
    line(
      over.length === 0,
      path.relative(APP, page),
      Object.entries(measured)
        .map(([kind, value]) => `${kind} ${value.toFixed(1).padStart(6)} KB`)
        .join('  ')
    )
  );

  for (const kind of over) {
    report.push(`     ${kind} is over its ${BUDGET[kind]} KB budget`);
  }
}

const sumOf = async (files) =>
  (await Promise.all(files.map(gzippedSize))).reduce((total, size) => total + size, 0);

const baselineSize = kb(await sumOf(baseline));
const baselineOver = baselineSize > BASELINE_BUDGET;
failed ||= baselineOver;

report.push('');
report.push(
  line(!baselineOver, `shared runtime (${baseline.length} chunks)`, `${baselineSize.toFixed(1).padStart(6)} KB of ${BASELINE_BUDGET} KB`)
);

console.log(report.join('\n'));
console.log(
  failed
    ? `\nOver budget (${Object.entries(BUDGET)
        .map(([kind, value]) => `${kind} ${value} KB`)
        .join(', ')}, gzipped). Either the change earns the extra bytes and the budget moves with it, or it does not.`
    : '\nWithin budget.'
);

process.exit(failed ? 1 : 0);
