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
     * Everything except Next internals, files with an extension, and `/og`.
     *
     * `/og` renders the Open Graph card and has no locale segment of its own.
     * Without the exclusion this handler redirected it to `/en/og`, which does
     * not exist — so every social preview for this site resolved to a 404.
     */
    '/((?!_next|_vercel|og|.*\\..*).*)',
    '/(en|nl)/:path*',
  ],
};
