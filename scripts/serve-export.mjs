/**
 * Serves `out/` the way Cloudflare Pages does.
 *
 *   npm run build:static && npm run serve:static     # http://localhost:4000
 *
 * `npx serve` and friends are not a substitute for this. They resolve paths by
 * their own rules — most of them redirect `/en` to `/en/` because a directory of
 * that name exists — and none of them read `_redirects`. That means the two
 * things most likely to break on the move to Cloudflare are exactly the two
 * things a generic static server will not show you.
 *
 * What this reproduces, from Cloudflare's asset-serving behaviour:
 *
 *  - `_redirects` at the output root: first match wins, `*` captures the rest of
 *    the path, and `:splat` puts it back in the destination.
 *  - Path resolution: the exact file, then the path with `.html` appended, then
 *    `index.html` inside the directory.
 *  - A miss serves `404.html` with a 404 status, rather than a bare error.
 *  - `/api/contact` runs the Pages Function, so the contact form can be
 *    submitted here exactly as it will be in production.
 *
 * With `CONTACT_DRY_RUN=1` the call to the mail provider is answered locally
 * instead of sent, which makes the whole path — form, redirect, confirmation —
 * walkable without an account or an API key:
 *
 *   CONTACT_DRY_RUN=1 CONTACT_ENDPOINT=/api/contact npm run build:static
 *   CONTACT_DRY_RUN=1 npm run serve:static
 *
 * The stub lives here rather than in the Function, so nothing about production
 * behaviour depends on a switch that only this file knows about.
 *
 * It is a development tool, not part of the build.
 */

import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

import { onRequestGet, onRequestPost } from '../functions/api/contact.ts';

const ROOT = path.resolve('out');
const PORT = Number(process.env.PORT ?? 4000);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

/** Parses `_redirects` into rules, keeping their order — first match wins. */
async function loadRedirects() {
  let file = '';
  try {
    file = await readFile(path.join(ROOT, '_redirects'), 'utf-8');
  } catch {
    return [];
  }

  return file
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const [from, to, status] = line.split(/\s+/);
      return { from, to, status: Number(status ?? 302) };
    });
}

function match(rule, pathname) {
  if (!rule.from.endsWith('*')) {
    return rule.from === pathname ? rule.to : null;
  }

  const prefix = rule.from.slice(0, -1);
  if (!pathname.startsWith(prefix)) return null;

  return rule.to.replace(':splat', pathname.slice(prefix.length));
}

/** The file a path resolves to, or null. */
async function resolve(pathname) {
  const relative = pathname.replace(/^\//, '');
  const candidates = relative
    ? [relative, `${relative}.html`, path.join(relative, 'index.html')]
    : ['index.html'];

  for (const candidate of candidates) {
    const file = path.join(ROOT, candidate);
    // Keeps a crafted path from reading outside the export.
    if (!file.startsWith(ROOT)) continue;

    try {
      if ((await stat(file)).isFile()) return file;
    } catch {
      /* try the next candidate */
    }
  }

  return null;
}

const redirects = await loadRedirects();

if (process.env.CONTACT_DRY_RUN === '1') {
  const send = globalThis.fetch;

  globalThis.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input.url;
    if (!url.startsWith('https://api.resend.com/')) return send(input, init);

    const request = typeof input === 'string' ? new Request(input, init) : input;
    console.log('\n— dry run, this mail was not sent —');
    console.log(await request.text());
    return new Response(JSON.stringify({ id: 'dry-run' }), { status: 200 });
  };
}

/** Runs the Pages Function, the way Cloudflare routes `/api/*` to it. */
async function handleFunction(request) {
  if (request.method === 'POST') return onRequestPost({ request, env: process.env });
  if (request.method === 'GET') return onRequestGet();

  return new Response('Method not allowed', { status: 405 });
}

/** Rebuilds the incoming Node request as a standard `Request`. */
async function toRequest(nodeRequest) {
  const chunks = [];
  for await (const chunk of nodeRequest) chunks.push(chunk);

  return new Request(`http://localhost${nodeRequest.url}`, {
    method: nodeRequest.method,
    headers: nodeRequest.headers,
    body: chunks.length > 0 ? Buffer.concat(chunks) : undefined,
  });
}

createServer(async (request, response) => {
  const { pathname } = new URL(request.url, 'http://localhost');

  if (pathname.startsWith('/api/')) {
    const result = await handleFunction(await toRequest(request));
    response.writeHead(result.status, Object.fromEntries(result.headers));
    response.end(await result.text());
    return;
  }

  for (const rule of redirects) {
    const target = match(rule, pathname);
    if (target) {
      response.writeHead(rule.status, { location: target });
      response.end();
      return;
    }
  }

  const file = (await resolve(pathname)) ?? path.join(ROOT, '404.html');
  const found = file !== path.join(ROOT, '404.html');

  response.writeHead(found ? 200 : 404, {
    'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream',
  });
  createReadStream(file).pipe(response);
}).listen(PORT, () => {
  console.log(`Serving out/ as Cloudflare Pages would: http://localhost:${PORT}`);
  console.log(`${redirects.length} redirect rules loaded from _redirects`);
});
