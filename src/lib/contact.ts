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
 * The largest request body worth reading.
 *
 * The three fields cannot legitimately add up to more than about four kilobytes,
 * and the limits above reject anything longer — but only after `formData()` has
 * already read the whole body into memory. Cloudflare would hand this Function a
 * hundred megabytes if someone posted one. Checking the declared length first
 * turns that from work into a refusal.
 */
export const MAX_BODY_BYTES = 64 * 1024;

/**
 * Email validation, deliberately loose — with a short list of exceptions.
 *
 * The only address worth rejecting is one that cannot be replied to at all. A
 * stricter pattern rejects valid addresses — new TLDs, plus-addressing, unicode
 * domains — and the cost of being wrong is a person who cannot contact Peter and
 * never finds out why. Apostrophes stay legal for the same reason: `o'brien@…`
 * is somebody's actual address.
 *
 * What is excluded is the punctuation that means something in an address *list*:
 * `<>` delimit an address, `,;` separate two of them, and quotes and brackets
 * open a display name or a comment. This value is handed to Resend as `reply_to`
 * verbatim, so `jan<evil@attacker.example>` would otherwise arrive as a message
 * showing one address in its body and replying to another. Nobody's real address
 * contains these characters, and every use of them here is a lie about where a
 * reply is going.
 */
const EMAIL = /^[^\s@<>,;"\\()[\]]+@[^\s@<>,;"\\()[\]]+\.[^\s@<>,;"\\()[\]]+$/;

/**
 * Strips the control characters a browser never sends and a mail header cannot
 * carry, keeping the line breaks and tabs that belong in a typed message.
 */
function withoutControls(value: string): string {
  return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');
}

/**
 * Flattens a value to something that can appear on a single header line.
 *
 * The name ends up in the subject. A bare `\n` in it — which the CRLF
 * normalisation below leaves alone, because it only rewrites pairs — would be a
 * line break in a header field, and a line break in a header field is where a
 * second header goes. Resend takes JSON and builds the message itself, so this
 * is not the injection it would be over SMTP; it is one library's parsing
 * decision away from being one, and collapsing the whitespace costs nothing.
 */
function singleLine(value: string): string {
  return withoutControls(value.replace(/\s+/g, ' ')).trim();
}

function field(form: FormData, name: string): string {
  const value = form.get(name);
  if (typeof value !== 'string') return '';

  /*
   * A browser posting a form normalises every line break to CRLF, so a message
   * typed with Enter arrives as `\r\n`. Left alone that ends up in the email
   * body, mixed with the `\n` this code joins its own lines with. One kind of
   * line ending in, one kind out.
   */
  return withoutControls(value.replace(/\r\n/g, '\n')).trim();
}

export function parseSubmission(form: FormData): ParseResult {
  if (field(form, HONEYPOT_FIELD) !== '') return { ok: false, reason: 'spam' };

  const submission = {
    name: singleLine(field(form, 'name')),
    email: singleLine(field(form, 'email')),
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

/**
 * Whether a form POST came from this site's own pages.
 *
 * There is no session and no token here, so this is not CSRF in the usual sense
 * — an attacker can post to the endpoint with `curl` and always could. What the
 * check stops is different: a page on another domain that submits a hidden form
 * to this endpoint as soon as someone opens it. That turns every visitor of that
 * page into a sender, from their own address, which is how a per-visitor rate
 * limit gets walked around and how a mailbox fills up.
 *
 * A missing `Origin` is allowed through, and that is the whole design. Browsers
 * always send it on a cross-origin form POST, which is the case being caught;
 * they have not always sent it on a same-origin one, and a check that required
 * it would silently break the form for whoever is using the browser that
 * doesn't. Absent means "no evidence of a cross-site post", not "trusted".
 *
 * An `Origin` that will not parse — including the literal `null` a sandboxed
 * iframe sends — is evidence, and is refused.
 */
export function isTrustedOrigin(origin: string | null, requestUrl: string): boolean {
  if (origin === null) return true;

  try {
    return new URL(origin).host === new URL(requestUrl).host;
  } catch {
    return false;
  }
}
