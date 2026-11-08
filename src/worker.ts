import { handle } from '@astrojs/cloudflare/handler';
import { Directory } from './server/directory';
import { Room } from './server/room';

export { Directory, Room };

const WS_PATH = /^\/api\/session\/([0-9A-Z]{8})\/ws$/;

export default {
  async fetch(request, env, ctx) {
    // WebSocket upgrades go straight to the session's Durable Object, before Astro sees them.
    const m = new URL(request.url).pathname.match(WS_PATH);
    if (m) return env.ROOM.get(env.ROOM.idFromName(m[1])).fetch(request);
    return handle(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
