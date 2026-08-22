# priemersma.nl

Personal portfolio for Peter Riemersma — Network & Security Engineering student
at Hanze University, co-owner of [pyxels](https://www.pyxels.eu), freelance at
Riemersma ICT.

Built with Next.js (App Router) and next-intl. Bilingual: English and Dutch.

## Running it

Requires Node.js 20+.

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

## How it is put together

```
src/
├── app/[locale]/          # routes — home, about, work, work/[slug]
│   └── work/projects/     # case studies as MDX, one folder per locale
├── content/               # site copy: types.ts, en.ts, nl.ts
├── components/site/       # header, footer, page sections
├── components/ui/         # inline SVG icons
├── styles/                # tokens.css, base.css, motion.css
└── i18n/                  # routing config and URL construction
```

**Content lives in `src/content`**, as typed TypeScript rather than JSON. Both
locales satisfy the same `Content` interface, so a field added to one language
and forgotten in the other is a build error instead of a blank on the page.

**Every visible string is in that model**, including navigation labels and button
text. If it renders, it is translatable.

**Styling is CSS Modules over a token layer.** Every colour, size, duration and
radius in the interface resolves to a custom property in `src/styles/tokens.css`,
which defines complete dark and light palettes and follows `prefers-color-scheme`.

**Animation costs no JavaScript.** Reveal-on-scroll uses CSS scroll timelines
(`animation-timeline: view()`) rather than an IntersectionObserver, so animated
sections stay server components. Every animation sits behind an `@supports` guard
with the finished state as its default, so a browser without scroll timelines —
or a visitor with reduced motion enabled — gets the completed page rather than a
blank one waiting for an animation that will never run.

## Adding a project

1. Write `src/app/[locale]/work/projects/en/my-project.mdx` and its Dutch
   counterpart in `../nl/`. The filename is the URL slug.
2. Add an entry to `projects` in `src/content/en.ts` and `src/content/nl.ts`.
   Its `slug` must match the filename — a mismatch is a 404, not a type error.

## URLs

Every locale is prefixed: `/en/about`, `/nl/about`. The default locale is
prefixed too, deliberately — without it, one URL could serve either language
depending on a cookie while its own canonical tag claimed otherwise.

## Roadmap

See [`docs/OVERHAUL_PLAN.md`](docs/OVERHAUL_PLAN.md) for the audit this rebuild
came out of, the design and performance decisions behind it, and what is left.

## Licence

CC BY-NC 4.0 — see [`LICENSE`](LICENSE). Note that this is inherited from the
[Once UI Magic Portfolio](https://github.com/once-ui-system/magic-portfolio)
template the project started from; little of that template remains, and the
licence is due a review.
