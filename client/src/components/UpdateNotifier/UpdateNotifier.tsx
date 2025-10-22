import { useContext, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { LoginContext } from '@/LoginContext';

/**
 * UpdateNotifier component monitors for PWA updates and sets the status in LoginContext
 * This allows the Header to display a notification bell when updates are available
 */
export function UpdateNotifier() {
  const { setUpdateAvailable } = useContext(LoginContext);
  
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      console.log('Service Worker registered:', swUrl);
      
      // Check for updates every 60 seconds
      if (registration) {
        setInterval(() => {
          console.log('Checking for service worker updates...');
          registration.update().catch(err => {
            console.error('Error checking for updates:', err);
          });
        }, 60000);
      }
    },
    onRegisterError(error) {
      console.error('Service Worker registration error:', error);
    },
  });

  useEffect(() => {
    console.log('UpdateNotifier mounted, needRefresh:', needRefresh);
    
    // When needRefresh changes, update the context
    if (needRefresh) {
      console.log('✅ PWA update available - showing notification bell');
      setUpdateAvailable(true);
    }
  }, [needRefresh, setUpdateAvailable]);

  useEffect(() => {
    // Log on mount
    console.log('UpdateNotifier: Service worker monitoring started');
    
    return () => {
      console.log('UpdateNotifier: Component unmounting');
    };
  }, []);

  // This component doesn't render anything
  return null;
}
