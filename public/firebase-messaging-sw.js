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
  
  const notificationTitle = payload.notification?.title || 'Radhika Jewellers';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new update.',
    icon: '/icon.png',
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
