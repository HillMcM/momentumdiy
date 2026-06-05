import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFriendlyError } from '../utils/errorMessages';

interface ErrorDisplayProps {
  /** The error message to display (will be converted to user-friendly message) */
  error: string;
  /** Optional title for the error (defaults to "Error") */
  title?: string;
  /** Optional callback for the back button (defaults to navigating to /app) */
  onBack?: () => void;
  /** Optional custom back button label */
  backLabel?: string;
  /** Optional additional action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Optional retry function */
  onRetry?: () => void | Promise<void>;
  /** Whether to show user-friendly error messages (default: true) */
  showFriendly?: boolean;
}

/**
 * Standardized error display component for consistent error UI across the app.
 * Use this for critical errors that block the UI (e.g., failed data loading).
 * For non-critical errors, use the notification system instead.
 */
export default function ErrorDisplay({
  error,
  title = 'Something Went Wrong',
  onBack,
  backLabel = 'Go Back',
  action,
  onRetry,
  showFriendly = true
}: ErrorDisplayProps) {
  const navigate = useNavigate();
  const [isRetrying, setIsRetrying] = useState(false);

  const friendlyError = showFriendly ? getFriendlyError(error) : { message: error, recoverySteps: [], retryable: false };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/app');
    }
  };

  const handleRetry = async () => {
    if (!onRetry) return;
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F0A1A] p-6">
      <div className="bg-[#1B1628]/80 backdrop-blur-sm rounded-2xl border border-red-500/30 p-8 max-w-lg w-full">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">❌ {title}</div>
          <div className="text-gray-300 mb-4 text-left">
            <p className="mb-4">{friendlyError.message}</p>
            {friendlyError.recoverySteps && friendlyError.recoverySteps.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4 text-left">
                <p className="text-sm font-semibold text-red-300 mb-2">What you can do:</p>
                <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                  {friendlyError.recoverySteps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3">
            {onRetry && friendlyError.retryable && (
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="bg-[#EF8E81] hover:bg-[#E67A6E] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isRetrying ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Retrying...
                  </>
                ) : (
                  'Try Again'
                )}
              </button>
            )}
            <button
              onClick={handleBack}
              className="bg-[#EF8E81] hover:bg-[#E67A6E] text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {backLabel}
            </button>
            {action && (
              <button
                onClick={action.onClick}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-colors border border-white/20"
              >
                {action.label}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

