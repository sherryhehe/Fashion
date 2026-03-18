/**
 * API base URL for the admin app.
 *
 * When you open the admin on localhost, we default to your **local** backend so
 * Settings (e.g. Stripe) reflect your machine — not production.
 *
 * To call production API from a local admin tab, set in `.env.local`:
 *   NEXT_PUBLIC_USE_REMOTE_API=true
 */
export const getApiUrl = (): string => {
  const useRemote =
    typeof process !== 'undefined' &&
    process.env.NEXT_PUBLIC_USE_REMOTE_API === 'true';

  const localApi =
    (process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:5000/api').replace(
      /\/$/,
      ''
    );

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocalHost = host === 'localhost' || host === '127.0.0.1';
    if (isLocalHost && !useRemote) {
      return localApi;
    }
    if (host === 'admin.buyshopo.com') {
      return 'https://admin.buyshopo.com/api';
    }
  }

  // SSR during `next dev`: still talk to local API unless forcing remote
  if (
    typeof window === 'undefined' &&
    process.env.NODE_ENV === 'development' &&
    !useRemote
  ) {
    return localApi;
  }

  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }
  if (process.env.NODE_ENV === 'production') {
    return 'https://admin.buyshopo.com/api';
  }
  return localApi;
};
