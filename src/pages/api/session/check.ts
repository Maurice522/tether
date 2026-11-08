import { digest } from '../../../lib/crypto';
import { body, HttpError, json, rateLimit, route } from '../../../lib/http';
import { store } from '../../../lib/store';
import { MAX_MEMBERS, ONLINE_WINDOW_MS } from '../../../lib/types';

/**
 * Validate a code before asking for a name, so a typo fails fast.
 * Shares the join rate limit bucket, so it can't be used to brute-force codes.
 */
export const POST = route(async (ctx) => {
  await rateLimit(ctx, 'join', 12, 10 * 60 * 1000);
  const b = await body(ctx);
  const otp = typeof b.otp === 'string' ? b.otp.replace(/\D/g, '') : '';
  if (otp.length !== 6) throw new HttpError(400, 'The code has 6 digits.');
  const now = new Date();
  const session = await store().findByOtp(digest(otp), now);
  if (!session) throw new HttpError(404, 'That code is wrong or has expired. Ask for a fresh one.');
  const online = session.members.filter((m) => now.getTime() - new Date(m.lastSeen).getTime() < ONLINE_WINDOW_MS);
  if (session.members.length >= MAX_MEMBERS && online.length >= MAX_MEMBERS) {
    throw new HttpError(409, `This session is full (${MAX_MEMBERS} people max).`);
  }
  const host = session.members.find((m) => m.id === session.hostId) ?? session.members[0];
  return json({ host: host?.name ?? null, count: online.length });
});
