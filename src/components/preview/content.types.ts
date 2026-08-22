/**
 * Content contract for the proof of concept.
 *
 * This file also demonstrates the content model proposed in the overhaul plan:
 * typed TypeScript modules instead of a `.js` file containing JSX and translation
 * lookups. The benefits are visible immediately — list data is a real array rather
 * than a string split on a delimiter, every field is checked at compile time, and
 * a missing field in one locale is a build error rather than a blank on the page.
 *
 * In the full rewrite this becomes `src/content/en.ts` and `src/content/nl.ts`,
 * both satisfying a shared `Content` interface exported from `src/content/types.ts`.
 *
 * Roles, dates, education and certifications are taken from Peter's LinkedIn
 * profile. The prose around them is written for this layout, which is built to
 * reward specifics: every claim names a technology, a scale or a result.
 */

export interface Fact {
  /** Short mono label rendered above the value. */
  label: string;
  /** The headline value. Kept terse — two or three words at most. */
  value: string;
}

export interface Project {
  slug: string;
  /** Mono eyebrow describing the kind of work. */
  kind: string;
  title: string;
  summary: string;
  /** Concrete technologies, rendered as mono tags. */
  stack: string[];
  /** A measurable result. Omitted when there is not an honest one to give. */
  outcome?: string;
  year: string;
}

export interface Capability {
  title: string;
  description: string;
  /** Specific tools and protocols — the evidence behind the title. */
  keywords: string[];
}

export interface TimelineEntry {
  period: string;
  role: string;
  organisation: string;
  description: string;
  /** Marks the entry as ongoing, which renders a live status dot. */
  current?: boolean;
  /**
   * Secondary entries are real and worth listing, but they are not what the
   * reader is here for. They render in a quieter, more compact treatment so the
   * engineering roles above them keep the weight.
   */
  secondary?: boolean;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  /**
   * Lead certifications get their own card. The rest are listed compactly —
   * eleven equally weighted entries would bury the two that carry real weight.
   */
  lead?: boolean;
}

/**
 * Every string the interface renders that is not part of a data record.
 *
 * These used to be literals in the component, which meant the Dutch page rendered
 * an English headline, English navigation and English buttons — the classic
 * half-translated page. If a string is visible, it belongs here.
 */
export interface Ui {
  notice: { badge: string; text: string };
  nav: { work: string; capabilities: string; background: string; contact: string };
  actions: { seeWork: string; getInTouch: string };
  sections: {
    work: SectionCopy;
    capabilities: SectionCopy;
    background: SectionCopy;
    contact: { index: string; title: string; text: string };
  };
  background: {
    experience: string;
    education: string;
    certifications: string;
    certificationsLead: string;
  };
  languageLabel: string;
}

export interface SectionCopy {
  /** Mono eyebrow, e.g. "01 / Work". The number is part of the string so the
   *  translation can reorder it if the language calls for it. */
  index: string;
  title: string;
  lead: string;
}

export interface Content {
  ui: Ui;
  profile: Profile;
  facts: Fact[];
  projects: Project[];
  capabilities: Capability[];
  timeline: TimelineEntry[];
  education: TimelineEntry[];
  certifications: Certification[];
}

export interface Profile {
  name: string;
  role: string;
  location: string;
  /**
   * Split in two so the second half can carry the accent colour. Keeping it as
   * data rather than markup means a translator can move the emphasis to
   * whichever clause carries it in their language.
   */
  headline: { lead: string; accent: string };
  subline: string;
  availability: string;
  email: string;
  phone: string;
  github: string;
  linkedin: string;
}
