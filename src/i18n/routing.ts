import { defineRouting } from 'next-intl/routing';

/**
 * Routing configuration.
 *
 * Deliberately free of `createNavigation`. That helper builds next-intl's client
 * navigation API (Link, useRouter, usePathname), and importing it here pulled
 * next-intl's client runtime — IntlMessageFormat and all — into every page that
 * so much as read the locale list, including pages with no client component at
 * all. The old header was its only consumer, and it is gone.
 */
export const routing = defineRouting({
  locales: ['en', 'nl'],
  defaultLocale: 'en',

  /*
   * Every locale is prefixed, including the default.
   *
   * Under 'as-needed' the default locale had no prefix, which meant /about served
   * English or Dutch depending on a NEXT_LOCALE cookie — one URL, two languages,
   * while the page's own canonical and hreflang declared it as English. A crawler
   * could see either. Prefixing everything makes a URL mean exactly one language.
   *
   * It is also what the move to static hosting requires: without middleware there
   * is nothing to negotiate a prefix-less URL, so the export only ever emits
   * prefixed paths. Making the change here, where middleware can still redirect
   * the old URLs, means it happens once.
   */
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];
