import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/**
 * Next configuration.
 *
 * Two things the template needed are gone. `@next/mdx` compiled `.mdx` files as
 * routes, which this site never did — the case studies are read from disk and
 * compiled by `next-mdx-remote`, so the loader and the `md`/`mdx` page
 * extensions were carrying no traffic. `sassOptions` silenced deprecation
 * warnings from Once UI's stylesheets, and Once UI is gone.
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,

  /**
   * Routes the rebuild removed.
   *
   * The site had a blog with one post and an empty gallery page. Deleting a page
   * does not delete the links to it, so anything already indexed or shared would
   * land on a 404. These send those URLs to the language's home page instead.
   *
   * Both the prefixed and the unprefixed forms are listed because both existed:
   * the site used to serve English without a locale prefix.
   *
   * Note for the move to Cloudflare Pages: `redirects` is server behaviour and
   * does not survive a static export. These four rules become lines in
   * `_redirects` at that point, alongside the ones replacing the locale proxy.
   */
  async redirects() {
    return [
      { source: '/blog/:path*', destination: '/en', permanent: true },
      { source: '/gallery', destination: '/en', permanent: true },
      { source: '/:locale(en|nl)/blog/:path*', destination: '/:locale', permanent: true },
      { source: '/:locale(en|nl)/gallery', destination: '/:locale', permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
