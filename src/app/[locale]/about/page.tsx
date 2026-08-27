import { setRequestLocale } from 'next-intl/server';

import { getContent } from '@/content';
import {
  CapabilityList,
  Certifications,
  ContactCta,
  SectionHead,
  Timeline,
} from '@/components/site/sections';
import { OG_IMAGE, ORIGIN, localeAlternates, localeUrl } from '@/i18n/urls';
import styles from '@/components/site/site.module.css';

/**
 * About.
 *
 * The full story: what he does, the history behind it, and the credentials. The
 * home page carries the short version.
 */

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const { profile, ui } = getContent(locale);
  const title = `${ui.sections.background.title} — ${profile.name}`;

  return {
    title,
    description: ui.sections.background.lead,
    alternates: localeAlternates(locale, '/about'),
    openGraph: {
      title,
      description: ui.sections.background.lead,
      type: 'profile',
      locale: locale === 'nl' ? 'nl_NL' : 'en_US',
      url: localeUrl(locale, '/about'),
      images: [OG_IMAGE],
    },
  };
}

export default async function About(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const content = getContent(locale);
  const { ui, profile, capabilities, timeline, education, certifications } = content;

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            // The same identifier the home page uses, so this is more of what is
            // known about one person rather than a second person with his name.
            '@id': `${ORIGIN}/#peter`,
            name: profile.name,
            jobTitle: profile.role,
            description: profile.metaDescription,
            url: localeUrl(locale, '/about'),
            sameAs: [profile.github, profile.linkedin],
            alumniOf: education.map((e) => ({ '@type': 'EducationalOrganization', name: e.organisation })),
            worksFor: timeline
              .filter((e) => e.current)
              .map((e) => ({ '@type': 'Organization', name: e.organisation })),
          }),
        }}
      />

      <section id="capabilities" className={`${styles.container} ${styles.section}`} style={{ borderTop: 'none' }}>
        <SectionHead
          as="h1"
          index={ui.sections.capabilities.index}
          title={ui.sections.capabilities.title}
          lead={ui.sections.capabilities.lead}
        />
        <CapabilityList capabilities={capabilities} headingLevel="h2" />
      </section>

      <section id="background" className={`${styles.container} ${styles.section}`}>
        <SectionHead
          index={ui.sections.background.index}
          title={ui.sections.background.title}
          lead={ui.sections.background.lead}
        />

        <div className={`${styles.subHead} ${styles.subHeadFirst} reveal`}>
          <h3 className={styles.subTitle}>{ui.background.experience}</h3>
        </div>
        <Timeline entries={timeline} />

        <div className={`${styles.subHead} reveal`}>
          <h3 className={styles.subTitle}>{ui.background.education}</h3>
        </div>
        <Timeline entries={education} />

        <div className={`${styles.subHead} reveal`}>
          <h3 className={styles.subTitle}>{ui.background.certifications}</h3>
          <p className={styles.subLead}>{ui.background.certificationsLead}</p>
        </div>
        <Certifications certifications={certifications} />
      </section>

      <ContactCta content={content} locale={locale} />
    </>
  );
}
