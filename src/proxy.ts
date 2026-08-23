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
     * `/og` was the reason this list exists: it rendered the Open Graph card,
     * and without the exclusion the handler redirected it to `/en/og`, which
     * does not exist — so every social preview resolved to a 404. That route is
     * gone, and `/api` has taken its place: the contact form posts there, and it
     * is a Cloudflare Function rather than a page in either language.
     */
    '/((?!api|_next|_vercel|og|.*\\..*).*)',
    '/(en|nl)/:path*',
  ],
};
