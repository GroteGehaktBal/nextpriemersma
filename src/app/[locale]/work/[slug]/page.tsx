import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { getPosts } from '@/app/utils/utils';
import { getContent } from '@/content';
import { routing } from '@/i18n/routing';
import { OG_IMAGE, localeAlternates, localeUrl } from '@/i18n/urls';
import { CaseStudyFooter, CaseStudyHeader, ContactCta, type Credit } from '@/components/site/sections';
import { Prose } from '@/components/site/Prose';
import styles from '@/components/site/site.module.css';

interface WorkParams {
  params: Promise<{ slug: string; locale: string }>;
}

/**
 * A case study.
 *
 * Two sources meet here. The MDX file in `work/projects/<locale>/` holds the
 * body; `src/content/<locale>.ts` holds the summary, stack and outcome that the
 * card on `/work` shows. The page renders both, which is what keeps a project's
 * description identical wherever it appears — previously the card and the page
 * carried separate copies of the same claim, and they had already drifted.
 */

/** Reads one project's MDX file, or undefined when the slug has none. */
function getPost(locale: string, slug: string) {
  return getPosts('work/projects', locale).find((post) => post.slug === slug);
}

export function generateStaticParams(): { slug: string; locale: string }[] {
  return routing.locales.flatMap((locale) =>
    getPosts('work/projects', locale).map((post) => ({ slug: post.slug, locale }))
  );
}

export async function generateMetadata(props: WorkParams) {
  const { slug, locale } = await props.params;
  const post = getPost(locale, slug);

  if (!post) return {};

  const { projects } = getContent(locale);
  const project = projects.find((entry) => entry.slug === slug);
  const title = project?.title ?? post.metadata.title;
  const description = project?.summary ?? post.metadata.summary;

  return {
    title,
    description,
    alternates: localeAlternates(locale, `/work/${slug}`),
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.metadata.publishedAt,
      url: localeUrl(locale, `/work/${slug}`),
      locale: locale === 'nl' ? 'nl_NL' : 'en_US',
      images: [OG_IMAGE],
    },
    twitter: { card: 'summary_large_image' as const, title, description, images: [OG_IMAGE.url] },
  };
}

export default async function Project(props: WorkParams) {
  const { slug, locale } = await props.params;
  setRequestLocale(locale);

  const post = getPost(locale, slug);
  if (!post) notFound();

  const content = getContent(locale);
  const project = content.projects.find((entry) => entry.slug === slug);
  const title = project?.title ?? post.metadata.title;

  /*
   * Everyone on the project except its owner: this is Peter's site, so his own
   * name above his own case study is noise. Collaborators are named because they
   * did the work with him.
   */
  const credits: Credit[] = (post.metadata.team ?? [])
    .filter((member) => member.name !== content.profile.name)
    .map((member) => ({ name: member.name, url: member.linkedIn }));

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: title,
            description: project?.summary ?? post.metadata.summary,
            datePublished: post.metadata.publishedAt,
            inLanguage: locale,
            url: localeUrl(locale, `/work/${slug}`),
            author: { '@type': 'Person', name: content.profile.name, url: localeUrl(locale, '/about') },
            about: project?.stack,
          }),
        }}
      />

      <CaseStudyHeader
        content={content}
        locale={locale}
        title={title}
        project={project}
        credits={credits}
      />

      <section className={`${styles.container} ${styles.caseBody}`}>
        <div className="reveal">
          <Prose source={post.content} />
        </div>
      </section>

      <CaseStudyFooter content={content} locale={locale} />

      <ContactCta content={content} />
    </>
  );
}
