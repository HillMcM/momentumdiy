import { useState, useEffect, useRef } from 'react';

/**
 * Hook to track window focus state and prevent unnecessary re-renders
 * when switching between browser tabs/windows
 */
export function useWindowFocus() {
  const [isFocused, setIsFocused] = useState(true);
  const [hasBeenFocused, setHasBeenFocused] = useState(true);

  // Debug: Track hook renders
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  console.log(`🪟 useWindowFocus render #${renderCountRef.current} - isFocused: ${isFocused}, hasBeenFocused: ${hasBeenFocused}`);

  useEffect(() => {
    const handleFocus = () => {
      setIsFocused(true);
      setHasBeenFocused(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    // Listen for window focus/blur events
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Also listen for document visibility changes (tab switching)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleFocus();
      } else {
        handleBlur();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return { isFocused, hasBeenFocused };
}
