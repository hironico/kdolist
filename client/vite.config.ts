/// <reference types="vitest" />
import * as path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import mkcert from 'vite-plugin-mkcert'

import manifest from './manifest.json';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      registerType: "prompt", 
      injectRegister: "inline",
      strategies: "generateSW",
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html}', '**/*.{svg,png,jpg,gif}'],
        globDirectory: "dist/",
        // Exclude API routes from service worker navigation handling
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [
          /^\/api\/.*/,     // Exclude all /api/* routes
          /^\/legal\/.*/,   // Exclude all /legal/* routes
        ],
        // Don't auto-activate - wait for user confirmation
        clientsClaim: false,
        skipWaiting: false,
      },
      manifest: manifest,
      // switch to "true" to enable sw on development
      devOptions: {
        enabled: false,
      },
    }),
    mkcert(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    root: path.resolve(__dirname, './src'),
  },
});
