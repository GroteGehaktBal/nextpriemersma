import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/**
 * Next configuration.
 *
 * `output: 'export'` is unconditional, and that is the whole shape of this file.
 * The site is served by Cloudflare Pages as a directory of plain files, so a
 * build that produced anything else would be a build nobody deploys — and until
 * this became the only mode, the difference between what CI checked and what
 * shipped was a flag away from going unnoticed.
 *
 * What that costs, and where it went instead:
 *
 *  - `redirects()`. Next runs those on a server and an export has none. Every
 *    rule now lives in `public/_redirects`, which Cloudflare reads at the edge;
 *    `npm run check:export` fails if one points at a page that was never built.
 *  - `src/proxy.ts`, which negotiated a locale from `Accept-Language`. A static
 *    host cannot read a request header, so the bare domain goes to English and
 *    the header's language switch does the rest.
 *
 * Two things the template needed are gone too. `@next/mdx` compiled `.mdx` files
 * as routes, which this site never did — the case studies are read from disk and
 * compiled by `next-mdx-remote`, so the loader and the `md`/`mdx` page extensions
 * were carrying no traffic. `sassOptions` silenced deprecation warnings from
 * Once UI's stylesheets, and Once UI is gone.
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
};

export default withNextIntl(nextConfig);
