// Service Worker - Background Sync & Heartbeat Engine
const CACHE_NAME = 'love-3d-bg-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Lắng nghe Background Sync khi kết nối mạng phục hồi hoặc chạy ngầm
self.addEventListener('sync', (event) => {
    if (event.tag === 'bg-gps-sync' || event.tag === 'bg-photo-sync') {
        event.waitUntil(Promise.resolve());
    }
});

// Lắng nghe Periodic Background Sync
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'bg-heartbeat') {
        event.waitUntil(Promise.resolve());
    }
});
