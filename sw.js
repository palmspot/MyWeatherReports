// sw.js — Service Worker for push notifications
// tenki.migimigi.cc

self.addEventListener('push', function(event) {
  var data = {};
  try { data = event.data ? event.data.json() : {}; } catch(e) {}

  var title = data.title || '気象警報・注意報';
  var options = {
    body: data.body || '警報・注意報が発令されました',
    icon: '/apple-touch-icon.png',
    badge: '/apple-touch-icon.png',
    tag: 'weather-warning',          // 同じtagは上書き（重複通知防止）
    renotify: true,
    data: { url: data.url || '/' }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list) {
      // すでに開いているタブがあればフォーカス
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.includes(self.location.origin)) {
          return list[i].focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
