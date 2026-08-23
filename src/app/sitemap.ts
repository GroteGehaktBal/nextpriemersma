import { getCaseStudies } from '@/content/case-studies';
import { routing } from '@/i18n/routing';
import { SITE_PAGES, localeUrl } from '@/i18n/urls';

/**
 * Emitted as a file at build time.
 *
 * Without this, a static export refuses to build: Next cannot know whether a
 * route handler is safe to run once at build time unless it is told, and these
 * two read nothing that changes between requests.
 */
export const dynamic = 'force-static';

/**
 * Sitemap for both locales.
 *
 * Every URL is absolute and locale-prefixed, which is what `localeUrl` is for:
 * this file used to interpolate a bare host, so each entry read
 * `priemersma.nl/about` rather than `https://priemersma.nl/en/about`, and search
 * engines discard entries that are not absolute URLs.
 */
export default function sitemap() {
  const today = new Date().toISOString().split('T')[0];

  const pages = routing.locales.flatMap((locale) =>
    SITE_PAGES.map((path) => ({
      url: localeUrl(locale, path),
      lastModified: today,
    }))
  );

  const caseStudies = routing.locales.flatMap((locale) =>
    getCaseStudies(locale).map((study) => ({
      url: localeUrl(locale, `/work/${study.slug}`),
      lastModified: study.publishedAt,
    }))
  );

  return [...pages, ...caseStudies];
}
