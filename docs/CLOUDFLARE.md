# Moving to Cloudflare Pages

Everything in the repository is ready for this. What is left is account setup,
and it is all in a browser rather than in code.

The site is deployed on Vercel today and will keep working there throughout; the
switch is the last step, and it is a DNS change that can be undone.

---

## 0. Merge first

Cloudflare builds a branch of the repository, and the build command below —
`npm run build:static` — only exists once this work is on `main`. So the pull
request goes first.

Merging changes nothing about the Vercel deployment: it still builds with
`npm run build`, and the contact form stays invisible there because
`CONTACT_ENDPOINT` is only set in the Cloudflare project.

## 1. Create the Pages project

Cloudflare dashboard → **Compute** → **Workers & Pages** → **Create** →
**Pages** → **Connect to Git**, and pick `GroteGehaktBal/nextpriemersma`.

(The 2026 dashboard groups the sidebar into Observe / Build / Compute. Cloudflare's
own documentation still writes this as "go to Workers & Pages"; it is the same
page, one level in.)

Build settings:

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Build command | `npm run build:static` |
| Build output directory | `out` |
| Root directory | `/` |

The `functions/` directory at the repository root is picked up automatically —
that is where the contact form's endpoint lives. Cloudflare generates a
`_routes.json` from it so that only `/api/*` invokes a Function and every other
request is served as a static asset, which is the difference between free and
metered:

- **Static assets** — unlimited requests, on the free plan.
- **Functions** — counted against the Workers free allowance of 100,000 requests
  a day. A contact form will not approach that.

`public/_redirects` is copied into `out/` by the build and does the job
`src/proxy.ts` does on Vercel: sends `/about` to `/en/about`, the bare domain to
a language, and the removed `/blog` and `/gallery` URLs somewhere useful.

## 2. Set up the mail account for the contact form

The form needs somewhere to send mail from. [Resend](https://resend.com) is what
the code is written against: 3,000 emails a month and 100 a day on the free plan,
which is a contact form several times over.

Cloudflare has its own **Email Sending** in the sidebar, and it is tempting to use
the platform you are already on. It is not free: it requires the Workers Paid
plan at $5 a month, with 3,000 messages included. That is the whole reason the
code targets Resend instead. If the site ever moves to a paid Workers plan for
another reason, switching is one function in `src/lib/contact.ts`.

1. Create an account and add **priemersma.nl** as a domain.
2. Resend gives you three DNS records — an MX/TXT pair for the sending subdomain
   and a DKIM key. Add them in Cloudflare DNS. **Set them to DNS-only** (grey
   cloud, not orange) — proxying mail records breaks them.
3. Wait for the domain to verify, then create an API key with send permission.

`priemersma.nl` has no SPF, DKIM or DMARC record at all today. Resend's records
add the first two for the subdomain it sends from. A DMARC record is worth the
two minutes it takes on top:

```
Name: _dmarc      Type: TXT
v=DMARC1; p=none; rua=mailto:peter@riemersmaict.nl
```

`p=none` changes nothing about delivery — it asks receiving servers to report
what is being sent in your name. Read those for a few weeks before tightening it
to `quarantine`.

## 3. Give the Pages project its settings

Pages project → **Settings** → **Environment variables**, for both Production and
Preview:

| Name | Value | Type |
| --- | --- | --- |
| `CONTACT_ENDPOINT` | `/api/contact` | plain text |
| `CONTACT_TO` | where the messages should arrive | plain text |
| `CONTACT_FROM` | `priemersma.nl <form@priemersma.nl>` | plain text |
| `RESEND_API_KEY` | the key from step 2 | **secret** |

`CONTACT_ENDPOINT` is read at build time and decides what the contact page
renders: set, it renders the form; unset, it renders the email address instead.
That is why the form does not appear on the Vercel deployment, where there is no
endpoint to post to.

`CONTACT_FROM` must be at a domain Resend has verified. It cannot be the
visitor's own address — that fails SPF and lands in spam — which is why their
address goes in `reply_to` instead, so replying still reaches them.

## 4. Check the preview

Cloudflare gives the project a `*.pages.dev` address. Before touching DNS, walk
through it:

- `/` redirects to `/en`, and `/about` to `/en/about`.
- `/blog` and `/gallery` land on the home page rather than a 404.
- Both languages, and the language switch staying on the same page.
- Send yourself a message through the form, and reply to it — the reply should go
  to the address you filled in, not to your own.

The same walk can be done locally first, without an account:

```bash
CONTACT_DRY_RUN=1 CONTACT_ENDPOINT=/api/contact npm run build:static
CONTACT_DRY_RUN=1 npm run serve:static     # http://localhost:4000
```

That serves `out/` with Cloudflare's own path resolution and redirect rules, runs
the Function, and prints the email to the terminal instead of sending it.

## 5. Move the domain

Add `priemersma.nl` and `www.priemersma.nl` as custom domains on the Pages
project. Because the DNS is already at Cloudflare, this rewrites the records for
you; propagation is minutes.

### The second domain

`riemersmaict.nl` points at the same site today. Two domains serving identical
pages is worse than it looks: search engines pick one and treat the other as a
duplicate, and which one they pick is not up to you. Every canonical tag, every
`hreflang` and the whole sitemap in this repository name `priemersma.nl`, so the
tidy arrangement is for the other domain to say the same thing at the HTTP level.

Add it as a custom domain on the Pages project as well — that is what puts it
behind Cloudflare's proxy, which a redirect rule needs — and then:

**Rules** → **Redirect Rules** → **Create rule**

| Field | Value |
| --- | --- |
| When incoming requests match | Hostname equals `riemersmaict.nl` (add a second `or` for `www.riemersmaict.nl`) |
| Type | Dynamic |
| Expression | `concat("https://priemersma.nl", http.request.uri.path)` |
| Status | 301 |
| Preserve query string | on |

The free plan's allowance of redirect rules is small but this needs exactly one.

**This does not touch mail.** A redirect rule acts on HTTP; `riemersmaict.nl`'s
MX record and everything at `peter@riemersmaict.nl` keep working exactly as they
do now.

Then, in order:

1. Watch the site on the real domain for a day.
2. Remove the domain from the Vercel project.
3. Delete `src/proxy.ts` and the `redirects()` block in `next.config.mjs`, which
   exist only for Vercel, and drop `STATIC_EXPORT` — the export becomes the only
   build. Keep `npm run check:export` in CI.

Step 3 is a pull request, not a rush. Nothing breaks if it waits.

## What changes for you

| | Vercel | Cloudflare Pages |
| --- | --- | --- |
| Static requests | metered by plan | unlimited, free |
| Commercial use on the free plan | not permitted | permitted |
| Locale negotiation | `src/proxy.ts`, reads Accept-Language | `_redirects`, always English |
| Contact form | no endpoint | `functions/api/contact.ts` |
| Analytics | Vercel's, unused here | Cloudflare Web Analytics, free, no cookie banner |
| Second domain | two sites, one canonical | one 301, one site |

The one real loss is in that fourth row: a static redirect cannot read a
visitor's language preference, so the bare domain always goes to English. Doing
it properly needs a Worker in front of the site, which is worth it only if the
analytics ever show it matters. Anyone who wants Dutch is one click away in the
header, and every link that names a language keeps working.
