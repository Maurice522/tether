import type { APIContext } from 'astro';
import { digest, safeEqual } from './crypto';
import { store, withStore } from './store';
import { ONLINE_WINDOW_MS, type Member, type PublicMember, type Session } from './types';

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}

/** Wraps a handler so thrown HttpErrors become JSON responses. */
export function route(fn: (ctx: APIContext) => Promise<Response>) {
  return async (ctx: APIContext) => {
    try {
      return await withStore(() => fn(ctx));
    } catch (err) {
      if (err instanceof HttpError) return json({ error: err.message }, err.status);
      console.error(err);
      return json({ error: 'Something went wrong on our side.' }, 500);
    }
  };
}

export async function body<T = Record<string, unknown>>(ctx: APIContext, maxBytes = 200_000): Promise<T> {
  const text = await ctx.request.text();
  if (text.length > maxBytes) throw new HttpError(413, 'Request too large.');
  try {
    return (text ? JSON.parse(text) : {}) as T;
  } catch {
    throw new HttpError(400, 'Invalid JSON.');
  }
}

export function cleanName(v: unknown): string {
  const name = typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : '';
  if (name.length < 1 || name.length > 24) throw new HttpError(400, 'Name must be 1–24 characters.');
  return name;
}

export function cleanTag(v: unknown): string {
  const tag = typeof v === 'string' ? v.toUpperCase() : '';
  if (!/^[0-9A-Z]{4}$/.test(tag)) throw new HttpError(400, 'Invalid device tag.');
  return tag;
}

export function sessionIdParam(ctx: APIContext): string {
  const id = String(ctx.params.id ?? '').toUpperCase();
  if (!/^[0-9A-Z]{8}$/.test(id)) throw new HttpError(404, 'Session not found.');
  return id;
}

export async function rateLimit(ctx: APIContext, bucket: string, max: number, windowMs: number) {
  let ip = 'unknown';
  try { ip = ctx.clientAddress; } catch { /* not available in some runtimes */ }
  if (!(await store().hit(`${bucket}:${ip}`, max, windowMs))) {
    throw new HttpError(429, 'Too many attempts. Take a breather and try again in a few minutes.');
  }
}

/** Resolves the calling member from the `x-tether-member: <id>.<token>` header. */
export async function authMember(ctx: APIContext, sid: string): Promise<{ session: Session; me: Member }> {
  const raw = ctx.request.headers.get('x-tether-member') ?? '';
  const [memberId, token] = raw.split('.');
  const session = await store().getSession(sid);
  if (!session) throw new HttpError(404, 'This session has ended.');
  const me = session.members.find((m) => m.id === memberId);
  if (!me || !token || !safeEqual(me.tokenHash, digest(token))) {
    throw new HttpError(401, 'You are not part of this session.');
  }
  return { session, me };
}

export function publicMembers(s: Session, now = Date.now()): PublicMember[] {
  return s.members.map((m) => ({
    id: m.id,
    name: m.name,
    tag: m.tag,
    host: m.id === s.hostId,
    online: now - new Date(m.lastSeen).getTime() < ONLINE_WINDOW_MS,
    joinedAt: new Date(m.joinedAt).getTime(),
    status: m.status ?? {},
  }));
}
