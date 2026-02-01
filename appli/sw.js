// Service Worker pour Dahira Kenal PWA
const CACHE_NAME = 'dahira-kenal-v1.0.0';
const urlsToCache = [
  './versionfinal.html',
  './manifest.json',
  './fontawesome/css/all.min.css'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Mise en cache des fichiers');
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.log('[Service Worker] Erreur de cache:', err);
      })
  );
  self.skipWaiting(); // Force l'activation immédiate
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activation...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Prend le contrôle immédiatement
});

// Stratégie de cache : Network First, fallback sur Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la réponse est valide, on la met en cache
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si le réseau échoue, on utilise le cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[Service Worker] Chargement depuis le cache:', event.request.url);
              return cachedResponse;
            }
            
            // Si rien dans le cache, page d'erreur basique
            return new Response(
              `<!DOCTYPE html>
              <html lang="fr">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Hors ligne - Dahira Kenal</title>
                <style>
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    margin: 0;
                    background: linear-gradient(135deg, #ecfdf5 0%, #ccfbf1 100%);
                    color: #1e293b;
                    text-align: center;
                    padding: 2rem;
                  }
                  .icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                  }
                  h1 {
                    color: #059669;
                    margin-bottom: 0.5rem;
                  }
                  p {
                    color: #64748b;
                    max-width: 400px;
                  }
                  button {
                    background: #059669;
                    color: white;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 600;
                    margin-top: 1.5rem;
                    cursor: pointer;
                  }
                </style>
              </head>
              <body>
                <div class="icon">📡</div>
                <h1>Vous êtes hors ligne</h1>
                <p>Veuillez vérifier votre connexion Internet pour accéder à cette page.</p>
                <button onclick="window.location.reload()">Réessayer</button>
              </body>
              </html>`,
              {
                headers: { 'Content-Type': 'text/html' }
              }
            );
          });
      })
  );
});

// Gestion des messages du client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
