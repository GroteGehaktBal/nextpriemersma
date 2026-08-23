import { ORIGIN } from '@/i18n/urls';

export default function robots() {
  return {
    rules: [{ userAgent: '*' }],
    sitemap: `${ORIGIN}/sitemap.xml`,
  };
}
