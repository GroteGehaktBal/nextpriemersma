import { setRequestLocale } from 'next-intl/server';

import { getContent } from '@/content';
import { localePath } from '@/i18n/urls';
import { ArrowRight } from '@/components/ui/icons';
import styles from '@/components/site/site.module.css';

/**
 * Where a sent message lands.
 *
 * Reached by a redirect from the Function rather than by a link, which is why it
 * is kept out of the index: it says nothing to a search engine, and a visitor
 * arriving here from a search result would be reading a confirmation of
 * something they never did.
 */
export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const { ui, profile } = getContent(locale);

  return {
    title: `${ui.contactPage.thanksTitle} — ${profile.name}`,
    robots: { index: false, follow: true },
  };
}

export default async function Thanks(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const { ui } = getContent(locale);

  return (
    <section className={`${styles.container} ${styles.notFound}`}>
      <h1 className={styles.thanksTitle}>{ui.contactPage.thanksTitle}</h1>
      <p className={styles.notFoundLine}>{ui.contactPage.thanksBody}</p>
      <p>
        <a className={styles.notFoundLink} href={localePath(locale)}>
          {ui.contactPage.thanksBack}
          <ArrowRight className={styles.buttonArrow} />
        </a>
      </p>
    </section>
  );
}
