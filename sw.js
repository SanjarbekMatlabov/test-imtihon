/* Service worker — ilovani internetsiz ishlatish uchun.
   Ikkita kesh: SHELL (ilova + savollar bazasi) va IMG (savol rasmlari).
   Rasmlar 63 MB bo'lgani uchun avtomatik yuklanmaydi — foydalanuvchi o'zi
   "oflayn uchun yuklab olish" tugmasini bosganda yoki ko'rgan sari keshlanadi. */

/* Ilova yangilanganda VERSION ni oshiring — qobiq qayta yuklanadi.
   IMG ataylab versiyasiz: rasmlar yangilanishdan keyin ham saqlanib qoladi,
   aks holda har safar 63 MB qaytadan yuklanardi. */
const VERSION = 'v2';
const SHELL = 'yhq-shell-' + VERSION;
const IMG = 'yhq-img';

/* Ilova ishlashi uchun zarur fayllar (~3.5 MB) */
const SHELL_FILES = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/icons.js',
  './js/i18n.js',
  './js/pwa.js',
  './js/app.js',
  './data/questions.js',
  './data/topics.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(SHELL)
      .then(c => c.addAll(SHELL_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== SHELL && k !== IMG).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

const isImage = url => url.pathname.includes('/images/');

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // sahifaga o'tish — oflaynda ham index.html ochilsin
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(() => caches.match('./index.html', { ignoreSearch: true }))
    );
    return;
  }

  // rasmlar: avval keshdan, bo'lmasa tarmoqdan olib keshga qo'shamiz
  if (isImage(url)) {
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(IMG).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => new Response('', { status: 404 })))
    );
    return;
  }

  // qolgan hammasi: kesh birinchi
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(SHELL).then(c => c.put(req, copy));
      }
      return res;
    }))
  );
});

/* --- sahifa bilan aloqa --- */
self.addEventListener('message', e => {
  const msg = e.data || {};
  const reply = data => e.source && e.source.postMessage(data);

  if (msg.type === 'IMG_STATUS') {
    caches.open(IMG)
      .then(c => c.keys())
      .then(k => reply({ type: 'IMG_STATUS', cached: k.length, total: msg.total || 0 }));
    return;
  }

  if (msg.type === 'CACHE_IMAGES') {
    e.waitUntil(cacheImages(msg.urls || [], reply));
    return;
  }

  if (msg.type === 'CLEAR_IMAGES') {
    caches.delete(IMG).then(() => reply({ type: 'IMG_STATUS', cached: 0, total: msg.total || 0 }));
  }
});

async function cacheImages(urls, reply) {
  const cache = await caches.open(IMG);
  const pending = [];
  for (const u of urls) {
    if (!(await cache.match(u))) pending.push(u);
  }

  const total = urls.length;
  let done = total - pending.length;
  reply({ type: 'IMG_PROGRESS', done, total });

  const BATCH = 8;
  for (let i = 0; i < pending.length; i += BATCH) {
    await Promise.all(pending.slice(i, i + BATCH).map(async u => {
      try {
        const res = await fetch(u, { cache: 'no-cache' });
        if (res.ok) await cache.put(u, res);
      } catch (err) { /* bitta rasm tushmasa ham davom etamiz */ }
      done++;
    }));
    reply({ type: 'IMG_PROGRESS', done, total });
  }
  reply({ type: 'IMG_DONE', done, total });
}
