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
        // Exclude unnecessary files
        config.plugins.push(
            new config.webpack.IgnorePlugin({
                resourceRegExp: /\.(spec|test)\.(js|ts)x?$/,
                contextRegExp: /pages/,
            })
        );

        // Optionally, you can also use the `exclude` option
        // config.module.rules.push({
        //     test: /\.(js|ts)x?$/,
        //     exclude: /\.(spec|test)\.(js|ts)x?$/,
        //     use: 'babel-loader',
        // });

        return config;
    },
};

export default withNextIntl(withMDX(nextConfig));