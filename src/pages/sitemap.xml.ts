import type { APIRoute } from 'astro';
import { guides } from '../content/guides';
import { alternatesFor, DEFAULT_LANG, LANGS } from '../i18n';

export const prerender = true;

const SITE = 'https://tethersecure.com';

/** Every page in every language, each listing its translations (hreflang) so search engines pair them. */
export const GET: APIRoute = () => {
  const pages = [
    { path: '/', priority: '1.0', freq: 'weekly' },
    ...guides.en.map((g) => ({ path: `/${g.slug}/`, priority: '0.8', freq: 'monthly' })),
    { path: '/privacy/', priority: '0.4', freq: 'yearly' },
  ];
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = pages.flatMap((p) => {
    const alts = alternatesFor(p.path);
    const links = [
      ...LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE}${alts[l]}"/>`),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${alts[DEFAULT_LANG]}"/>`,
    ].join('\n');
    return LANGS.map((l) => `  <url>
    <loc>${SITE}${alts[l]}</loc>
${links}
    <lastmod>${lastmod}</lastmod><changefreq>${p.freq}</changefreq><priority>${p.priority}</priority>
  </url>`);
  });
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
};
