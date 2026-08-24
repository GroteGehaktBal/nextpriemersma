import type { Content } from '@/content';
import { HONEYPOT_FIELD } from '@/lib/contact';
import { ArrowRight, Mail } from '@/components/ui/icons';

import styles from './site.module.css';

/**
 * The contact form.
 *
 * A server component that renders a plain `<form method="post">`. No React on
 * the client, no fetch, no state: the browser posts it, the Function replies
 * with a redirect, and the visitor lands on a confirmation page. That is the
 * whole interaction, and it works with JavaScript switched off.
 *
 * Two details are doing more than they look:
 *
 *  - The error message is revealed by `:target`. When the Function rejects a
 *    submission it redirects to `…/contact#error`, the fragment matches the
 *    element's id, and CSS shows it. A static page cannot be re-rendered with an
 *    error in it, and this is the alternative to shipping JavaScript to do it.
 *  - `locale` is posted as a hidden field so the Function knows which language
 *    to send the visitor back to. It is checked against the known locales on the
 *    other side rather than trusted.
 */
export function ContactForm({
  content,
  locale,
  endpoint,
}: {
  content: Content;
  locale: string;
  endpoint: string;
}) {
  const { contactPage } = content.ui;

  return (
    <>
      <p className={styles.formError} id="error" role="alert">
        {contactPage.error}
      </p>

      <form className={styles.form} method="post" action={endpoint}>
        <input type="hidden" name="locale" value={locale} />

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="name">
            {contactPage.nameLabel}
          </label>
          <input
            className={styles.input}
            id="name"
            name="name"
            type="text"
            maxLength={100}
            autoComplete="name"
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="email">
            {contactPage.emailLabel}
          </label>
          <input
            className={styles.input}
            id="email"
            name="email"
            type="email"
            maxLength={200}
            autoComplete="email"
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="message">
            {contactPage.messageLabel}
          </label>
          <textarea
            className={`${styles.input} ${styles.textarea}`}
            id="message"
            name="message"
            rows={7}
            maxLength={4000}
            required
          />
        </div>

        {/*
          The honeypot. Hidden with CSS rather than `type="hidden"`, because a
          bot skips hidden inputs and fills in visible ones. `tabindex="-1"` and
          `aria-hidden` keep it away from anyone using a keyboard or a screen
          reader, and the label is there for the browser that ignores the CSS.
        */}
        <div className={styles.honeypot} aria-hidden="true">
          <label htmlFor={HONEYPOT_FIELD}>{contactPage.honeypotLabel}</label>
          <input
            id={HONEYPOT_FIELD}
            name={HONEYPOT_FIELD}
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <button className={`${styles.button} ${styles.buttonPrimary}`} type="submit">
          {contactPage.submit}
          <ArrowRight className={styles.buttonArrow} />
        </button>
      </form>
    </>
  );
}

/**
 * What the contact page shows when no endpoint is configured.
 *
 * A build without `CONTACT_ENDPOINT` has nowhere for the form to post — a plain
 * `npm run dev`, mostly, where no Function is running. Rather than render one
 * that fails, the page offers the address it would have mailed to.
 */
export function ContactDirect({ content }: { content: Content }) {
  const { profile } = content;

  return (
    <a className={`${styles.button} ${styles.buttonPrimary}`} href={`mailto:${profile.email}`}>
      <Mail />
      {profile.email}
    </a>
  );
}
