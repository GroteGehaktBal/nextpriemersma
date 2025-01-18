import mdx from '@next/mdx';
import createNextIntlPlugin from 'next-intl/plugin';

const withMDX = mdx({
    extension: /\.mdx?$/,
    options: { },
});

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.optimization.splitChunks = {
                chunks: 'all',
                minSize: 0,
                maxSize: 1000000, // Adjust the max size as needed
            };
        }
        return config;
    },
};

export default withNextIntl(withMDX(nextConfig));