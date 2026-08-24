/**
 * Tests the contact endpoint.
 *
 *   npm test
 *
 * This is the only code on the site that runs per request, takes input from
 * strangers, and can fail in ways nobody notices — a form that silently stops
 * delivering looks exactly like a form nobody used. So it is the only code with
 * tests.
 *
 * The Function is exercised directly, with a stubbed `fetch` and a stubbed
 * environment: everything it touches is a web standard that Node also
 * implements, which is what makes that possible without Cloudflare running.
 * Node strips the types on import — see the `test` script.
 */

import assert from 'node:assert/strict';

import { onRequestGet, onRequestPost } from '../functions/api/contact.ts';
import {
  buildMailRequest,
  HONEYPOT_FIELD,
  isTrustedOrigin,
  parseSubmission,
  redirectTarget,
} from '../src/lib/contact.ts';

const ENV = {
  RESEND_API_KEY: 're_test_key',
  CONTACT_TO: 'peter@riemersmaict.nl',
  CONTACT_FROM: 'priemersma.nl <form@priemersma.nl>',
};

const VALID = { name: 'Jan Jansen', email: 'jan@example.com', message: 'Hallo Peter,\n\nvraagje.' };

function post(fields, headers) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.append(key, value);
  return {
    request: new Request('https://priemersma.nl/api/contact', { method: 'POST', body: form, headers }),
  };
}

/** Replaces `fetch` for one call and records what the Function tried to send. */
async function withFetch(response, run) {
  const original = globalThis.fetch;
  const calls = [];

  globalThis.fetch = async (request) => {
    calls.push(request);
    return response;
  };

  try {
    return { result: await run(), calls };
  } finally {
    globalThis.fetch = original;
  }
}

const tests = [];
const test = (name, run) => tests.push({ name, run });

test('a valid submission sends the mail and confirms', async () => {
  const { result, calls } = await withFetch(new Response('{}', { status: 200 }), () =>
    onRequestPost({ ...post({ ...VALID, locale: 'nl' }), env: ENV })
  );

  assert.equal(result.status, 303);
  assert.equal(result.headers.get('location'), '/nl/contact/thanks');
  assert.equal(calls.length, 1);

  const sent = calls[0];
  assert.equal(sent.url, 'https://api.resend.com/emails');
  assert.equal(sent.headers.get('authorization'), `Bearer ${ENV.RESEND_API_KEY}`);

  const body = await sent.json();
  assert.equal(body.from, ENV.CONTACT_FROM, 'sends from the verified domain, not the visitor');
  assert.deepEqual(body.to, [ENV.CONTACT_TO]);
  assert.equal(body.reply_to, VALID.email, 'replying goes to the visitor');
  assert.ok(body.text.includes(VALID.message));
  assert.ok(body.text.includes(VALID.name));
});

test('the language of the page decides where the visitor lands', async () => {
  const { result } = await withFetch(new Response('{}', { status: 200 }), () =>
    onRequestPost({ ...post({ ...VALID, locale: 'en' }), env: ENV })
  );

  assert.equal(result.headers.get('location'), '/en/contact/thanks');
});

test('a locale from outside the site cannot be used to redirect elsewhere', async () => {
  const { result } = await withFetch(new Response('{}', { status: 200 }), () =>
    onRequestPost({ ...post({ ...VALID, locale: '/evil.example.com' }), env: ENV })
  );

  assert.equal(result.headers.get('location'), '/en/contact/thanks');
});

test('a filled honeypot sends nothing and says nothing', async () => {
  const { result, calls } = await withFetch(new Response('{}', { status: 200 }), () =>
    onRequestPost({ ...post({ ...VALID, locale: 'nl', [HONEYPOT_FIELD]: 'https://spam' }), env: ENV })
  );

  assert.equal(calls.length, 0, 'no mail is sent');
  assert.equal(
    result.headers.get('location'),
    '/nl/contact/thanks',
    'and the bot is told it worked, so it learns nothing'
  );
});

