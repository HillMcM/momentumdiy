import React from 'react';

interface LoadingSkeletonProps {
  /** Number of skeleton lines to show (default: 3) */
  lines?: number;
  /** Optional title skeleton */
  showTitle?: boolean;
  /** Optional custom className */
  className?: string;
}

/**
 * Standardized loading skeleton component for consistent loading UI across the app.
 * Use this for content that will be replaced with actual data.
 * 
 * Usage:
 * ```tsx
 * <LoadingSkeleton lines={5} showTitle />
 * ```
 */
export default function LoadingSkeleton({
  lines = 3,
  showTitle = false,
  className = ''
}: LoadingSkeletonProps) {
  return (
    <div className={`bg-[#1B1628]/80 backdrop-blur-sm rounded-2xl border border-[#2A243E]/60 p-8 ${className}`}>
      <div className="animate-pulse">
        {showTitle && (
          <div className="h-8 bg-gray-600 rounded w-48 mb-4"></div>
        )}
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`h-4 bg-gray-600 rounded ${index < lines - 1 ? 'mb-4' : ''}`}
            style={{ width: index === lines - 1 ? '75%' : '100%' }}
          ></div>
        ))}
      </div>
    </div>
  );
}

