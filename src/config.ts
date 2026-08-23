/**
 * Where the contact form posts, or nothing.
 *
 * The form needs an endpoint, and this site has exactly one host that can give
 * it one: Cloudflare Pages, through the Function in `functions/api/contact.ts`.
 * On Vercel that path does not exist, and a form that posts into a 404 is worse
 * than no form at all.
 *
 * So the endpoint is configuration, not a flag. Set `CONTACT_ENDPOINT` to
 * `/api/contact` in the Cloudflare Pages project and the contact page renders a
 * form; leave it unset and the same page offers the email address instead.
 * Neither state is broken, and moving between them is a setting rather than a
 * commit.
 */
export const CONTACT_ENDPOINT = process.env.CONTACT_ENDPOINT ?? '';
