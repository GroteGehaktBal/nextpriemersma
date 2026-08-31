/**
 * What a search result is allowed to say.
 *
 * A `<meta name="description">` is not read by a browser and not shown on the
 * page; its whole job is to be the two lines under the title in a search result.
 * Google cuts those at roughly 155 characters, and it cuts mid-word — the site's
 * own listing used to end "…and building ...", which reads as a page that was
 * not finished rather than a sentence that was.
 *
 * So descriptions are written to fit. Where the text has to come from prose that
 * was written for the page rather than for the result — a case study's summary —
 * `metaDescription` shortens it at a boundary a reader would have chosen.
 */

import type { Content } from '@/content/types';
import { ORIGIN } from '@/i18n/urls';

/** Google's practical cut-off. Not a spec; an observation, and a safe one. */
export const DESCRIPTION_LIMIT = 155;

/**
 * The one identifier for the one person this site is about.
 *
 * Every page that describes him names this, so the home page in English and the
 * about page in Dutch are more of what is known about one person rather than
 * four people who happen to share a name.
 */
export const PERSON_ID = `${ORIGIN}/#peter`;

/**
 * Everything the site is willing to state about Peter, in one place.
 *
 * Built here rather than in each page because the pages had already drifted:
 * both claimed the same `@id` and then gave it different employers, the home
 * page listing two and the about page three. An identifier that says "these are
 * the same person" is worth less than nothing when the statements behind it
 * disagree — it turns two partial descriptions into one contradictory one.
 *
 * Everything comes from the content model, so a change to the timeline or the
 * profile reaches the structured data without anyone remembering to.
 */
export function personSchema(content: Content, url: string) {
  const { profile, capabilities, timeline, education } = content;

  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: profile.name,
    jobTitle: profile.role,
    description: profile.metaDescription,
    url,
    image: `${ORIGIN}/og.png`,
    sameAs: [profile.github, profile.linkedin],
    knowsLanguage: ['nl', 'en'],
    knowsAbout: capabilities.flatMap((capability) => capability.keywords),
    address: {
      '@type': 'PostalAddress',
      addressLocality: profile.address.locality,
      addressRegion: profile.address.region,
      addressCountry: profile.address.country,
    },
    alumniOf: education.map((entry) => ({
      '@type': 'EducationalOrganization',
      name: entry.organisation,
    })),
    // The roles the timeline marks as ongoing, which is the same list the page
    // renders with a live dot beside it.
    worksFor: timeline
      .filter((entry) => entry.current)
      .map((entry) => ({
        '@type': 'Organization',
        name: entry.organisation,
        ...(entry.url === undefined ? {} : { url: entry.url }),
      })),
  };
}

/**
 * Shortens text to something that will not be truncated by the search engine.
 *
 * Prefers to end on a sentence, because a complete thought that stops early
 * reads better than a longer one that stops mid-clause. Falls back to a word
 * boundary with an ellipsis, and returns the text untouched when it already
 * fits — which is the case for most of the site, and should stay that way.
 */
export function metaDescription(text: string, limit = DESCRIPTION_LIMIT): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= limit) return clean;

  // A sentence that ends within the limit, if it uses most of the room.
  const room = clean.slice(0, limit);
  const sentence = Math.max(room.lastIndexOf('. '), room.lastIndexOf('! '), room.lastIndexOf('? '));
  if (sentence >= limit * 0.6) return clean.slice(0, sentence + 1);

  // Otherwise a word boundary — one character short, because the ellipsis that
  // replaces the rest counts towards the limit too.
  const head = clean.slice(0, limit - 1);
  const word = head.lastIndexOf(' ');

  return `${(word > 0 ? head.slice(0, word) : head).replace(/[,;:—–-]$/, '')}…`;
}
