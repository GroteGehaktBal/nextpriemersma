import { getRequestConfig } from 'next-intl/server';

import { routing } from './routing';

/**
 * next-intl request configuration.
 *
 * next-intl is used here for routing only — locale negotiation in middleware and
 * `setRequestLocale` for static rendering. Copy comes from `src/content`, typed
 * TypeScript modules rather than JSON message catalogues, so there are no
 * messages to load and none are returned. That also means no page pulls
 * next-intl's client runtime, which is why the message formatter no longer
 * appears in the JavaScript sent to the browser.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = routing.locales.includes(requested as never)
    ? (requested as string)
    : routing.defaultLocale;

  return { locale, messages: {} };
});
