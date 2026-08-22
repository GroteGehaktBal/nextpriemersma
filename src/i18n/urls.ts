import { routing } from './routing';
import { baseURL } from '@/app/resources';

/**
 * Canonical URL construction for both locales.
 *
 * Two things live here because getting either wrong is invisible until search
 * engines act on it:
 *
 *  - `baseURL` in the config is a bare host (`priemersma.nl`) with no scheme.
 *    Interpolating it straight into a URL produces `priemersma.nl/about`, which
 *    is not a URL — the sitemap was emitting exactly that, and search engines
 *    reject those entries.
 *  - The locale prefix is `as-needed`, so the default locale has *no* prefix.
 *    `/about` is English and `/nl/about` is Dutch. Anything building a localised
 *    URL has to know that, so it is expressed once here.
 */

export const ORIGIN = `https://${baseURL}`;

/**
 * Absolute URL for a route in a given locale.
 *
 * @param path Route without a locale prefix, e.g. `/about`. Use `''` for home.
 */
export function localeUrl(locale: string, path = ''): string {
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  return `${ORIGIN}${prefix}${path}`;
}

/**
 * `alternates` metadata for a route: its canonical URL plus an hreflang entry
 * for every locale.
 *
 * Without this, Google has no way to know that `/about` and `/nl/about` are the
 * same page in two languages. It treats them as unrelated — or as duplicates —
 * and shows the wrong one to the wrong audience. `x-default` names the version
 * to serve when no language matches.
 */
export function localeAlternates(locale: string, path = '') {
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, localeUrl(l, path)])
  );

  return {
    canonical: localeUrl(locale, path),
    languages: {
      ...languages,
      'x-default': localeUrl(routing.defaultLocale, path),
    },
  };
}
