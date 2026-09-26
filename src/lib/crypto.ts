import { createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { envVar } from './env';

// Crockford base32 without look-alikes (no I, L, O, U).
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export function randomId(length: number): string {
  const bytes = randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % 32];
  return out;
}

export function randomToken(): string {
  return randomBytes(24).toString('base64url');
}

export function randomOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}

function pepper(): string {
  const p = envVar('TETHER_PEPPER');
  if (!p && import.meta.env.PROD) throw new Error('TETHER_PEPPER is not set');
  return p || 'dev-pepper';
}

export function digest(value: string): string {
  return createHash('sha256').update(pepper()).update(':').update(value).digest('hex');
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}
