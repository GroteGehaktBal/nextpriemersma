import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { getCaseStudies, getCaseStudy } from '@/content/case-studies';
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

export function generateStaticParams(): { slug: string; locale: string }[] {
  return routing.locales.flatMap((locale) =>
    getCaseStudies(locale).map((study) => ({ slug: study.slug, locale }))
  );
}

export async function generateMetadata(props: WorkParams) {
  const { slug, locale } = await props.params;
  const study = getCaseStudy(locale, slug);

  if (!study) return {};

  const { projects } = getContent(locale);
  const project = projects.find((entry) => entry.slug === slug);
  const title = project?.title ?? study.title;
  const description = project?.summary ?? study.summary;

  return {
    title,
    description,
    alternates: localeAlternates(locale, `/work/${slug}`),
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: study.publishedAt,
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

  const study = getCaseStudy(locale, slug);
  if (!study) notFound();

  const content = getContent(locale);
  const project = content.projects.find((entry) => entry.slug === slug);
  const title = project?.title ?? study.title;

  /*
   * Everyone on the project except its owner: this is Peter's site, so his own
   * name above his own case study is noise. Collaborators are named because they
   * did the work with him.
   */
  const credits: Credit[] = (study.collaborators ?? [])
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
            description: project?.summary ?? study.summary,
            datePublished: study.publishedAt,
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
          <Prose source={study.body} />
        </div>
      </section>

      <CaseStudyFooter content={content} locale={locale} />

      <ContactCta content={content} />
    </>
  );
}