test('an unusable submission comes back as an error', async () => {
  for (const fields of [
    { ...VALID, email: 'not-an-address' },
    { ...VALID, name: '' },
    { ...VALID, message: '' },
    { ...VALID, message: 'x'.repeat(4001) },
  ]) {
    const { result, calls } = await withFetch(new Response('{}', { status: 200 }), () =>
      onRequestPost({ ...post({ ...fields, locale: 'nl' }), env: ENV })
    );

    assert.equal(calls.length, 0);
    assert.equal(result.headers.get('location'), '/nl/contact#error');
  }
});

test('addresses that are unusual but real are accepted', () => {
  for (const email of ['peter+site@riemersmaict.nl', 'a@b.co', "o'brien@example.museum"]) {
    const form = new FormData();
    form.append('name', VALID.name);
    form.append('email', email);
    form.append('message', VALID.message);

    assert.equal(parseSubmission(form).ok, true, `${email} should be accepted`);
  }
});

test('missing configuration fails visibly rather than pretending to send', async () => {
  const { result, calls } = await withFetch(new Response('{}', { status: 200 }), () =>
    onRequestPost({ ...post({ ...VALID, locale: 'en' }), env: { ...ENV, RESEND_API_KEY: '' } })
  );

  assert.equal(calls.length, 0);
  assert.equal(result.headers.get('location'), '/en/contact#error');
});

test('a rejection from the mail provider is not reported as success', async () => {
  const { result } = await withFetch(new Response('nope', { status: 422 }), () =>
    onRequestPost({ ...post({ ...VALID, locale: 'nl' }), env: ENV })
  );

  assert.equal(result.headers.get('location'), '/nl/contact#error');
});

test('a network failure is not reported as success', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error('connection reset');
  };

  try {
    const result = await onRequestPost({ ...post({ ...VALID, locale: 'nl' }), env: ENV });
    assert.equal(result.headers.get('location'), '/nl/contact#error');
  } finally {
    globalThis.fetch = original;
  }
});

test('a GET on the endpoint goes to the form', async () => {
  const result = await onRequestGet();

  assert.equal(result.status, 303);
  assert.equal(result.headers.get('location'), '/en/contact');
});

test('the redirect targets match the pages that exist', () => {
  assert.equal(redirectTarget('nl', 'sent', ['en', 'nl']), '/nl/contact/thanks');
  assert.equal(redirectTarget('nl', 'error', ['en', 'nl']), '/nl/contact#error');
});

/* ---------------------------------------------------------------------------
 * What the endpoint refuses before any of it counts as a submission.
 *
 * Each of these was a way in. They are tested at the Function rather than in
 * the library because the refusal is the Function's job, and because what broke
 * in the first case was that an exception escaped it.
 * ------------------------------------------------------------------------ */

test('a form posted from another site is refused, and no mail is sent', async () => {
  const { result, calls } = await withFetch(new Response('{}', { status: 200 }), () =>
    onRequestPost({
      ...post({ ...VALID, locale: 'nl' }, { origin: 'https://evil.example' }),
      env: ENV,
    })
  );

  assert.equal(calls.length, 0, 'a page on another domain cannot send mail through this form');
  assert.equal(result.status, 403);
});

test('a form posted from the site itself is accepted', async () => {
  const { result, calls } = await withFetch(new Response('{}', { status: 200 }), () =>
    onRequestPost({
      ...post({ ...VALID, locale: 'nl' }, { origin: 'https://priemersma.nl' }),
      env: ENV,
    })
  );

  assert.equal(calls.length, 1);
  assert.equal(result.headers.get('location'), '/nl/contact/thanks');
});

test('an origin that is absent is not treated as an origin that is wrong', () => {
  assert.equal(isTrustedOrigin(null, 'https://priemersma.nl/api/contact'), true);
  assert.equal(isTrustedOrigin('https://priemersma.nl', 'https://priemersma.nl/api/contact'), true);
  assert.equal(isTrustedOrigin('https://evil.example', 'https://priemersma.nl/api/contact'), false);
  assert.equal(isTrustedOrigin('null', 'https://priemersma.nl/api/contact'), false, 'a sandboxed frame');
  assert.equal(
    isTrustedOrigin('https://priemersma.nl.evil.example', 'https://priemersma.nl/api/contact'),
    false,
    'a hostname that merely starts the same'
  );
});

test('a body that is not a form is refused rather than thrown', async () => {
  const result = await onRequestPost({
    request: new Request('https://priemersma.nl/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{"name":"x"}',
    }),
    env: ENV,
  });

  assert.equal(result.status, 400, 'an uncaught parse error here is a 500 nobody wrote');
});

