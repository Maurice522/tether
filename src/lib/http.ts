import type { APIContext } from 'astro';
import { directory } from './rooms';

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
      return await fn(ctx);
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
  if (!(await directory().hit(`${bucket}:${ip}`, max, windowMs))) {
    throw new HttpError(429, 'Too many attempts. Take a breather and try again in a few minutes.');
  }
}

/** The calling member from the `x-tether-member: <id>.<token>` header (checked by the room). */
export function memberHeader(ctx: APIContext): { id: string; token: string } {
  const [id, token] = (ctx.request.headers.get('x-tether-member') ?? '').split('.');
  if (!id || !token) throw new HttpError(401, 'You are not part of this session.');
  return { id, token };
}
