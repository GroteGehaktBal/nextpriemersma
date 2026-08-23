import { routing } from '@/i18n/routing';

import { en } from './en';
import { nl } from './nl';
import type { Content } from './types';

/**
 * Site content, per locale.
 *
 * Typed TypeScript modules rather than JSON message files. Both locales satisfy
 * the same `Content` interface, so a field added to one language and forgotten in
 * the other is a build error instead of a blank on the page — the failure mode
 * the JSON files allowed, and which the site shipped with.
 */
const content: Record<string, Content> = { en, nl };

export function getContent(locale: string): Content {
  return content[locale] ?? content[routing.defaultLocale];
}

export type {
  Capability,
  Certification,
  Content,
  Fact,
  Profile,
  Project,
  SectionCopy,
  TimelineEntry,
  Ui,
} from './types';
