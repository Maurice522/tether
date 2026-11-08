// Tether service worker: makes the site installable and receives things shared from other apps
// ("Share → Tether"). It does no offline caching: Tether needs a live connection anyway.
const SHARE_CACHE = 'tether-share';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method === 'POST' && url.pathname === '/share-target') {
    event.respondWith(receiveShare(event.request));
  }
});

/** Park the shared text/files in Cache Storage, then open /share which hands them to a session. */
async function receiveShare(request) {
  const form = await request.formData();
  const cache = await caches.open(SHARE_CACHE);
  await Promise.all((await cache.keys()).map((k) => cache.delete(k)));

  const text = [form.get('title'), form.get('text'), form.get('url')]
    .filter((v) => typeof v === 'string' && v.trim())
    .filter((v, i, all) => all.indexOf(v) === i)
    .join('\n');
  const files = form.getAll('files').filter((f) => f instanceof File && f.size > 0);

  const index = { text, files: files.map((f, i) => ({ key: `/share-file/${i}`, name: f.name, type: f.type, size: f.size })), at: Date.now() };
  await cache.put('/share-index', new Response(JSON.stringify(index), { headers: { 'content-type': 'application/json' } }));
  await Promise.all(files.map((f, i) => cache.put(`/share-file/${i}`, new Response(f, { headers: { 'content-type': f.type || 'application/octet-stream' } }))));
  return Response.redirect('/share', 303);
}

// Tapping a notification brings the Tether tab back (or opens it).
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const tab = all.find((c) => new URL(c.url).pathname.startsWith('/s/'));
    if (tab) return tab.focus();
    return self.clients.openWindow('/');
  })());
});
