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
import { HONEYPOT_FIELD, parseSubmission, redirectTarget } from '../src/lib/contact.ts';

const ENV = {
  RESEND_API_KEY: 're_test_key',
  CONTACT_TO: 'peter@riemersmaict.nl',
  CONTACT_FROM: 'priemersma.nl <form@priemersma.nl>',
};

const VALID = { name: 'Jan Jansen', email: 'jan@example.com', message: 'Hallo Peter,\n\nvraagje.' };

function post(fields) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.append(key, value);
  return { request: new Request('https://priemersma.nl/api/contact', { method: 'POST', body: form }) };
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
