// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  // We keep our own state in MongoDB; don't provision a KV namespace for Astro sessions.
  session: false,
  vite: {
    // Dev only: the MongoDB driver's CJS dep tr46 requires "punycode/", which workerd dev can't resolve.
    resolve: { alias: { 'punycode/': 'punycode' } },
    environments: { ssr: { optimizeDeps: { include: ['mongodb'] } } },
  },
  server: { host: '127.0.0.1', port: 4327 },
});
