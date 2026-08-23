import { setRequestLocale } from 'next-intl/server';

import { getContent } from '@/content';
import { ContactCta, Hero, ProjectList, SectionHead } from '@/components/site/sections';
import { OG_IMAGE, localeAlternates, localeUrl } from '@/i18n/urls';
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
    description: profile.subline,
    alternates: localeAlternates(locale, ''),
    openGraph: {
      title,
      description: profile.subline,
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
  const { ui, profile, projects } = content;

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: profile.name,
            jobTitle: profile.role,
            description: profile.subline,
            email: `mailto:${profile.email}`,
            url: localeUrl(locale, ''),
            sameAs: [profile.github, profile.linkedin],
            knowsLanguage: ['nl', 'en'],
          }),
        }}
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

      <ContactCta content={content} />
    </>
  );
}
