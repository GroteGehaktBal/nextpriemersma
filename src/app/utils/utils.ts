import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

/** A collaborator credited in a project's frontmatter. */
type Team = {
    name: string;
    role: string;
    linkedIn: string;
};

/**
 * Frontmatter of a case study.
 *
 * `image`, `images` and `tag` were dropped along with the hero image the case
 * studies used to open with. `summary` stays because it is the fallback for a
 * project that has no entry in the content model.
 */
type Metadata = {
    title: string;
    publishedAt: string;
    summary: string;
    team: Team[];
};

function getMDXFiles(dir: string) {
    if (!fs.existsSync(dir)) {
        throw new Error(`Directory not found: ${dir}`);
    }

    return fs.readdirSync(dir).filter((file) => path.extname(file) === '.mdx');
}

function readMDXFile(filePath: string) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(rawContent);

    const metadata: Metadata = {
        title: data.title || '',
        publishedAt: data.publishedAt,
        summary: data.summary || '',
        team: data.team || [],
    };

    return { metadata, content };
}

function getMDXData(dir: string) {
    const mdxFiles = getMDXFiles(dir);
    return mdxFiles.map((file) => {
        const { metadata, content } = readMDXFile(path.join(dir, file));
        const slug = path.basename(file, path.extname(file));

        return {
            metadata,
            slug,
            content,
        };
    });
}

/**
 * Root of the MDX content tree.
 *
 * Kept as a literal prefix on purpose. Turbopack traces filesystem access
 * statically; when the whole path is assembled from a caller-supplied array it
 * cannot tell what will be read, so it conservatively traces — and deploys —
 * every file in the project, `public/` included. Anchoring the path here keeps
 * the traced set to the content directory.
 */
const CONTENT_ROOT = path.join(process.cwd(), 'src', 'app', '[locale]');

export type ContentSection = 'work/projects';

/**
 * Reads every MDX file for one section in one locale.
 *
 * @param section Content collection, relative to the locale segment.
 * @param locale  Locale directory to read, e.g. `en` or `nl`.
 */
export function getPosts(section: ContentSection, locale: string) {
    return getMDXData(path.join(CONTENT_ROOT, section, locale));
}