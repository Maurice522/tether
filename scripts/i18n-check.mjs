// Fails if any T('…') string (or server error message shown to users) lacks a German or French entry.
// Run: node scripts/i18n-check.mjs   (--missing prints the missing keys as JSON, for filling in)
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|astro)$/.test(name) && !/[\\/]i18n[\\/](de|fr)\.ts$/.test(p)) files.push(p);
  }
})(join(root, 'src'));

const keys = new Set();
const callRe = /\b(?:T|tr)\(\s*(?:'((?:\\.|[^'\\])*)'|"((?:\\.|[^"\\])*)")/g;
const unescape = (s) => s.replace(/\\(['"\\])/g, '$1');
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(callRe)) keys.add(unescape(m[1] ?? m[2]));
  // Server error messages are translated in the browser (scripts/ui.ts → tr(data.error)).
  for (const m of src.matchAll(/HttpError\(\d+,\s*(?:'([^']+)'|`([^`]+)`)/g)) keys.add((m[1] ?? m[2]).replace('${MAX_MEMBERS}', '4'));
}

const load = async (l) => (await import(pathToFileURL(join(root, 'src/i18n', `${l}.ts`)).href))[l];
let failed = false;
const report = {};
for (const lang of ['de', 'fr']) {
  const dict = await load(lang);
  const missing = [...keys].filter((k) => !(k in dict));
  const unused = Object.keys(dict).filter((k) => !keys.has(k));
  report[lang] = missing;
  if (missing.length) failed = true;
  console.error(`${lang}: ${keys.size} keys, ${missing.length} missing, ${unused.length} unused`);
  if (unused.length && !process.argv.includes('--missing')) console.error('  unused:', unused.slice(0, 10));
}
if (process.argv.includes('--missing')) console.log(JSON.stringify(report.de, null, 1));
process.exitCode = failed ? 1 : 0;
