/**
 * useMediaQuery Hook
 * Reactive hook for responsive design that updates when viewport changes
 */

import { useState, useEffect } from 'react';

/**
 * Generic media query hook
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Set initial value
    setMatches(media.matches);
    
    // Listen for changes
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [query]);
  
  return matches;
}

/**
 * Convenience hooks for common breakpoints
 */
export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
export const useIsTablet = () => useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');

/**
 * Orientation detection
 */
export const useIsPortrait = () => useMediaQuery('(orientation: portrait)');
export const useIsLandscape = () => useMediaQuery('(orientation: landscape)');

/**
 * Combined mobile detection (includes tablets in portrait)
 */
export const useIsMobileOrTablet = () => useMediaQuery('(max-width: 1024px)');

