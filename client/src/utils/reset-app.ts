/**
 * Resets the application by clearing all stored data including:
 * - LocalStorage (auth tokens, user preferences, etc.)
 * - SessionStorage
 * - IndexedDB
 * - Service Worker caches
 * Then reloads the application
 */
async function resetApp() {
  try {
    console.log('Resetting application - clearing all data...');

    // 1. Clear localStorage (includes auth tokens)
    localStorage.clear();
    console.log('✓ LocalStorage cleared');

    // 2. Clear sessionStorage
    sessionStorage.clear();
    console.log('✓ SessionStorage cleared');

    // 3. Clear IndexedDB databases
    if ('indexedDB' in window) {
      try {
        const databases = await indexedDB.databases();
        for (const db of databases) {
          if (db.name) {
            indexedDB.deleteDatabase(db.name);
            console.log(`✓ IndexedDB "${db.name}" deleted`);
          }
        }
      } catch (error) {
        console.warn('Could not clear IndexedDB:', error);
      }
    }

    // 4. Clear Service Worker caches
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => {
            console.log(`✓ Cache "${cacheName}" deleted`);
            return caches.delete(cacheName);
          })
        );
      } catch (error) {
        console.warn('Could not clear caches:', error);
      }
    }

    // 5. Unregister service workers
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map(registration => {
            console.log('✓ Service Worker unregistered');
            return registration.unregister();
          })
        );
      } catch (error) {
        console.warn('Could not unregister service workers:', error);
      }
    }

    console.log('Application reset complete - reloading...');
    
    // 6. Reload the application
    window.location.href = '/';
  } catch (error) {
    console.error('Error during app reset:', error);
    // Force reload even if cleanup failed
    window.location.href = '/';
  }
}

export default resetApp;
