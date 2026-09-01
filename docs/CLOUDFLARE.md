# Cloudflare Pages

The site runs on Cloudflare Pages, built from this repository by Cloudflare's own
Git integration. This is what that setup consists of, and what to do when a piece
of it needs changing.

The migration this file used to describe is done. What is left is operations.

---

## 1. The Pages project

Cloudflare dashboard → **Compute** → **Workers & Pages** → the project.

(The 2026 dashboard groups the sidebar into Observe / Build / Compute.
Cloudflare's own documentation still writes this as "go to Workers & Pages"; it
is the same page, one level in.)

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Build command | `npm run build:static` |
| Build output directory | `out` |
| Root directory | `/` |

`build:static` and `build` are the same command. The alias exists because it is
what this project's build setting says, and changing a live build setting to save
one line in `package.json` is not a trade worth making. Either name produces
`out/`.

Three files in that directory are not pages, and Cloudflare treats each of them
specially:

- **`_redirects`** — locale prefixes and the URLs the 2026 rebuild retired.
- **`_headers`** — the Content-Security-Policy and the cache rules.
- **`functions/`**, from the repository root rather than the output — Cloudflare
  bundles it and generates a `_routes.json` so that only `/api/*` invokes a
  Function and everything else is served as a static asset. That is the
  difference between free and metered:
  - **Static assets** — unlimited requests, on the free plan.
  - **Functions** — counted against the Workers free allowance of 100,000
    requests a day.

### Node

The v3 build image runs Node 22, which is what this project needs and what CI
uses. If Cloudflare ever changes that default, the build will fail on syntax
rather than quietly run on the wrong version — the fix is an environment variable
`NODE_VERSION` = `22` on the project, not a change in this repository.

### Production and previews

Pages does this natively and by default: the **production branch** is deployed to
the real domain, and every other branch gets its own **preview deployment** at a
`*.pages.dev` URL. There is nothing to build and nothing in this repository that
controls it.

Project → **Settings** → **Builds** → **Branch control**:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Preview branches | All non-production branches |

"This branch has not been deployed" on a pull request is not the signal it looks
like — see *Reporting on a pull request* below. If a branch genuinely is not
being built, it is one of three things, in the order worth checking: preview
branches are set to None or to a custom list this branch is not on; automatic
deployments are off for the branch; or the Cloudflare Pages GitHub App has lost
access to the repository, in which case it still builds but stops reporting.

Two things about previews are specific to this site.

**The environment variables have to exist for Preview too** — see §2. Without
`CONTACT_ENDPOINT` a preview renders the email address where production renders
the form, which makes it a preview of a different site.

**The rate limiting rule in §4 does not cover a preview.** It is a rule on the
`priemersma.nl` zone, and `*.pages.dev` is not in that zone — so a preview with a
working `RESEND_API_KEY` is a contact form with nothing in front of it, able to
spend the same 100 mails a day the real one draws on. Either leave
`RESEND_API_KEY` out of the Preview environment, which lets a preview render and
validate the form but not send, or put previews behind **Cloudflare Access**
(Settings → General → Access policy), which is free and asks for a login before
anything is served.

### The `*.pages.dev` address

Preview deployments are given `X-Robots-Tag: noindex` by Cloudflare
automatically. The project's own production `*.pages.dev` address is not, and it
serves the same pages as `priemersma.nl` — the same duplicate-content problem
`riemersmaict.nl` had, from a domain nobody chose to publish.

`public/_headers` closes it, and needs no configuring:

```
https://:project.pages.dev/*
  X-Robots-Tag: noindex

https://:version.:project.pages.dev/*
  X-Robots-Tag: noindex
```

`:project` and `:version` are placeholders Cloudflare fills from the request's
hostname — not names to substitute — so these match `<project>.pages.dev` and
`<hash>.<project>.pages.dev` and nothing else. The scoping is the point: the same
header without a host would take the real site out of Google.

Which is why it is asserted rather than trusted. `npm run smoke` checks both
directions — the `pages.dev` hostnames carry `noindex`, `priemersma.nl` and
`www.priemersma.nl` do not and still carry the security headers — and
`npm run serve:static` will show you the same thing by hand:

```bash
curl -sI -H 'Host: nextpriemersma.pages.dev' localhost:4000/en | grep -i robots
curl -sI -H 'Host: priemersma.nl'            localhost:4000/en | grep -i robots
```

Only one of those two directions is recoverable. Missing the `noindex` costs
some duplicate content; a `noindex` that reaches the real domain takes the site
out of Google, and by the time anyone notices it has been out for a while.

### Reporting on a pull request

Pages reports as a **check**, beside CI, named "Cloudflare Pages". It does not
create GitHub *deployments*, so the repository's Deployments page and the
"Environments" listed there stay empty of it — anything shown there is left over
from a host that did create them, and can be deleted under Settings →
Environments.

## 2. Environment variables

Project → **Settings** → **Environment variables**, for both Production and
Preview:

| Name | Value | Type |
| --- | --- | --- |
| `CONTACT_ENDPOINT` | `/api/contact` | plain text |
| `CONTACT_TO` | where the messages should arrive | plain text |
| `CONTACT_FROM` | `priemersma.nl <form@priemersma.nl>` | plain text |
| `RESEND_API_KEY` | the key from step 3 | **secret** |

`RESEND_API_KEY` is a secret, not plain text. The difference is that a secret
cannot be read back out of the dashboard afterwards — which is the point, and
also means the only way to change it is to replace it.

