import { useState, useCallback } from 'react';

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxAttempts?: number;
  /** Delay between retries in milliseconds (default: 1000) */
  delay?: number;
  /** Whether to use exponential backoff (default: true) */
  exponentialBackoff?: boolean;
  /** Callback when retry fails */
  onRetryFailed?: (error: unknown) => void;
}

/**
 * Hook for retrying failed operations with configurable retry logic.
 * 
 * Usage:
 * ```tsx
 * const { retry, isRetrying } = useRetry({ maxAttempts: 3 });
 * 
 * const handleSave = async () => {
 *   await retry(async () => {
 *     await apiService.saveData(data);
 *   });
 * };
 * ```
 */
export function useRetry(options: RetryOptions = {}) {
  const {
    maxAttempts = 3,
    delay = 1000,
    exponentialBackoff = true,
    onRetryFailed
  } = options;

  const [isRetrying, setIsRetrying] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  const retry = useCallback(async <T,>(
    operation: () => Promise<T>
  ): Promise<T> => {
    setIsRetrying(true);
    setAttemptCount(0);
    let lastError: unknown;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      setAttemptCount(attempt + 1);
      
      try {
        const result = await operation();
        setIsRetrying(false);
        setAttemptCount(0);
        return result;
      } catch (error) {
        lastError = error;
        
        // Don't wait after the last attempt
        if (attempt < maxAttempts - 1) {
          const waitTime = exponentialBackoff
            ? delay * Math.pow(2, attempt)
            : delay;
          
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    setIsRetrying(false);
    setAttemptCount(0);
    
    if (onRetryFailed) {
      onRetryFailed(lastError);
    }
    
    throw lastError;
  }, [maxAttempts, delay, exponentialBackoff, onRetryFailed]);

  return {
    retry,
    isRetrying,
    attemptCount
  };
}
