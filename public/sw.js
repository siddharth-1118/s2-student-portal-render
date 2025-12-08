self.addEventListener("push", function (event) {
  if (!event.data) return;

  const data = event.data.json();
  const title = data.title || "SRM Student Portal";

  const options = {
    body: data.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: data.url ? { url: data.url } : {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(url));
});
