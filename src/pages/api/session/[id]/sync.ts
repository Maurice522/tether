import { authMember, body, HttpError, json, publicMembers, route, sessionIdParam } from '../../../../lib/http';
import { store } from '../../../../lib/store';
import { MAX_CLIP_BYTES, type MemberStatus, type Signal } from '../../../../lib/types';

const SIGNAL_TYPES = new Set(['offer', 'answer', 'clip', 'bye']);

function cleanStatus(v: unknown): MemberStatus | undefined {
  if (!v || typeof v !== 'object') return undefined;
  const s = v as Record<string, any>;
  const str = (x: unknown, max: number) => (typeof x === 'string' ? x.slice(0, max) : undefined);
  const music = s.music && typeof s.music === 'object'
    ? { title: str(s.music.title, 120) ?? '', artist: str(s.music.artist, 120) ?? '', playing: !!s.music.playing, url: str(s.music.url, 300) }
    : null;
  return { app: str(s.app, 40), music, focused: !!s.focused };
}

/**
 * One round trip per poll: heartbeat + optional status, outgoing signals,
 * and back comes the roster plus any signals addressed to us.
 */
export const POST = route(async (ctx) => {
  const sid = sessionIdParam(ctx);
  const { session, me } = await authMember(ctx, sid);
  const b = await body(ctx, MAX_CLIP_BYTES * 4 + 20_000);
  const now = new Date();
  const status = cleanStatus(b.status);

  const outgoing: Signal[] = [];
  if (Array.isArray(b.signals)) {
    if (b.signals.length > 12) throw new HttpError(400, 'Too many signals.');
    const memberIds = new Set(session.members.map((m) => m.id));
    for (const s of b.signals) {
      if (!s || !SIGNAL_TYPES.has(s.type) || !memberIds.has(s.to) || s.to === me.id) continue;
      outgoing.push({ sid, from: me.id, to: s.to, type: s.type, data: s.data ?? null, at: now });
    }
  }

  const [, , incoming] = await Promise.all([
    store().touchMember(sid, me.id, now, status),
    store().pushSignals(outgoing),
    store().takeSignals(sid, me.id),
  ]);

  // Reflect our own heartbeat in the roster we send back.
  me.lastSeen = now;
  if (status) me.status = status;

  return json({
    now: now.getTime(),
    me: me.id,
    members: publicMembers(session, now.getTime()),
    otp: session.otp,
    otpExpiresAt: new Date(session.otpExpiresAt).getTime(),
    invite: session.invite,
    signals: incoming.map((s) => ({ from: s.from, type: s.type, data: s.data })),
  });
});
