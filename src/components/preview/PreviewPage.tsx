import type { CSSProperties } from 'react';

import { ArrowRight, ArrowUpRight, Check, GitHub, LinkedIn, Mail } from '@/components/ui/icons';
import { localePath } from '@/i18n/urls';

import type { Content } from './content.types';
import styles from './preview.module.css';

/**
 * The proof-of-concept page, rendered for whichever locale it is given.
 *
 * The whole page is a server component. There is no `"use client"` anywhere in this
 * route, which means the HTML Vercel serves already contains every word below —
 * the opposite of the current site, where `RouteGuard` puts a spinner in the
 * pre-rendered markup and the content only appears after React hydrates.
 *
 * The animations are CSS. `enter` staggers the hero on load, `reveal` and
 * `revealItem` are driven by scroll timelines, and `revealRule` draws the accent
 * rules under the capability titles. All of them are defined in
 * `src/styles/motion.css` and all of them degrade to a fully visible page.
 */

/**
 * Sets the stagger index a hero element animates on.
 *
 * Typed as a CSS custom property rather than passed as a class so the delay stays
 * a data value, and the motion system keeps a single definition of the animation.
 */
const enterIndex = (index: number) => ({ '--enter-index': index }) as CSSProperties;

/** Same idea for scroll-reveal stagger within a list. */
const revealOffset = (index: number) => ({ '--reveal-offset': index }) as CSSProperties;

export interface PreviewPageProps {
  content: Content;
  /** Drives the `lang` attribute and which side of the language toggle is active. */
  locale: 'en' | 'nl';
}

