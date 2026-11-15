import welcome from '@/utils/welcome';
// Register the PWA install listeners as early as possible: `beforeinstallprompt`
// fires only once and may happen before React is mounted.
import '@/components/PWAInstallPrompt/usePWAInstall';

// Root contains the main dependencies and providers of the base app
//  - React, ReactDom, RecoilRoot, HelmetProvider, ThemeProvider, MUI-core)
// App contains the main structure of the base app

// These are the two main chunks that are used to render the core structure of the app
// Importing them with Promise.all (by using HTTP/2 multiplexing) we can load them in parallel
// and achieve the best possible performance

Promise.all([import('@/Root'), import('@/App')]).then(([{ default: render }, { default: App }]) => {
  render(App);
});

// welcome message for users in the console
welcome();

// ts(1208)
export {};
