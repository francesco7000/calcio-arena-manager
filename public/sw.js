
const CACHE_NAME = 'calcio-arena-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/src/main.tsx',
  '/src/index.css'
];

// Installazione del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Gestione delle notifiche push
self.addEventListener('push', (event) => {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.message || 'Nuova notifica dalla Calcio Arena',
        icon: '/icon-192.png',
        badge: '/favicon.ico',
        vibrate: [100, 50, 100],
        data: {
          url: data.url || '/',
          matchId: data.matchId
        },
        actions: [
          {
            action: 'open',
            title: 'Visualizza'
          },
          {
            action: 'close',
            title: 'Chiudi'
          }
        ],
        // Aggiunta per iOS/Safari
        tag: data.matchId ? `match-${data.matchId}` : 'calcio-arena-notification',
        renotify: true // Forza la notifica anche se esiste già una con lo stesso tag
      };
      
      event.waitUntil(
        self.registration.showNotification('Calcio Arena', options)
      );
    } catch (error) {
      console.error('Errore durante l\'elaborazione della notifica push:', error);
    }
  }
});

// Gestione delle notifiche push per Safari/iOS (fallback)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PUSH_NOTIFICATION') {
    const data = event.data.payload;
    const options = {
      body: data.body || 'Nuova notifica dalla Calcio Arena',
      icon: '/icon-192.png',
      badge: '/favicon.ico',
      data: data.data || {},
      tag: data.tag || 'calcio-arena-notification',
      renotify: true
    };
    
    self.registration.showNotification(data.title || 'Calcio Arena', options);
  }
});

// Gestione del click sulle notifiche
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Cerca una finestra già aperta dell'app
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              payload: event.notification.data
            });
            return client.focus();
          }
        }
        // Se non c'è una finestra aperta, aprine una nuova
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Estrategia de caché: Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Verificamos que sea una respuesta válida
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clonamos la respuesta para poder usarla y guardarla en caché
        const responseToCache = response.clone();

        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // Si la red falla, intentamos con la caché
        return caches.match(event.request);
      })
  );
});
