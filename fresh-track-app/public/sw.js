self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(clients.claim()));

self.addEventListener('message', event => {
  if (event.data?.type === 'NOTIFY') {
    self.registration.showNotification(event.data.title, {
      body: event.data.body,
      icon: '/icon-192.png',
    });
  }
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const suggestionId = e.notification.data?.suggestionId;

  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      const target = list[0];
      if (target) {
        target.focus();
        target.postMessage({ type: "navigate", view: "cook", suggestionId });
      } else {
        clients.openWindow("/");
      }
    })
  );
});
