import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/**
 * Static export, opt-in.
 *
 * `npm run build` produces a normal Next build — what Vercel deploys, and what
 * keeps `src/proxy.ts` doing locale negotiation. `npm run build:static` sets
 * this and produces `out/`: a directory of plain files, the shape Cloudflare
 * Pages serves, where there is no proxy and `public/_redirects` takes over its
 * job.
 *
 * Both are built in CI, so the day this site moves to Cloudflare is not the day
 * anyone finds out the export had quietly broken.
 */
const staticExport = process.env.STATIC_EXPORT === '1';

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
 * A static export has no server to run them, so in that mode they are not
 * declared at all and `public/_redirects` carries the same rules for Cloudflare.
 * The two have to stay in step; `npm run check:export` fails if that file goes
 * missing or sends a visitor somewhere that was never built.
 */
const removedRoutes = [
  { source: '/blog/:path*', destination: '/en', permanent: true },
  { source: '/gallery', destination: '/en', permanent: true },
  { source: '/:locale(en|nl)/blog/:path*', destination: '/:locale', permanent: true },
  { source: '/:locale(en|nl)/gallery', destination: '/:locale', permanent: true },
];

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
  ...(staticExport ? { output: 'export' } : { redirects: async () => removedRoutes }),
};

export default withNextIntl(nextConfig);
