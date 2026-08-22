import { use } from "react";
import { getPosts } from '@/app/utils/utils';
import { Flex } from '@/once-ui/components';
import { Projects } from '@/components/work/Projects';
import { baseURL } from '@/app/resources';
import { localeAlternates, localeUrl } from '@/i18n/urls';
import { renderContent } from '@/app/resources/renderContent';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';

export async function generateMetadata(props: { params: Promise<{ locale: string }>}) {
    const params = await props.params;

    const {
        locale
    } = params;

    const t = await getTranslations();
    const { work } = renderContent(t);

    const title = work.title;
    const description = work.description;
    const ogImage = `https://${baseURL}/og?title=${encodeURIComponent(title)}`;

    return {
		title,
		description,
		alternates: localeAlternates(locale, '/work'),
		openGraph: {
			title,
			description,
			type: 'website',
			locale: locale === 'nl' ? 'nl_NL' : 'en_US',
			url: localeUrl(locale, '/work'),
			images: [
				{
					url: ogImage,
					alt: title,
				},
			],
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images: [ogImage],
		},
	};
}

export default function Work(props: { params: Promise<{ locale: string }>}) {
    const params = use(props.params);

    const {
        locale
    } = params;

    setRequestLocale(locale);
    let allProjects = getPosts('work/projects', locale);

    const t = useTranslations();
    const { person, work } = renderContent(t);

    return (
        <Flex
			fillWidth maxWidth="m"
			direction="column">
            <script
                type="application/ld+json"
                suppressHydrationWarning
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'CollectionPage',
                        headline: work.title,
                        description: work.description,
                        url: `https://${baseURL}/projects`,
                        image: `${baseURL}/og?title=Design%20Projects`,
                        author: {
                            '@type': 'Person',
                            name: person.name,
                        },
                        hasPart: allProjects.map(project => ({
                            '@type': 'CreativeWork',
                            headline: project.metadata.title,
                            description: project.metadata.summary,
                            url: `https://${baseURL}/projects/${project.slug}`,
                            image: `${baseURL}/${project.metadata.image}`,
                        })),
                    }),
                }}
            />
            <Projects locale={locale}/>
        </Flex>
    );
}