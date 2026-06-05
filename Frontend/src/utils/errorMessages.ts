/**
 * Maps technical error messages to user-friendly messages with actionable recovery steps.
 * This ensures users see helpful, non-technical error messages instead of raw API errors.
 */

export interface FriendlyError {
  message: string;
  recoverySteps?: string[];
  retryable?: boolean;
}

const ERROR_MAPPINGS: Record<string, FriendlyError> = {
  // Track errors
  'Track data loaded but not active': {
    message: 'This track isn\'t currently active',
    recoverySteps: [
      'Visit the Marketing Track page to activate this track',
      'Or choose a different track to get started'
    ],
    retryable: false
  },
  'Track not found': {
    message: 'This marketing track couldn\'t be found',
    recoverySteps: [
      'Check if the track is still available',
      'Try refreshing the page',
      'Go back to the Marketing Track page'
    ],
    retryable: true
  },
  'Track Not Active': {
    message: 'This track isn\'t currently active',
    recoverySteps: [
      'Activate this track from the Marketing Track page',
      'Or choose a different track to continue your journey'
    ],
    retryable: false
  },
  
  // Network errors
  'Failed to fetch': {
    message: 'Unable to connect to the server',
    recoverySteps: [
      'Check your internet connection',
      'Wait a moment and try again',
      'If the problem persists, contact support'
    ],
    retryable: true
  },
  'Network error': {
    message: 'Network connection problem',
    recoverySteps: [
      'Check your internet connection',
      'Try refreshing the page',
      'Disable any VPN or firewall that might be blocking the connection'
    ],
    retryable: true
  },
  'Network request failed': {
    message: 'Unable to connect to the server',
    recoverySteps: [
      'Check your internet connection',
      'Try again in a few moments'
    ],
    retryable: true
  },
  
  // Authentication errors
  'Session expired': {
    message: 'Your session has expired',
    recoverySteps: [
      'Please sign in again to continue'
    ],
    retryable: false
  },
  'Unauthorized': {
    message: 'You need to sign in to continue',
    recoverySteps: [
      'Sign in to access this feature'
    ],
    retryable: false
  },
  
  // API errors
  'Too many requests': {
    message: 'Too many requests at once',
    recoverySteps: [
      'Please wait a moment before trying again',
      'We\'ll automatically retry for you'
    ],
    retryable: true
  },
  'Rate limit exceeded': {
    message: 'You\'ve sent too many requests too quickly',
    recoverySteps: [
      'Please wait a minute before trying again',
      'This helps us keep the service fast for everyone'
    ],
    retryable: true
  },
  
  // AI-specific errors
  'You\'ve reached your monthly AI assistant limit': {
    message: 'You\'ve used all your AI assistant credits for this month',
    recoverySteps: [
      'Your usage resets at the start of next month',
      'Consider upgrading your plan for more AI credits',
      'You can still use all other features in the meantime'
    ],
    retryable: false
  },
  'AI usage limit': {
    message: 'You\'ve reached your monthly AI assistant limit',
    recoverySteps: [
      'Your usage resets at the start of next month',
      'Upgrade your plan for more AI credits',
      'All other features remain available'
    ],
    retryable: false
  },
  'AI assistant temporarily unavailable': {
    message: 'The AI assistant is temporarily unavailable',
    recoverySteps: [
      'Check your internet connection',
      'Try again in a few moments',
      'If the problem persists, contact support'
    ],
    retryable: true
  },
  'Failed to generate AI response': {
    message: 'Unable to get a response from the AI assistant',
    recoverySteps: [
      'Check your internet connection',
      'Try rephrasing your question',
      'Wait a moment and try again'
    ],
    retryable: true
  },
  'I\'m having trouble connecting right now': {
    message: 'The AI assistant is having connection issues',
    recoverySteps: [
      'Check your internet connection',
      'Try again in a few moments',
      'Refresh the page if the problem continues'
    ],
    retryable: true
  },
  'HTTP error! status: 500': {
    message: 'Something went wrong on our end',
    recoverySteps: [
      'We\'ve been notified and are working on it',
      'Please try again in a few moments'
    ],
    retryable: true
  },
  'HTTP error! status: 404': {
    message: 'The requested resource wasn\'t found',
    recoverySteps: [
      'Check if the item still exists',
      'Try refreshing the page'
    ],
    retryable: true
  },
  'HTTP error! status: 503': {
    message: 'Service temporarily unavailable',
    recoverySteps: [
      'We\'re performing maintenance or experiencing high traffic',
      'Please try again in a few minutes'
    ],
    retryable: true
  },
  
  // Task errors
  'Failed to load track': {
    message: 'Unable to load your marketing track',
    recoverySteps: [
      'Check your internet connection',
      'Try refreshing the page',
      'If the problem continues, contact support'
    ],
    retryable: true
  },
  'Failed to save module': {
    message: 'Unable to save changes',
    recoverySteps: [
      'Check your connection and try again',
      'Your changes might not have been saved'
    ],
    retryable: true
  },
  'Failed to create task': {
    message: 'Unable to create task',
    recoverySteps: [
      'Check your connection',
      'Try creating the task again'
    ],
    retryable: true
  },
  'Failed to update task': {
    message: 'Unable to update task',
    recoverySteps: [
      'Check your connection',
      'Try updating again'
    ],
    retryable: true
  },
  
  // Generic errors
  'Unknown error occurred': {
    message: 'Something unexpected happened',
    recoverySteps: [
      'Try refreshing the page',
      'If the problem continues, contact support'
    ],
    retryable: true
  },
  'An unexpected error occurred': {
    message: 'Something unexpected happened',
    recoverySteps: [
      'Try again in a moment',
      'If the problem continues, contact support'
    ],
    retryable: true
  }
};

/**
 * Converts a technical error message to a user-friendly message with recovery steps.
 */
export function getFriendlyError(error: string | Error): FriendlyError {
  const errorMessage = error instanceof Error ? error.message : error;
  
  // Try exact match first
  if (ERROR_MAPPINGS[errorMessage]) {
    return ERROR_MAPPINGS[errorMessage];
  }
  
  // Try partial matches (case-insensitive)
  const lowerError = errorMessage.toLowerCase();
  for (const [key, value] of Object.entries(ERROR_MAPPINGS)) {
    if (lowerError.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // Check for HTTP status codes
  const httpStatusMatch = errorMessage.match(/HTTP error! status: (\d+)/);
  if (httpStatusMatch) {
    const statusCode = httpStatusMatch[1];
    const statusKey = `HTTP error! status: ${statusCode}`;
    if (ERROR_MAPPINGS[statusKey]) {
      return ERROR_MAPPINGS[statusKey];
    }
  }
  
  // Default friendly error
  return {
    message: 'Something went wrong',
    recoverySteps: [
      'Try refreshing the page',
      'If the problem continues, please contact support'
    ],
    retryable: true
  };
}

/**
 * Extracts a concise error message from various error types.
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'An unexpected error occurred';
}
