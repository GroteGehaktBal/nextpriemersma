import { routing } from '@/i18n/routing';

/**
 * Points the language switch at the current page rather than the home page.
 *
 * Rendered once, in the layout. The header's two locale links are plain anchors
 * to `/en` and `/nl` in the HTML — correct with JavaScript off, and correct
 * before this runs — and this swaps the locale segment of the current path into
 * them, so switching language on `/nl/work/pyxels` lands on the English version
 * of that same case study.
 *
 * It is a string of JavaScript rather than a client component on purpose. A
 * client component would pull this page across the hydration boundary and bring
 * React's client runtime with it, for four lines of DOM work that never needs to
 * run twice.
 */
export function LocaleSwitchScript() {
  const pattern = `^/(${routing.locales.join('|')})(?=/|$)`;

  const script = `(function(){try{var p=location.pathname.replace(new RegExp(${JSON.stringify(
    pattern
  )}),'');document.querySelectorAll('[data-locale-switch]').forEach(function(a){a.setAttribute('href','/'+a.getAttribute('data-locale-switch')+p+location.search+location.hash)})}catch(e){}})()`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
