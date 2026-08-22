import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
 
export default createMiddleware(routing);
 
export const config = {
  // Match only internationalized pathnames
  matcher: [
      '/',
      // `preview` is excluded so the design proof of concept, which lives outside
      // the [locale] segment, is not rewritten to a locale-prefixed path that has
      // no matching route. Remove this once the PoC route is promoted or deleted.
      '/((?!api|_next|_vercel|preview|.*\\..*).*)',
      '/(en|id)/:path*'
    ]
};
