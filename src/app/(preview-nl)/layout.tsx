import type { Metadata } from 'next';

import { fontClassName, previewMetadata, previewViewport } from '@/components/preview/previewShell';

/**
 * Root layout for the Dutch proof of concept.
 *
 * A separate root layout purely so `lang` is correct: it belongs on <html>, and a
 * page cannot override an attribute set by its layout. Getting this wrong is not
 * cosmetic — screen readers pronounce the page in the wrong language and browsers
 * offer to translate a page that is already in the reader's language.
 */

export const metadata: Metadata = {
  ...previewMetadata,
  title: 'Ontwerpvoorbeeld — Peter Riemersma',
  alternates: {
    canonical: '/preview/nl',
    languages: { en: '/preview', nl: '/preview/nl', 'x-default': '/preview' },
  },
};

export const viewport = previewViewport;

export default function DutchPreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={fontClassName}>
      <body>{children}</body>
    </html>
  );
}
