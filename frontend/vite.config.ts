import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',

      manifest: {
        name: 'UPTGO',
        short_name: 'UPTGO',
        description: 'Tu plataforma académica, siempre contigo.',
        theme_color: '#4a7c59',
        background_color: '#f7f6f2',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        lang: 'es-CO',
        categories: ['education', 'productivity'],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        // Precaché: todos los assets del build (estáticos + immutables)
        globPatterns: ['**/*.{js,css,html,ico,svg,png,woff2,woff,webp}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,

        runtimeCaching: [
          // Stale While Revalidate — auth/me y settings (tolera desactualización)
          {
            urlPattern: /\/api\/(auth\/me|settings)(\?.*)?$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-swr',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60, // 1 hora
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Network First — todas las demás llamadas /api/* con fallback a caché
          {
            urlPattern: /\/api\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-dynamic',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60, // 24 horas
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Cache First — Google Fonts (inmutables)
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1 año
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },

      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  server: {
    allowedHosts: ['unfantastic-abbigail-semiacademically.ngrok-free.dev'],
  },
})
