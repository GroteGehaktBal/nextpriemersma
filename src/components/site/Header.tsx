import type { Content } from '@/content';
import { localePath } from '@/i18n/urls';
import { routing } from '@/i18n/routing';

import styles from './site.module.css';

/**
 * Site header.
 *
 * A server component. The language switch is two links to two pre-rendered
 * pages rather than a client component calling the router, which is how the
 * previous header did it — that pulled the whole header, and its translation
 * lookups, across the hydration boundary.
 */
export function Header({ content, locale }: { content: Content; locale: string }) {
  const { ui, profile } = content;

  const nav = [
    { href: localePath(locale, '/work'), label: ui.nav.work },
    { href: localePath(locale, '/about'), label: ui.nav.background },
    { href: localePath(locale, '/contact'), label: ui.nav.contact },
  ];

  return (
    <header className={styles.header}>
      <a className={styles.wordmark} href={localePath(locale)}>
        <span className={styles.wordmarkDot} aria-hidden="true" />
        {profile.name}
      </a>

      <nav className={styles.nav} aria-label={ui.nav.work}>
        {nav.map((item) => (
          <a key={item.href} className={styles.navLink} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>

      {/*
        The language switch.
        
        Each link points at the other language's home page, which is what it
        resolves to with JavaScript off. `LocaleSwitchScript` in the layout
        rewrites the two hrefs to the current page in the other language — the
        slugs are identical across locales, so `/nl/work/pyxels` maps to
        `/en/work/pyxels` by swapping one segment.

        Why a script and not a server computation: the header renders in the
        layout, and a layout is not told which page is below it. The alternatives
        were reading the request headers, which stops every page being static, or
        rendering the header separately in each page, which is a foot-gun for the
        next page anyone adds. This costs a few hundred bytes and degrades to a
        working link.
      */}
      <nav className={styles.localeSwitch} aria-label={ui.languageLabel}>
        {routing.locales.map((l) => (
          <a
            key={l}
            className={`${styles.localeOption} ${l === locale ? styles.localeOptionActive : ''}`}
            href={localePath(l)}
            hrefLang={l}
            lang={l}
            data-locale-switch={l}
            aria-current={l === locale ? 'page' : undefined}
          >
            {l.toUpperCase()}
          </a>
        ))}
      </nav>
    </header>
  );
}
