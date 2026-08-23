import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import matter from 'gray-matter';

/**
 * Case studies, read from MDX at build time.
 *
 * One file per project per locale, under
 * `src/app/[locale]/work/projects/<locale>/<slug>.mdx`. The filename is the URL
 * slug, and the same slug in both locale folders is what makes `/en/work/x` and
 * `/nl/work/x` two languages of one page.
 *
 * Nothing here runs at request time: every page that calls these functions is
 * statically generated, so the filesystem is touched during the build and never
 * again.
 */

/** A collaborator credited in a project's frontmatter. */
export interface Collaborator {
  name: string;
  role: string;
  linkedIn: string;
}

export interface CaseStudy {
  /** Filename without its extension, and the last segment of the URL. */
  slug: string;
  title: string;
  /** ISO date. Feeds `lastModified` in the sitemap and `publishedTime` in the metadata. */
  publishedAt: string;
  /** Fallback description for a project with no entry in the content model. */
  summary: string;
  collaborators: Collaborator[];
  /** The MDX body, uncompiled. `Prose` renders it. */
  body: string;
}

/**
 * Root of the content tree.
 *
 * Kept as a literal prefix on purpose. The bundler traces filesystem access
 * statically; when a path is assembled entirely from caller-supplied values it
 * cannot tell what will be read, so it conservatively traces — and deploys —
 * every file in the project, `public/` included. Anchoring the path here keeps
 * the traced set to the content directory.
 */
const PROJECTS_ROOT = path.join(process.cwd(), 'src', 'app', '[locale]', 'work', 'projects');

function read(directory: string, file: string): CaseStudy {
  const { data, content } = matter(readFileSync(path.join(directory, file), 'utf-8'));

  return {
    slug: path.basename(file, '.mdx'),
    title: data.title ?? '',
    publishedAt: data.publishedAt ?? '',
    summary: data.summary ?? '',
    collaborators: data.team ?? [],
    body: content,
  };
}

/** Every case study in one locale, in filename order. */
export function getCaseStudies(locale: string): CaseStudy[] {
  const directory = path.join(PROJECTS_ROOT, locale);

  return readdirSync(directory)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => read(directory, file));
}

/** One case study, or undefined when the slug has no file in this locale. */
export function getCaseStudy(locale: string, slug: string): CaseStudy | undefined {
  return getCaseStudies(locale).find((study) => study.slug === slug);
}
