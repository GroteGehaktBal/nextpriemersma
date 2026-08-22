import { getPosts } from '@/app/utils/utils'
import { routes as routesConfig } from '@/app/resources'
import { routing } from '@/i18n/routing'
import { localeUrl } from '@/i18n/urls'

/**
 * Sitemap for both locales.
 *
 * Previously this interpolated `baseURL` directly, and `baseURL` is a bare host
 * with no scheme — so every entry read `priemersma.nl/about` rather than
 * `https://priemersma.nl/about`, and search engines discard entries that are not
 * absolute URLs. `localeUrl` builds them correctly and knows that the default
 * locale carries no prefix.
 */
export default async function sitemap() {
    const { locales } = routing;

    const posts = (section: 'work/projects', urlBase: string) =>
        locales.flatMap((locale) =>
            getPosts(section, locale).map((post) => ({
                url: localeUrl(locale, `${urlBase}/${post.slug}`),
                lastModified: post.metadata.publishedAt,
            }))
        );

    const activeRoutes = Object.keys(routesConfig).filter(
        (route) => routesConfig[route as keyof typeof routesConfig]
    );

    const pages = locales.flatMap((locale) =>
        activeRoutes.map((route) => ({
            url: localeUrl(locale, route === '/' ? '' : route),
            lastModified: new Date().toISOString().split('T')[0],
        }))
    );

    return [
        ...pages,
        ...(routesConfig['/work'] ? posts('work/projects', '/work') : []),
    ];
}
