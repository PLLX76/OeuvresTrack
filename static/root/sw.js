importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.5.3/workbox-sw.js"
);

// Vérification que Workbox est bien chargé
if (workbox) {
  console.log(`Workbox est chargé`);

  workbox.precaching.precacheAndRoute([
    {
      url: "/app/",
      revision: null,
    },
    {
      url: "/app/?utm_source=pwa",
      revision: null,
    },
    {
      url: "/static/css/home.css",
      revision: null,
    },
    {
      url: "/static/css/home_secondary.css",
      revision: null,
    },
    {
      url: "/static/css/settings.css",
      revision: null,
    },
    {
      url: "/static/css/tierlist.css",
      revision: null,
    },
    {
      url: "/static/js/home.js",
      revision: null,
    },
    {
      url: "/static/js/settings.js",
      revision: null,
    },
    {
      url: "/static/js/tierlist.js",
      revision: null,
    },
    {
      url: "/sw.js",
      revision: null,
    },
    {
      url: "/manifest.json",
      revision: null,
    },
    {
      url: "/static/icons/account_circle.svg",
      revision: null,
    },
    {
      url: "/static/icons/add_96dp.svg",
      revision: null,
    },
    {
      url: "/static/icons/add.svg",
      revision: null,
    },
    {
      url: "/static/icons/close.svg",
      revision: null,
    },
    {
      url: "/static/icons/delete.svg",
      revision: null,
    },
    {
      url: "/static/icons/dictionary.svg",
      revision: null,
    },
    {
      url: "/static/icons/do_not_disturb_on.svg",
      revision: null,
    },
    {
      url: "/static/icons/drag_indicator.svg",
      revision: null,
    },
    {
      url: "/static/icons/edit.svg",
      revision: null,
    },
    {
      url: "/static/icons/info.svg",
      revision: null,
    },
    {
      url: "/static/icons/keyboard_arrow_down.svg",
      revision: null,
    },
    {
      url: "/static/icons/keyboard_arrow_up.svg",
      revision: null,
    },
    {
      url: "/static/icons/library_books.svg",
      revision: null,
    },
    {
      url: "/static/icons/logo_complete.svg",
      revision: null,
    },
    {
      url: "/static/icons/logo_mini.svg",
      revision: null,
    },
    {
      url: "/static/icons/menu.svg",
      revision: null,
    },
    {
      url: "/static/icons/more.svg",
      revision: null,
    },
    {
      url: "/static/icons/movie.svg",
      revision: null,
    },
    {
      url: "/static/icons/notification_add.svg",
      revision: null,
    },
    {
      url: "/static/icons/notifications.svg",
      revision: null,
    },
    {
      url: "/static/icons/save.svg",
      revision: null,
    },
    {
      url: "/static/icons/search.svg",
      revision: null,
    },
    {
      url: "/static/icons/settings.svg",
      revision: null,
    },
    {
      url: "/static/icons/tv.svg",
      revision: null,
    },
    {
      url: "/static/icons/view_list_96dp.svg",
      revision: null,
    },
    {
      url: "/static/icons/view_list.svg",
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
