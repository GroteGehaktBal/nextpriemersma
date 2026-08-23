# Security

## Reporting something

Email **peter@riemersmaict.nl**, or open a private security advisory through
GitHub's **Security** tab on this repository. Please do not open a public issue
for a vulnerability.

This is a personal portfolio, not a service with users, so there is no bounty and
no formal timeline. There is an actual person reading, and a fix takes about as
long as it takes to write.

---

## What there is to attack

Almost nothing, and that is the design rather than a happy accident.

The site is a directory of static files on Cloudflare Pages. There is no
database, no session, no account, no cookie, no analytics and no third-party
script — `npm run check:export` fails the build if a page starts loading anything
from another origin, so that last one stays true without anyone having to
remember it.

That leaves exactly one piece of code that runs per request and takes input from
strangers: **`functions/api/contact.ts`**, the contact form's endpoint. It is
twenty lines, and everything below is about it.

## The contact endpoint

### What reaches it

A `POST` of three fields and a locale, from a plain `<form method="post">`. No
JavaScript is involved on either side.

### What it refuses, and why

| Refused | Answer | Because |
| --- | --- | --- |
| A post whose `Origin` is another site | `403` | A page elsewhere can otherwise auto-submit a hidden form and turn each of its own visitors into a sender — which is also how a per-IP rate limit gets walked around. An **absent** `Origin` is allowed: browsers always send it cross-origin, and requiring it would break the form in any browser that omits it same-origin. |
| A body larger than 64 KB | `413` | Checked from `Content-Length` before the body is read, so a large upload is a refusal rather than work. |
| A body that is not a form | `400` | `formData()` throws on one. Uncaught, that was a `500` from the runtime — not a hole in itself, but the shape of one. |
| A filled honeypot | `303` to the confirmation | Told it worked, so a bot learns nothing about which field gave it away. Nothing is sent. |
| A name or message that is empty or over its limit, or an address that cannot be one | `303` back to `#error` | |

### What it does to what it accepts

- **The name is flattened to one line.** It goes into the subject, and a line
  break in a header field is where a second header goes. Resend takes JSON and
  builds the message itself, so this is not the injection it would be over SMTP —
  it is one library's parsing decision away from being one.
- **The address may not contain `<>`, `,`, `;`, quotes or brackets.** It is
  handed to Resend as `reply_to` verbatim, and `jan<evil@attacker.example>`
  otherwise arrives as a message showing one address in its body and replying to
  another. Apostrophes stay legal, because `o'brien@…` is somebody's real
  address.
- **The submitted text is never interpolated into HTML.** The mail is plain text.
  There is no markup to escape.
- **The locale is checked against the two the site has.** It arrives in the
  request body, and an unchecked value there is an open redirect.
- **The mail is sent from a verified domain**, never from the visitor's address,
  which would fail SPF. Theirs goes in `reply_to`.

### What it logs

The status of a failed send and the first 200 characters of the provider's
answer. A rejection notice quotes back what was submitted, and the logs of a
public site are not the place for a stranger's email address to accumulate.

Nothing is logged on success.

### Secrets

`RESEND_API_KEY` exists only as a **secret** environment variable on the
Cloudflare Pages project. It is not in this repository, not in the build output,
and not in any log line — it is read from `env` and put in an `Authorization`
header, and nothing else touches it.

Nothing in this repository is a credential. `CONTACT_TO` and `CONTACT_FROM` are
configuration and would be harmless in the open; they are project variables
anyway, so that the repository can be public without a decision having to be made
about them.

## Response headers

`public/_headers` sets, for every page: `Content-Security-Policy`,
`Strict-Transport-Security` (two years, subdomains included, no preload),
`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` and
`Permissions-Policy`. The file itself says what each is for.

`npm run smoke` asserts they are actually served, rather than merely declared.

## Accepted, and not fixed

Being explicit about these is the point of the list.

**There is no rate limit in the code.** The Function has no memory between
requests and the storage that would give it one is a paid binding. The limit is a
Cloudflare rate limiting rule in front of it — free plan, one rule, spent on
`/api/contact` — and `docs/CLOUDFLARE.md` §4 has the settings. The number that
makes this matter is Resend's, not Cloudflare's: **100 emails a day**, which a
script can spend in under a minute, taking the form down for everyone until
midnight.

**The Content-Security-Policy allows inline scripts and styles.** Next emits the
RSC payload as inline `<script>` blocks whose content differs per page, so pinning
them by hash would mean generating `_headers` per page on every build and breaking
hydration whenever a hash drifted. What it does not weaken is the part that
matters for a site with no user-generated HTML: `script-src 'self'` still refuses
every *external* script, which is how a static site actually gets compromised — a
dependency that decides to phone home.

**The spam defence is a honeypot, not a CAPTCHA.** A honeypot stops the bots that
fill in every field they can see, which is most of them, and costs a visitor
nothing. A distributed flood from many addresses walks past both it and a per-IP
rate limit; the answer to that is Turnstile, which is free and needs a script tag
on a site that currently ships none. That is a real trade, worth making if the
form is ever actually abused and not before.

**An absent `Origin` header is trusted.** See the table above — this is a
deliberate choice against breaking the form for real people, and it costs
nothing, because anyone who can omit the header can also post with `curl`.

## What is checked, and where

| | |
| --- | --- |
| `npm test` | The endpoint's logic: every refusal above, and the paths where the provider rejects the mail or the network fails and the form must not claim success. |
| `npm run check:export` | That no page loads anything from another origin, and that `_headers` and `_redirects` are present and point somewhere real. |
| `npm run smoke` | The endpoint through an actual server, with Cloudflare's own routing: a submission confirmed, a foreign one refused, a malformed one refused, the headers served. |
| `npm audit --audit-level=high` | Dependencies. There are six at runtime. |

All four run in CI on every push and pull request.
