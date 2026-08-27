import type { CSSProperties } from 'react';

import type { Capability, Certification, Content, Project, TimelineEntry } from '@/content';
import { ArrowLeft, ArrowRight, Check, Mail } from '@/components/ui/icons';
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
        <a
          className={`${styles.button} ${styles.buttonSecondary}`}
          href={localePath(locale, '/contact')}
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
  );
}

export function ProjectList({
  projects,
  locale,
  featureCount = 2,
  headingLevel: Title = 'h3',
}: {
  projects: Project[];
  locale: string;
  /** How many entries get the full-width treatment with an outcome line. */
  featureCount?: number;
  /**
   * Level for the card titles.
   *
   * A page's headings have to descend one level at a time to be navigable: on
   * the home page the section head above this list is an h2, so the cards are
   * h3; on /work the section head is the page's h1, so they are h2. Hard-coding
   * h3 made /work jump from h1 straight to h3, which is what a screen reader
   * reports as a missing level.
   */
  headingLevel?: 'h2' | 'h3';
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

          <Title className={styles.projectTitle}>
            <a className={styles.projectLink} href={localePath(locale, `/work/${project.slug}`)}>
              {project.title}
            </a>
          </Title>

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

export function CapabilityList({
  capabilities,
  headingLevel: Title = 'h3',
}: {
  capabilities: Capability[];
  /** As on `ProjectList`: one level below the section head above this list. */
  headingLevel?: 'h2' | 'h3';
}) {
  return (
    <div className={styles.capabilityList}>
      {capabilities.map((capability, index) => (
        <article
          key={capability.title}
          className={`${styles.capability} revealItem`}
          style={revealOffset(index % 2)}
        >
          <Title className={styles.capabilityTitle}>{capability.title}</Title>
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

/**
 * The closing call to action, on every page.
 *
 * It used to be a `mailto:` showing the address. That asks the reader to have a
 * mail client configured, to switch to it, and to write the first line
 * themselves — three chances to not bother, and on a phone the first one alone
 * loses most people. The form asks for a name, an address and a message, and it
 * is one tap away.
 *
 * The address is still on `/contact`, beside the form, for anyone who prefers it.
 */
export function ContactCta({ content, locale }: { content: Content; locale: string }) {
  const { ui } = content;

  return (
    <section id="contact" className={`${styles.container} ${styles.section}`}>
      <div className={`${styles.contact} reveal`}>
        <span className={styles.sectionIndex}>{ui.sections.contact.index}</span>
        <h2 className={styles.contactTitle}>{ui.sections.contact.title}</h2>
        <p className={styles.contactText}>{ui.sections.contact.text}</p>
        <a
          className={`${styles.button} ${styles.buttonPrimary}`}
          href={localePath(locale, '/contact')}
        >
          <Mail />
          {ui.actions.getInTouch}
        </a>
      </div>
    </section>
  );
}

/**
 * A person credited on a case study, read from the MDX frontmatter.
 *
 * They used to render as a row of avatar images. Two 40px photographs of people
 * the reader has never met communicate nothing that their names do not, and cost
 * two image requests on a page that otherwise makes none.
 */
export interface Credit {
  name: string;
  url?: string;
}

/**
 * Header of a case study.
 *
 * Deliberately built from the same parts as the card that links here — the same
 * eyebrow, the same tags, the same outcome line — so arriving on the page feels
 * like the card opening rather than a jump to an unrelated layout. The lead and
 * the tags come from the content model, which is what keeps the two in step: the
 * MDX file holds the body, the content model holds the summary.
 */
export function CaseStudyHeader({
  content,
  locale,
  title,
  project,
  credits = [],
}: {
  content: Content;
  locale: string;
  /** Falls back to the MDX title when the slug has no entry in the model. */
  title: string;
  project?: Project;
  credits?: Credit[];
}) {
  const { ui } = content;

  return (
    <header className={`${styles.container} ${styles.caseHeader}`}>
      <a className={`${styles.backLink} enter`} style={enterIndex(0)} href={localePath(locale, '/work')}>
        <ArrowLeft className={styles.backArrow} />
        {ui.caseStudy.back}
      </a>

      {project && (
        <p className={`${styles.projectMeta} ${styles.caseMeta} enter`} style={enterIndex(1)}>
          <span className={styles.projectKind}>{project.kind}</span>
          <span className={styles.projectMetaRule} aria-hidden="true" />
          <span>{project.year}</span>
        </p>
      )}

      <h1 className={`${styles.caseTitle} enter`} style={enterIndex(2)}>
        {title}
      </h1>

      {project && (
        <p className={`${styles.caseLead} enter`} style={enterIndex(3)}>
          {project.summary}
        </p>
      )}

      {project && project.stack.length > 0 && (
        <ul className={`${styles.tagRow} enter`} style={enterIndex(4)}>
          {project.stack.map((item) => (
            <li key={item} className={styles.tag}>
              {item}
            </li>
          ))}
        </ul>
      )}

      {project?.outcome && (
        <p className={`${styles.projectOutcome} ${styles.caseOutcome} enter`} style={enterIndex(5)}>
          <Check className={styles.projectOutcomeIcon} />
          {project.outcome}
        </p>
      )}

      {credits.length > 0 && (
        <p className={`${styles.caseCredit} enter`} style={enterIndex(6)}>
          <span className={styles.caseCreditLabel}>{ui.caseStudy.withLabel}</span>
          {credits.map((credit, index) => (
            <span key={credit.name}>
              {index > 0 && ', '}
              {credit.url ? (
                <a className={styles.caseCreditLink} href={credit.url} target="_blank" rel="noopener noreferrer">
                  {credit.name}
                </a>
              ) : (
                credit.name
              )}
            </span>
          ))}
        </p>
      )}
    </header>
  );
}

/** Closing link at the foot of a case study, back to the full list. */
export function CaseStudyFooter({ content, locale }: { content: Content; locale: string }) {
  return (
    <div className={`${styles.container} ${styles.caseFooter}`}>
      <a className={`${styles.button} ${styles.buttonSecondary} reveal`} href={localePath(locale, '/work')}>
        <ArrowLeft />
        {content.ui.caseStudy.more}
      </a>
    </div>
  );
}
