// Renders the PWA / notification icons from the logo. Run: node scripts/icons.mjs
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'node:fs';

const mark = (size, pad) => {
  const s = 32 - pad * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#0a0b0c"/>
  <g transform="translate(${pad} ${pad}) scale(${s / 32})">
    <rect x="4" y="10" width="8" height="12" rx="3" fill="#eceee6"/>
    <rect x="20.5" y="10.5" width="7" height="11" rx="2.5" fill="none" stroke="#eceee6" stroke-width="1.6"/>
    <path d="M12 16c3-5 5.5 5 8.5 0" fill="none" stroke="#c8f53a" stroke-width="2.2" stroke-linecap="round"/>
  </g></svg>`;
};
for (const [name, size, pad] of [['icon-192.png', 192, 2], ['icon-512.png', 512, 2], ['icon-maskable-512.png', 512, 6], ['apple-touch-icon.png', 180, 3]]) {
  writeFileSync(`public/${name}`, new Resvg(mark(size, pad), { fitTo: { mode: 'width', value: size } }).render().asPng());
  console.log('wrote', name);
}
