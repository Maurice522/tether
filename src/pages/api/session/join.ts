import { digest, randomId, randomToken, safeEqual } from '../../../lib/crypto';
import { body, cleanName, cleanTag, HttpError, json, rateLimit, route } from '../../../lib/http';
import { store } from '../../../lib/store';
import { MAX_MEMBERS, type Session } from '../../../lib/types';

/** Join with either { otp } or { sessionId, invite }. */
export const POST = route(async (ctx) => {
  await rateLimit(ctx, 'join', 12, 10 * 60 * 1000);
  const b = await body(ctx);
  const name = cleanName(b.name);
  const tag = cleanTag(b.tag);
  const now = new Date();

  let session: Session | null = null;
  if (typeof b.otp === 'string') {
    const otp = b.otp.replace(/\D/g, '');
    if (otp.length !== 6) throw new HttpError(400, 'The code has 6 digits.');
    session = await store().findByOtp(digest(otp), now);
    if (!session) throw new HttpError(404, 'That code is wrong or has expired. Ask for a fresh one.');
  } else if (typeof b.sessionId === 'string' && typeof b.invite === 'string') {
    session = await store().getSession(b.sessionId.toUpperCase());
    if (!session || !safeEqual(session.invite, b.invite)) {
      throw new HttpError(404, 'This invite link is no longer valid.');
    }
  } else {
    throw new HttpError(400, 'Enter a code or use an invite link.');
  }

  const memberId = randomId(10);
  const token = randomToken();
  const result = await store().addMember(
    session._id,
    { id: memberId, tokenHash: digest(token), name, tag, joinedAt: now, lastSeen: now, status: { focused: true } },
    MAX_MEMBERS,
  );
  if (result === 'full') throw new HttpError(409, `This session is full (${MAX_MEMBERS} people max).`);
  if (result === 'missing') throw new HttpError(404, 'This session has ended.');
  return json({ sessionId: session._id, member: { id: memberId, token } }, 201);
});
