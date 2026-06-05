import React from 'react';
import { useOfflineDetection } from '../hooks/useOfflineDetection';

/**
 * Banner component that displays when the user is offline.
 * Shows at the top of the page to indicate network connectivity issues.
 */
export default function OfflineBanner() {
  const { isOnline, wasOffline } = useOfflineDetection();

  if (isOnline && !wasOffline) {
    return null;
  }

  if (!isOnline) {
    return (
      <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-2 text-amber-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
          </svg>
          <span className="font-medium">You're offline. Some features may be unavailable.</span>
        </div>
      </div>
    );
  }

  // Show reconnected message briefly
  return (
    <div className="bg-green-500/20 border-b border-green-500/30 px-4 py-3 text-center animate-fade-out">
      <div className="flex items-center justify-center gap-2 text-green-300">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="font-medium">Connection restored!</span>
      </div>
    </div>
  );
}
