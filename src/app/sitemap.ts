import { getPosts } from '@/app/utils/utils';
import { routing } from '@/i18n/routing';
import { SITE_PAGES, localeUrl } from '@/i18n/urls';

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
    getPosts('work/projects', locale).map((post) => ({
      url: localeUrl(locale, `/work/${post.slug}`),
      lastModified: post.metadata.publishedAt,
    }))
  );

  return [...pages, ...caseStudies];
}
