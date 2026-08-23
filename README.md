# priemersma.nl

Personal portfolio for Peter Riemersma — Network & Security Engineering student
at Hanze University, co-owner of [pyxels](https://www.pyxels.eu), freelance at
Riemersma ICT.

Bilingual (English and Dutch), server-rendered, statically generated. Six runtime
dependencies. About a kilobyte of page-specific JavaScript.

## Running it

Requires Node.js 20 or newer. There is nothing to configure — no environment
variables, no API keys, no services.

```bash
npm install
npm run dev        # http://localhost:3000/en
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm run size` | Size budget, against the last build |

CI runs typecheck, lint, build, the size budget and `npm audit` on every push and
pull request.

## How it is put together

```
src/
├── app/[locale]/          # routes — home, about, work, work/[slug]
│   └── work/projects/     # case studies as MDX, one folder per locale
├── content/               # site copy: types.ts, en.ts, nl.ts, case-studies.ts
├── components/site/       # header, footer, page sections, MDX rendering
├── components/ui/         # inline SVG icons
├── styles/                # tokens.css, base.css, motion.css
└── i18n/                  # routing config and URL construction

scripts/                   # size budget, and the source of the link-preview image
```

**Content lives in `src/content`**, as typed TypeScript rather than JSON. Both
locales satisfy the same `Content` interface, so a field added to one language
and forgotten in the other is a build error instead of a blank on the page.

**Every visible string is in that model**, including navigation labels, button
text and the 404 line. If it renders, it is translatable.

**Styling is CSS Modules over a token layer.** Every colour, size, duration and
radius in the interface resolves to a custom property in `src/styles/tokens.css`,
which defines complete dark and light palettes and follows `prefers-color-scheme`.
Text colours are chosen to clear WCAG AA contrast in both.

**Nothing renders on the client.** The only `"use client"` file is the error
boundary, which needs a `reset` callback React hands it at runtime. Everything
else — the language switch, the case-study bodies, the whole interface — is a
server component.

**Animation costs no JavaScript.** Reveal-on-scroll uses CSS scroll timelines
(`animation-timeline: view()`) rather than an IntersectionObserver, so animated
sections stay server components. Every animation sits behind an `@supports` guard
with the finished state as its default, so a browser without scroll timelines —
or a visitor with reduced motion enabled — gets the completed page rather than a
blank one waiting for an animation that will never run.

## Adding a project

1. Write `src/app/[locale]/work/projects/en/my-project.mdx` and its Dutch
   counterpart in `../nl/`. The filename is the URL slug, and it must be the same
   in both folders — that is what makes the two files one page in two languages.
   Frontmatter is `title`, `summary`, `publishedAt`, and optionally `team`;
   collaborators are credited by name under the header.
2. Add an entry to `projects` in `src/content/en.ts` and `src/content/nl.ts`.
   Its `slug` must match the filename — a mismatch is a 404, not a type error.

The case-study page takes its title, summary, tags and outcome from the content
model and its body from the MDX file, so a project reads the same on its card and
on its own page.

## URLs

Every locale is prefixed: `/en/about`, `/nl/about`. The default locale is
prefixed too, deliberately — without it, one URL could serve either language
depending on a cookie while its own canonical tag claimed otherwise.

`src/proxy.ts` redirects an unprefixed URL to the language the visitor's browser
asks for, which is what keeps the site's older `/about`-style links working.

## The link preview image

`public/og.png` is the card shown when a link to the site is shared. It is
rendered once from `scripts/og-card.html`, not generated per request:

```bash
node scripts/generate-og.mjs     # needs a global Playwright install
```

## Roadmap

See [`docs/OVERHAUL_PLAN.md`](docs/OVERHAUL_PLAN.md) for the audit this rebuild
came out of, the design and performance decisions behind it, the measurements,
and what is left.

## Licence

Code: [MIT](LICENSE).

Not covered by that licence: the site's written content and the photograph, which
are Peter's own, and the typefaces, which are OFL. [`NOTICE`](NOTICE) has the
details, along with the attribution for the template this project started from in
2025 and no longer contains any code from.
