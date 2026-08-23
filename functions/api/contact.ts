/*
 * The `.ts` extension is deliberate. Cloudflare bundles this directory with
 * esbuild, which does not mind either way — but it is also the only form Node
 * can resolve, and Node is what runs `npm test` against this file directly.
 */
import { buildMailRequest, parseSubmission, redirectTarget } from '../../src/lib/contact.ts';

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
  return new Response(null, { status: 303, headers: { location } });
}

export async function onRequestPost(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const form = await context.request.formData();
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
      console.error(`contact form: Resend returned ${response.status}`, await response.text());
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
