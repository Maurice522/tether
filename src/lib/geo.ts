import { LANG_COOKIE, langForCountry, localePath } from '../i18n';

/** Crawlers always get the page they asked for, so every language stays indexed under its own URL. */
const BOT = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|lighthouse|pagespeed|headless/i;
/** Paths that are app routes or files, not translated content pages. */
const NOT_CONTENT = /^\/(?:de|fr)(?:\/|$)|^\/(?:s|api|_astro|_image|share|spotify)(?:\/|$)|\.[a-z0-9]+$/i;
const HAS_LANG_COOKIE = new RegExp(`(?:^|;\\s*)${LANG_COOKIE}=`);

/**
 * First visit to an English page from Germany/Austria/France etc.: send them to the same page in their language.
 * Never when they've picked a language with the switcher (cookie), so English stays one click away.
 */
export function geoRedirect(request: Request & { cf?: { country?: unknown } }, url: URL): Response | null {
  if (request.method !== 'GET' && request.method !== 'HEAD') return null;
  if (NOT_CONTENT.test(url.pathname)) return null;
  if (!(request.headers.get('accept') ?? '').includes('text/html')) return null;
  if (BOT.test(request.headers.get('user-agent') ?? '')) return null;
  if (HAS_LANG_COOKIE.test(request.headers.get('cookie') ?? '')) return null;
  const lang = langForCountry(request.cf?.country as string | undefined, request.headers.get('accept-language'));
  if (!lang) return null;
  const to = new URL(localePath(lang, url.pathname) + url.search, url);
  return new Response(null, { status: 302, headers: { location: to.toString(), 'cache-control': 'private, no-store', vary: 'cookie' } });
}
