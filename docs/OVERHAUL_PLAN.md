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

1. **Evidence over adjectives.** "Deployed 2.5GbE and Wi-Fi 7 across a multi-site
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
| CSS | 19.8 KB | ≤ 10 KB | **5.1 KB** |
| HTML | 8.9 KB | ≤ 15 KB | 8.1 KB |
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
- **Static Open Graph images.** `/og` is currently a dynamic route rendering a
  1920×1080 image on every request — a serverless invocation for every crawl, at four
  times the pixels any platform displays. Moving to `opengraph-image.tsx` generates
  1200×630 PNGs at build time, served from the CDN, costing zero runtime.
- **Self-hosted subset fonts.** `next/font/local` with a Latin subset, `font-display:
  swap`, and size-adjust metrics to make the fallback match — eliminating the shift.
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

### 7.3 Open questions for you

These are the gaps I cannot fill from the repository:

1. **LinkedIn.** Your profile is blocked by this environment's network policy, so I
   could not read it. Exact job titles, dates, the certifications you hold (CCNA?
   Azure? Home Assistant-related?), and your own "about" text would meaningfully
   improve the copy.
2. **Numbers.** Case studies live on specifics — sites connected, users supported,
   uptime, throughput, hours saved. Even rough figures are far stronger than none.
3. **Images.** There is one avatar and three project images in `public/`. Photographs of
   real racks, dashboards or installations would carry the work pages.
4. **Positioning.** Is this aimed at employers (internships, graduate roles) or at
   pyxels/Riemersma ICT clients? The two audiences want different first screens. It can
   serve both, but one has to lead.
5. **CV.** Should the site offer a downloadable PDF, generated from the same content
   source so it can never drift out of date?

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

## 9. Roadmap

Each phase is independently shippable. Nothing goes to production half-finished.

| Phase | Work | Outcome |
| --- | --- | --- |
| **0 — PoC** *(this branch)* | Token layer, motion system, one fully realised page at `/preview` | Something to react to before the rewrite starts |
| **1 — Foundation** | Token layer merged, `RouteGuard` removed, primitives built, fonts self-hosted | Content in the HTML; the largest performance win, on its own |
| **2 — Pages** | Home, about, work index and case-study template rebuilt on the new system | The new site, feature-complete |
| **3 — Cleanup** | Once UI, Sass, `react-icons` and the API routes removed; budget enforced in CI | The budget in §6 met and defended |
| **4 — Content** | Case studies rewritten to the template, LinkedIn details folded in, real images | The site actually sells the work |
| **5 — Polish** | Static OG images, `hreflang`, JSON-LD, `/uses`, optional CV export | Search, sharing and the long tail |

Phase 1 is where most of the measured gain lands. Phases 4 and 5 are where most of the
*hiring* value lands.

---

## 10. Risks and how they are handled

| Risk | Mitigation |
| --- | --- |
| Rewriting the design system breaks the live site | Every phase ships behind a Vercel preview deployment; `main` is only updated once a phase is verified. |
| Scroll-driven animations are unsupported in an older browser | `@supports` guard with a fully-visible default. Unsupported browsers get a complete, static page — never a hidden one. |
| Content work stalls the technical work | Phases 1–3 are entirely independent of content. The technical rewrite never waits on copy. |
| The rebuild drifts back toward a generic template | The performance budget and the design principles in §4.1 are the review criteria for every PR. |
| Free-tier limits | The end state is fully static. No serverless functions beyond locale routing, so build minutes are the only meter that moves. |

---

## 11. What is in this branch right now

- This plan.
- `src/styles/tokens.css` — the complete token layer, dark and light.
- `src/styles/base.css` — reset and element defaults.
- `src/styles/motion.css` — the scroll-driven animation system.
- `src/app/[locale]/preview/` — a fully server-rendered PoC page using all of the above.

- `src/components/ui/icons.tsx` — inline SVG icons, replacing `react-icons`.

The PoC is additive. Exactly one existing file was modified — `src/middleware.ts`, where
`preview` was added to the matcher's exclusion list so the locale middleware does not
rewrite `/preview` to a locale-prefixed path that has no route. Nothing else was touched:
the current site still builds and behaves exactly as before, and the preview route is
`noindex`. It exists to be judged, then either promoted or thrown away.

See [`PROOF_OF_CONCEPT.md`](./PROOF_OF_CONCEPT.md) for what it demonstrates and how to
run it.
