import { setRequestLocale } from 'next-intl/server';

import { getContent } from '@/content';
import { ContactCta, ProjectList, SectionHead } from '@/components/site/sections';
import { OG_IMAGE, localeAlternates, localeUrl } from '@/i18n/urls';
import styles from '@/components/site/site.module.css';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const { ui, profile } = getContent(locale);
  const title = `${ui.sections.work.title} — ${profile.name}`;

  return {
    title,
    description: ui.sections.work.lead,
    alternates: localeAlternates(locale, '/work'),
    openGraph: {
      title,
      description: ui.sections.work.lead,
      type: 'website',
      locale: locale === 'nl' ? 'nl_NL' : 'en_US',
      url: localeUrl(locale, '/work'),
      images: [OG_IMAGE],
    },
  };
}

export default async function Work(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const content = getContent(locale);
  const { ui, projects } = content;

  return (
    <>
      <section className={`${styles.container} ${styles.section}`} style={{ borderTop: 'none' }}>
        <SectionHead
          as="h1"
          index={ui.sections.work.index}
          title={ui.sections.work.title}
          lead={ui.sections.work.lead}
        />
        <ProjectList projects={projects} locale={locale} featureCount={2} headingLevel="h2" />
      </section>

      <ContactCta content={content} locale={locale} />
    </>
  );
}
