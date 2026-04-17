/**
 * Centralized API Configuration
 * Single source of truth for API URLs and configuration
 */

// Local backend via devtunnels (if available)
const DEV_TUNNEL_URL = 'https://960wd305-5000.inc1.devtunnels.ms';

// Local machine IP for development (useful for physical devices)
const LOCAL_IP = '192.168.1.17';
const LOCAL_BACKEND_PORT = 5001;
// Android emulator reaches host machine via 10.0.2.2
const LOCAL_BACKEND_URL = `http://10.0.2.2:${LOCAL_BACKEND_PORT}`;

// Use local backend so Stripe keys in backend/.env are active.
const FORCE_PRODUCTION_API = false;

// Base URL configuration
const getBaseURL = (): string => {
  if (__DEV__ && !FORCE_PRODUCTION_API) {
    return LOCAL_BACKEND_URL;
  }
  // Production API URL
  return 'https://admin.buyshopo.com';
};

// API endpoint path
const API_PATH = '/api';

// Full API base URL (with /api)
export const API_BASE_URL = `${getBaseURL()}${API_PATH}`;

// Image base URL (without /api, images are served directly)
// In local dev we still serve media from production because local uploads may be incomplete.
export const IMAGE_BASE_URL = (__DEV__ && !FORCE_PRODUCTION_API)
  ? 'https://admin.buyshopo.com'
  : getBaseURL();

// Export configuration object
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  imageBaseURL: IMAGE_BASE_URL,
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second initial delay
  headers: {
    'Content-Type': 'application/json',
  },
  devBackendUrl: DEV_TUNNEL_URL,
  localBackendUrl: LOCAL_BACKEND_URL,
  localIP: LOCAL_IP,
  forceProduction: FORCE_PRODUCTION_API,
  isDevelopment: __DEV__,
  mode: (__DEV__ && !FORCE_PRODUCTION_API) ? 'DEVELOPMENT' : 'PRODUCTION',
};

// Log configuration on startup (dev mode only)
if (__DEV__) {
  console.log('📱 Mobile App API Configuration:');
  console.log('   Mode:', API_CONFIG.mode);
  console.log('   API URL:', API_CONFIG.baseURL);
  console.log('   Image URL:', API_CONFIG.imageBaseURL);
  if (API_CONFIG.mode === 'DEVELOPMENT') {
    console.log('   Backend:', API_CONFIG.localBackendUrl);
    console.log('   Tunnel Fallback:', API_CONFIG.devBackendUrl);
  }
}

export default API_CONFIG;

