import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Aegis – Disaster Intelligence Platform',
        short_name: 'Aegis',
        description: 'Real-time disaster management SaaS — SOS, AI risk, maps, shelters, chat.',
        theme_color: '#4f46e5',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        categories: ['emergency', 'utilities', 'public-safety'],
        icons: [
          { src: 'pwa-192x192.png',   sizes: '192x192',   type: 'image/png' },
          { src: 'pwa-512x512.png',   sizes: '512x512',   type: 'image/png', purpose: 'any maskable' },
          { src: 'pwa-512x512.png',   sizes: '512x512',   type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          {
            name: 'Send SOS',
            short_name: 'SOS',
            description: 'Panic button — send emergency SOS',
            url: '/emergency/sos',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
          },
          {
            name: 'Live Map',
            short_name: 'Map',
            description: 'View live disaster map',
            url: '/maps',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
          },
        ],
        screenshots: [
          { src: 'screenshot-wide.png',   sizes: '1280x720', type: 'image/png', form_factor: 'wide' },
          { src: 'screenshot-mobile.png', sizes: '390x844',  type: 'image/png', form_factor: 'narrow' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/unpkg\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-cache',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // API calls — network-first with fallback
            urlPattern: /\/api\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
              networkTimeoutSeconds: 10,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
        // Navigate fallback for SPA routing
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
      },
    }),
  ],
  server: {
    port: 5180,
    strictPort: true,
    host: true,              // needed for Capacitor live reload
  },
  build: {
    // Target modern mobile browsers (WebView)
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          react:    ['react', 'react-dom', 'react-router-dom'],
          redux:    ['@reduxjs/toolkit', 'react-redux'],
          maps:     ['leaflet', 'react-leaflet'],
          realtime: ['socket.io-client'],
          motion:   ['framer-motion'],
          charts:   ['recharts'],
          icons:    ['lucide-react'],
        },
      },
    },
  },
});