test('a body larger than the form could produce is refused before it is read', async () => {
  const { result, calls } = await withFetch(new Response('{}', { status: 200 }), () =>
    onRequestPost({
      request: new Request('https://priemersma.nl/api/contact', {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'content-length': String(2 * 1024 * 1024),
        },
        body: 'name=Jan&email=jan%40example.com&message=hi&locale=nl',
      }),
      env: ENV,
    })
  );

  assert.equal(calls.length, 0);
  assert.equal(result.status, 413);
});

test('a Content-Length that is not a byte count does not slip past the size check', async () => {
  // Each of these parses to Infinity or NaN. A guard that only refuses a
  // *finite* oversized length waves all of them through to the body.
  for (const header of ['1e999', 'abc', '9999999999999999999999999999999999e300', '-1', '1.5']) {
    const { result, calls } = await withFetch(new Response('{}', { status: 200 }), () =>
      onRequestPost({
        request: new Request('https://priemersma.nl/api/contact', {
          method: 'POST',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'content-length': header,
          },
          body: 'name=Jan&email=jan%40example.com&message=hi&locale=nl',
        }),
        env: ENV,
      })
    );

    assert.equal(calls.length, 0, `Content-Length: ${header} should not reach the mail provider`);
    assert.ok(
      result.status === 400 || result.status === 413,
      `Content-Length: ${header} should be refused, got ${result.status}`
    );
  }
});

test('an ordinary Content-Length is still let through', async () => {
  const { result, calls } = await withFetch(new Response('{}', { status: 200 }), () =>
    onRequestPost({
      request: new Request('https://priemersma.nl/api/contact', {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'content-length': '52',
        },
        body: 'name=Jan&email=jan%40example.com&message=hi&locale=nl',
      }),
      env: ENV,
    })
  );

  assert.equal(calls.length, 1);
  assert.equal(result.headers.get('location'), '/nl/contact/thanks');
});

/* ---------------------------------------------------------------------------
 * What the submitted text cannot become.
 * ------------------------------------------------------------------------ */

test('a name cannot open a second line in the subject', async () => {
  const form = new FormData();
  form.append('name', 'Jan\nBcc: victim@example.com');
  form.append('email', 'jan@example.com');
  form.append('message', 'hoi');

  const parsed = parseSubmission(form);
  assert.equal(parsed.ok, true, 'still a real submission; only the line break goes');

  const body = await buildMailRequest(parsed.submission, {
    from: ENV.CONTACT_FROM,
    to: ENV.CONTACT_TO,
    apiKey: ENV.RESEND_API_KEY,
  }).json();

  assert.ok(!/[\r\n]/.test(body.subject), `a header field cannot contain a line break: ${body.subject}`);
  assert.ok(body.subject.includes('Jan Bcc: victim@example.com'), 'the text itself is kept, on one line');
});

test('control characters do not survive into the message', () => {
  const form = new FormData();
  form.append('name', VALID.name);
  form.append('email', VALID.email);
  form.append('message', 'regel een\r\nregel twee  en een tab\tblijft');

  const parsed = parseSubmission(form);

  assert.equal(parsed.ok, true);
  assert.equal(parsed.submission.message, 'regel een\nregel twee en een tab\tblijft');
});

test('an address that hides a second address is rejected', () => {
  for (const email of [
    'jan<evil@attacker.example>',
    'jan@example.com, evil@attacker.example',
    'jan@example.com;evil@attacker.example',
    '"Jan" <evil@attacker.example>',
  ]) {
    const form = new FormData();
    form.append('name', VALID.name);
    form.append('email', email);
    form.append('message', VALID.message);

    assert.equal(parseSubmission(form).ok, false, `${email} should be rejected`);
  }
});

let failed = 0;

for (const { name, run } of tests) {
  try {
    await run();
    console.log(`ok   ${name}`);
  } catch (error) {
    failed++;
    console.error(`FAIL ${name}`);
    console.error(`     ${error.message.split('\n').join('\n     ')}`);
  }
}

console.log(`\n${tests.length - failed}/${tests.length} passed`);
process.exit(failed > 0 ? 1 : 0);
