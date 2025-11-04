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
      injectRegister: "auto",
      strategies: "injectManifest",
      srcDir: 'src',
      filename: 'sw.ts',
      manifest: manifest as any,
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,gif,ico}'],
      },
      workbox: {
        sourcemap: true,
      },
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
