import type { Metadata, Viewport } from 'next';
import { Inter, Source_Code_Pro } from 'next/font/google';

import '@/styles/tokens.css';
import '@/styles/base.css';
import '@/styles/motion.css';

/**
 * Shared root-layout pieces for the proof of concept.
 *
 * Each locale needs its own root layout, because `lang` belongs on <html> and a
 * page cannot override an attribute its layout set. Rather than duplicate the
 * font setup and metadata across those layouts, they live here and each layout
 * supplies only its own language.
 */

const sans = Inter({
  variable: '--font-primary',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600'],
});

/*
 * Deliberately the same two families the live site already loads.
 * `next/font/google` fetches at build time, so every additional family is another
 * network dependency the production build can fail on. Phase 1 self-hosts both.
 */
const mono = Source_Code_Pro({
  variable: '--font-code',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500'],
});

export const fontClassName = `${sans.variable} ${mono.variable}`;

export const previewMetadata: Metadata = {
  description:
    'Proof of concept for the portfolio overhaul: new design language, token layer and zero-JavaScript motion system.',
  // A working draft: never index it, and never let it be mistaken for the site.
  robots: { index: false, follow: false },
};

export const previewViewport: Viewport = {
  // Both themes are real, so the browser chrome should follow the system setting.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbfbfa' },
    { media: '(prefers-color-scheme: dark)', color: '#08090b' },
  ],
};
