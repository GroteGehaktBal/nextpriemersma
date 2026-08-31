import { setRequestLocale } from 'next-intl/server';

import { getContent } from '@/content';
import { ContactCta, Hero, ProjectList, SectionHead } from '@/components/site/sections';
import { OG_IMAGE, localeAlternates, localeUrl } from '@/i18n/urls';
import { personSchema } from '@/lib/seo';
import { routing } from '@/i18n/routing';
import styles from '@/components/site/site.module.css';

/**
 * Home.
 *
 * Positioning in one screen, then the work, then a way to get in touch. The
 * longer story — capabilities, history, certifications — lives on /about, so
 * this page stays scannable.
 */

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const { profile, ui } = getContent(locale);
  const title = `${profile.name} — ${profile.role}`;

  return {
    title,
    description: profile.metaDescription,
    alternates: localeAlternates(locale, ''),
    openGraph: {
      title,
      description: profile.metaDescription,
      type: 'website',
      locale: locale === 'nl' ? 'nl_NL' : 'en_US',
      url: localeUrl(locale, ''),
      siteName: profile.name,
      alternateLocale: routing.locales.filter((l) => l !== locale),
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description: ui.sections.work.lead,
      images: [OG_IMAGE.url],
    },
  };
}

export default async function Home(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const content = getContent(locale);
  const { ui, projects } = content;

  /*
   * `ProfilePage` wrapping a `Person` is the shape Google documents for a page
   * that is about one person, and it says more than the bare `Person` that was
   * here before: which entity the page is *about*, rather than one it mentions.
   *
   * The person themselves is built by `personSchema`, which the about page also
   * uses — they share an `@id`, and an identifier claiming two pages describe
   * one person is worth less than nothing if the two then disagree.
   */
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: localeUrl(locale, ''),
    inLanguage: locale,
    mainEntity: personSchema(content, localeUrl(locale, '')),
  };

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <Hero content={content} locale={locale} />

      <section id="work" className={`${styles.container} ${styles.section}`}>
        <SectionHead
          index={ui.sections.work.index}
          title={ui.sections.work.title}
          lead={ui.sections.work.lead}
        />
        {/* Two on the home page; the rest live on /work. */}
        <ProjectList projects={projects.slice(0, 2)} locale={locale} featureCount={2} />
      </section>

      <ContactCta content={content} locale={locale} />
    </>
  );
}
