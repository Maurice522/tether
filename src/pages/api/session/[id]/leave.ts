import { json, memberHeader, route, sessionIdParam } from '../../../../lib/http';
import { room } from '../../../../lib/rooms';

export const POST = route(async (ctx) => {
  const sid = sessionIdParam(ctx);
  const me = memberHeader(ctx);
  await room(sid).leave(me.id, me.token);
  return json({ ok: true });
});
