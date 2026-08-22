import type { Metadata, Viewport } from 'next';
import { Inter, Source_Code_Pro } from 'next/font/google';

import '@/styles/tokens.css';
import '@/styles/base.css';
import '@/styles/motion.css';

/**
 * Root layout for the proof of concept.
 *
 * This is a second root layout, deliberately kept outside the `[locale]` segment so
 * the PoC can demonstrate the proposed architecture without touching the live site.
 *
 * The differences from the current layout are the point of this file:
 *
 *   - It is a server component with no client wrapper, so page content is present
 *     in the pre-rendered HTML rather than behind a hydration boundary.
 *   - There is no `<Background>` component, and therefore no `mousemove` listener
 *     and no `requestAnimationFrame` loop re-rendering React at 60 fps. The ambient
 *     background is painted by CSS on the body and costs nothing after first paint.
 *   - Fonts are declared with `next/font` and exposed as the CSS variables the token
 *     layer reads, so there is no separate stylesheet request and no layout shift.
 */

const sans = Inter({
  variable: '--font-primary',
  subsets: ['latin'],
  display: 'swap',
  // Trimmed to the weights the design actually uses; nothing else is downloaded.
  weight: ['400', '500', '600'],
});

/*
 * Deliberately the same two families the live site already loads. `next/font/google`
 * fetches at build time, so every additional family is another network dependency the
 * production build can fail on; the proof of concept should not introduce one to make
 * a point it can make with the fonts already proven in this project's deployments.
 * Phase 1 self-hosts both and removes the build-time fetch altogether.
 */
const mono = Source_Code_Pro({
  variable: '--font-code',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Design preview — Peter Riemersma',
  description:
    'Proof of concept for the portfolio overhaul: new design language, token layer and zero-JavaScript motion system.',
  // The preview is a working draft and must never be indexed or shared as the site.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  // Both themes are real, so the browser chrome should follow the system setting too.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbfbfa' },
    { media: '(prefers-color-scheme: dark)', color: '#08090b' },
  ],
};

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
