importScripts('https://www.gstatic.com/firebasejs/9.16.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.16.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
const firebaseConfig = {
  apiKey: "AIzaSyAe7zRhrskoCmzB8dxoDzu_Ar-ZTaZL7_s",
  authDomain: "radhika-jewellers-699.firebaseapp.com",
  projectId: "radhika-jewellers-699",
  storageBucket: "radhika-jewellers-699.firebasestorage.app",
  messagingSenderId: "271343725756",
  appId: "1:271343725756:web:137764a186f74afc3c34b9",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || 'Radhika Jewellers';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'You have a new update from Radhika Jewellers.',
    icon: '/assets/logo.png',
    badge: '/assets/logo.png',
    data: {
      url: payload.data?.url || payload.data?.link || '/',
    },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
