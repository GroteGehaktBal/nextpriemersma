import type { CSSProperties } from 'react';

import { ArrowRight, ArrowUpRight, Check, GitHub, LinkedIn, Mail } from '@/components/ui/icons';

import { capabilities, facts, profile, projects, timeline } from './content';
import styles from './preview.module.css';

/**
 * Proof of concept for the portfolio overhaul.
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

export default function PreviewPage() {
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
        <span className={styles.noticeBadge}>Proof of concept</span>
        <span>Design proposal — not the live site</span>
      </div>

      <header className={styles.header}>
        <a className={styles.wordmark} href="#top">
          <span className={styles.wordmarkDot} aria-hidden="true" />
          Peter Riemersma
        </a>

        <nav className={styles.nav} aria-label="Sections">
          <a className={styles.navLink} href="#work">
            Work
          </a>
          <a className={styles.navLink} href="#capabilities">
            Capabilities
          </a>
          <a className={styles.navLink} href="#background">
            Background
          </a>
          <a className={styles.navLink} href="#contact">
            Contact
          </a>
        </nav>

        {/*
          Static in the PoC — it demonstrates the treatment. In the real build this
          is the only interactive element in the header, and the one place a client
          component is genuinely warranted.
        */}
        <div className={styles.localeSwitch} aria-hidden="true">
          <span className={`${styles.localeOption} ${styles.localeOptionActive}`}>EN</span>
          <span className={styles.localeOption}>NL</span>
        </div>
      </header>

      <main id="top">
        <section className={`${styles.container} ${styles.hero}`}>
          <p className={`${styles.availability} enter`} style={enterIndex(0)}>
            <span className={styles.statusDot} aria-hidden="true" />
            {profile.availability}
          </p>

          <h1 className={`${styles.heroTitle} enter`} style={enterIndex(1)}>
            I design networks that stay up{' '}
            <span className={styles.heroAccent}>and homes that think for themselves.</span>
          </h1>

          <p className={`${styles.heroSubline} enter`} style={enterIndex(2)}>
            {profile.subline}
          </p>

          <div className={`${styles.heroActions} enter`} style={enterIndex(3)}>
            <a className={`${styles.button} ${styles.buttonPrimary}`} href="#work">
              See the work
              <ArrowRight className={styles.buttonArrow} />
            </a>
            <a
              className={`${styles.button} ${styles.buttonSecondary}`}
              href={`mailto:${profile.email}`}
            >
              <Mail />
              Get in touch
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
            <span className={styles.sectionIndex}>01 / Work</span>
            <div>
              <h2 className={styles.sectionTitle}>Selected projects</h2>
              <p className={styles.sectionLead}>
                Infrastructure, automation and the software that ties them together. Each entry
                names what was built, what it runs on, and what changed as a result.
              </p>
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
                  <a className={styles.projectLink} href={`/work/${project.slug}`}>
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
            <span className={styles.sectionIndex}>02 / Capabilities</span>
            <div>
              <h2 className={styles.sectionTitle}>What I actually do</h2>
              <p className={styles.sectionLead}>
                Four areas, each backed by the tools and protocols behind it rather than a
                self-assessed percentage bar.
              </p>
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
            <span className={styles.sectionIndex}>03 / Background</span>
            <div>
              <h2 className={styles.sectionTitle}>Experience and education</h2>
              <p className={styles.sectionLead}>
                Studying network and security engineering while running two businesses that put it
                into practice.
              </p>
            </div>
          </div>

          <div className={styles.timeline}>
            {timeline.map((entry, index) => (
              <article
                key={`${entry.organisation}-${entry.role}`}
                className={`${styles.entry} revealItem`}
                style={revealOffset(index)}
              >
                <p className={styles.entryPeriod}>
                  {entry.current && <span className={styles.statusDot} aria-hidden="true" />}
                  {entry.period}
                </p>
                <div className={styles.entryBody}>
                  <h3 className={styles.entryRole}>{entry.role}</h3>
                  <p className={styles.entryOrg}>{entry.organisation}</p>
                  <p className={styles.entryText}>{entry.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className={`${styles.container} ${styles.section}`}>
          <div className={`${styles.contact} reveal`}>
            <span className={styles.sectionIndex}>04 / Contact</span>
            <h2 className={styles.contactTitle}>Got a network or a house that needs thinking about?</h2>
            <p className={styles.contactText}>
              Available for internships, freelance work and smart-home projects across Friesland and
              the north of the Netherlands.
            </p>
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
