import { handle } from '@astrojs/cloudflare/handler';
import { Directory } from './server/directory';
import { Room } from './server/room';
import { COUNTRY_HEADER } from './i18n';
import { geoRedirect } from './lib/geo';

export { Directory, Room };

const WS_PATH = /^\/api\/session\/([0-9A-Z]{8})\/ws$/;

/** The one address search engines should see. www and plain http redirect here. */
const CANONICAL_HOST = 'tethersecure.com';
const REDIRECT_HOSTS = new Set([CANONICAL_HOST, `www.${CANONICAL_HOST}`]);

/**
 * Sent on every page and file. No full Content-Security-Policy yet (GTM and Google Fonts would need a
 * careful allowlist); frame-ancestors alone stops the site being framed for clickjacking.
 */
const SECURITY_HEADERS: Record<string, string> = {
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'content-security-policy': "frame-ancestors 'none'",
  'x-frame-options': 'DENY',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
};

function withSecurityHeaders(res: Response): Response {
  if (res.status === 101 || res.webSocket) return res; // WebSocket upgrades pass through untouched
  const out = new Response(res.body, res);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) if (!out.headers.has(k)) out.headers.set(k, v);
  return out;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (REDIRECT_HOSTS.has(url.hostname) && (url.hostname !== CANONICAL_HOST || url.protocol !== 'https:')) {
      url.protocol = 'https:';
      url.hostname = CANONICAL_HOST;
      // 308 keeps POST bodies intact for API calls; pages get a classic 301 that every crawler understands.
      const permanent = request.method === 'GET' || request.method === 'HEAD' ? 301 : 308;
      return Response.redirect(url.toString(), permanent);
    }

    const geo = geoRedirect(request, url);
    if (geo) return geo;

    // WebSocket upgrades go straight to the session's Durable Object, before Astro sees them.
    const m = url.pathname.match(WS_PATH);
    if (m) return env.ROOM.get(env.ROOM.idFromName(m[1])).fetch(request);
    // Pass the visitor's country on to Astro (session rooms pick their language from it). Overwrites any client value.
    const headers = new Headers(request.headers);
    headers.set(COUNTRY_HEADER, (request.cf?.country as string | undefined) ?? '');
    return withSecurityHeaders(await handle(new Request(request, { headers }), env, ctx));
  },
} satisfies ExportedHandler<Env>;
