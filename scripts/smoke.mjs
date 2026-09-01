/**
 * Serves the export the way Cloudflare Pages will, and asks it the questions a
 * visitor would.
 *
 *   npm run build && npm run smoke
 *
 * `npm run check:export` reads the export as files; this reads it as a site. The
 * difference is everything that only exists once something is answering
 * requests: whether a redirect fires, whether the security headers arrive,
 * whether a form submission gets a confirmation and a foreign one does not.
 *
 * Those are exactly the things that broke quietly during the move to Cloudflare
 * — a redirect rule that was never loaded, a Function that returned a 500 to a
 * malformed body — and none of them are visible to a unit test, because the unit
 * test calls the Function directly and never goes through a server at all.
 *
 * The mail provider is stubbed by `CONTACT_DRY_RUN`, so this sends nothing and
 * needs no account, no key and no network.
 */

import { spawn } from 'node:child_process';
import { request as httpRequest } from 'node:http';
import process from 'node:process';

const PORT = Number(process.env.SMOKE_PORT ?? 4173);
const BASE = `http://localhost:${PORT}`;

const server = spawn(
  process.execPath,
  ['--experimental-strip-types', 'scripts/serve-export.mjs'],
  {
    env: {
      ...process.env,
      PORT: String(PORT),
      CONTACT_DRY_RUN: '1',
      CONTACT_ENDPOINT: '/api/contact',
      CONTACT_TO: 'smoke@example.com',
      CONTACT_FROM: 'Smoke <smoke@example.com>',
      RESEND_API_KEY: 'not-a-real-key',
    },
    stdio: ['ignore', 'pipe', 'inherit'],
  }
);

/** Waits for the server to answer, rather than for an arbitrary number of seconds. */
async function ready() {
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      await fetch(`${BASE}/en`, { redirect: 'manual' });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  throw new Error(`the export server never came up on ${PORT}`);
}

/**
 * The response headers for a request arriving at a given hostname.
 *
 * `fetch` will not do this: `Host` is a forbidden header name, and undici drops
 * it silently rather than failing — which would make every assertion below pass
 * for the wrong reason. `node:http` sends what it is given.
 */
function headersAt(host, pathname) {
  return new Promise((resolve, reject) => {
    const call = httpRequest(
      { host: 'localhost', port: PORT, path: pathname, method: 'GET', headers: { host } },
      (response) => {
        response.resume();
        resolve(response.headers);
      }
    );
    call.on('error', reject);
    call.end();
  });
}

/** A form submission, as a browser makes one. */
function submit(fields, headers = {}) {
  return fetch(`${BASE}/api/contact`, {
    method: 'POST',
    redirect: 'manual',
    headers: { 'content-type': 'application/x-www-form-urlencoded', ...headers },
    body: new URLSearchParams(fields).toString(),
  });
}

const problems = [];
const checks = [];

function check(name, condition, detail = '') {
  checks.push({ name, ok: Boolean(condition), detail });
  if (!condition) problems.push(`${name}${detail ? ` — ${detail}` : ''}`);
}

try {
  await ready();

  // The pages themselves.
  for (const page of ['/en', '/nl', '/en/about', '/nl/work', '/en/contact', '/nl/contact/thanks']) {
    const response = await fetch(`${BASE}${page}`, { redirect: 'manual' });
    check(`GET ${page}`, response.status === 200, `got ${response.status}`);
  }

  // A URL that was never built, and the page that catches it.
  const missing = await fetch(`${BASE}/en/nothing-here`, { redirect: 'manual' });
  check('a URL that does not exist gets the 404 page', missing.status === 404, `got ${missing.status}`);

  // The redirects, which are the whole of what replaced the proxy.
  for (const [from, to] of [
    ['/', '/en'],
    ['/about', '/en/about'],
    ['/work/pyxels', '/en/work/pyxels'],
    ['/blog/anything', '/en'],
    ['/nl/gallery', '/nl'],
  ]) {
    const response = await fetch(`${BASE}${from}`, { redirect: 'manual' });
    const location = response.headers.get('location');
    check(`${from} redirects to ${to}`, location === to, `went to ${location ?? 'nowhere'}`);
  }

  // The headers, on a page rather than in the file that declares them.
  const headers = (await fetch(`${BASE}/en`, { redirect: 'manual' })).headers;
  for (const header of [
    'content-security-policy',
    'strict-transport-security',
    'x-content-type-options',
    'referrer-policy',
    'permissions-policy',
  ]) {
    check(`${header} is served`, headers.get(header) !== null);
  }
  check(
    "the policy still refuses other origins",
    (headers.get('content-security-policy') ?? '').includes("default-src 'self'")
  );

  /*
   * `X-Robots-Tag: noindex` on the right hostnames and no others.
   *
   * Both directions are asserted because only one of them is recoverable. The
   * `*.pages.dev` copies going unnoindexed costs some duplicate content; the
   * same header reaching priemersma.nl takes the site out of Google, and by the
   * time anyone notices it has been out for a while.
   */
  for (const host of ['nextpriemersma.pages.dev', '4a2b1c.nextpriemersma.pages.dev']) {
    const at = await headersAt(host, '/en');
    check(`${host} is told not to index`, at['x-robots-tag'] === 'noindex', `got ${at['x-robots-tag']}`);
  }

  for (const host of ['priemersma.nl', 'www.priemersma.nl']) {
    const at = await headersAt(host, '/en');
    check(
      `${host} is NOT told not to index`,
      at['x-robots-tag'] === undefined,
      `got ${at['x-robots-tag']}`
    );
    check(`${host} still gets the security headers`, at['content-security-policy'] !== undefined);
  }

  // The contact form, all the way through.
  const sent = await submit(
    { name: 'Jan Jansen', email: 'jan@example.com', message: 'Hallo Peter', locale: 'nl' },
    { origin: BASE }
  );
  check(
    'a submission is accepted and confirmed in its own language',
    sent.status === 303 && sent.headers.get('location') === '/nl/contact/thanks',
    `${sent.status} → ${sent.headers.get('location')}`
  );

  const confirmation = await fetch(`${BASE}${sent.headers.get('location')}`, { redirect: 'manual' });
  check('and the page it confirms on exists', confirmation.status === 200, `got ${confirmation.status}`);

  const rejected = await submit(
    { name: 'Jan', email: 'not-an-address', message: 'x', locale: 'en' },
    { origin: BASE }
  );
  check(
    'an unusable submission comes back to the form',
    rejected.headers.get('location') === '/en/contact#error',
    `went to ${rejected.headers.get('location')}`
  );

  const foreign = await submit(
    { name: 'Bot', email: 'bot@evil.example', message: 'spam', locale: 'nl' },
    { origin: 'https://evil.example' }
  );
  check('a submission from another site is refused', foreign.status === 403, `got ${foreign.status}`);

  const malformed = await fetch(`${BASE}/api/contact`, {
    method: 'POST',
    redirect: 'manual',
    headers: { 'content-type': 'application/json' },
    body: '{"not":"a form"}',
  });
  check(
    'a body that is not a form is refused, not a 500',
    malformed.status === 400,
    `got ${malformed.status}`
  );
} finally {
  server.kill();
}

for (const { name, ok, detail } of checks) {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok || !detail ? '' : ` — ${detail}`}`);
}

console.log(`\n${checks.length - problems.length}/${checks.length} passed`);

if (problems.length > 0) {
  console.error('\nThe export does not behave the way Cloudflare Pages will serve it.');
  process.exit(1);
}
