// Web Push Service Worker for Firebase Cloud Messaging
/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyC97YLi_pibHrtkJMw7Oi7c1CcDkt9DCWs",
  authDomain: "campus-stitch.firebaseapp.com",
  projectId: "campus-stitch",
  storageBucket: "campus-stitch.firebasestorage.app",
  messagingSenderId: "551202613453",
  appId: "1:551202613453:web:0474853d06c9dc440c2184",
};

firebase.initializeApp(firebaseConfig);

try {
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || "CampusStitch";
    const options = {
      body: payload.notification?.body || "New campus activity update.",
      icon: payload.notification?.icon || "/icon-192.png",
      badge: "/icon-192.png",
      data: payload.data || {},
      vibrate: [100, 50, 100],
    };
    return self.registration.showNotification(title, options);
  });
} catch (err) {
  console.warn("FCM background messaging handler notice:", err);
}

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// Fallback background push listener
self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const notification = data.notification || data;
    const title = notification.title || "CampusStitch";
    const options = {
      body: notification.body || "You have a new update",
      icon: notification.icon || "/icon-192.png",
      badge: "/icon-192.png",
      data: data.data || {},
      vibrate: [100, 50, 100],
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.warn("Service worker push parse error:", err);
  }
});

// Notification click event handler - opens the target page in the web app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const clickAction =
    event.notification.data?.click_action ||
    event.notification.data?.url ||
    "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(clickAction);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(clickAction);
        }
      })
  );
});
