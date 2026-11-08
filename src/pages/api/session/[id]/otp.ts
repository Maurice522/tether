import { HttpError, json, memberHeader, rateLimit, route, sessionIdParam } from '../../../../lib/http';
import { room } from '../../../../lib/rooms';

/** Any member can mint a fresh code; the old one stops working. */
export const POST = route(async (ctx) => {
  const sid = sessionIdParam(ctx);
  const me = memberHeader(ctx);
  await rateLimit(ctx, 'otp', 30, 10 * 60 * 1000);
  const res = await room(sid).rotateOtp(me.id, me.token);
  if (!res) throw new HttpError(401, 'You are not part of this session.');
  return json(res);
});
