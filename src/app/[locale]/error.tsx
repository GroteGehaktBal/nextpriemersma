'use client';

import { useEffect } from 'react';

import styles from '@/components/site/site.module.css';

/**
 * Error boundary.
 *
 * The one client component on the site, and unavoidably so: `reset` is a
 * function React hands to the boundary at runtime. It is deliberately plain —
 * an error page that depends on the content model or the icon set is an error
 * page that can fail for the same reason the page under it did.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className={`${styles.container} ${styles.notFound}`}>
      <p className={styles.notFoundCode}>500</p>
      <p className={styles.notFoundLine}>Something went wrong / Er ging iets mis</p>
      <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={reset}>
        Try again / Opnieuw proberen
      </button>
    </section>
  );
}
