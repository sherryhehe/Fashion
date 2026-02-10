/**
 * Application Configuration
 * 
 * Centralized configuration management for environment variables
 * and application settings.
 */

/**
 * API Configuration
 * Defaults to production API if NEXT_PUBLIC_API_URL is not set
 */
const getApiBaseUrl = (): string => {
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

export const API_CONFIG = {
  baseURL: getApiBaseUrl(),
  timeout: 30000, // 30 seconds
} as const;

/**
 * Application Configuration
 */
export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Shopo Admin Dashboard',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const;

/**
 * Feature Flags
 */
export const FEATURES = {
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  enableNotifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
} as const;

/**
 * Development Configuration
 */
export const DEV_CONFIG = {
  isDebugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;

/**
 * Pagination Configuration
 */
export const PAGINATION = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 25, 50, 100],
} as const;

/**
 * Date/Time Configuration
 */
export const DATETIME = {
  defaultDateFormat: 'MMM dd, yyyy',
  defaultTimeFormat: 'HH:mm',
  defaultDateTimeFormat: 'MMM dd, yyyy HH:mm',
} as const;

/**
 * Validation Rules
 */
export const VALIDATION = {
  minPasswordLength: 8,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
} as const;

/**
 * Get configuration value safely
 */
export function getConfig<T>(key: string, defaultValue?: T): T | undefined {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value as unknown as T;
}

