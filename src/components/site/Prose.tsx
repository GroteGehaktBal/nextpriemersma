import type { ReactNode } from 'react';
import { MDXRemote } from 'next-mdx-remote/rsc';

import styles from './prose.module.css';

/**
 * Renders a case study's MDX body.
 *
 * The component map below is deliberately thin: MDX emits HTML elements, and
 * `prose.module.css` styles HTML elements, so almost nothing needs a component
 * at all. Only three cases do — headings, which need an id to be linkable;
 * links, which need their target and rel set by origin; and tables, which need a
 * scroll container so a wide one does not widen the page.
 *
 * What this replaces is worth recording. Every paragraph used to render as a
 * Once UI `<Text>` with four inline style props, and every heading as a client
 * component that mounted a toast portal so the heading could copy its own URL to
 * the clipboard. That put React state, a portal and an event listener on a page
 * whose content never changes.
 */

/**
 * Flattens a heading's children to plain text.
 *
 * A heading is usually a single string, but Markdown allows inline formatting
 * inside one — `## The **fast** path` arrives as an array of nodes. Slugifying
 * `[object Object]` would produce colliding ids, so the text is collected first.
 */
function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    return textOf((node as { props: { children?: ReactNode } }).props.children);
  }
  return '';
}

/**
 * Builds an id from heading text.
 *
 * Decomposing to NFKD and dropping the combining marks first is what makes this
 * work in Dutch: without it "Gebruikte Technologieën" loses its ë entirely and
 * becomes `gebruikte-technologien`... in the good case. The accented character
 * is not a word character, so it would otherwise be stripped along with the
 * punctuation.
 */
function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function heading(level: 2 | 3 | 4) {
  const Tag = `h${level}` as const;

  function Heading({ children }: { children?: ReactNode }) {
    return <Tag id={slugify(textOf(children))}>{children}</Tag>;
  }

  Heading.displayName = `ProseH${level}`;
  return Heading;
}

function Anchor({ href = '', children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const external = /^https?:\/\//.test(href);

  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : null)}
      {...rest}
    >
      {children}
    </a>
  );
}

function Table({ children }: { children?: ReactNode }) {
  return (
    <div className={styles.tableWrap}>
      <table>{children}</table>
    </div>
  );
}

const components = {
  h1: heading(2), // A case study's own title is the page's h1; the body starts below it.
  h2: heading(2),
  h3: heading(3),
  h4: heading(4),
  a: Anchor,
  table: Table,
};

export function Prose({ source }: { source: string }) {
  return (
    <div className={styles.prose}>
      <MDXRemote source={source} components={components} />
    </div>
  );
}
