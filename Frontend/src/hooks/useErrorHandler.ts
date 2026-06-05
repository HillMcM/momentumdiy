import { useCallback } from 'react';
import { logger } from '../utils/logger';
import { useNotificationHelpers } from './useNotificationHelpers';
import { getFriendlyError } from '../utils/errorMessages';

export interface ErrorHandlerOptions {
  /** Whether to show a notification to the user (default: true) */
  showNotification?: boolean;
  /** Custom error title for notification (default: "Error") */
  notificationTitle?: string;
  /** Whether this is a critical error that should be logged as error (default: true) */
  logAsError?: boolean;
  /** Additional context to include in logs */
  context?: Record<string, unknown>;
}

/**
 * Standardized error handling hook for consistent error handling across components.
 * 
 * Usage:
 * ```tsx
 * const { handleError } = useErrorHandler();
 * 
 * try {
 *   await someOperation();
 * } catch (error) {
 *   handleError(error, {
 *     notificationTitle: 'Operation Failed',
 *     context: { operation: 'someOperation' }
 *   });
 * }
 * ```
 */
export function useErrorHandler() {
  const { showError } = useNotificationHelpers();

  const handleError = useCallback(
    (
      error: unknown,
      options: ErrorHandlerOptions = {}
    ) => {
      const {
        showNotification = true,
        notificationTitle = 'Error',
        logAsError = true,
        context = {}
      } = options;

      // Extract error message and convert to user-friendly message
      const rawErrorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
        ? error 
        : 'An unexpected error occurred';

      const friendlyError = getFriendlyError(rawErrorMessage);
      
      // Log the raw error for debugging
      if (logAsError) {
        logger.error(notificationTitle, error instanceof Error ? error : new Error(rawErrorMessage), context);
      } else {
        logger.warn(notificationTitle, error instanceof Error ? error : new Error(rawErrorMessage), context);
      }

      // Show user-friendly notification with recovery steps
      if (showNotification) {
        const messageWithRecovery = friendlyError.recoverySteps && friendlyError.recoverySteps.length > 0
          ? `${friendlyError.message}\n\n${friendlyError.recoverySteps.join('\n')}`
          : friendlyError.message;

        showError(
          notificationTitle,
          messageWithRecovery,
          friendlyError.retryable ? {
            label: 'Try Again',
            onClick: () => {
              // Note: Retry logic should be handled by the calling component
              // This is just a placeholder action button
            }
          } : undefined
        );
      }
    },
    [showError]
  );

  return { handleError };
}

