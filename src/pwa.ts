import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

/**
 * Version du cache du service worker.
 * À incrémenter en même temps que `public/sw.js` à chaque mise en production :
 * les anciens caches sont supprimés automatiquement.
 */
export const PWA_CACHE_VERSION = '1.2.0';

const isWeb = Platform.OS === 'web';

/**
 * Enregistre le service worker (Web uniquement, jamais en développement).
 * Les chemins sont relatifs au document pour fonctionner aussi sous un
 * sous-chemin (GitHub Pages : /montessoriclub/).
 */
export async function registerServiceWorker(): Promise<void> {
  if (!isWeb || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  if (typeof __DEV__ !== 'undefined' && __DEV__) return;
  try {
    const scope = new URL('./', document.baseURI);
    await navigator.serviceWorker.register(new URL('sw.js', scope).toString(), { scope: scope.pathname });
  } catch {
    // Un service worker indisponible (navigation privée, ancien navigateur)
    // ne doit jamais empêcher l'application de fonctionner.
  }
}

/** État réseau, pour afficher un bandeau discret et rassurant hors ligne. */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() =>
    isWeb && typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    if (!isWeb || typeof window === 'undefined') return;
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    setOnline(navigator.onLine);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return online;
}

/** true si l'application est déjà lancée comme application installée. */
export function isStandalone(): boolean {
  if (!isWeb || typeof window === 'undefined') return false;
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return (
    navigatorWithStandalone.standalone === true ||
    window.matchMedia?.('(display-mode: standalone)').matches === true
  );
}
