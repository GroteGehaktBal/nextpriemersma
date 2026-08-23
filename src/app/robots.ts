import { ORIGIN } from '@/i18n/urls';

/**
 * Emitted as a file at build time.
 *
 * Without this, a static export refuses to build: Next cannot know whether a
 * route handler is safe to run once at build time unless it is told, and these
 * two read nothing that changes between requests.
 */
export const dynamic = 'force-static';

export default function robots() {
  return {
    rules: [{ userAgent: '*' }],
    sitemap: `${ORIGIN}/sitemap.xml`,
  };
}
