// Cyber Shield Mobile Background Service Worker
const CACHE_NAME = 'cybershield-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Background message handler for mobile link checks
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_URL_BACKGROUND') {
    const url = event.data.url;
    // Process background check notification
    if (self.registration && self.registration.showNotification) {
      // If notification permission is granted
    }
  }
});
