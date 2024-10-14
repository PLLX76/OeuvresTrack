importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.5.3/workbox-sw.js"
);

// Vérification que Workbox est bien chargé
if (workbox) {
  console.log(`Workbox est chargé`);

  workbox.precaching.precacheAndRoute([
    {
      url: "/app",
      revision: null,
    },
  ]);

  // Mettre en cache toutes les ressources statiques : CSS, JS, images
  workbox.routing.registerRoute(
    ({ request }) =>
      request.destination === "style" ||
      request.destination === "script" ||
      request.destination === "image",
    new workbox.strategies.CacheFirst({
      cacheName: "static-resources",
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
        }),
      ],
    })
  );

  // Mettre en cache les requêtes pour la page principale de l'application
  workbox.routing.registerRoute(
    ({ request }) => request.destination === "document",
    new workbox.strategies.CacheFirst({
      cacheName: "pages-cache",
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 10,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 jours
        }),
      ],
    })
  );

  // Mettre en cache les icones
  workbox.routing.registerRoute(
    ({ url }) => url.pathname.startsWith("/static/icons/"),
    new workbox.strategies.CacheFirst({
      cacheName: "icons-cache",
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 30,
          maxAgeSeconds: 60 * 24 * 60 * 60, // 60 Jours
        }),
      ],
    })
  );

  // Mettre en cache les requêtes dynamiques pour le mode offline
  workbox.routing.registerRoute(
    ({ url }) => true, // Attraper toutes les autres requêtes
    new workbox.strategies.NetworkFirst({
      cacheName: "dynamic-cache",
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
        }),
      ],
    })
  );
} else {
  console.error(`Échec du chargement de Workbox`);
}

self.addEventListener("push", function (event) {
  const data = event.data.json();
  const title = data.title || "Nouvelle notification";
  const options = {
    body: data.body || "Vous avez une nouvelle notification.",
    icon: data.icon || "/static/icons/logo_mini.svg",
    badge: data.badge || undefined,
    data: {
      url: data.url,
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = event.notification.data.url || "/";
  event.waitUntil(clients.openWindow(url));
});
