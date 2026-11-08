// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import { fileURLToPath } from 'node:url';

// Dev only: tr46 (via the MongoDB driver) does require("punycode/"). The Cloudflare Vite plugin marks
// that as an external Node builtin, which workerd dev can't require, and it does so before aliases
// apply. Rewriting the specifier to the npm package's file makes the dep pre-bundler inline it.
const punycode = fileURLToPath(new URL('./node_modules/punycode/punycode.js', import.meta.url));
const inlinePunycode = {
  name: 'tether:inline-punycode',
  /** @param {string} code @param {string} id */
  transform(code, id) {
    if (!/[\\/]tr46[\\/]/.test(id) || !code.includes('require("punycode/")')) return null;
    return code.replaceAll('require("punycode/")', `require(${JSON.stringify(punycode)})`);
  },
};

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  // We keep our own state in MongoDB; don't provision a KV namespace for Astro sessions.
  session: false,
  vite: {
    environments: {
      ssr: {
        optimizeDeps: {
          include: ['mongodb'],
          rolldownOptions: { plugins: [inlinePunycode] },
        },
      },
    },
  },
  server: { host: '127.0.0.1', port: 4327 },
});
