/**
 * Responsive Utility Functions
 * Helper functions for responsive design patterns
 */

/**
 * Get value based on current viewport width
 */
export const getResponsiveValue = <T,>(mobile: T, tablet: T, desktop: T): T => {
  const width = window.innerWidth;
  if (width < 768) return mobile;
  if (width < 1024) return tablet;
  return desktop;
};

/**
 * Detect if device supports touch
 */
export const isTouchDevice = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Get responsive padding based on screen size
 */
export const getResponsivePadding = (): string => {
  return getResponsiveValue('0.75rem', '1.5rem', '2rem');
};

/**
 * Get responsive grid columns
 */
export const getResponsiveColumns = (mobileCols = 1, tabletCols = 2, desktopCols = 2): string => {
  const cols = getResponsiveValue(mobileCols, tabletCols, desktopCols);
  return `repeat(${cols}, 1fr)`;
};

/**
 * Breakpoint constants
 */
export const BREAKPOINTS = {
  sm: 640,   // Mobile landscape, small tablets
  md: 768,   // Tablets portrait
  lg: 1024,  // Tablets landscape, small laptops
  xl: 1280,  // Laptops, desktops
  '2xl': 1536 // Large desktops
} as const;

/**
 * Check if current width is at or below a breakpoint
 */
export const isAtBreakpoint = (breakpoint: keyof typeof BREAKPOINTS): boolean => {
  return window.innerWidth <= BREAKPOINTS[breakpoint];
};

