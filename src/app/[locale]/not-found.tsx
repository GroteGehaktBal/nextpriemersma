import { routing } from '@/i18n/routing';
import { getContent } from '@/content';
import { localePath } from '@/i18n/urls';
import { ArrowRight } from '@/components/ui/icons';
import styles from '@/components/site/site.module.css';

/**
 * 404.
 *
 * Bilingual, because Next renders one not-found page for the whole locale
 * segment and gives it no params — there is no locale to read here, and
 * guessing one would show a Dutch reader an English page as often as not.
 * Naming both languages costs two lines and is never wrong.
 */
export default function NotFound() {
  return (
    <section className={`${styles.container} ${styles.notFound}`}>
      <p className={styles.notFoundCode}>404</p>

      {routing.locales.map((locale) => {
        const { ui } = getContent(locale);

        return (
          <p key={locale} className={styles.notFoundLine} lang={locale}>
            <a className={styles.notFoundLink} href={localePath(locale)}>
              {ui.notFound}
              <ArrowRight className={styles.buttonArrow} />
            </a>
          </p>
        );
      })}
    </section>
  );
}
