import * as path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';
import mkcert from 'vite-plugin-mkcert'

import manifest from './manifest.json';

// https://vitejs.dev/config/
export default defineConfig({
  legacy: {
    // Restore Vite 5 CJS interop behaviour for packages like @mui/icons-material
    // that use default exports from CommonJS subpath imports (e.g. '@mui/icons-material/Menu').
    // Remove once those packages declare ESM-only exports or update their peer deps for Vite 8.
    inconsistentCjsInterop: true,
  },
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
