
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
  
  let notificationData = {
    title: 'Calcio Arena',
    message: 'Nuova notifica dalla Calcio Arena',
    url: '/',
    matchId: null
  };
  
  // Prova a estrarre i dati dal payload
  if (event.data) {
    try {
      // Prova a interpretare i dati come JSON
      notificationData = {...notificationData, ...event.data.json()};
    } catch (e) {
      // Se non è JSON, prova a interpretare come testo
      try {
        const textData = event.data.text();
        notificationData.message = textData;
      } catch (textError) {
        console.error('Impossibile estrarre dati dalla notifica push:', textError);
      }
    }
  }
  
  const options = {
    body: notificationData.message,
    icon: '/icon-192.png',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      url: notificationData.url || '/',
      matchId: notificationData.matchId
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
    tag: notificationData.matchId ? `match-${notificationData.matchId}` : 'calcio-arena-notification',
    renotify: true, // Forza la notifica anche se esiste già una con lo stesso tag
    requireInteraction: true, // Mantiene la notifica visibile fino all'interazione dell'utente
    silent: false // Assicura che la notifica emetta un suono
  };
  
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
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
      renotify: data.renotify !== undefined ? data.renotify : true,
      requireInteraction: data.requireInteraction !== undefined ? data.requireInteraction : true,
      silent: data.silent !== undefined ? data.silent : false,
      vibrate: [100, 50, 100]
    };
    
    self.registration.showNotification(data.title || 'Calcio Arena', options);
  }
});

// Gestione specifica per iOS in PWA mode
self.addEventListener('activate', (event) => {
  // Richiedi il controllo immediato su tutte le pagine dell'app
  event.waitUntil(self.clients.claim());
  
  // Registra la sottoscrizione push quando il service worker viene attivato
  // Questo aiuta a mantenere attiva la sottoscrizione anche quando l'app è chiusa
  self.registration.pushManager.getSubscription()
    .then(subscription => {
      if (!subscription) {
        //console.log('Nessuna sottoscrizione push trovata nel service worker');
      } else {
        //console.log('Sottoscrizione push esistente trovata nel service worker');
      }
    })
    .catch(error => {
      console.error('Errore durante il controllo della sottoscrizione push:', error);
    });
});

// Gestione del click sulle notifiche
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
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

// Gestione dell'evento pushsubscriptionchange
self.addEventListener('pushsubscriptionchange', (event) => {
  
  // Qui dovremmo aggiornare la sottoscrizione nel database
  // Ma poiché non possiamo accedere direttamente a Supabase dal service worker,
  // possiamo inviare un messaggio ai client aperti per gestire l'aggiornamento
  event.waitUntil(
    clients.matchAll().then(clientList => {
      if (clientList.length > 0) {
        // Invia un messaggio al primo client disponibile
        clientList[0].postMessage({
          type: 'PUSH_SUBSCRIPTION_CHANGED',
          payload: {
            oldSubscription: event.oldSubscription,
            newSubscription: event.newSubscription
          }
        });
      } else {
        //console.log('Nessun client disponibile per aggiornare la sottoscrizione push');
      }
    })
  );
});

// Pulizia della cache durante l'attivazione
self.addEventListener('activate', function(event) {
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
