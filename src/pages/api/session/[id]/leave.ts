import { authMember, json, route, sessionIdParam } from '../../../../lib/http';
import { store } from '../../../../lib/store';

export const POST = route(async (ctx) => {
  const sid = sessionIdParam(ctx);
  const { session, me } = await authMember(ctx, sid);
  await store().removeMember(sid, me.id);
  const at = new Date();
  await store().pushSignals(
    session.members
      .filter((m) => m.id !== me.id)
      .map((m) => ({ sid, from: me.id, to: m.id, type: 'bye' as const, data: null, at })),
  );
  return json({ ok: true });
});
