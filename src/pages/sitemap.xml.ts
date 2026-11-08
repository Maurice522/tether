import type { APIRoute } from 'astro';
import { guides } from '../content/guides';

export const prerender = true;

const SITE = 'https://tethersecure.com';

export const GET: APIRoute = () => {
  const pages = [
    { path: '/', priority: '1.0', freq: 'weekly' },
    ...guides.map((g) => ({ path: `/${g.slug}/`, priority: '0.8', freq: 'monthly' })),
    { path: '/privacy/', priority: '0.4', freq: 'yearly' },
  ];
  const lastmod = new Date().toISOString().slice(0, 10);
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${SITE}${p.path}</loc><lastmod>${lastmod}</lastmod><changefreq>${p.freq}</changefreq><priority>${p.priority}</priority></url>`).join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
};
