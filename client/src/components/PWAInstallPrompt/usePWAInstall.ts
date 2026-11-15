import { useSyncExternalStore } from 'react';

/**
 * PWA install state shared across the app.
 *
 * The `beforeinstallprompt` event is fired only once by Chromium browsers and
 * possibly before React has mounted, so the listener lives at module level and
 * this module is imported from main.tsx at startup.
 */

export type InstallPlatform = 'native' | 'ios-safari' | 'ios-edge' | 'none';

type InstallState = {
  installed: boolean;
  platform: InstallPlatform;
  dialogRequested: boolean;
};

const DISMISSED_UNTIL_KEY = 'kdolist_pwa_prompt_dismissed_until';
const SNOOZE_MS = 14 * 24 * 60 * 60 * 1000;

const isStandalone = (): boolean =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    (window.navigator as any).standalone === true);

const detectIOSPlatform = (): InstallPlatform => {
  if (typeof navigator === 'undefined') return 'none';
  const ua = navigator.userAgent;
  // iPadOS 13+ reports itself as a Mac but has a touch screen.
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  if (!isIOS) return 'none';
  if (/EdgiOS/.test(ua)) return 'ios-edge';
  // Chrome / Firefox / Opera on iOS cannot install PWAs, only Safari and Edge can.
  if (/CriOS|FxiOS|OPiOS/.test(ua)) return 'none';
  return 'ios-safari';
};

const iosPlatform = detectIOSPlatform();

let deferredPrompt: any = null;
let state: InstallState = {
  installed: isStandalone(),
  platform: iosPlatform,
  dialogRequested: false,
};
const listeners = new Set<() => void>();

const setState = (patch: Partial<InstallState>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredPrompt = e;
    if (state.platform !== 'native') {
      setState({ platform: 'native' });
    }
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    setState({ installed: true, platform: 'none', dialogRequested: false });
  });
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const getSnapshot = () => state;

/** Triggers the browser native install dialog (Chromium only). */
const promptInstall = async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
  if (!deferredPrompt) return 'unavailable';
  const evt = deferredPrompt;
  deferredPrompt = null;
  evt.prompt();
  const { outcome } = await evt.userChoice;
  if (outcome === 'accepted') {
    setState({ installed: true, platform: 'none' });
  } else {
    // Chrome will not fire the event again for a while.
    setState({ platform: iosPlatform });
  }
  return outcome;
};

/** Asks the PWAInstallPrompt dialog to open (e.g. from the sidebar menu). */
const requestInstallDialog = () => setState({ dialogRequested: true });
const clearInstallDialogRequest = () => setState({ dialogRequested: false });

const isSnoozed = (): boolean => {
  try {
    const until = Number(localStorage.getItem(DISMISSED_UNTIL_KEY) ?? 0);
    return until > Date.now();
  } catch {
    return false;
  }
};

const snoozeInstallPrompt = () => {
  try {
    localStorage.setItem(DISMISSED_UNTIL_KEY, String(Date.now() + SNOOZE_MS));
  } catch {
    /* ignore storage errors */
  }
};

export function usePWAInstall() {
  const s = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    isInstalled: s.installed,
    platform: s.platform,
    canInstall: !s.installed && s.platform !== 'none',
    dialogRequested: s.dialogRequested,
    promptInstall,
    requestInstallDialog,
    clearInstallDialogRequest,
    isSnoozed,
    snoozeInstallPrompt,
  };
}

export default usePWAInstall;
