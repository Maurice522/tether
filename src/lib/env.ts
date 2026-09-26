import { env } from 'cloudflare:workers';

/** Reads a Worker var/secret (wrangler.jsonc, `wrangler secret put`, or .dev.vars locally). */
export function envVar(key: string): string | undefined {
  const v = (env as unknown as Record<string, unknown>)[key];
  return typeof v === 'string' && v ? v : undefined;
}
