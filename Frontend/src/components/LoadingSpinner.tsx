import React from 'react';

interface LoadingSpinnerProps {
  /** Optional message to display below the spinner */
  message?: string;
  /** Size of the spinner - 'sm', 'md', or 'lg' (default: 'md') */
  size?: 'sm' | 'md' | 'lg';
  /** Optional custom className for the container */
  className?: string;
  /** Whether to show full screen loading (default: false) */
  fullScreen?: boolean;
}

/**
 * Standardized loading spinner component for consistent loading UI across the app.
 * 
 * Usage:
 * ```tsx
 * <LoadingSpinner message="Loading data..." />
 * <LoadingSpinner size="lg" fullScreen message="Loading your dashboard..." />
 * ```
 */
export default function LoadingSpinner({
  message,
  size = 'md',
  className = '',
  fullScreen = false
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 border-b-2',
    md: 'h-8 w-8 border-b-2',
    lg: 'h-12 w-12 border-b-2'
  };

  const spinner = (
    <div className={`text-center ${className}`}>
      <div className={`inline-block animate-spin rounded-full ${sizeClasses[size]} border-[#EF8E81] mb-4`}></div>
      {message && (
        <p className="text-gray-400">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0A1A]">
        {spinner}
      </div>
    );
  }

  return spinner;
}

