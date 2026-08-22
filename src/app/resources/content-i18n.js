/**
 * @typedef {Object} ContentImage
 * @property {string} src
 * @property {string} alt
 * @property {number} width  Aspect-ratio width, not pixels.
 * @property {number} height Aspect-ratio height, not pixels.
 */

const createI18nContent = (t) => {
    const person = {
        firstName: 'Peter',
        lastName:  'Riemersma',
        get name() {
            return `${this.firstName} ${this.lastName}`;
        },
        role:      t("person.role"),
        avatar:    '/images/avatar.jpg',
        location:  t("contact.timezone"),        // Expecting the IANA time zone identifier, e.g., 'Europe/Vienna'
        languages: t("contact.languages").split(',')
        //languages: {languages}   // optional: Leave the array empty if you don't want to display languages
    }

    const newsletter = {
        display: false,
        title: <>{t("newsletter.title", {firstName: person.firstName})}</>,
        description: <>{t("newsletter.description")}</>
    }

    const social = [
        // Links are automatically displayed.
        // Import new icons in /once-ui/icons.ts
        {
            name: 'GitHub',
            icon: 'github',
            link: 'https://github.com/grotegehaktbal',
        },
        {
            name: 'LinkedIn',
            icon: 'linkedin',
            link: 'https://www.linkedin.com/in/peter-riemersma',
        },
        {
            name: 'X',
            icon: 'x',
            link: '',
        },
        {
            name: 'Email',
            icon: 'email',
            link: 'mailto:peter@riemersmaict.nl',
        },
        {
            name: t("contact.phone"),
            icon: 'phone',
            link: 'tel:+31615939010',
        },
    ]

    const home = {
        label: t("home.label"),
        title: t("home.title", {name: person.name}),
        description: t("home.description", {role: person.role}),
        headline: <>{t("home.headline")}</>,
        subline: <>{t("home.subline")}</>
    }

    const about = {
        label: t("about.label"),
        title: t("about.title"),
        description: t("about.description", {name: person.name, role: person.role, location: person.location}),
        tableOfContent: {
            display: true,
            subItems: true
        },
        avatar: {
            display: true
        },
        calendar: {
            display: false,
            link: 'https://cal.com'
        },
        intro: {
            display: true,
            title: t("about.intro.title"),
            description: <>{t("about.intro.description")}</>
        },
        work: {
            display: true, // set to false to hide this section
            title: t("about.work.title"),
            experiences: [
                {
                    company: 'pyxels',
                    timeframe: t("about.work.experiences.pyxels.timeframe"),
                    role: t("about.work.experiences.pyxels.role"),
                    achievements: t("about.work.experiences.pyxels.achievements").split(";"),
                    /** @type {ContentImage[]} */
                    images: []
                },
                {
                    company: 'Riemersma ICT',
                    timeframe: t("about.work.experiences.Riemersma ICT.timeframe"),
                    role: t("about.work.experiences.Riemersma ICT.role"),
                    achievements: t("about.work.experiences.Riemersma ICT.achievements").split(";"),
                    /** @type {ContentImage[]} */
                    images: []
                }
            ]
        },
        studies: {
            display: true, // set to false to hide this section
            title: 'Studies',
            institutions: [
                {
                    name: t(`about.studies.institutions.Hanzehogeschool Groningen.naamhanze`),
                    description: <>{t(`about.studies.institutions.Hanzehogeschool Groningen.description`)}</>,
                },
                {
                    name: t(`about.studies.institutions.Noorderpoort College.naamnoorderpoort`),
                    description: <>{t("about.studies.institutions.Noorderpoort College.description")}</>,
                }
            ]
        },
        technical: {
            display: true, // set to false to hide this section
            title: t("about.technical.title"),
            skills: [
                {
                    title: 'Cisco Networking',
                    description: <>{t("about.technical.skills.Cisco Networking.description")}</>,
                    /** @type {ContentImage[]} */
                    images: []
                },
                {
                    title: 'Home Assistant',
                    description: <>{t("about.technical.skills.Home Assistant.description")}</>,
                    /** @type {ContentImage[]} */
                    images: []
                },
                {
                    title: 'Next.js',
                    description: <>{t("about.technical.skills.Nextjs.description")}</>, // "." not accepted in next-intl namespace
                    /** @type {ContentImage[]} */
                    images: []
                    // images: [
                    //     {
                    //         src: '/images/projects/project-01/cover-04.jpg',
                    //         alt: 'Project image',
                    //         width: 16,
                    //         height: 9
                    //     },
                    // ]
                }
            ]
        }
    }

    const blog = {
        label: t("blog.label"),
        title: t("blog.title"),
        description: t("blog.description", {name: person.name})
        // Create new blog posts by adding a new .mdx file to app/blog/posts
        // All posts will be listed on the /blog route
    }

    const work = {
        label: t("work.label"),
        title: t("work.title"),
        description: t("work.description", {name: person.name})
        // Create new project pages by adding a new .mdx file to app/blog/posts
        // All projects will be listed on the /home and /work routes
    }

    const gallery = {
        label: t("gallery.label"),
        title: t("gallery.title"),
        description: t("gallery.description", {name: person.name}),
        images: [
            {
                src: '/images/gallery/img-01.jpg',
                alt: 'image',
                orientation: 'vertical'
            },
            { 
                src: '/images/gallery/img-02.jpg',
                alt: 'image',
                orientation: 'horizontal'
            },
        ]
    }
    return {
        person,
        social,
        newsletter,
        home,
        about,
        blog,
        work,
        gallery
    }
};

export { createI18nContent };