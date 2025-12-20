const CACHE_NAME = 'lanortrad-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/Catalogue.html',
    '/Planning.html',
    '/css/style.css',
    '/css/reader.css',
    '/js/utile/navbar.js',
    '/js/utile/search.js',
    '/images/Lanor/Banner.jpg'
];

// Installation
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// Activation
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch - Stratégie Network First avec fallback sur cache
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Clone la réponse car elle ne peut être consommée qu'une fois
                const responseToCache = response.clone();
                
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });
                
                return response;
            })
            .catch(() => {
                // Si le réseau échoue, chercher dans le cache
                return caches.match(event.request);
            })
    );
});