import { digest } from '../../../../lib/crypto';
import { authMember, json, rateLimit, route, sessionIdParam } from '../../../../lib/http';
import { freshOtp } from '../../../../lib/otp';
import { store } from '../../../../lib/store';
import { OTP_TTL_MS } from '../../../../lib/types';

/** Any member can mint a fresh code; the old one stops working. */
export const POST = route(async (ctx) => {
  const sid = sessionIdParam(ctx);
  await authMember(ctx, sid);
  await rateLimit(ctx, 'otp', 30, 10 * 60 * 1000);
  const now = new Date();
  const otp = await freshOtp(now);
  const otpExpiresAt = new Date(now.getTime() + OTP_TTL_MS);
  await store().setOtp(sid, otp, digest(otp), otpExpiresAt);
  return json({ otp, otpExpiresAt: otpExpiresAt.getTime() });
});
