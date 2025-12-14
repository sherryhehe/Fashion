/**
 * Network Helper Utilities
 * Functions to handle network errors and provide user-friendly messages
 */

/**
 * Get user-friendly network error message based on error code
 * @param errorCode Error code from axios error
 * @param errorMessage Original error message
 * @returns User-friendly error message
 */
export const getNetworkErrorMessage = (errorCode?: string, errorMessage?: string): string => {
  // Check for specific error codes
  if (errorCode === 'ECONNABORTED' || errorMessage?.includes('timeout')) {
    return 'Request timed out. The server is taking too long to respond. Please try again.';
  }
  
  if (errorCode === 'ERR_NETWORK' || errorMessage?.includes('Network Error')) {
    return 'Network error. Please check your internet connection and try again.';
  }
  
  if (errorCode === 'ENOTFOUND' || errorMessage?.includes('getaddrinfo')) {
    return 'Cannot reach server. Please check your internet connection.';
  }
  
  if (errorCode === 'ECONNREFUSED') {
    return 'Connection refused. The server may be down. Please try again later.';
  }
  
  if (errorCode === 'ECONNRESET') {
    return 'Connection was reset. Please try again.';
  }
  
  // Default message
  return 'Network error. Please check your internet connection and try again.';
};

/**
 * Check if error is a network error (no response from server)
 * @param error Axios error object
 * @returns boolean
 */
export const isNetworkError = (error: any): boolean => {
  return !error.response && !!error.code;
};

/**
 * Check if error is a timeout error
 * @param error Axios error object
 * @returns boolean
 */
export const isTimeoutError = (error: any): boolean => {
  const code = error.code || '';
  const message = error.message || '';
  return code === 'ECONNABORTED' || message.includes('timeout');
};

/**
 * Check if error should trigger a retry
 * Network errors and timeouts are good candidates for retry
 * @param error Axios error object
 * @returns boolean
 */
export const shouldRetryRequest = (error: any): boolean => {
  // Don't retry if there's a response (4xx, 5xx errors)
  if (error.response) {
    return false;
  }
  
  // Retry on network errors and timeouts
  return isNetworkError(error) || isTimeoutError(error);
};

