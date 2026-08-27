import { setRequestLocale } from 'next-intl/server';

import { getContent } from '@/content';
import { ContactCta, Hero, ProjectList, SectionHead } from '@/components/site/sections';
import { OG_IMAGE, ORIGIN, localeAlternates, localeUrl } from '@/i18n/urls';
import { routing } from '@/i18n/routing';
import styles from '@/components/site/site.module.css';

/**
 * Home.
 *
 * Positioning in one screen, then the work, then a way to get in touch. The
 * longer story — capabilities, history, certifications — lives on /about, so
 * this page stays scannable.
 */

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const { profile, ui } = getContent(locale);
  const title = `${profile.name} — ${profile.role}`;

  return {
    title,
    description: profile.metaDescription,
    alternates: localeAlternates(locale, ''),
    openGraph: {
      title,
      description: profile.metaDescription,
      type: 'website',
      locale: locale === 'nl' ? 'nl_NL' : 'en_US',
      url: localeUrl(locale, ''),
      siteName: profile.name,
      alternateLocale: routing.locales.filter((l) => l !== locale),
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description: ui.sections.work.lead,
      images: [OG_IMAGE.url],
    },
  };
}

export default async function Home(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const content = getContent(locale);
  const { ui, profile, projects, capabilities } = content;

  /*
   * What the page says about itself in a form a search engine can act on.
   *
   * `ProfilePage` wrapping a `Person` is the shape Google documents for a page
   * that is about one person, and it is worth more here than the bare `Person`
   * that was here before: it says which entity the page is *about* rather than
   * merely mentioning one.
   *
   * The `@id` is the point of the whole thing. Both language versions name the
   * same identifier, so the two pages describe one person in two languages
   * instead of two people who happen to share a name — which is the same
   * confusion `hreflang` clears up for the pages themselves.
   *
   * Everything below is checkable. Nothing is asserted that the site does not
   * also say in prose.
   */
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: localeUrl(locale, ''),
    inLanguage: locale,
    mainEntity: {
      '@type': 'Person',
      '@id': `${ORIGIN}/#peter`,
      name: profile.name,
      jobTitle: profile.role,
      description: profile.metaDescription,
      email: `mailto:${profile.email}`,
      url: localeUrl(locale, ''),
      image: OG_IMAGE.url,
      sameAs: [profile.github, profile.linkedin],
      knowsLanguage: ['nl', 'en'],
      knowsAbout: capabilities.flatMap((capability) => capability.keywords),
      address: {
        '@type': 'PostalAddress',
        addressLocality: profile.address.locality,
        addressRegion: profile.address.region,
        addressCountry: profile.address.country,
      },
      worksFor: [
        { '@type': 'Organization', name: 'pyxels', url: 'https://www.pyxels.eu' },
        { '@type': 'Organization', name: 'Riemersma ICT' },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <Hero content={content} locale={locale} />

      <section id="work" className={`${styles.container} ${styles.section}`}>
        <SectionHead
          index={ui.sections.work.index}
          title={ui.sections.work.title}
          lead={ui.sections.work.lead}
        />
        {/* Two on the home page; the rest live on /work. */}
        <ProjectList projects={projects.slice(0, 2)} locale={locale} featureCount={2} />
      </section>

      <ContactCta content={content} locale={locale} />
    </>
  );
}
