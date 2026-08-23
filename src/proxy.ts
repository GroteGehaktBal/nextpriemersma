import createMiddleware from 'next-intl/middleware';

import { routing } from './i18n/routing';

/**
 * Locale negotiation.
 *
 * Next 16 renamed this file convention from `middleware` to `proxy`; the
 * behaviour is unchanged, and next-intl's handler is the same one. It does two
 * things: sends a prefix-less URL to the locale the visitor's browser asks for,
 * and lets every already-prefixed URL through untouched.
 *
 * None of this survives a static export, which is deliberate. When the site
 * moves to Cloudflare Pages the redirects become `_redirects` rules, and because
 * every locale is prefixed already (`localePrefix: 'always'`) there is nothing
 * else here to replace.
 */
export default createMiddleware(routing);

export const config = {
  matcher: [
    '/',
    /*
     * Everything except Next internals, files with an extension, and paths that
     * have no locale of their own.
     *
     * `/api` is the one that matters now: the contact form posts there, and it
     * is a Cloudflare Function rather than a page in either language, so
     * redirecting it into a locale would break it.
     *
     * This list used to name `/og` as well, from when the Open Graph card was a
     * route: without the exclusion the handler sent it to `/en/og`, which does
     * not exist, and every social preview resolved to a 404. The card is a
     * static file now — `/og.png`, excluded by the extension rule like any other
     * file — so the name is gone from here too rather than lingering as a rule
     * for a route that no longer exists.
     */
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/(en|nl)/:path*',
  ],
};
