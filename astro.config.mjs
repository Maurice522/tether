// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  // Session state lives in our own Durable Objects; don't provision a KV namespace for Astro sessions.
  session: false,
  server: { host: '127.0.0.1', port: 4327 },
});
