/**
 * The contact form's logic, with no runtime of its own.
 *
 * Nothing here touches Node, Cloudflare or the DOM: it takes a `FormData` and
 * returns either a validated submission or the reason it was rejected, and it
 * builds the request that sends the mail. The Cloudflare Pages Function in
 * `functions/api/contact.ts` is the only thing that knows where it runs, and it
 * is twenty lines long because everything that can be tested without a server
 * lives here instead.
 */

/** Fields the form posts. */
export interface Submission {
  name: string;
  email: string;
  message: string;
}

export type ParseResult =
  | { ok: true; submission: Submission }
  | { ok: false; reason: 'invalid' | 'spam' };

/**
 * The field a person never sees and a bot usually fills in.
 *
 * Named for something a form-filler expects to find rather than `honeypot`, and
 * hidden with CSS rather than `type="hidden"`, because a hidden input is exactly
 * what a bot knows to leave alone. Anything in it means the submission was not
 * typed by a person.
 */
export const HONEYPOT_FIELD = 'website';

/** Upper bounds, so a submission cannot be used to post a novel through the API. */
const LIMITS = { name: 100, email: 200, message: 4000 };

/**
 * Email validation, deliberately loose.
 *
 * The only address worth rejecting is one that cannot be replied to at all. A
 * stricter pattern rejects valid addresses — new TLDs, plus-addressing, unicode
 * domains — and the cost of being wrong is a person who cannot contact Peter and
 * never finds out why.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function field(form: FormData, name: string): string {
  const value = form.get(name);
  if (typeof value !== 'string') return '';

  /*
   * A browser posting a form normalises every line break to CRLF, so a message
   * typed with Enter arrives as `\r\n`. Left alone that ends up in the email
   * body, mixed with the `\n` this code joins its own lines with. One kind of
   * line ending in, one kind out.
   */
  return value.replace(/\r\n/g, '\n').trim();
}

export function parseSubmission(form: FormData): ParseResult {
  if (field(form, HONEYPOT_FIELD) !== '') return { ok: false, reason: 'spam' };

  const submission = {
    name: field(form, 'name'),
    email: field(form, 'email'),
    message: field(form, 'message'),
  };

  const valid =
    submission.name.length > 0 &&
    submission.name.length <= LIMITS.name &&
    submission.email.length <= LIMITS.email &&
    EMAIL.test(submission.email) &&
    submission.message.length > 0 &&
    submission.message.length <= LIMITS.message;

  return valid ? { ok: true, submission } : { ok: false, reason: 'invalid' };
}

export interface MailConfig {
  /** Verified sender on the Resend account, e.g. `Website <form@priemersma.nl>`. */
  from: string;
  /** Where the message goes. */
  to: string;
  apiKey: string;
}

/**
 * Builds the Resend request.
 *
 * Returned rather than sent so the caller owns the `fetch`, which is what lets
 * this be tested without a network. Two details matter:
 *
 *  - `reply_to` is the sender's address, so replying goes to them. `from` cannot
 *    be their address: the domain sending the mail has to be one the account has
 *    verified, or it fails SPF and lands in spam.
 *  - The body is plain text, and the submitted text is never interpolated into
 *    HTML. There is no markup to escape and nothing to inject.
 */
export function buildMailRequest(submission: Submission, config: MailConfig): Request {
  const body = {
    from: config.from,
    to: [config.to],
    reply_to: submission.email,
    subject: `Contactformulier — ${submission.name}`,
    text: [
      `Naam:    ${submission.name}`,
      `E-mail:  ${submission.email}`,
      '',
      submission.message,
    ].join('\n'),
  };

  return new Request('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${config.apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

/**
 * Where to send the browser afterwards.
 *
 * The locale comes from the page the form was posted from, so a Dutch visitor
 * gets a Dutch confirmation. It is validated against the known locales rather
 * than trusted: it arrives in the request body, and an unchecked value there
 * would let anyone craft a link that redirects through this site to anywhere.
 */
export function redirectTarget(
  locale: string,
  outcome: 'sent' | 'error',
  locales: readonly string[]
): string {
  const safe = locales.includes(locale) ? locale : locales[0];

  return outcome === 'sent' ? `/${safe}/contact/thanks` : `/${safe}/contact#error`;
}
