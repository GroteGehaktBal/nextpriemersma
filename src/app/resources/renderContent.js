import { createI18nContent } from './content-i18n';

/**
 * Builds the content tree for the active locale.
 *
 * This used to branch on an `i18n` flag and fall back to a second, hand-written
 * copy of the content in `content.js`. That file was never reached — the site
 * has localisation switched on — and it still held the upstream template's
 * placeholder biography for a fictional designer in Jakarta, which would have
 * been the first thing a visitor to the public repository read. It has been
 * removed rather than corrected: a second copy of every string is a maintenance
 * trap, and the phase 1 content model replaces this shape entirely.
 */
const renderContent = (t) => createI18nContent(t);

export { renderContent };
