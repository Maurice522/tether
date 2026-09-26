import { digest, randomOtp } from './crypto';
import { store } from './store';

/** A 6-digit code not currently held by another live session. */
export async function freshOtp(now: Date): Promise<string> {
  for (let i = 0; i < 8; i++) {
    const otp = randomOtp();
    if (!(await store().findByOtp(digest(otp), now))) return otp;
  }
  throw new Error('Could not allocate a unique OTP');
}
