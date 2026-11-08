import { digest, randomId, randomToken } from '../../../lib/crypto';
import { body, cleanName, cleanTag, HttpError, json, rateLimit, route } from '../../../lib/http';
import { directory, room } from '../../../lib/rooms';
import { MAX_MEMBERS } from '../../../lib/types';

/** Join with either { otp } or { sessionId, invite }. */
export const POST = route(async (ctx) => {
  await rateLimit(ctx, 'join', 12, 10 * 60 * 1000);
  const b = await body(ctx);
  const name = cleanName(b.name);
  const tag = cleanTag(b.tag);

  let sid: string | null = null;
  let invite: string | undefined;
  if (typeof b.otp === 'string') {
    const otp = b.otp.replace(/\D/g, '');
    if (otp.length !== 6) throw new HttpError(400, 'The code has 6 digits.');
    sid = await directory().lookupOtp(digest(otp));
    if (!sid) throw new HttpError(404, 'That code is wrong or has expired. Ask for a fresh one.');
  } else if (typeof b.sessionId === 'string' && /^[0-9A-Z]{8}$/i.test(b.sessionId) && typeof b.invite === 'string') {
    sid = b.sessionId.toUpperCase();
    invite = b.invite;
  } else {
    throw new HttpError(400, 'Enter a code or use an invite link.');
  }

  const now = Date.now();
  const id = randomId(10);
  const token = randomToken();
  const result = await room(sid).join({ id, tokenHash: digest(token), name, tag, joinedAt: now, lastSeen: now }, invite);
  if (result === 'full') throw new HttpError(409, `This session is full (${MAX_MEMBERS} people max).`);
  if (result === 'badinvite') throw new HttpError(404, 'This invite link is no longer valid.');
  if (result === 'missing') throw new HttpError(404, invite ? 'This invite link is no longer valid.' : 'This session has ended.');
  return json({ sessionId: sid, member: { id, token } }, 201);
});
