/**
 * Utility functions for handling error messages in React components
 * Ensures that error objects are properly converted to strings to prevent React error #31
 */

export interface ErrorObject {
  code?: string | number;
  message?: string;
  error?: string;
  data?: {
    error?: string;
    message?: string;
  };
  response?: {
    data?: {
      error?: string;
      message?: string;
    };
    message?: string;
  };
}

/**
 * Extracts a string error message from various error types
 * Handles cases where error might be:
 * - A string
 * - An Error object
 * - An Axios error with response data
 * - A custom error object with code/message properties
 * - Any other object that might contain error information
 */
export const getErrorMessage = (error: unknown, fallback: string = 'An unexpected error occurred'): string => {
  // If it's already a string, return it
  if (typeof error === 'string') {
    return error;
  }

  // If it's null, undefined, or not an object, return fallback
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const errorObj = error as ErrorObject;

  // Try to extract message from various possible locations
  const possibleMessages = [
    errorObj.message,
    errorObj.error,
    errorObj.response?.data?.error,
    errorObj.response?.data?.message,
    errorObj.response?.message,
    errorObj.data?.error,
    errorObj.data?.message,
  ];

  // Return the first non-empty string found
  for (const msg of possibleMessages) {
    if (typeof msg === 'string' && msg.trim()) {
      return msg.trim();
    }
  }

  // If no message found but there's a code, format it
  if (errorObj.code) {
    return `Error ${errorObj.code}: ${fallback}`;
  }

  // Last resort: return the fallback message
  return fallback;
};

/**
 * Validates that a value is a string and safe to display in React
 * Prevents React error #31 by ensuring only strings are rendered
 */
export const ensureString = (value: unknown, fallback: string = ''): string => {
  if (typeof value === 'string') {
    return value;
  }
  
  if (value === null || value === undefined) {
    return fallback;
  }
  
  // If it's an object, try to extract an error message
  if (typeof value === 'object') {
    return getErrorMessage(value, fallback);
  }
  
  // For other types, convert to string safely
  return String(value);
};

/**
 * Handles authentication-specific errors with appropriate user-friendly messages
 */
export const getAuthErrorMessage = (error: unknown): string => {
  const message = getErrorMessage(error);
  
  // Map specific error messages to user-friendly ones
  const errorMappings: Record<string, string> = {
    'User already exists': 'An account with this email already exists. Please try logging in instead.',
    'Invalid credentials': 'Invalid email or password. Please check your credentials and try again.',
    'Email already in use': 'This email is already registered. Please use a different email or try logging in.',
    'Username already exists': 'This username is already taken. Please choose a different username.',
    'Password too short': 'Password must be at least 6 characters long.',
    'Invalid email format': 'Please enter a valid email address.',
    'Network Error': 'Unable to connect to the server. Please check your internet connection and try again.',
    'timeout': 'Request timed out. Please try again.',
  };

  // Check for exact matches first
  if (errorMappings[message]) {
    return errorMappings[message];
  }

  // Check for partial matches
  for (const [key, value] of Object.entries(errorMappings)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // For 500 errors or server errors, provide a generic message
  if (message.includes('500') || message.toLowerCase().includes('internal server error')) {
    return 'Server error occurred. Please try again in a few moments.';
  }

  // Return the cleaned message if no mapping found
  return message;
};

/**
 * Additional safety check for React rendering
 * Ensures that any value passed to React components is a safe string
 */
export const safeErrorDisplay = (error: unknown): string => {
  const result = ensureString(error);
  
  // Double-check that we have a string and it's not empty
  if (typeof result !== 'string' || !result.trim()) {
    return 'An error occurred';
  }
  
  return result.trim();
};