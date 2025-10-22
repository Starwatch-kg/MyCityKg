// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Initialize Firebase in service worker
firebase.initializeApp({
  apiKey: 'AIzaSyDemoKey-Replace-With-Your-Web-API-Key',
  authDomain: 'mycitykg.firebaseapp.com',
  projectId: 'mycitykg',
  storageBucket: 'mycitykg.appspot.com',
  messagingSenderId: '544289183767',
  appId: '1:544289183767:web:demo-app-id',
  measurementId: 'G-DEMO-MEASUREMENT-ID'
});

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'MyCityKg';
  const notificationOptions = {
    body: payload.notification?.body || 'Новое уведомление',
    icon: '/icons/Icon-192.png',
    badge: '/icons/Icon-192.png',
    tag: 'mycitykg-notification',
    data: payload.data,
    actions: [
      {
        action: 'open',
        title: 'Открыть',
        icon: '/icons/Icon-192.png'
      },
      {
        action: 'close',
        title: 'Закрыть'
      }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Open the app when notification is clicked
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window if app is not open
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
