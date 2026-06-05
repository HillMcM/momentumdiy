import { useState, useEffect } from 'react';

/**
 * Hook to detect online/offline status and handle network connectivity changes.
 * 
 * Usage:
 * ```tsx
 * const { isOnline, wasOffline } = useOfflineDetection();
 * 
 * if (!isOnline) {
 *   return <OfflineBanner />;
 * }
 * ```
 */
export function useOfflineDetection() {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window === 'undefined') return true;
    return navigator.onLine;
  });
  
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Brief delay to ensure connection is stable
        setTimeout(() => {
          setWasOffline(false);
        }, 1000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
}
