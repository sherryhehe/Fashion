/**
 * Centralized API Configuration
 * Single source of truth for API URLs and configuration
 */

// Change this to your local machine's IP address for development
// Find your IP with: ifconfig | grep "inet " | grep -v 127.0.0.1
const LOCAL_IP = '192.168.1.17';

// FORCE PRODUCTION API - Set to true to always use production API
// Set to false to use local backend for testing
const FORCE_PRODUCTION_API = true; // ✅ Production mode enabled

// Base URL configuration
const getBaseURL = (): string => {
  if (__DEV__ && !FORCE_PRODUCTION_API) {
    return `http://${LOCAL_IP}:5000`;
  }
  // Production API URL
  return 'https://admin.buyshopo.com';
};

// API endpoint path
const API_PATH = '/api';

// Full API base URL (with /api)
export const API_BASE_URL = `${getBaseURL()}${API_PATH}`;

// Image base URL (without /api, images are served directly)
export const IMAGE_BASE_URL = getBaseURL();

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
    console.log('   Local IP:', API_CONFIG.localIP);
  }
}

export default API_CONFIG;

