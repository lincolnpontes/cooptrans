const CACHE_NAME = 'paoa-v28';
const ASSETS = [
  './',
  './index.html',
  './style.css?v=28',
  './app.js?v=28',
  './manifest.json',
  './icon.png',
  './assets/home-aulas.png',
  './assets/home-produtos.png',
  './assets/home-cronograma.png',
  './assets/home-regras.png',
  './assets/home-lpdc.png',
  './assets/instagram.png',
  './assets/hamburguer-bovino.jpg',
  './assets/linguica-frescal.jpg',
  './assets/kafta-bovina.jpg',
  './assets/almondega-bovina.jpg',
  './assets/pate-carneo.jpg',
  './assets/salsicha.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).catch(() => caches.match('./index.html')))
  );
});
