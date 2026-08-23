import { Inter, Source_Code_Pro } from 'next/font/google';
import { setRequestLocale } from 'next-intl/server';

import '@/styles/tokens.css';
import '@/styles/base.css';
import '@/styles/motion.css';

import { getContent } from '@/content';
import { routing } from '@/i18n/routing';
import { OG_IMAGE, ORIGIN, localeAlternates } from '@/i18n/urls';
import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';

/**
 * Root layout.
 *
 * Three things that were here are deliberately gone:
 *
 *  - `RouteGuard`, a client component that wrapped every page and started in a
 *    loading state. Because that was its initial state, the pre-rendered HTML
 *    Vercel served contained a spinner and none of the page. Disabled routes are
 *    a build-time decision now, handled by `generateStaticParams`.
 *  - `<Background>`, which registered a mousemove listener and a
 *    requestAnimationFrame loop calling React setState on every frame, forever,
 *    to move a decorative gradient. The ambient wash is CSS now: painted once.
 *  - The dozen `data-*` theme attributes Once UI switched on, along with Once
 *    UI itself. Theme is CSS custom properties following `prefers-color-scheme`.
 */

const sans = Inter({
  variable: '--font-primary',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600'],
});

const mono = Source_Code_Pro({
  variable: '--font-code',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500'],
});

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const { profile } = getContent(locale);

  return {
    metadataBase: new URL(ORIGIN),
    title: { default: profile.name, template: `%s` },
    description: profile.subline,
    alternates: localeAlternates(locale),
    openGraph: {
      title: profile.name,
      description: profile.subline,
      url: ORIGIN,
      siteName: profile.name,
      locale: locale === 'nl' ? 'nl_NL' : 'en_US',
      type: 'website',
      images: [OG_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large' as const,
        'max-snippet': -1,
      },
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const content = getContent(locale);

  return (
    <html lang={locale} className={`${sans.variable} ${mono.variable}`}>
      <body>
        <a className="skipLink" href="#main">
          {content.ui.skipToContent}
        </a>
        <div className="siteShell">
          <div className="siteAmbient" aria-hidden="true">
            <div className="siteAmbientGrid" />
          </div>
          <Header content={content} locale={locale} />
          <main id="main">{props.children}</main>
          <Footer content={content} />
        </div>
      </body>
    </html>
  );
}
