import { digest, randomId, randomToken } from '../../../lib/crypto';
import { body, cleanName, cleanTag, json, rateLimit, route } from '../../../lib/http';
import { freshOtp } from '../../../lib/otp';
import { store } from '../../../lib/store';
import { OTP_TTL_MS, SESSION_TTL_MS, type Session } from '../../../lib/types';

export const POST = route(async (ctx) => {
  await rateLimit(ctx, 'create', 20, 10 * 60 * 1000);
  const b = await body(ctx);
  const name = cleanName(b.name);
  const tag = cleanTag(b.tag);

  const now = new Date();
  const memberId = randomId(10);
  const token = randomToken();
  const otp = await freshOtp(now);
  const session: Session = {
    _id: randomId(8),
    hostId: memberId,
    otp,
    otpHash: digest(otp),
    otpExpiresAt: new Date(now.getTime() + OTP_TTL_MS),
    invite: randomToken(),
    createdAt: now,
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
    members: [{ id: memberId, tokenHash: digest(token), name, tag, joinedAt: now, lastSeen: now, status: { focused: true } }],
  };
  await store().createSession(session);
  return json({ sessionId: session._id, member: { id: memberId, token } }, 201);
});
