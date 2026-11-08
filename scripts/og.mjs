// Renders the social-share card (public/og-image.png, 1200x630). Run: node scripts/og.mjs
// Uses system fonts (Segoe UI / Georgia / Consolas on Windows) since the web fonts aren't installed locally.
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'node:fs';

const W = 1200, H = 630;
const lime = '#c8f53a';
const ink = '#eceee6';
const muted = '#93978e';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="#1d2023"/></pattern>
    <radialGradient id="glow" cx="85%" cy="10%" r="70%"><stop offset="0" stop-color="${lime}" stop-opacity="0.16"/><stop offset="1" stop-color="${lime}" stop-opacity="0"/></radialGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="#0a0b0c"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- brand -->
  <g transform="translate(72 64)">
    <rect x="0" y="9" width="16" height="22" rx="5" fill="${ink}"/>
    <rect x="30" y="10" width="14" height="20" rx="4.5" fill="none" stroke="${ink}" stroke-width="3"/>
    <path d="M16 20c6-9 9 9 14 0" fill="none" stroke="${lime}" stroke-width="3.6" stroke-linecap="round"/>
    <text x="60" y="30" font-family="Segoe UI, Arial, sans-serif" font-size="30" font-weight="700" fill="${ink}" letter-spacing="-1">tether</text>
  </g>

  <!-- headline -->
  <text x="72" y="250" font-family="Segoe UI, Arial, sans-serif" font-size="92" font-weight="700" fill="${ink}" letter-spacing="-4">Copy on one.</text>
  <text x="72" y="352" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="96" fill="${lime}" letter-spacing="-2">Paste on the other.</text>
  <text font-family="Segoe UI, Arial, sans-serif" font-size="29" fill="${muted}"><tspan x="74" y="414">Sync clipboard &amp; share files securely</tspan><tspan x="74" y="452">between PCs, Mac &amp; phone. Browser to browser.</tspan></text>

  <!-- pills -->
  <g font-family="Consolas, 'Courier New', monospace" font-size="21" fill="${ink}">
    ${['Peer-to-peer', 'Encrypted', 'No upload', 'No sign-up'].map((t, i) => {
      const x = 72 + [0, 210, 384, 556][i];
      const w = [186, 152, 150, 158][i];
      return `<g transform="translate(${x} 488)"><rect width="${w}" height="44" rx="22" fill="#15181b" stroke="#2a2e31"/><circle cx="22" cy="22" r="5" fill="${lime}"/><text x="38" y="29">${t}</text></g>`;
    }).join('')}
  </g>

  <!-- devices + cable -->
  <g transform="translate(880 150)">
    <rect x="0" y="0" width="250" height="150" rx="18" fill="#141618" stroke="#2a2e31" stroke-width="2" transform="rotate(-4 125 75)"/>
    <rect x="30" y="58" width="150" height="30" rx="8" fill="#22344f" transform="rotate(-4 125 75)"/>
    <rect x="60" y="250" width="250" height="150" rx="18" fill="#141618" stroke="#2a2e31" stroke-width="2" transform="rotate(3 185 325)"/>
    <rect x="90" y="306" width="170" height="30" rx="8" fill="none" stroke="${lime}" stroke-width="2" stroke-dasharray="6 5" transform="rotate(3 185 325)"/>
    <path d="M190 85 C 300 120, 300 220, 160 318" fill="none" stroke="${lime}" stroke-width="8" stroke-linecap="round" opacity="0.35" filter="url(#soft)"/>
    <path d="M190 85 C 300 120, 300 220, 160 318" fill="none" stroke="${lime}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="282" cy="200" r="11" fill="${lime}"/>
  </g>

  <text x="72" y="580" font-family="Consolas, 'Courier New', monospace" font-size="24" fill="${muted}">tethersecure.com</text>
</svg>`;

writeFileSync('public/og-image.png', new Resvg(svg, { fitTo: { mode: 'width', value: W }, font: { loadSystemFonts: true } }).render().asPng());
console.log('wrote public/og-image.png');
