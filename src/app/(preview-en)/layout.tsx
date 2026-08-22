import type { Metadata } from 'next';

import { fontClassName, previewMetadata, previewViewport } from '@/components/preview/previewShell';

/**
 * Root layout for the English proof of concept.
 *
 * Server components only. No client wrapper, so the page content is in the
 * pre-rendered HTML rather than behind a hydration boundary; no background
 * component, so nothing runs a requestAnimationFrame loop after first paint.
 */

export const metadata: Metadata = {
  ...previewMetadata,
  title: 'Design preview — Peter Riemersma',
  alternates: {
    canonical: '/preview',
    languages: { en: '/preview', nl: '/preview/nl', 'x-default': '/preview' },
  },
};

export const viewport = previewViewport;

export default function EnglishPreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontClassName}>
      <body>{children}</body>
    </html>
  );
}
