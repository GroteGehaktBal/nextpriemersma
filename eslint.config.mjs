import next from 'eslint-config-next/core-web-vitals';

/**
 * ESLint flat config.
 *
 * Replaces the `.eslintrc.json` that ESLint 10 no longer reads. Together with
 * the `lint` script now calling `eslint` directly — Next.js 16 removed the
 * `next lint` command the old script used — this is the first working lint
 * setup in the project for some time.
 *
 * `eslint-config-next` already publishes flat config, so it is spread in
 * directly rather than wrapped in the eslintrc compatibility layer.
 */
const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'next-env.d.ts',
      'public/**',
      // Vendored third-party design system, not maintained here and scheduled
      // for removal in phase 3 of the overhaul. It carries two genuine React
      // warnings (setState in an effect, a ref read during render); linting code
      // we do not own would train us to ignore the output rather than act on it.
      // Remove this entry when src/once-ui is deleted.
      'src/once-ui/**',
    ],
  },
  ...next,
];

export default config;
