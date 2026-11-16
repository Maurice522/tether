// Tell IndexNow search engines (Bing, Yandex, Seznam, Naver…) about every page in the live sitemap.
// Run after a deploy:  npm run indexnow
// The key is public by design: it is served at https://tethersecure.com/<key>.txt to prove ownership.
const KEY = 'db6487936011bbfa89e3b27fdf8d42e2';
const HOST = 'tethersecure.com';

const sitemap = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!urlList.length) throw new Error('No URLs found in the sitemap');

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
});
console.log(`IndexNow: submitted ${urlList.length} URLs → HTTP ${res.status} ${res.statusText}`);
if (res.status >= 400) { console.log(await res.text()); process.exitCode = 1; }
