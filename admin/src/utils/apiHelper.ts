/**
 * API Helper Utilities
 * Single source of truth for API base URL. Prefer NEXT_PUBLIC_API_URL in production.
 */
export const getApiUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location.hostname === 'admin.buyshopo.com') {
    return 'https://admin.buyshopo.com/api';
  }
  if (process.env.NODE_ENV === 'production') {
    return 'https://admin.buyshopo.com/api';
  }
  return 'http://localhost:8000/api';
};

