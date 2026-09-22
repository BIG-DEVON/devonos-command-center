self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: "Morrow", body: event.data ? event.data.text() : "A new alert is ready." };
  }

  const title = payload.title || "Morrow";
  const options = {
    body: payload.body || "A new alert is ready inside your workspace.",
    icon: "/morrow-mark.svg",
    badge: "/morrow-mark.svg",
    tag: payload.tag || `morrow-${payload.id || Date.now()}`,
    timestamp: Number(payload.timestamp) || Date.now(),
    renotify: payload.severity === "critical" || payload.severity === "warning",
    requireInteraction: payload.severity === "critical",
    silent: false,
    vibrate: payload.severity === "critical" ? [180, 90, 180] : [120],
    actions: [
      { action: "open", title: "Open Morrow" },
      { action: "dismiss", title: "Dismiss" },
    ],
    data: {
      id: payload.id || "",
      category: payload.category || "Notification",
      url: payload.url || "/dashboard",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;
  const targetUrl = new URL(event.notification.data?.url || "/dashboard", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return self.clients.openWindow ? self.clients.openWindow(targetUrl) : undefined;
    })
  );
});
