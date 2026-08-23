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
};

export default withNextIntl(nextConfig);
