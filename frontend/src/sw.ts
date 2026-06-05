/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import {
  NetworkFirst,
  StaleWhileRevalidate,
  CacheFirst,
} from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

declare const self: ServiceWorkerGlobalScope & typeof globalThis

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// ── Runtime caching ─────────────────────────────────────────────────────────

// Stale While Revalidate — auth/me and settings (tolerates staleness)
registerRoute(
  ({ url }: { url: URL }) =>
    /\/api\/(auth\/me|settings)(\?.*)?$/.test(url.pathname + url.search),
  new StaleWhileRevalidate({
    cacheName: 'api-swr',
    plugins: [
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 3600 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
)

// Network First — all other API calls with cache fallback
registerRoute(
  ({ url }: { url: URL }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-dynamic',
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 86400 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
)

// Cache First — Google Fonts (immutable)
registerRoute(
  ({ url }: { url: URL }) =>
    /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i.test(url.href),
  new CacheFirst({
    cacheName: 'google-fonts',
    plugins: [
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 31536000 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
)

// ── Push notifications ───────────────────────────────────────────────────────

self.addEventListener('push', (event: PushEvent) => {
  const payload = event.data
    ? (event.data.json() as {
        title: string
        body: string
        data?: Record<string, string>
      })
    : { title: 'UPTGO', body: 'Nueva notificación', data: undefined }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      data: payload.data,
    }),
  )
})

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()
  event.waitUntil(
    (self as ServiceWorkerGlobalScope).clients.openWindow(
      (event.notification.data as Record<string, string> | undefined)?.url ?? '/',
    ),
  )
})
