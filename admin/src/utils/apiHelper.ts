/**
 * API Helper Utilities
 * Provides consistent API URL resolution across the application
 */

/**
 * Get the API base URL with production fallback
 * This ensures the correct API URL is used in both development and production
 */
export const getApiUrl = (): string => {
  // If environment variable is set, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Check if we're in production by hostname
  if (typeof window !== 'undefined' && window.location.hostname === 'admin.buyshopo.com') {
    return 'https://admin.buyshopo.com/api';
  }
  
  // Check if we're in production by NODE_ENV
  if (process.env.NODE_ENV === 'production') {
    return 'https://admin.buyshopo.com/api';
  }
  
  // Default to localhost for development
  return 'http://localhost:8000/api';
};

