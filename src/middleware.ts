import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
 
export default createMiddleware(routing);
 
export const config = {
  // Match only internationalized pathnames
  matcher: [
      '/',
      '/((?!api|_next|_vercel|.*\\..*).*)',
      // Locales come from i18nOptions in src/app/resources/config.js. This listed
      // `id` — the upstream template's Indonesian locale — which this site does not
      // have, so locale-prefixed Dutch paths were never matched by this entry.
      '/(en|nl)/:path*'
    ]
};
