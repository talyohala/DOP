self.addEventListener('install', (e) => self.skipWaiting());

self.addEventListener('push', function(event) {
  const options = {
    body: event.data ? event.data.text() : 'יש לך התראה חדשה ב-DOP! ⚡',
    icon: 'https://cdn-icons-png.flaticon.com/512/3050/3050514.png',
    vibrate: [200, 100, 200, 100, 200] // תבנית רטט מיוחדת
  };
  event.waitUntil(self.registration.showNotification('DOP', options));
});