export function PreviewPage({ content, locale }: PreviewPageProps) {
  const { ui, profile, facts, projects, capabilities, timeline, education, certifications } =
    content;

  return (
    <div className={styles.page}>
      <div className={styles.ambient} aria-hidden="true">
        <div className={styles.ambientGrid} />
      </div>

      {/*
        Branch-only banner. This route exists to be reviewed and will be deleted or
        promoted once a direction is chosen; the banner makes that unambiguous.
      */}
      <div className={styles.notice}>
        <span className={styles.noticeBadge}>{ui.notice.badge}</span>
        <span>{ui.notice.text}</span>
      </div>

      <header className={styles.header}>
        <a className={styles.wordmark} href="#top">
          <span className={styles.wordmarkDot} aria-hidden="true" />
          Peter Riemersma
        </a>

        <nav className={styles.nav} aria-label="Sections">
          <a className={styles.navLink} href="#work">
            {ui.nav.work}
          </a>
          <a className={styles.navLink} href="#capabilities">
            {ui.nav.capabilities}
          </a>
          <a className={styles.navLink} href="#background">
            {ui.nav.background}
          </a>
          <a className={styles.navLink} href="#contact">
            {ui.nav.contact}
          </a>
        </nav>

        {/*
          A real language switch, and still zero JavaScript: two links to two
          pre-rendered pages. The current site does this with a client component
          and a router call.

          Plain <a> rather than next/link is deliberate, and the lint rule is
          disabled below rather than satisfied. next/link is a client component,
          so it would put JavaScript on a page whose entire claim is that it needs
          none — and it would buy nothing here, because the two locales have
          separate root layouts and Next.js always does a full page load when a
          navigation crosses one. All cost, no benefit.
        */}
        {/* eslint-disable @next/next/no-html-link-for-pages */}
        <nav className={styles.localeSwitch} aria-label={ui.languageLabel}>
          <a
            className={`${styles.localeOption} ${locale === 'en' ? styles.localeOptionActive : ''}`}
            href="/preview"
            hrefLang="en"
            lang="en"
            aria-current={locale === 'en' ? 'page' : undefined}
          >
            EN
          </a>
          <a
            className={`${styles.localeOption} ${locale === 'nl' ? styles.localeOptionActive : ''}`}
            href="/preview/nl"
            hrefLang="nl"
            lang="nl"
            aria-current={locale === 'nl' ? 'page' : undefined}
          >
            NL
          </a>
        </nav>
        {/* eslint-enable @next/next/no-html-link-for-pages */}
      </header>

      <main id="top">
        <section className={`${styles.container} ${styles.hero}`}>
          <p className={`${styles.availability} enter`} style={enterIndex(0)}>
            <span className={styles.statusDot} aria-hidden="true" />
            {profile.availability}
          </p>

          <h1 className={`${styles.heroTitle} enter`} style={enterIndex(1)}>
            {profile.headline.lead}{' '}
            <span className={styles.heroAccent}>{profile.headline.accent}</span>
          </h1>

          <p className={`${styles.heroSubline} enter`} style={enterIndex(2)}>
            {profile.subline}
          </p>

          <div className={`${styles.heroActions} enter`} style={enterIndex(3)}>
            <a className={`${styles.button} ${styles.buttonPrimary}`} href="#work">
              {ui.actions.seeWork}
              <ArrowRight className={styles.buttonArrow} />
            </a>
            <a
              className={`${styles.button} ${styles.buttonSecondary}`}
              href={`mailto:${profile.email}`}
            >
              <Mail />
              {ui.actions.getInTouch}
            </a>
          </div>

          <dl className={`${styles.facts} enter`} style={enterIndex(4)}>
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className={styles.factLabel}>{fact.label}</dt>
                <dd className={styles.factValue}>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="work" className={`${styles.container} ${styles.section}`}>
          <div className={`${styles.sectionHead} reveal`}>
            <span className={styles.sectionIndex}>{ui.sections.work.index}</span>
            <div>
              <h2 className={styles.sectionTitle}>{ui.sections.work.title}</h2>
              <p className={styles.sectionLead}>{ui.sections.work.lead}</p>
            </div>
          </div>

          <div className={styles.projectList}>
            {projects.map((project, index) => (
              <article
                key={project.slug}
                /*
                 * The first two projects are the lead case studies and span the full
                 * width; the rest pair up. A featured card earns its space by
                 * carrying an outcome line the compact cards do not have room for.
                 */
                className={`${styles.project} ${index < 2 ? styles.projectFeatured : ''} revealItem`}
                style={revealOffset(index % 2)}
              >
                <div className={styles.projectMeta}>
                  <span className={styles.projectKind}>{project.kind}</span>
                  <span className={styles.projectMetaRule} aria-hidden="true" />
                  <span>{project.year}</span>
                </div>

                <h3 className={styles.projectTitle}>
                  <a className={styles.projectLink} href={localePath(locale, `/work/${project.slug}`)}>
                    {project.title}
                  </a>
                </h3>

                <p className={styles.projectSummary}>{project.summary}</p>

                <ul className={styles.tagRow}>
                  {project.stack.map((item) => (
                    <li key={item} className={styles.tag}>
                      {item}
                    </li>
                  ))}
                </ul>

                {project.outcome && (
                  <p className={styles.projectOutcome}>
                    <Check className={styles.projectOutcomeIcon} />
                    {project.outcome}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>

        <section id="capabilities" className={`${styles.container} ${styles.section}`}>
          <div className={`${styles.sectionHead} reveal`}>
            <span className={styles.sectionIndex}>{ui.sections.capabilities.index}</span>
            <div>
              <h2 className={styles.sectionTitle}>{ui.sections.capabilities.title}</h2>
              <p className={styles.sectionLead}>{ui.sections.capabilities.lead}</p>
            </div>
          </div>

          <div className={styles.capabilityList}>
            {capabilities.map((capability, index) => (
              <article
                key={capability.title}
                className={`${styles.capability} revealItem`}
                style={revealOffset(index % 2)}
              >
                <h3 className={styles.capabilityTitle}>{capability.title}</h3>
                <div className={`${styles.capabilityRule} revealRule`} aria-hidden="true" />
                <p className={styles.capabilityText}>{capability.description}</p>
                <p className={styles.capabilityKeywords}>{capability.keywords.join('  ·  ')}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="background" className={`${styles.container} ${styles.section}`}>
          <div className={`${styles.sectionHead} reveal`}>
            <span className={styles.sectionIndex}>{ui.sections.background.index}</span>
            <div>
              <h2 className={styles.sectionTitle}>{ui.sections.background.title}</h2>
              <p className={styles.sectionLead}>{ui.sections.background.lead}</p>
            </div>
          </div>

          <div className={`${styles.subHead} ${styles.subHeadFirst} reveal`}>
            <h3 className={styles.subTitle}>{ui.background.experience}</h3>
          </div>

          <div className={styles.timeline}>
            {timeline.map((entry, index) => (
              <article
                key={`${entry.organisation}-${entry.role}`}
                className={`${styles.entry} ${entry.secondary ? styles.entrySecondary : ''} revealItem`}
                style={revealOffset(index)}
              >
                <p className={styles.entryPeriod}>
                  {entry.current && <span className={styles.statusDot} aria-hidden="true" />}
                  {entry.period}
                </p>
                <div className={styles.entryBody}>
                  <h4 className={styles.entryRole}>{entry.role}</h4>
                  <p className={styles.entryOrg}>{entry.organisation}</p>
                  <p className={styles.entryText}>{entry.description}</p>
                </div>
              </article>
            ))}
          </div>

          <div className={`${styles.subHead} reveal`}>
            <h3 className={styles.subTitle}>{ui.background.education}</h3>
          </div>

          <div className={styles.timeline}>
            {education.map((entry, index) => (
              <article
                key={entry.organisation}
                className={`${styles.entry} revealItem`}
                style={revealOffset(index)}
              >
                <p className={styles.entryPeriod}>
                  {entry.current && <span className={styles.statusDot} aria-hidden="true" />}
                  {entry.period}
                </p>
                <div className={styles.entryBody}>
                  <h4 className={styles.entryRole}>{entry.role}</h4>
                  <p className={styles.entryOrg}>{entry.organisation}</p>
                  <p className={styles.entryText}>{entry.description}</p>
                </div>
              </article>
            ))}
          </div>

          <div className={`${styles.subHead} reveal`}>
            <h3 className={styles.subTitle}>{ui.background.certifications}</h3>
            <p className={styles.subLead}>{ui.background.certificationsLead}</p>
          </div>

          <div className={styles.certLead}>
            {certifications
              .filter((cert) => cert.lead)
              .map((cert, index) => (
                <article
                  key={cert.name}
                  className={`${styles.cert} revealItem`}
                  style={revealOffset(index)}
                >
                  <p className={styles.certIssuer}>
                    {cert.issuer} · {cert.date}
                  </p>
                  <h4 className={styles.certName}>{cert.name}</h4>
                </article>
              ))}
          </div>

          <ul className={`${styles.certRest} reveal`}>
            {certifications
              .filter((cert) => !cert.lead)
              .map((cert) => (
                <li key={cert.name} className={styles.certRestItem}>
                  <span className={styles.certRestName}>{cert.name}</span>
                  <span className={styles.certRestMeta}>
                    {cert.issuer} · {cert.date}
                  </span>
                </li>
              ))}
          </ul>
        </section>

        <section id="contact" className={`${styles.container} ${styles.section}`}>
          <div className={`${styles.contact} reveal`}>
            <span className={styles.sectionIndex}>{ui.sections.contact.index}</span>
            <h2 className={styles.contactTitle}>{ui.sections.contact.title}</h2>
            <p className={styles.contactText}>{ui.sections.contact.text}</p>
            <a
              className={`${styles.button} ${styles.buttonPrimary}`}
              href={`mailto:${profile.email}`}
            >
              <Mail />
              {profile.email}
            </a>
          </div>
        </section>
      </main>

      <footer className={`${styles.container} ${styles.footer}`}>
        <span>
          © {new Date().getFullYear()} {profile.name} — {profile.location}
        </span>
        <div className={styles.footerLinks}>
          <a
            className={styles.footerLink}
            href={profile.github}
            target="_blank"
            rel="noreferrer noopener"
          >
            <GitHub size={14} /> GitHub
          </a>
          <a
            className={styles.footerLink}
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer noopener"
          >
            <LinkedIn size={14} /> LinkedIn
          </a>
          <a className={styles.footerLink} href={`mailto:${profile.email}`}>
            <ArrowUpRight size={14} /> Email
          </a>
        </div>
      </footer>
    </div>
  );
}
