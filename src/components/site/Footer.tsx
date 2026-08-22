import type { Content } from '@/content';
import { ArrowUpRight, GitHub, LinkedIn } from '@/components/ui/icons';

import styles from './site.module.css';

export function Footer({ content }: { content: Content }) {
  const { profile } = content;

  return (
    <footer className={`${styles.container} ${styles.footer}`}>
      <span>
        © {new Date().getFullYear()} {profile.name} — {profile.location}
      </span>
      <div className={styles.footerLinks}>
        <a className={styles.footerLink} href={profile.github} target="_blank" rel="noreferrer noopener">
          <GitHub size={14} /> GitHub
        </a>
        <a className={styles.footerLink} href={profile.linkedin} target="_blank" rel="noreferrer noopener">
          <LinkedIn size={14} /> LinkedIn
        </a>
        <a className={styles.footerLink} href={`mailto:${profile.email}`}>
          <ArrowUpRight size={14} /> {content.ui.nav.contact}
        </a>
      </div>
    </footer>
  );
}
