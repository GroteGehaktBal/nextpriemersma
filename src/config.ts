/**
 * Where the contact form posts, or nothing.
 *
 * The form needs an endpoint, and the endpoint is the Cloudflare Pages Function
 * in `functions/api/contact.ts`. Cloudflare runs it; `next dev` does not, and
 * neither does an export opened from the filesystem. A form that posts into a
 * 404 is worse than no form at all.
 *
 * So the endpoint is configuration rather than a flag. Set `CONTACT_ENDPOINT` to
 * `/api/contact` — the Pages project does, and so does CI — and the contact page
 * renders a form; leave it unset, as a bare `npm run dev` does, and the same
 * page offers the email address instead. Neither state is broken.
 *
 * `npm run smoke` is the way to exercise the real thing locally: it builds with
 * the variable set and serves the result the way Cloudflare will.
 */
export const CONTACT_ENDPOINT = process.env.CONTACT_ENDPOINT ?? '';
