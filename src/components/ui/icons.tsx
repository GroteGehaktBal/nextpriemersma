/**
 * Inline icon set.
 *
 * The current site depends on `react-icons`, which pulls from three separate icon
 * families to render about a dozen glyphs. These are hand-written SVG paths on a
 * 24×24 grid with a 1.5px stroke: no dependency, no module graph, and each icon
 * costs roughly 200 bytes in the HTML rather than a JavaScript import.
 *
 * They are server components — nothing here is interactive, so nothing here
 * crosses the hydration boundary.
 */

export interface IconProps {
  /** Rendered size in pixels. Matches the surrounding text size by default. */
  size?: number;
  className?: string;
}

/**
 * Shared attributes for every glyph.
 *
 * `currentColor` means an icon inherits the colour of its context, so an icon
 * never needs its own colour token. `aria-hidden` is correct for all of these:
 * each one sits beside a text label that already names the action.
 */
const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false as const,
});

export function ArrowRight({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function ArrowUpRight({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

export function Check({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="m4 12 5.5 5.5L20 7" />
    </svg>
  );
}

export function Mail({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="2.75" y="4.75" width="18.5" height="14.5" rx="2.25" />
      <path d="m3.5 7 7.4 5.3a2 2 0 0 0 2.2 0L20.5 7" />
    </svg>
  );
}

export function GitHub({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
    </svg>
  );
}

export function LinkedIn({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      <path d="M7.5 10.5V17" />
      <path d="M7.5 7.5v.01" />
      <path d="M11.5 17v-3.75a2.25 2.25 0 0 1 4.5 0V17" />
      <path d="M11.5 10.5V17" />
    </svg>
  );
}
