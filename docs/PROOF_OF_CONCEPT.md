# Proof of Concept

**Route:** `/preview` · **Branch:** `claude/portfolio-overhaul-plan-vefcnd`

A working page built on the design language and architecture proposed in
[`OVERHAUL_PLAN.md`](./OVERHAUL_PLAN.md). It exists to be judged before the rewrite
starts, and to prove the performance claims in the plan with real numbers rather than
promises.

---

## Running it

```bash
npm install
npm run dev
# http://localhost:3000/preview
```

The current site is untouched and still runs at `/`, `/about` and `/work`, so the two
can be compared side by side in the same browser.

---

## What it demonstrates

### 1. Content is in the HTML

The whole route is server components — there is no `"use client"` anywhere in it. The
pre-rendered HTML contains every word on the page.

This is the direct answer to the biggest problem in the audit: today, `RouteGuard`
means the pre-rendered HTML of every page contains a spinner and nothing else. You can
see the difference by extracting the visible text from the two built pages:

```
.next/server/app/en/about.html   →   "Home About Work EN NL © 2026 / Peter Riemersma"
.next/server/app/preview.html    →   the entire page
```

### 2. The animations cost nothing

Reveal-on-scroll normally needs an `IntersectionObserver`, which makes a component a
client component and drags everything it renders across the hydration boundary. Here
it is a CSS scroll timeline:

```css
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .reveal {
      animation: rise linear both;
      animation-timeline: view();
      animation-range: entry 5% cover 22%;
    }
  }
}
```

Every animation on the page is CSS, only `opacity` and `transform` are animated, and
nothing runs on the main thread. The result is measurable: **`/preview` ships zero
application JavaScript.** Diffing the chunk sets of the two built pages shows
`/preview` loading nothing beyond the shared framework baseline, while the current
pages add 63 KB of application code on top of it — and show nothing until it arrives.

### 3. Both themes are real

The token layer defines a complete dark palette and a complete light palette, and the
page follows `prefers-color-scheme`. The current site is hardcoded to dark.

### 4. The ambient background stopped costing frames

The current background registers a `mousemove` listener and a `requestAnimationFrame`
loop that calls `setState` on every frame, for as long as the tab is open. The PoC
replaces it with two radial gradients over a masked dot grid: pure CSS, painted once,
no listeners, no re-renders. It looks near-identical and the main thread stays idle.

---

## Measured result

Both figures are gzip, from a production build.

| | Current `/about` | PoC `/preview` |
| --- | --- | --- |
| **Application JS** | 63.0 KB | **0.0 KB** |
| Framework baseline JS | 163.4 KB | 163.4 KB |
| CSS | 19.8 KB | **5.4 KB** (73% less) |
| HTML | 8.9 KB | 10.6 KB |
| **Content in the pre-rendered HTML** | **none** | **all of it** |

The 163 KB framework baseline is the Next.js App Router and React runtime. It is
identical on both pages and is not something a portfolio can optimise away. The
number that changed is the one that matters: whether the page needs JavaScript before
it can be read.

---

## Verified

Checked against the production build in Chromium:

- **No horizontal overflow** at 320, 360, 390, 480, 768, 1024, 1280, 1440 and 1920 px.
- **Reduced motion**: with `prefers-reduced-motion: reduce`, every animated element is
  fully visible without scrolling. Nothing is hidden behind an animation that will not run.
- **No console errors** in dark, light or mobile rendering.
- **Heading outline** is correctly nested — one `h1`, then `h2` per section, `h3` per item.
- **Every link has an accessible name**; the whole-card click target is implemented by
  stretching the title link rather than wrapping a heading in an anchor.
- **Focus is always visible** — a single `:focus-visible` treatment, never removed.

---

## Files

| File | What it is |
| --- | --- |
| `src/styles/tokens.css` | The design language: colour, type, space, radius, motion. Both themes. |
| `src/styles/base.css` | Reset and element defaults. |
| `src/styles/motion.css` | Every animation on the site, and the reduced-motion override. |
| `src/app/(preview)/layout.tsx` | Root layout for the PoC — server-only, no client wrapper. |
| `src/app/(preview)/preview/page.tsx` | The page. |
| `src/app/(preview)/preview/content.ts` | Typed content, demonstrating the proposed content model. |
| `src/app/(preview)/preview/preview.module.css` | Page styles. Every value is a token. |
| `src/components/ui/icons.tsx` | Inline SVG icons, replacing `react-icons`. |

One existing file was modified: `src/middleware.ts`, where `preview` was added to the
matcher's exclusion list so the locale middleware does not rewrite `/preview` to a
locale-prefixed path that has no route. That line is removed when the PoC is promoted
or deleted.

---

## Deliberately not included

Scope was kept to what is needed to judge the direction:

- **No images.** The layout leaves room for project imagery, but there are no real
  photographs of the work in the repository yet. Placeholder images would flatter the
  design dishonestly.
- **Static language switcher.** It shows the treatment. In the real build it is the
  one place a client component is genuinely warranted.
- **English only.** The Dutch translation follows once the copy is settled.
- **Content is real but the prose is a draft.** Roles, dates, education and the eleven
  certifications come from the LinkedIn profile; the sentences around them are written
  for this layout and are open to rewriting.

---

## What I need from you

1. **The design direction** — right, or wrong? The accent colour, the mono-plus-sans
   pairing and the density are all easy to change now and expensive to change later.
2. **The animation level** — too much, too little, or about right?
3. **Positioning** — should the first screen speak to employers or to clients?
4. **The two editorial calls on your history** — certifications ranked rather than
   listed flat, and the non-technical roles dimmed. See §7.3 of the plan.

## Deployment

Live on the pull request preview, so it can be reviewed without running anything:

**https://nextpriemersma-git-claude-portf-c76459-grotegehaktbals-projects.vercel.app/preview**

The deployment that was failing is fixed. The cause was not this branch: Vercel refused
to build the project at all because `next-mdx-remote@5.0.0` carries an
arbitrary-code-execution advisory, which it now blocks at build time. That, and the 49
other vulnerabilities `npm audit` reported, are resolved — see §2.4b of the plan.
