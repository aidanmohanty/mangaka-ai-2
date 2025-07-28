/**
 * Utility functions for handling and displaying errors safely in React components
 */

export interface ErrorWithMessage {
  message: string;
}

export interface APIError {
  error: string;
  errors?: Array<{ msg: string; param: string }>;
}

export interface AxiosError {
  response?: {
    data?: APIError | string;
  };
  message?: string;
}

/**
 * Safely extract error message from various error types
 * Prevents React error #31 by ensuring string output
 */
export const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object') {
    // Handle Axios errors
    if ('response' in error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.data) {
        if (typeof axiosError.response.data === 'string') {
          return axiosError.response.data;
        }
        if (typeof axiosError.response.data === 'object' && 'error' in axiosError.response.data) {
          return axiosError.response.data.error;
        }
      }
      if (axiosError.message) {
        return axiosError.message;
      }
    }

    // Handle Error objects
    if ('message' in error && typeof (error as ErrorWithMessage).message === 'string') {
      return (error as ErrorWithMessage).message;
    }

    // Handle objects with error property
    if ('error' in error && typeof (error as any).error === 'string') {
      return (error as any).error;
    }

    // Handle validation errors array
    if ('errors' in error && Array.isArray((error as any).errors)) {
      const errors = (error as any).errors;
      if (errors.length > 0 && errors[0].msg) {
        return errors[0].msg;
      }
    }
  }

  return 'An unexpected error occurred';
};

/**
 * Get user-friendly error messages for authentication flows
 */
export const getAuthErrorMessage = (error: unknown): string => {
  const message = getErrorMessage(error);
  
  // Map common server errors to user-friendly messages
  const errorMappings: Record<string, string> = {
    'Server error': 'Something went wrong. Please try again later.',
    'Invalid credentials': 'Invalid email or password.',
    'User with this email or username already exists': 'An account with this email or username already exists.',
    'Access token required': 'Please log in to continue.',
    'Invalid token': 'Your session has expired. Please log in again.',
    'User not found': 'Account not found.',
  };

  return errorMappings[message] || message;
};

/**
 * Ensure a value is a string (fallback for React error prevention)
 */
export const ensureString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }
  if (value && typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value || '');
};

/**
 * Safe error display for React components
 */
export const safeErrorDisplay = (error: unknown): string => {
  try {
    return getErrorMessage(error);
  } catch {
    return 'An error occurred';
  }
};