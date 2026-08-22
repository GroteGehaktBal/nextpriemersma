import type { CSSProperties } from 'react';

import type { Capability, Certification, Content, Project, TimelineEntry } from '@/content';
import { ArrowRight, Check, Mail } from '@/components/ui/icons';
import { localePath } from '@/i18n/urls';

import styles from './site.module.css';

/**
 * Page sections.
 *
 * Every one is a server component, and every animation below is CSS: `enter`
 * staggers above-the-fold content on load, `reveal` and `revealItem` are driven
 * by scroll timelines, and `revealRule` draws the accent rules. They are defined
 * in `src/styles/motion.css`, and each degrades to a fully visible page.
 */

/** Stagger index for load-in animations, passed as data rather than a class. */
const enterIndex = (index: number) => ({ '--enter-index': index }) as CSSProperties;

/** Stagger offset for scroll reveals within a list. */
const revealOffset = (index: number) => ({ '--reveal-offset': index }) as CSSProperties;

export function SectionHead({
  index,
  title,
  lead,
  as: Heading = 'h2',
}: {
  index: string;
  title: string;
  lead?: string;
  /**
   * Heading level. A page needs exactly one h1, so the section that names the
   * page uses `h1` and the rest stay `h2`. On the home page the hero holds the
   * h1, so every section head there is an h2.
   */
  as?: 'h1' | 'h2';
}) {
  return (
    <div className={`${styles.sectionHead} reveal`}>
      <span className={styles.sectionIndex}>{index}</span>
      <div>
        <Heading className={styles.sectionTitle}>{title}</Heading>
        {lead && <p className={styles.sectionLead}>{lead}</p>}
      </div>
    </div>
  );
}

export function Hero({ content, locale }: { content: Content; locale: string }) {
  const { ui, profile, facts } = content;

  return (
    <section className={`${styles.container} ${styles.hero}`}>
      <p className={`${styles.availability} enter`} style={enterIndex(0)}>
        <span className={styles.statusDot} aria-hidden="true" />
        {profile.availability}
      </p>

      <h1 className={`${styles.heroTitle} enter`} style={enterIndex(1)}>
        {profile.headline.lead} <span className={styles.heroAccent}>{profile.headline.accent}</span>
      </h1>

      <p className={`${styles.heroSubline} enter`} style={enterIndex(2)}>
        {profile.subline}
      </p>

      <div className={`${styles.heroActions} enter`} style={enterIndex(3)}>
        <a className={`${styles.button} ${styles.buttonPrimary}`} href={localePath(locale, '/work')}>
          {ui.actions.seeWork}
          <ArrowRight className={styles.buttonArrow} />
        </a>
        <a className={`${styles.button} ${styles.buttonSecondary}`} href={`mailto:${profile.email}`}>
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
  );
}

export function ProjectList({
  projects,
  locale,
  featureCount = 2,
}: {
  projects: Project[];
  locale: string;
  /** How many entries get the full-width treatment with an outcome line. */
  featureCount?: number;
}) {
  return (
    <div className={styles.projectList}>
      {projects.map((project, index) => (
        <article
          key={project.slug}
          className={`${styles.project} ${index < featureCount ? styles.projectFeatured : ''} revealItem`}
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
  );
}

export function CapabilityList({ capabilities }: { capabilities: Capability[] }) {
  return (
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
  );
}

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <div className={styles.timeline}>
      {entries.map((entry, index) => (
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
  );
}

export function Certifications({ certifications }: { certifications: Certification[] }) {
  const lead = certifications.filter((c) => c.lead);
  const rest = certifications.filter((c) => !c.lead);

  return (
    <>
      <div className={styles.certLead}>
        {lead.map((cert, index) => (
          <article key={cert.name} className={`${styles.cert} revealItem`} style={revealOffset(index)}>
            <p className={styles.certIssuer}>
              {cert.issuer} · {cert.date}
            </p>
            <h4 className={styles.certName}>{cert.name}</h4>
          </article>
        ))}
      </div>

      <ul className={`${styles.certRest} reveal`}>
        {rest.map((cert) => (
          <li key={cert.name} className={styles.certRestItem}>
            <span className={styles.certRestName}>{cert.name}</span>
            <span className={styles.certRestMeta}>
              {cert.issuer} · {cert.date}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

export function ContactCta({ content }: { content: Content }) {
  const { ui, profile } = content;

  return (
    <section id="contact" className={`${styles.container} ${styles.section}`}>
      <div className={`${styles.contact} reveal`}>
        <span className={styles.sectionIndex}>{ui.sections.contact.index}</span>
        <h2 className={styles.contactTitle}>{ui.sections.contact.title}</h2>
        <p className={styles.contactText}>{ui.sections.contact.text}</p>
        <a className={`${styles.button} ${styles.buttonPrimary}`} href={`mailto:${profile.email}`}>
          <Mail />
          {profile.email}
        </a>
      </div>
    </section>
  );
}
