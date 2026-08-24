/*
 * The `.ts` extension is deliberate. Cloudflare bundles this directory with
 * esbuild, which does not mind either way — but it is also the only form Node
 * can resolve, and Node is what runs `npm test` against this file directly.
 */
import {
  buildMailRequest,
  isTrustedOrigin,
  MAX_BODY_BYTES,
  parseSubmission,
  redirectTarget,
} from '../../src/lib/contact.ts';

/**
 * The contact form's endpoint, as a Cloudflare Pages Function.
 *
 * This directory is the one part of the site that is not a file. Cloudflare
 * Pages serves `out/` as static assets — free and unlimited — and routes only
 * `/api/*` here, so the Workers request allowance is spent on form submissions
 * and nothing else.
 *
 * It is not a Next route handler on purpose. A route handler would have to run
 * on a server, and this site has none: adding one would end the static export
 * that everything else depends on. Twenty lines in a different directory is the
 * cheaper trade.
 *
 * The exchange is a plain form POST followed by a redirect, so it works with
 * JavaScript disabled and leaves nothing in the browser's history to re-submit.
 *
 * Three things are refused before any of it counts as a submission: a post from
 * another origin, a body larger than the form could produce, and a body that is
 * not a form. What is *not* here is a rate limit — this Function has no memory
 * between requests, and the storage that would give it one is a paid binding.
 * That job belongs to the rate limiting rule in front of it, which the free plan
 * includes exactly one of and `docs/CLOUDFLARE.md` spends it on this path.
 *
 * Configure in the Pages project (Settings → Environment variables):
 *
 *   RESEND_API_KEY   secret, from resend.com
 *   CONTACT_TO       where the mail goes
 *   CONTACT_FROM     a verified sender, e.g. "priemersma.nl <form@priemersma.nl>"
 */

interface Env {
  RESEND_API_KEY: string;
  CONTACT_TO: string;
  CONTACT_FROM: string;
}

const LOCALES = ['en', 'nl'] as const;

/** 303, so the browser follows with a GET and a reload cannot re-send the form. */
function seeOther(location: string): Response {
  // Nothing about the outcome of a submission should sit in a cache.
  return new Response(null, {
    status: 303,
    headers: { location, 'cache-control': 'no-store' },
  });
}

/**
 * A refusal, before any of this is treated as a form submission.
 *
 * Deliberately not a redirect: these are answers to something that is not a
 * person pressing Send — a foreign page, an oversized body, a client that posted
 * something other than a form. A status code is the honest reply, and it keeps
 * them out of the confirmation page's traffic.
 */
function refuse(status: number, reason: string): Response {
  return new Response(`${reason}\n`, {
    status,
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export async function onRequestPost(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const { request } = context;

  if (!isTrustedOrigin(request.headers.get('origin'), request.url)) {
    return refuse(403, 'This form only accepts submissions from priemersma.nl.');
  }

  /*
   * The declared length, checked before the body is read. A chunked request
   * declares none, which is why the field limits still do the real work — this
   * is the cheap refusal for the obvious case, not the only bound.
   *
   * Anything present that is not a plain byte count is refused rather than
   * skipped. `Number('1e999')` is `Infinity` and `Number('abc')` is `NaN`, and
   * a guard written as "refuse when it is finite and too large" lets both of
   * those straight through to the body it was meant to keep unread.
   */
  const declared = request.headers.get('content-length');
  if (declared !== null) {
    const size = Number(declared);

    if (!Number.isInteger(size) || size < 0) {
      return refuse(400, 'Malformed Content-Length.');
    }

    if (size > MAX_BODY_BYTES) {
      return refuse(413, 'That is larger than this form accepts.');
    }
  }

  /*
   * `formData()` throws on a body that is not a form — a JSON POST, or a
   * truncated multipart upload. Uncaught, that is a 500 from the runtime and an
   * error page nobody wrote. It is not a security hole by itself; it is the
   * shape of one, and a scanner will find it in a minute.
   */
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return refuse(400, 'Expected a form submission.');
  }

  const locale = String(form.get('locale') ?? LOCALES[0]);

  const parsed = parseSubmission(form);

  if (!parsed.ok) {
    /*
     * A bot that filled the honeypot is told the message went through. Showing
     * it the error page teaches it which field gave it away; showing it the
     * confirmation teaches it nothing, and costs a human nothing either, because
     * no human ever sees that field.
     */
    return seeOther(redirectTarget(locale, parsed.reason === 'spam' ? 'sent' : 'error', LOCALES));
  }

  const { RESEND_API_KEY, CONTACT_TO, CONTACT_FROM } = context.env;

  if (!RESEND_API_KEY || !CONTACT_TO || !CONTACT_FROM) {
    console.error('contact form: the mail configuration is incomplete');
    return seeOther(redirectTarget(locale, 'error', LOCALES));
  }

  try {
    const response = await fetch(
      buildMailRequest(parsed.submission, {
        apiKey: RESEND_API_KEY,
        to: CONTACT_TO,
        from: CONTACT_FROM,
      })
    );

    if (!response.ok) {
      /*
       * Enough of the provider's answer to tell a bad key from a bad address,
       * and no more. It is a rejection notice, so it quotes back what was
       * submitted; the logs of a public site are not the place for a stranger's
       * email address to accumulate.
       */
      const detail = (await response.text()).slice(0, 200);
      console.error(`contact form: Resend returned ${response.status}: ${detail}`);
      return seeOther(redirectTarget(locale, 'error', LOCALES));
    }
  } catch (error) {
    console.error('contact form: sending failed', error);
    return seeOther(redirectTarget(locale, 'error', LOCALES));
  }

  return seeOther(redirectTarget(locale, 'sent', LOCALES));
}

/** A GET on the endpoint is someone poking at it; send them to the form. */
export async function onRequestGet(): Promise<Response> {
  return seeOther(`/${LOCALES[0]}/contact`);
}
