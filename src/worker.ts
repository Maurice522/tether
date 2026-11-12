import { handle } from '@astrojs/cloudflare/handler';
import { Directory } from './server/directory';
import { Room } from './server/room';

export { Directory, Room };

const WS_PATH = /^\/api\/session\/([0-9A-Z]{8})\/ws$/;

/** The one address search engines should see. www and plain http redirect here. */
const CANONICAL_HOST = 'tethersecure.com';
const REDIRECT_HOSTS = new Set([CANONICAL_HOST, `www.${CANONICAL_HOST}`]);

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

    // WebSocket upgrades go straight to the session's Durable Object, before Astro sees them.
    const m = url.pathname.match(WS_PATH);
    if (m) return env.ROOM.get(env.ROOM.idFromName(m[1])).fetch(request);
    return handle(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