`CONTACT_ENDPOINT` is read at build time and decides what the contact page
renders: set, it renders the form; unset, it renders the email address instead.
CI sets it too, so what CI checks is what the project builds.

`CONTACT_FROM` must be at a domain Resend has verified. It cannot be the
visitor's own address — that fails SPF and lands in spam — which is why their
address goes in `reply_to` instead, so replying still reaches them.

## 3. The mail account

[Resend](https://resend.com): 3,000 emails a month and 100 a day on the free
plan.

Cloudflare has its own **Email Sending** in the sidebar, and it is tempting to
use the platform you are already on. It is not free: it requires the Workers Paid
plan at $5 a month. That is the whole reason the code targets Resend instead. If
the site ever moves to a paid Workers plan for another reason, switching is one
function in `src/lib/contact.ts`.

The DNS records Resend asks for live in Cloudflare DNS and must be **DNS-only**
(grey cloud, not orange) — proxying mail records breaks them.

A DMARC record is worth the two minutes it takes on top:

```
Name: _dmarc      Type: TXT
v=DMARC1; p=none; rua=mailto:peter@riemersmaict.nl
```

`p=none` changes nothing about delivery — it asks receiving servers to report
what is being sent in your name. Read those for a few weeks before tightening it
to `quarantine`.

## 4. Rate limiting the contact form

**This one is worth doing, and it is not done by anything in this repository.**

The Function has no memory between requests, and the storage that would give it
one is a paid binding. So it can refuse a malformed submission, an oversized one
and one posted from another site — all of which it does — but it cannot notice
that the same address has sent four hundred messages in a minute. Nothing in the
code can.

The number that matters is not Cloudflare's. Workers allows 100,000 requests a
day; Resend's free plan allows **100 emails a day**. A script can spend the whole
mail quota in under a minute and the form is then down for everyone until
midnight, with no error anywhere except in the logs.

The free plan includes exactly one rate limiting rule. Spend it here.

Dashboard → the `priemersma.nl` zone → **Security rules** → **Create rule** →
**Rate limiting rule**:

| Field | Value |
| --- | --- |
| Rule name | `contact form` |
| When incoming requests match | URI Path **equals** `/api/contact` |
| … and | Request Method **equals** `POST` |
| Characteristics | IP with NAT support (the default) |
| Rate | 5 requests per 10 seconds — or the shortest period the plan offers |
| Action | Block |

Five in ten seconds is far above anything a person filling in a form produces and
far below what a script needs to be worth writing. The free plan restricts which
periods and durations are selectable, so take what the dashboard offers rather
than matching this table exactly.

### What this does not do

A distributed flood from many addresses walks past a per-IP limit. The honest
answer to that is [Turnstile](https://developers.cloudflare.com/turnstile/), which
is free and unlimited — and which needs a script tag on the contact page. This
site ships no JavaScript at all, so adding it is a real trade rather than a free
win. It is the right next step if the form ever actually gets abused, and not
before.

## 5. Domains

`priemersma.nl` and `www.priemersma.nl` are custom domains on the Pages project.

`riemersmaict.nl` points at the same site, and two domains serving identical
pages is worse than it looks: search engines pick one and treat the other as a
duplicate, and which one they pick is not up to you. Every canonical tag, every
`hreflang` and the whole sitemap in this repository name `priemersma.nl`, so the
other domain says the same thing at the HTTP level:

**Rules** → **Redirect Rules** → **Create rule**

| Field | Value |
| --- | --- |
| When incoming requests match | Hostname equals `riemersmaict.nl` (add a second `or` for `www.riemersmaict.nl`) |
| Type | Dynamic |
| Expression | `concat("https://priemersma.nl", http.request.uri.path)` |
| Status | 301 |
| Preserve query string | on |

**This does not touch mail.** A redirect rule acts on HTTP; `riemersmaict.nl`'s
MX record and everything at `peter@riemersmaict.nl` keep working exactly as they
do now.

## 6. After a deploy

Almost all of this is checked before a merge — `npm run check:export` reads the
export as files and `npm run smoke` reads it as a site, both in CI. What is worth
looking at on the real domain is the part CI cannot have an opinion about:

- Send yourself a message through the form, and **reply to it**. The reply should
  go to the address you filled in, not to your own.
- `/` lands on `/en`, and the language switch stays on the same page.

The whole of the rest can be rehearsed locally, without an account:

```bash
npm run build && npm run smoke     # asserts it
npm run serve:static               # http://localhost:4000, to look at it
```

`serve:static` reads `_redirects` and `_headers` and runs the Function the way
Cloudflare does. With `CONTACT_DRY_RUN=1` the mail is printed to the terminal
instead of sent:

```bash
CONTACT_DRY_RUN=1 CONTACT_ENDPOINT=/api/contact npm run build
CONTACT_DRY_RUN=1 npm run serve:static
```

## 7. What is no longer here

The site was on Vercel until August 2026. Three things existed only for that and
are gone: `src/proxy.ts`, which negotiated a locale from `Accept-Language`; the
`redirects()` block in `next.config.mjs`, which needed a server to run in; and
the `STATIC_EXPORT` flag that made the export optional.

The one real loss is the first: a static redirect cannot read a visitor's
language preference, so the bare domain always goes to English. Doing it properly
needs a Worker in front of the site, which is worth it only if the analytics ever
show it matters. Anyone who wants Dutch is one click away in the header, and
every link that names a language keeps working.
