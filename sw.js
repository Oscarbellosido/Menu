// Service worker: el menú s'obre sense connexió i s'instal·la com a aplicació.
// Puja CACHE cada vegada que canviïs index.html perquè els mòbils agafin la versió nova.
const CACHE = 'menu-v4';
const SHELL = ['./', 'index.html', 'manifest.json', 'icon.svg', 'icon-192.png', 'icon-512.png',
  'icones/noticies.png', 'icones/temps.png', 'icones/jocs.png', 'icones/economia.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

const cacheable = r => r && r.ok && r.type === 'basic';

self.addEventListener('fetch', e => {
  const req = e.request;
  // Només el que és dins del menú: les altres apps tenen el seu propi service worker
  if (req.method !== 'GET' || !req.url.startsWith(self.registration.scope)) return;
  e.respondWith(
    fetch(req, { cache: 'no-cache' }).then(r => {
      if (cacheable(r)) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return r;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('index.html')))
  );
});
