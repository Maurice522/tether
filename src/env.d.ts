// Only what we use from the Workers runtime; full `wrangler types` output clashes with DOM types in client scripts.
declare module 'cloudflare:workers' {
  export const env: Record<string, unknown>;
}
