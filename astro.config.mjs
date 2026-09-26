// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  // Edge-function emulation needs Deno locally; we don't use edge functions.
  adapter: netlify({ devFeatures: { environmentVariables: false, images: false, edgeFunctions: false } }),
  server: { host: '127.0.0.1', port: 4327 },
});
