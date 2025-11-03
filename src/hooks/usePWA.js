import { useEffect, useState } from 'react';

/**
 * Hook para manejar la PWA y actualizaciones del service worker
 */
export function usePWA() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [updateServiceWorker, setUpdateServiceWorker] = useState(() => () => {});

  useEffect(() => {
    // Importar dinámicamente el registro del service worker
    import('virtual:pwa-register/react').then(({ registerSW }) => {
      const updateSW = registerSW({
        immediate: true,
        onNeedRefresh() {
          setNeedRefresh(true);
        },
        onOfflineReady() {
          setOfflineReady(true);
        },
        onRegistered(registration) {
          console.log('Service Worker registrado:', registration);
        },
        onRegisterError(error) {
          console.error('Error al registrar Service Worker:', error);
        },
      });

      setUpdateServiceWorker(() => updateSW);
    }).catch((error) => {
      console.warn('PWA registration no disponible:', error);
    });
  }, []);

  const update = () => {
    if (updateServiceWorker) {
      updateServiceWorker(true);
      setNeedRefresh(false);
      window.location.reload();
    }
  };

  const dismiss = () => {
    setNeedRefresh(false);
    setOfflineReady(false);
  };

  return {
    needRefresh,
    offlineReady,
    update,
    dismiss,
  };
}

