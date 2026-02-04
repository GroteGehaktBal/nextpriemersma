import mdx from '@next/mdx';
import createNextIntlPlugin from 'next-intl/plugin';

const withMDX = mdx({
    extension: /\.mdx?$/,
    options: {},
});

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
    sassOptions: {
        silenceDeprecations: ['legacy-js-api', 'import'],
        quietDeps: true,
    },
};

export default withNextIntl(withMDX(nextConfig));