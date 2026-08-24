# Portfolio Overhaul — Plan

**Status:** proposal, awaiting review
**Branch:** `claude/portfolio-overhaul-plan-vefcnd`
**Author:** Peter Riemersma
**Last updated:** 2026-08-22

---

## 1. Goal

Turn `priemersma.nl` from a lightly edited template into a portfolio that stands on its
own: fast, precise, and credible enough to be the first thing a recruiter or client sees.

Three hard constraints drive every decision below.

| Constraint | What it means in practice |
| --- | --- |
| **Free hosting on Vercel** | No paid add-ons, no database, no external SaaS. Everything is statically pre-rendered at build time; runtime compute stays inside the Hobby limits. |
| **Fast** | A measurable performance budget (§6), enforced in CI. Perceived speed matters as much as the numbers. |
| **Subtle animation** | Motion is used to direct attention, never to entertain. It costs zero JavaScript and disappears for users who ask it to. |

A fourth, softer goal: the repository is going public, so the code, comments, commit
messages and documentation are written in English and are meant to be read.

---

## 2. Where we are today

The site is a fork of [Once UI Magic Portfolio](https://github.com/once-ui-system/magic-portfolio).
It works, it is deployed, and a fair amount of content has already been written. The
problems are structural rather than cosmetic, which is exactly why an overhaul is
worth the effort rather than another round of tweaks.

### 2.1 Baseline measurements

Captured from `npm run build` on commit `08c762d`:

| Metric | Today |
| --- | --- |
| Client JavaScript, all chunks | 1 164 KB raw / **363 KB gzip** |
| CSS | 154 KB raw / **20.8 KB gzip** |
| Design-system source vendored into `src/` | 110 files, **~11 950 lines** |
| Page content present in the pre-rendered HTML | **none** (see 2.2) |
| Runtime functions on a "static" site | 3 (`/og`, 2 Pages Router API routes) + middleware |
| Automated checks in CI | 0 |

### 2.2 The headline problem: nothing is server-rendered

`src/components/RouteGuard.tsx` is a client component that wraps **every page**. It
starts in `loading: true` and only renders `children` after a `useEffect` has run.

Because that state is the initial state, the pre-rendered HTML that Vercel serves
contains a loading spinner instead of the page. Extracting the visible text from the
built `about` page proves it:

```
class="flex p-0 m-0 flex-column" ...> Home About Work EN NL © 2026 / Peter Riemersma
```

The header, the language switcher and the footer are there. "Introduction", "Work
Experience", the job history — none of it is. The same holds for every route.

The consequences are not subtle:

- **LCP is gated behind 363 KB of JavaScript.** The browser must download, parse and
  hydrate React before the first meaningful pixel exists. Next.js pre-rendered the
  pages perfectly well; the guard throws that work away.
- **A layout shift is guaranteed**, because a centred spinner is replaced by a full page.
- **Crawlers and link unfurlers see a spinner.** Google will usually execute the JS
  eventually; LinkedIn, Slack, WhatsApp and Bing largely will not. For a portfolio
  whose main distribution channel *is* LinkedIn, this is the single most expensive bug
  on the site.

The guard exists to hide disabled routes and to password-protect one URL. Both are
solvable at build time, for free, with no client JavaScript at all.

### 2.3 The always-on animation loop

`Background` is configured with `mask: 'cursor'`. That code path registers a
`mousemove` listener **and** a `requestAnimationFrame` loop that calls `setState`
on every single frame, for as long as the tab is open:

```tsx
const updateSmoothPosition = () => {
    setSmoothPosition((prev) => { /* ... */ });
    animationFrameId = requestAnimationFrame(updateSmoothPosition);
};
```

A React re-render at 60 fps, forever, to move a decorative gradient. On a laptop it is
a fan; on a phone it is battery. It is also the reason INP is at risk: the main thread
is never idle.

### 2.4 Content and configuration debt

- **Template placeholder content is still in the repository.** `src/app/resources/content.js`
  describes "Selene, a Jakarta-based design engineer" working at "FLY" and "Creativ3".
  It is currently unreachable because `i18n` is `true`, but it ships in the repo and
  will be the first thing a visitor to the public GitHub reads.
- **The blog post is template filler** ("Arriving to a new milestone in my career") and
  references `/images/gallery/img-02.jpg`, which does not exist. The gallery page is
  disabled but still built, and points at fourteen images that are also missing.
- **`.github/FUNDING.yml` funds the template's authors.** On a public repo under your
  name, the GitHub Sponsors button on your portfolio would collect for someone else.
- **`.github/dependabot.yml` has an empty `package-ecosystem`** and therefore does nothing.
- **`.gitignore` ignores itself** (first entry is `.gitignore`).
- **The sitemap emits URLs without a scheme.** `baseURL` is `'priemersma.nl'`, and
  `sitemap.ts` interpolates it directly: the output is `priemersma.nl/about`, not
  `https://priemersma.nl/about`. Search engines reject those entries.
- **`robots.ts` emits a rule with no `allow` or `disallow`.**
- **The middleware matcher references a locale that does not exist** — `'/(en|id)/:path*'`.
  `id` is the template's Indonesian locale; this site is `en` and `nl`.
- **No `hreflang` alternates**, so Google cannot connect the English and Dutch versions,
  and `metadataBase` is built with the locale baked in, which makes every relative
  metadata URL locale-scoped.
- **Achievements are stored as a single string split on `;`.** `t("...achievements").split(";")`
  means a semicolon inside a sentence silently splits a bullet in two.
- **Linting does not run at all.** Two independent breakages: `npm run lint` calls
  `next lint`, which Next.js 16 removed (it now reads `lint` as a directory name and
  fails with *"Invalid project directory provided"*), and the config is a legacy
  `.eslintrc.json`, which ESLint 10 no longer reads — it requires flat config. Neither
  failure is loud, so the repository has effectively had no linting for some time.
- **`next export` is still in `package.json`** — removed in Next.js 14.
- **`vercel` is a devDependency** (~50 MB) but is never invoked by any script.
- **TypeScript `strict` is off**, and Next.js rewrites `tsconfig.json` on every build
  (`jsx: preserve` → `react-jsx`), which has already caused one revert commit.
- **Next.js 16 deprecation:** the build warns that `middleware.ts` should become `proxy.ts`.

### 2.4b Resolved — dependencies and the failing deployment

Handled on this branch rather than deferred, because it was blocking deployment.

Vercel refused the build outright: *"Vulnerable version of next-mdx-remote detected
(5.0.0)"* — an arbitrary-code-execution advisory in server-side rendering of MDX.
`npm audit` found 49 more, 50 in total, 2 critical and 27 high.

Most came from packages nothing imports: the `vercel` CLI and `@swc/cli` were
devDependencies no script invoked, and between them carried both criticals. Removing
them plus `punycode`, `remark` and `remark-html` took 377 packages out of the tree.
Everything else moved to its latest working release. **Result: 0 vulnerabilities.**

Two upgrades were deliberately *not* taken to the newest number. TypeScript 7.0 is out,
but `typescript-eslint` refuses to load under it, and ESLint 10 breaks
`eslint-config-next`'s parser. Both are pinned one major back, where the toolchain
works. An upgrade that breaks the tooling is not an upgrade.

The version bumps also forced fixes that were overdue:

- The password for protected routes was the string literal `'password'` in the source.
  It now reads `SITE_PASSWORD` from the environment and refuses every attempt when
  unset — no configuration should mean no access, not trivial access.
- Turbopack now warns that `getPosts` building its path from a caller-supplied array
  forces the entire project, `public/` included, into the server bundle. The path is
  anchored to a literal content root; traced files per route dropped from 856 to 677.
- Linting was restored (see §2.4) and a `typecheck` script added.
- Deleting the unreachable non-i18n branch un-masked a real bug: study institution
  names were JSX fragments passed to an `id` attribute, so every entry rendered
  `id="[object Object]"` and the About page's table-of-contents links to Studies could
  never resolve. Verified fixed in a browser.

### 2.5 What is worth keeping

Not everything needs to go. Explicitly carried forward:

- The **Next.js App Router + `next-intl`** foundation. Bilingual EN/NL is a genuine
  differentiator in the Dutch market and the routing setup is sound.
- **MDX for projects.** Writing a case study in Markdown is the right authoring model.
- The **real content already written**: the pyxels and Riemersma ICT entries, the
  Teradruk BV network project, the Weather Forecast IoT project, and the EN/NL
  translations of the about page.
- **Vercel Speed Insights**, which is free and gives real-user Core Web Vitals.
- The **dark, technical aesthetic**. The direction is right; the execution is generic.

---

## 3. Target architecture

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx          # server component, no client wrapper
│   │   ├── page.tsx            # home
│   │   ├── about/
│   │   ├── work/[slug]/
│   │   └── opengraph-image.tsx # static OG, generated at build
│   ├── sitemap.ts
│   └── robots.ts
├── content/                    # typed content, one module per locale
│   ├── types.ts                # the Content interface — the contract
│   ├── en.ts
│   └── nl.ts
├── components/
│   ├── ui/                     # small, owned primitives
│   └── sections/               # page-level compositions
├── styles/
│   ├── tokens.css              # design tokens, light + dark
│   └── base.css                # reset and element defaults
└── proxy.ts                    # locale routing (renamed from middleware.ts)
```

Four structural changes:

**1. Delete the `RouteGuard` wrapper.** Disabled routes become build-time decisions:
a route that is off is simply not generated by `generateStaticParams`, so it returns a
real 404 with no client code involved. Password protection, if still wanted, moves to
Next.js Middleware/Proxy — a header check at the edge, never a spinner in the markup.
This alone puts the page content back into the HTML.

**2. Replace the vendored design system.** ~11 950 lines of Once UI live in `src/`, of
which the site uses maybe fifteen components. A portfolio does not need `TagInput`,
`ColorInput`, `Carousel`, `Toaster`, `UserMenu` or `Dialog`. We keep a small set of
owned primitives — roughly 400 lines — built on the token layer. Everything that is
purely presentational becomes a server component.

**3. Move content into typed TypeScript.** `content-i18n.js` is a `.js` file containing
JSX that looks up translation keys, with array data smuggled through delimited strings.
Replacing it with `src/content/{en,nl}.ts` files that satisfy a shared `Content`
interface gives compile-time errors when a locale is missing a field, real arrays for
list data, and autocomplete while writing. The `messages/*.json` files stay for the
handful of genuinely interpolated UI strings.

**4. Own the CSS.** Sass, `postcss-preset-env`, `postcss-custom-media`,
`@csstools/postcss-global-data` and `postcss-flexbugs-fixes` are all in the dependency
tree to compile a design system we are removing. Modern CSS — custom properties,
`color-mix()`, `clamp()`, container queries — covers everything the site needs
natively. Five build dependencies leave, and the CSS becomes readable in DevTools.

---

## 4. Design language — "Signal"

The brief is a Network & Security Engineering student who runs a smart-home and network
business. The design should read as *engineered*: precise, calm, quietly confident.
Not a "hacker" aesthetic, not a generic startup landing page.

### 4.1 Principles

1. **Evidence over adjectives.** "Deployed 10GbE and Wi-Fi 7 across a multi-site
   network" beats "passionate about technology". The layout gives specifics the space.
2. **Restraint is the signal.** One accent colour, one geometric shape language, one
   motion idea. Anyone can add. Knowing what to leave out is what reads as senior.
3. **Everything is on a grid.** Consistent spacing and a strict type scale are the
   difference between "made with a template" and "designed".
4. **Dark-first, but honest.** The current theme is hardcoded to dark. The new one
   defaults to dark, ships a real light theme, and respects `prefers-color-scheme`.

### 4.2 Type

Two families, both self-hosted as subset `woff2` via `next/font/local` — no Google
Fonts round trip, no build-time network dependency, no layout shift.

- **Display and body:** a neutral grotesque (Inter, already in `public/fonts/`).
  Tight negative tracking at display sizes; comfortable measure of 62–68 characters
  for prose.
- **Metadata:** a monospace for labels, dates, tags, technology names and section
  numbers. This is where the engineering character lives — small caps-height mono
  labels next to large sans headings is a deliberate, restrained contrast.

The scale is fluid via `clamp()`, so there are no breakpoint jumps between sizes.

### 4.3 Colour

A near-black canvas with a very slight cool cast — pure `#000` looks cheap, pure grey
looks dead. One accent, used sparingly, as an actual signal: current state, focus ring,
the one link you should click.

Every value is a token in `src/styles/tokens.css`. Both themes are defined; light is a
first-class citizen, not an afterthought inverted from dark.

### 4.4 Layout

A wide content column with a persistent left rail on desktop for section numbering and
progress. Work is presented as substantial cards with room for a real image and a
one-line result, not as a uniform grid of thumbnails. The about page becomes a timeline
rather than a list.

---

## 5. Motion

The requirement is "beautiful subtle animations". The engineering answer is that they
should cost nothing.

### 5.1 CSS scroll-driven animations, zero JavaScript

Reveal-on-scroll is normally an `IntersectionObserver`, which means a client component,
a hydration boundary, and JavaScript on the main thread. Modern CSS does it natively:

```css
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .reveal {
      animation: reveal linear both;
      animation-timeline: view();
      animation-range: entry 5% cover 22%;
    }
  }
}
```

Supported in Chrome/Edge 115+, Safari 26+ and Firefox 144+. The `@supports` guard means
the element's default state is *fully visible* — browsers without support show the
finished page instantly rather than a broken one. Reduced-motion users get the same.
The component stays a server component. The cost is a few hundred bytes of CSS.

### 5.2 The motion vocabulary

Deliberately small, so the site feels like one thing:

| Element | Motion | Duration |
| --- | --- | --- |
| Hero lines | Staggered rise + fade on load, ~60 ms apart | 700 ms |
| Sections | Rise 12 px + fade, driven by scroll position | scroll-linked |
| Cards | Lift 2 px, border brightens on hover | 200 ms |
| Links | Underline sweeps in from the left | 250 ms |
| Route changes | Cross-fade via the View Transitions API | 200 ms |
| Accent rule | Scales from 0 to full width as its section enters | scroll-linked |

Everything uses one easing curve (`--ease-out: cubic-bezier(0.22, 1, 0.36, 1)`) and one
of three durations. Only `transform` and `opacity` are animated, so every animation runs
on the compositor and never triggers layout.

### 5.3 What gets removed

The cursor-tracking background loop (§2.3) is deleted. The ambient background becomes a
static masked gradient and dot grid: pure CSS, painted once, no listeners, no rAF, no
re-renders. Visually it is nearly identical; it just stops costing 60 frames a second.

### 5.4 Reduced motion

Every animation sits inside `@media (prefers-reduced-motion: no-preference)`. Users with
the OS setting enabled get an entirely static, fully functional site — not a degraded one.

---

## 6. Performance budget

Enforced in CI. A pull request that exceeds a budget fails.

All figures are gzip, measured on a real production build.

| Metric | Today (`/about`) | Budget | PoC (`/preview`) |
| --- | --- | --- | --- |
| **Application JS** | 63.0 KB | ≤ 15 KB | **0.0 KB** |
| Framework baseline JS | 163.4 KB | — | 163.4 KB |
| CSS | 19.8 KB | ≤ 10 KB | **5.4 KB** |
| HTML | 8.9 KB | ≤ 15 KB | 10.6 KB |
| Page content in the HTML | none | all | **all** |
| LCP (mobile, slow 4G) | gated on hydration | < 1.5 s | not JS-gated |
| CLS | shifts on hydrate | 0 | 0 |
| INP | competing with a 60 fps rAF loop | < 200 ms | no main-thread loop |
| Lighthouse (all four) | — | ≥ 95 | 100 |

A note on the framework baseline, because it is the honest caveat here: 163 KB of the
first load is the Next.js App Router and React 19 client runtime. It is identical on
both pages, it is cached across every route, and short of abandoning React it is not
something a portfolio can optimise away. **Application JavaScript is the number we
actually control**, and that is what the budget governs.

The PoC ships **zero** application JavaScript — verified by diffing the chunk sets of
the two pages, where `/preview` adds nothing beyond the shared baseline. The current
pages add 63 KB on top of it, and until that 63 KB has downloaded and hydrated, there
is no content on screen at all. That is the difference that matters: not the size of
the bundle, but whether the page needs it before it can be read.

### 6.1 How we get there

- **Server components by default.** `"use client"` becomes an exception that needs a
  reason. Today the theme switcher, the language switcher and the mobile menu are the
  only genuine candidates.
- **No icon library.** `react-icons` pulls from three separate families. The site uses
  about a dozen icons; they become inline SVG components. One dependency removed, and
  each icon costs roughly 200 bytes instead of a module graph.
- **Static Open Graph images.** ✅ Done, though not as planned here. `/og` was a
  dynamic route rendering a 1920×1080 image on every request — a serverless invocation
  for every crawl, at four times the pixels any platform displays. It was also broken:
  satori cannot read WOFF2, and WOFF2 was the only font the route had, so every request
  returned a 500. It is now a single 1200×630 PNG in `public/`, rendered once from
  `scripts/og-card.html` by a script that is not part of the build.
- **Self-hosted fonts.** ✅ Done by `next/font/google`, which downloads and self-hosts
  at build time — there is no request to Google at runtime. Two families at 68.8 KB
  gzipped is the remaining cost, and subsetting is what would reduce it.
- **Modern image pipeline.** AVIF with WebP fallback, explicit dimensions on every
  image, `priority` only on the true LCP element, and `sizes` that match the real layout.
- **Fewer runtime surfaces.** The two Pages Router API routes go. The proxy shrinks to
  locale negotiation only.
- **`Cache-Control: immutable`** on hashed assets, and a `no-store`-free static site
  that Vercel's CDN can hold indefinitely.

### 6.2 Measurement

- `@next/bundle-analyzer` on demand for investigating regressions.
- A `size-limit` config in CI as the actual gate.
- Lighthouse CI against a preview deployment on every pull request.
- Vercel Speed Insights (already installed) for field data from real visitors.

---

## 7. Content

Structure comes first; the words can be refined afterwards.

### 7.1 Information architecture

| Route | Purpose |
| --- | --- |
| `/` | Positioning in one screen, three or four proof points, selected work, contact. |
| `/about` | The full story: timeline, education, capabilities, certifications. |
| `/work` | Every project. |
| `/work/[slug]` | A case study: context → constraints → what was built → outcome. |
| `/uses` *(optional)* | The home lab and network stack. Cheap to write, disproportionately credible for this field, and genuinely interesting to the audience. |

The gallery and blog stay disabled until there is real material for them. An empty blog
is worse than no blog.

### 7.2 Case study template

Every project answers the same five questions, so they can be scanned side by side:

1. **Context** — whose problem, and why it mattered.
2. **Constraints** — budget, existing hardware, uptime requirements, deadline.
3. **Approach** — what was built, and the reasoning behind the key decisions.
4. **Stack** — concrete technologies, as mono-labelled tags.
5. **Outcome** — a measurable result wherever one exists.

The existing Teradruk BV and Weather Forecast entries already have most of this; they
need restructuring, not rewriting.

### 7.3 What the LinkedIn profile added

The profile has now been folded into the content model. Two things on it were absent
from the site entirely, and both are among the strongest credentials there:

- **Data Center Technician, Google — Eemshaven (2021–2022).** An eight-month internship
  in one of Europe's largest data centres, troubleshooting network faults and server
  hardware at production scale. This was nowhere on the portfolio. For a network and
  security student it is the single most persuasive line available, and it now sits in
  the hero facts and the experience timeline.
- **Cisco CCNA — two modules** (Enterprise Networking, Security & Automation, Nov 2023;
  Switching, Routing & Wireless Essentials, Oct 2023). Named certification from the
  vendor whose equipment the work is about. Previously the site said only "Cisco
  Networking" as a self-described skill.

Also corrected: exact dates for every role, Noorderpoort as *Network and System
Administration* (2019–2022) rather than "Network management", and Hanze from 2022.

Two editorial decisions worth confirming:

1. **Eleven certifications is too many to show flat.** The two Cisco CCNA modules get
   their own cards; the remaining nine — mostly LinkedIn Learning courses — are a
   compact list underneath. Showing all eleven at equal weight buries the two that a
   hiring manager actually recognises.
2. **Conduent (telesales) and Studentaanhuis are rendered as secondary entries**,
   dimmed and tightened. They are real and worth listing for continuity, but they are
   not what a reader is on the page for. ProjectXXL (logistics, 2021) is omitted
   entirely as unrelated to the field — easy to add back if you would rather show it.

### 7.4 Still open

1. **Numbers.** Case studies live on specifics — sites connected, users supported,
   uptime, throughput, hours saved. Even rough figures are far stronger than none.
2. **Images.** There is one avatar and three project images in `public/`. Photographs of
   real racks, dashboards or installations would carry the work pages.
3. **CV.** Should the site offer a downloadable PDF, generated from the same content
   source so it can never drift out of date?
4. **The Google internship.** Confirm you are happy to name the employer prominently —
   it is on your public LinkedIn, so this is a presentation question rather than a
   permission one, but it is your call how far forward it sits.

### 7.5 Positioning — settled

The first screen is for **anyone who wants to know who Peter Riemersma is** — not
employers specifically, and not pyxels clients specifically.

That is the easiest brief of the three, and it is what the current hero already does:
it states what he builds, then backs it with four facts a stranger can check
(CCNA, Google, the throughput he works at, the languages he speaks). It does not
pitch a service or ask for a job. The availability line stays because it is useful
information to any visitor, not because the page is a job application.

The practical consequence for the rebuild: **no audience switch, no duplicated
landing page.** One home page, written for a curious reader, with the work and the
background doing the persuading.

---

## 8. Tooling and repository quality

The repository is going public, so it should read like a repository worth reading.

- **TypeScript `strict: true`**, including `noUncheckedIndexedAccess`. Content files get
  real types instead of `any`.
- **ESLint flat config** (`eslint.config.mjs`) with the `next`, `@typescript-eslint` and
  `jsx-a11y` rule sets, replacing the legacy `.eslintrc.json` that ESLint 10 ignores, and
  a `lint` script that invokes `eslint` directly now that `next lint` no longer exists.
- **Prettier** with a committed config, so formatting is never a review topic.
- **GitHub Actions CI**: typecheck, lint, build, and the size budget, on every PR.
- **Conventional Commits**, which the history already mostly follows.
- **A real README**: what this is, how to run it, how the content model works, and how
  to add a project — not the template's instructions.
- **Fixed `dependabot.yml`** (`package-ecosystem: npm`) and a **removed `FUNDING.yml`**.
- **A `LICENSE` decision.** The current CC BY-NC 4.0 comes from the template and forbids
  commercial use, which is an odd fit for a business owner's own site. Worth revisiting.
- **`.gitignore`** cleaned up so it stops ignoring itself.

---

## 9. Hosting: Vercel or Cloudflare

Worth settling early, because it changes what the build has to produce.

### The finding that decides it

Vercel's Hobby plan is **not licensed for commercial use**, and Vercel's definition is
broader than "does it take payments". Their Fair Use guidelines count *advertising a
product or service* as commercial usage, alongside processing payments, affiliate
links, ads and being paid to build or host the site.

This portfolio advertises pyxels and Riemersma ICT and invites freelance enquiries.
Under that definition it is a commercial site, and Hobby is the wrong plan for it —
the alternative on Vercel is Pro at roughly $20 per month, which fails the "it must be
free" requirement.

Cloudflare's free plan carries no such restriction. Its limits are usage-based, and
**requests for static assets are free and unlimited** — a request only counts against
the quota when it invokes a Function. For a site whose end state is fully static, that
is effectively an unmetered free tier.

### Recommendation

**Finish the rebuild on Vercel, then move.** Staying put during phases 1–3 costs
nothing: preview deployments on every pull request are genuinely useful while the
design is still moving, and Next.js needs no adapter there. Migrating early would mean
debugging a hosting change and a rewrite at the same time.

### The migration, tested rather than assumed

A static export was run against this branch to find out what actually breaks. The
results are specific, and one of them is a trap.

**Four things block `output: 'export'` today.** Each fails the build with a named error:

| Blocker | Why | Resolution |
| --- | --- | --- |
| `src/app/og/route.tsx` | Dynamic route handler; `ImageResponse` cannot be exported | ✅ Deleted. The card is a static PNG in `public/` (§6.1) |
| `src/pages/api/*` | Pages Router API routes cannot be exported | ✅ Deleted along with the route guard that called them |
| `src/proxy.ts` | Middleware does not exist in a static export | ✅ Not a blocker after all: the export ignores it rather than failing, so it can stay for Vercel while `_redirects` covers Cloudflare |
| `robots.ts`, `sitemap.ts` | Need `export const dynamic = 'force-static'` | ✅ One line each, added |

**All four are cleared.** `npm run build:static` produces a complete `out/`, and
`npm run check:export` proves it: 16 pages, 15 internal links and 13 redirect
rules, every one resolving to a file that exists. Both run in CI on every pull
request, so the export cannot rot between now and the migration.

`npm run serve:static` serves that directory with Cloudflare's own rules — exact
file, then `.html`, then `index.html`, with `_redirects` applied in order — which
is how the redirect table below was verified rather than assumed. The full
accessibility and link sweep passes against it identically to the Vercel build.

With those handled, the export succeeds and emits both locale trees in full:
`out/en/about.html`, `out/nl/about.html` and so on for every page.

**The trap: going static silently changes every English URL.**

Today the middleware makes the default locale unprefixed. `/about` serves English, and
`/en/about` *redirects to* `/about`. In a static export there is no middleware to do
that, so the only file that exists is `out/en/about.html`. There is no `out/about.html`
and no `out/index.html` at all.

Verified on both `localePrefix` settings — `as-needed` and `always` produce the same
output. Changing that setting does **not** avoid this; it is a consequence of losing
middleware, not of the prefix strategy.

Left alone, the migration would 404 the bare domain and every English URL the site has
ever published — including anything already indexed or shared.

**The fix is a redirect map**, which Cloudflare Pages reads from a `_redirects` file at
the output root. It lives at `public/_redirects`, so the export carries it:

```
/            /en               302
/about       /en/about         301
/work        /en/work          301
/work/*      /en/work/:splat   301
/blog/*      /en               301
/gallery     /en               301
```

The root redirect is a 302 because which language a visitor should get is a decision
that may change; the rest are 301 because those URLs have genuinely moved. Language
negotiation from `Accept-Language` needs a Worker rather than a static rule — worth it
only if the analytics later show it matters; the language toggle covers it otherwise.

**One more Cloudflare consideration:** `@vercel/speed-insights` is Vercel-only and will
silently stop reporting. Cloudflare Web Analytics is the free equivalent, and it is a
one-line swap at migration time.

### Consequence for the rebuild

Because the destination is prefixed URLs, phase 2 should adopt `localePrefix: 'always'`
early rather than at migration time. That way the URL change happens once, on Vercel,
where middleware can still issue the redirects — and the eventual move to Cloudflare is
a pure hosting change with no URL churn at all.

## 10. Roadmap

Each phase is independently shippable. Nothing goes to production half-finished.

| Phase | Work | Outcome |
| --- | --- | --- |
| **0 — PoC** ✅ | Token layer, motion system, one fully realised page | Direction agreed before the rewrite started |
| **1 — Foundation** | Token layer merged, `RouteGuard` removed, primitives built, fonts self-hosted | Content in the HTML; the largest performance win, on its own |
| **2 — Pages** ◐ | Home, about and work index rebuilt on the new system | Done, except the case-study template — `/work/[slug]` still renders through Once UI |
| **3 — Cleanup** | Once UI, Sass, `react-icons` and the API routes removed; budget enforced in CI | The budget in §6 met and defended |
| **3b — Static + move** | `localePrefix: 'always'`, static export, deploy to Cloudflare Pages | Free hosting that permits commercial use (§9) |
| **4 — Content** | Case studies rewritten to the template, LinkedIn details folded in, real images | The site actually sells the work |
| **5 — Polish** | Static OG images, `hreflang`, JSON-LD, `/uses`, optional CV export | Search, sharing and the long tail |

Phase 1 is where most of the measured gain lands. Phases 4 and 5 are where most of the
*hiring* value lands.

---

## 11. Risks and how they are handled

| Risk | Mitigation |
| --- | --- |
| Rewriting the design system breaks the live site | Every phase ships behind a Vercel preview deployment; `main` is only updated once a phase is verified. |
| Scroll-driven animations are unsupported in an older browser | `@supports` guard with a fully-visible default. Unsupported browsers get a complete, static page — never a hidden one. |
| Content work stalls the technical work | Phases 1–3 are entirely independent of content. The technical rewrite never waits on copy. |
| The rebuild drifts back toward a generic template | The performance budget and the design principles in §4.1 are the review criteria for every PR. |
| Free-tier limits | The end state is fully static. No serverless functions beyond locale routing, so build minutes are the only meter that moves. |

---

## 12. Where the branch stands

**Shipped.** The design is the site, in both languages, and the template it grew
out of is gone. Home, about, work and the four case studies all run on the token
layer and the section components; `RouteGuard`, the requestAnimationFrame
background and the vendored Once UI design system are deleted. Page content is in
the pre-rendered HTML on every route.

Live at the pull request preview:
**https://nextpriemersma-git-claude-portf-c76459-grotegehaktbals-projects.vercel.app/en**
(and `/nl`).

**Measured per page, gzip, against `main`:**

| | main | now |
| --- | --- | --- |
| Content in the served HTML | none | all of it |
| HTML (`/about`) | 8.9 KB | 8.0 KB |
| JS | 226.4 KB | **131.8 KB** |
| CSS | 19.8 KB | **5.9 KB** |

The JS figure is now almost entirely the React and App Router runtime; the CSS is
the whole design language, tokens included. Removing Once UI is what moved both.

**What that cost in code:** 21,810 lines deleted against 6,129 added, and the
dependency list went from 22 packages to 6 — `next`, `react`, `react-dom`,
`next-intl`, `next-mdx-remote`, `gray-matter`. No icon library, no CSS-in-JS, no
Sass, no PostCSS configuration, no image pipeline.

**Verified**, on a production build, in both languages and both colour schemes:
every route returns 200 with the right `lang`, every internal link resolves,
exactly one `h1` per page with no skipped heading levels, no horizontal overflow
between 320 px and 1920 px, no JavaScript errors, and zero axe violations at
WCAG 2.1 AA. Lint, typecheck and `npm audit` are clean.

**Merged** into `main` on 23 August 2026 as #21, and live.

**Moved.** The site is on Cloudflare Pages as of 23 August 2026, with the contact
form live and delivering through Resend. §9's argument is settled rather than
pending: the free plan permits commercial use, static requests are unmetered, and
the one piece of runtime code is a Pages Function inside the Workers free
allowance.

Everything that existed only for Vercel is gone with it — `src/proxy.ts`, the
`redirects()` block in `next.config.mjs`, and the `STATIC_EXPORT` flag that made
the export optional. There is one build now, and it is the one that ships, which
is what closed the gap between what CI checked and what visitors got.

**Hardened since**, and covered in [`SECURITY.md`](../SECURITY.md): the contact
endpoint refuses a cross-site post, an oversized body and a body that is not a
form; a submitted name can no longer open a second line in a mail header, and an
address can no longer hide a second address in a display name. `public/_headers`
adds a Content-Security-Policy, HSTS and the rest, and `npm run check:export`
fails the build if a page ever starts loading something the policy forbids.
`npm run smoke` serves the export the way Cloudflare does and asserts all of it.

**Outstanding, in order:**

1. **The rate limiting rule.** The only piece of this that is a dashboard click
   rather than code, and the one with a real number behind it: Resend's free
   plan allows 100 emails a day, which a script can spend in under a minute.
   [`docs/CLOUDFLARE.md`](CLOUDFLARE.md) §4 has the settings.
2. **Font payload.** 68.8 KB gzipped for Inter and Source Code Pro is now the
   single largest asset on a page. Subsetting, or dropping to one weight of the
   mono face, is the remaining win.
3. **Case-study copy.** The `pyxels` page is still one line of body text, carried
   by the summary, stack and outcome from the content model. Riemersma ICT has
   been rewritten; pyxels is waiting on Peter.

**Settled since:** the licence. The repository was CC BY-SA 4.0 in `LICENSE` and
CC BY-NC 4.0 in the README — neither a good fit for code, and Creative Commons
advise against their licences for software. It is MIT now, with a `NOTICE` that
reserves the site's own writing and photograph and carries the attribution for
the template this project started from. The repository is public as of
23 August 2026.
