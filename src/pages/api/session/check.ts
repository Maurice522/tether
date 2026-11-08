import { digest } from '../../../lib/crypto';
import { body, HttpError, json, rateLimit, route } from '../../../lib/http';
import { directory, room } from '../../../lib/rooms';
import { MAX_MEMBERS } from '../../../lib/types';

/**
 * Validate a code before asking for a name, so a typo fails fast.
 * Shares the join rate-limit bucket, so it can't be used to brute-force codes.
 */
export const POST = route(async (ctx) => {
  await rateLimit(ctx, 'join', 12, 10 * 60 * 1000);
  const b = await body(ctx);
  const otp = typeof b.otp === 'string' ? b.otp.replace(/\D/g, '') : '';
  if (otp.length !== 6) throw new HttpError(400, 'The code has 6 digits.');
  const sid = await directory().lookupOtp(digest(otp));
  const info = sid ? await room(sid).info() : null;
  if (!info) throw new HttpError(404, 'That code is wrong or has expired. Ask for a fresh one.');
  if (info.full) throw new HttpError(409, `This session is full (${MAX_MEMBERS} people max).`);
  return json({ host: info.host });
});
