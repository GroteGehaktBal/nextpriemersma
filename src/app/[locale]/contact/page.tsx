import { setRequestLocale } from 'next-intl/server';

import { CONTACT_ENDPOINT } from '@/config';
import { getContent } from '@/content';
import { OG_IMAGE, localeAlternates, localeUrl } from '@/i18n/urls';
import { ContactDirect, ContactForm } from '@/components/site/ContactForm';
import { SectionHead } from '@/components/site/sections';
import { GitHub, LinkedIn } from '@/components/ui/icons';
import styles from '@/components/site/site.module.css';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const { ui, profile } = getContent(locale);
  const title = `${ui.contactPage.title} — ${profile.name}`;

  return {
    title,
    description: ui.contactPage.lead,
    alternates: localeAlternates(locale, '/contact'),
    openGraph: {
      title,
      description: ui.contactPage.lead,
      type: 'website',
      locale: locale === 'nl' ? 'nl_NL' : 'en_US',
      url: localeUrl(locale, '/contact'),
      images: [OG_IMAGE],
    },
  };
}

export default async function Contact(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const content = getContent(locale);
  const { ui, profile } = content;

  return (
    <section className={`${styles.container} ${styles.section}`} style={{ borderTop: 'none' }}>
      <SectionHead
        as="h1"
        index={ui.sections.contact.index}
        title={ui.contactPage.title}
        lead={ui.contactPage.lead}
      />

      <div className={styles.contactLayout}>
        <div className={styles.contactMain}>
          {CONTACT_ENDPOINT ? (
            <ContactForm content={content} locale={locale} endpoint={CONTACT_ENDPOINT} />
          ) : (
            <ContactDirect content={content} />
          )}
        </div>

        <aside className={styles.contactAside}>
          <p className={styles.contactAsideLabel}>{ui.contactPage.directLabel}</p>
          <ul className={styles.contactList}>
            <li>
              <a className={styles.contactListLink} href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
            </li>
            <li>
              <a
                className={styles.contactListLink}
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkedIn />
                LinkedIn
              </a>
            </li>
            <li>
              <a
                className={styles.contactListLink}
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHub />
                GitHub
              </a>
            </li>
          </ul>
          <p className={styles.contactAsideLocation}>{profile.location}</p>
        </aside>
      </div>
    </section>
  );
}
